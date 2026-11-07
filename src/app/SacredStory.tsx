"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import videoStory from "@/data/video-story.json";
import { BananaTrees, LotusDivider, Rangoli } from "./WeddingDecor";

const chapters = videoStory;

function filmTime(timestamp: number) {
  return `${String(Math.floor(timestamp / 60)).padStart(2, "0")}:${String(Math.floor(timestamp % 60)).padStart(2, "0")}`;
}

export function MotionControl({ telugu }: Readonly<{ telugu: boolean }>) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "paused" : "live";
    return () => {
      delete document.documentElement.dataset.motion;
    };
  }, [paused]);
  const labels = telugu
    ? ["అలంకరణల కదలిక ప్రారంభించండి", "అలంకరణల కదలిక ఆపండి"]
    : ["Play decorative animation", "Pause decorative animation"];
  const label = labels[paused ? 0 : 1];
  return (
    <button
      className="motion-toggle"
      onClick={() => setPaused(!paused)}
      aria-label={label}
      aria-pressed={paused}
      title={label}
    >
      {paused ? <Play size={15} /> : <Pause size={15} />}
    </button>
  );
}

function StoryFrames({ active }: Readonly<{ active: number }>) {
  return (
    <div className="video-story-screen">
      {chapters.map((chapter, index) => (
        <figure
          key={chapter.id}
          className={`video-story-frame ${index === active ? "is-active" : ""}`}
          aria-hidden={index !== active}
          aria-labelledby={`story-title-${chapter.id}`}
          aria-describedby={`story-body-${chapter.id}`}
        >
          <Image
            src={`/story/${chapter.id}.webp`}
            alt={chapter.alt}
            width={1280}
            height={720}
            sizes="(max-width: 700px) 94vw, 58vw"
            className="video-story-image"
            loading="eager"
          />
        </figure>
      ))}
    </div>
  );
}

export default function SacredStory({ telugu }: Readonly<{ telugu: boolean }>) {
  const section = useRef<HTMLElement>(null);
  const requestScene = useRef<(index: number) => void>(() => {});
  const navigationTween = useRef<gsap.core.Tween | null>(null);
  const navigationTarget = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const language = telugu ? 1 : 0;
  const current = chapters[active];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    const media = gsap.matchMedia();
    const frames = Array.from(
      section.current?.querySelectorAll<HTMLElement>(".video-story-frame") ??
        [],
    );
    const screen = section.current?.querySelector<HTMLElement>(
      ".video-story-screen",
    );
    const caption = section.current?.querySelector<HTMLElement>(
      ".video-story-caption-copy",
    );
    let displayed = 0;
    let requested = 0;
    let transitioning = false;
    let sceneTimeline: gsap.core.Timeline | null = null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionPaused = () =>
      document.documentElement.dataset.motion === "paused";
    gsap.set(frames, { autoAlpha: 0, y: 0, scale: 1 });
    gsap.set(frames[0], { autoAlpha: 1 });

    function settleScene(index: number) {
      gsap.set(frames, {
        autoAlpha: 0,
        y: 0,
        scale: 1,
        zIndex: 0,
        clearProps: "willChange",
      });
      gsap.set(frames[index], { autoAlpha: 1, zIndex: 1 });
      displayed = index;
      transitioning = false;
      setActive(index);
      if (caption)
        gsap.set(caption, { clearProps: "opacity,visibility,transform" });
      screen?.setAttribute("data-transitioning", "false");
    }

    function playScene() {
      if (transitioning || requested === displayed) return;
      const next = requested;
      if (window.innerWidth <= 700 || reducedMotion.matches || motionPaused()) {
        settleScene(next);
        return;
      }
      transitioning = true;
      screen?.setAttribute("data-transitioning", "true");
      const direction = next > displayed ? 1 : -1;
      const outgoing = frames[displayed];
      const incoming = frames[next];
      gsap.set(outgoing, { zIndex: 1, willChange: "transform, opacity" });
      gsap.set(incoming, {
        autoAlpha: 0,
        y: direction * 18,
        scale: 1.012,
        zIndex: 2,
        willChange: "transform, opacity",
      });
      sceneTimeline = gsap.timeline({
        onComplete: () => {
          settleScene(next);
          playScene();
        },
      });
      sceneTimeline
        .to(
          incoming,
          { autoAlpha: 1, y: 0, scale: 1, duration: 1.2, ease: "power3.out" },
          0,
        )
        .to(
          outgoing,
          {
            autoAlpha: 0,
            y: direction * -10,
            duration: 0.85,
            ease: "power2.inOut",
          },
          0.2,
        );
      if (caption) {
        sceneTimeline
          .to(caption, { autoAlpha: 0, y: -5, duration: 0.16 }, 0)
          .call(() => setActive(next), [], 0.18)
          .fromTo(
            caption,
            { autoAlpha: 0, y: 7 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              immediateRender: false,
            },
            0.22,
          );
      }
    }

    requestScene.current = (index: number) => {
      requested = Math.max(0, Math.min(chapters.length - 1, index));
      playScene();
    };

    function stopMotion() {
      if (!reducedMotion.matches && !motionPaused()) return;
      sceneTimeline?.kill();
      navigationTween.current?.kill();
      settleScene(requested);
    }
    reducedMotion.addEventListener("change", stopMotion);
    const motionObserver = new MutationObserver(stopMotion);
    motionObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion"],
    });
    const articles = Array.from(
      section.current?.querySelectorAll<HTMLElement>(".sacred-chapter") ?? [],
    );
    function updateChapter() {
      if (navigationTarget.current !== null) return;
      const readingLine =
        window.innerHeight * (window.innerWidth <= 700 ? 0.75 : 0.65);
      let next = 0;
      articles.forEach((article, index) => {
        if (article.getBoundingClientRect().top <= readingLine) next = index;
      });
      requestScene.current(next);
    }
    window.addEventListener("scroll", updateChapter, { passive: true });
    window.addEventListener("resize", updateChapter);
    const resizeObserver = new ResizeObserver(updateChapter);
    if (section.current) resizeObserver.observe(section.current);
    updateChapter();
    const context = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".video-story-halo",
          { rotation: -12 },
          {
            rotation: 20,
            ease: "none",
            scrollTrigger: {
              trigger: ".sacred-journey",
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5,
            },
          },
        );
      });
      media.add(
        "(max-width: 700px) and (prefers-reduced-motion: no-preference)",
        () => {
          if (motionPaused()) {
            gsap.set(
              articles.map((article) =>
                article.querySelector(".video-story-reading-frame"),
              ),
              { autoAlpha: 1, y: 0 },
            );
            return;
          }
          const reveals = articles.map((article) => {
            const image = article.querySelector(".video-story-reading-frame");
            return gsap.fromTo(
              image,
              { autoAlpha: 0.65, y: 22 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.85,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: image,
                  start: "top 92%",
                  once: true,
                  invalidateOnRefresh: true,
                },
              },
            );
          });
          const pauseObserver = new MutationObserver(() => {
            if (!motionPaused()) return;
            reveals.forEach((reveal) => {
              reveal.progress(1).pause();
            });
          });
          pauseObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-motion"],
          });
          return () => pauseObserver.disconnect();
        },
      );
    }, section);
    return () => {
      requestScene.current = () => {};
      sceneTimeline?.kill();
      navigationTween.current?.kill();
      navigationTarget.current = null;
      reducedMotion.removeEventListener("change", stopMotion);
      motionObserver.disconnect();
      gsap.set(frames, {
        clearProps: "opacity,visibility,transform,zIndex,willChange",
      });
      if (caption)
        gsap.set(caption, { clearProps: "opacity,visibility,transform" });
      window.removeEventListener("scroll", updateChapter);
      window.removeEventListener("resize", updateChapter);
      resizeObserver.disconnect();
      media.revert();
      context.revert();
    };
  }, []);

  function navigateChapter(index: number) {
    const target = Math.max(0, Math.min(chapters.length - 1, index));
    const reducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.motion === "paused";
    const article = document.getElementById(`story-${chapters[target].id}`);
    if (!article) return;
    const stage = section.current?.querySelector(".sacred-stage");
    const offset =
      window.innerWidth <= 700 &&
      stage &&
      getComputedStyle(stage).display !== "none"
        ? stage.getBoundingClientRect().height + 12
        : window.innerWidth <= 700
          ? 20
          : 100;
    const top = article.getBoundingClientRect().top + window.scrollY - offset;
    navigationTween.current?.kill();
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    root.dataset.storyNavigating = "true";
    const releaseNavigation = () => {
      navigationTarget.current = null;
      root.style.scrollBehavior = previousBehavior;
      delete root.dataset.storyNavigating;
    };
    navigationTarget.current = target;
    requestScene.current(target);
    if (reducedMotion) {
      window.scrollTo({ top, behavior: "instant" });
      releaseNavigation();
      return;
    }
    navigationTween.current = gsap.to(window, {
      scrollTo: { y: top, autoKill: true, onAutoKill: releaseNavigation },
      duration: 1.2,
      ease: "power3.inOut",
      onComplete: () => {
        releaseNavigation();
        requestScene.current(target);
      },
      onInterrupt: releaseNavigation,
    });
  }

  return (
    <section
      ref={section}
      className="sacred-story video-story section-with-bananas"
      id="sacred-story"
      aria-labelledby="sacred-story-title"
    >
      <BananaTrees />
      <header className="sacred-story-heading">
        <span className="eyebrow">DEEPA & YASHOVARDHAN</span>
        <h2 id="sacred-story-title">
          {telugu ? "మా కుటుంబ శుభాహ్వానము." : "An invitation from our family."}
        </h2>
        <p>
          {telugu
            ? "మా కుమార్తె వివాహ సంతోషమును మీతో పంచుకొనుచున్నాము."
            : "With love, we invite you to share in our daughter's wedding."}
        </p>
        <p className="story-family-signature">
          {telugu ? "ఆహ్వానించువారు" : "With warm regards"}
          <span>{telugu ? "శ్రీ ఈదర రామకృష్ణ, శ్రీమతి వనజాక్షి" : "Sri. Edara Ramakrishna & Smt. Vanajakshi"}</span>
        </p>
        <LotusDivider />
      </header>
      <div className="sacred-journey">
        <div className="sacred-stage">
          <Rangoli className="video-story-halo" />
          <StoryFrames active={active} />
          <div className="video-story-caption">
            <div className="video-story-caption-copy">
              <span className="eyebrow">
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(chapters.length).padStart(2, "0")} ·{" "}
                {current.word[language]}
              </span>
              <p>{current.title[language]}</p>
            </div>
            <div className="video-story-controls">
              <button
                className="story-step-button"
                onClick={() => navigateChapter(active - 1)}
                disabled={active === 0}
                title={telugu ? "మునుపటి క్షణం" : "Previous moment"}
                aria-label={telugu ? "మునుపటి క్షణం" : "Previous moment"}
              >
                <ArrowLeft size={18} />
              </button>
              <button
                className="story-step-button"
                onClick={() => navigateChapter(active + 1)}
                disabled={active === chapters.length - 1}
                title={telugu ? "తదుపరి క్షణం" : "Next moment"}
                aria-label={telugu ? "తదుపరి క్షణం" : "Next moment"}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
          <div className="video-story-meta">
            <span>
              {telugu ? "మా ఆహ్వాన చిత్రం" : "OUR INVITATION FILM"} ·{" "}
              {filmTime(current.timestamp)}
            </span>
            <a
              href={`/invitation.mp4#t=${current.timestamp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Play size={12} />
              {telugu ? "ఈ క్షణాన్ని చూడండి" : "Watch this moment"}
              <span className="sr-only">
                {telugu
                  ? "కొత్త ట్యాబ్‌లో తెరుచుకుంటుంది"
                  : "opens in a new tab"}
              </span>
            </a>
          </div>
          <nav
            className="story-frame-timeline"
            aria-label={
              telugu ? "మా కుటుంబ ఆహ్వానంలోని క్షణాలు" : "Our family invitation"
            }
          >
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                className="story-frame-stop"
                onClick={() => navigateChapter(index)}
                aria-current={index === active ? "step" : undefined}
                aria-controls={`story-${chapter.id}`}
                aria-label={`${String(index + 1).padStart(2, "0")}. ${chapter.title[language]}`}
                title={chapter.title[language]}
              >
                <span className="story-frame-thumbnail">
                  <Image
                    src={`/story/${chapter.id}.webp`}
                    alt=""
                    width={1280}
                    height={720}
                    sizes="(max-width: 700px) 15vw, 8vw"
                  />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </span>
                <span className="story-frame-stop-label">
                  {chapter.word[language]}
                </span>
              </button>
            ))}
          </nav>
        </div>
        <div className="sacred-chapters">
          {chapters.map((chapter, index) => (
            <article
              id={`story-${chapter.id}`}
              className={`sacred-chapter ${active === index ? "is-current" : ""}`}
              key={chapter.id}
            >
              <Image
                className="video-story-reading-frame"
                src={`/story/${chapter.id}.webp`}
                alt={chapter.alt}
                width={1280}
                height={720}
                sizes="(max-width: 700px) 94vw, 850px"
              />
              <span className="sacred-chapter-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="eyebrow">{chapter.label[language]}</span>
              <h3 id={`story-title-${chapter.id}`}>
                {chapter.title[language]}
              </h3>
              <p id={`story-body-${chapter.id}`}>{chapter.body[language]}</p>
              <span className="chapter-rule" aria-hidden="true" />
              {index < chapters.length - 1 && (
                <button
                  className="story-mobile-next"
                  onClick={() => navigateChapter(index + 1)}
                  aria-label={`${telugu ? "తదుపరి" : "Next"}: ${chapters[index + 1].title[language]}`}
                >
                  <span>
                    {telugu ? "తదుపరి" : "Next"} ·{" "}
                    {chapters[index + 1].word[language]}
                  </span>
                  <ArrowRight size={16} />
                </button>
              )}
            </article>
          ))}
        </div>
      </div>
      <div className="sacred-story-bridge">
        <LotusDivider />
        <p>
          {telugu
            ? "సకుటుంబ సమేతముగా విచ్చేసి వధూవరులను దీవింపవలెను."
            : "Please join us with your family and bless the couple."}
        </p>
        <a href="#celebration">
          {telugu ? "వివాహ శుభాహ్వానము" : "Join our celebration"}
          <ArrowDown size={18} />
        </a>
      </div>
    </section>
  );
}
