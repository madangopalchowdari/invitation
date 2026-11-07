"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Copy,
  MapPin,
  Play,
  X,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  photoChapters,
  photoFor,
  photos,
  type WeddingPhoto,
} from "@/data/photos";
import SacredStory, { MotionControl } from "./SacredStory";
import BackgroundMusic from "./BackgroundMusic";
import Rsvp from "./Rsvp";
import {
  Atmosphere,
  BananaTrees,
  CeremonyOrnaments,
  HeroOrnaments,
  LotusDivider,
  LoveSymbol,
  OrnamentalBand,
  PhotoSceneGraphics,
  PhotoStoryBackdrop,
  Rangoli,
} from "./WeddingDecor";

const weddingTime = new Date("2026-11-20T21:22:00+05:30").getTime();
type Language = "en" | "te";
type Filter = "all" | "couple" | "bride" | "candid";

function Photo({
  photo,
  className = "",
  priority = false,
  sizes = "(max-width: 700px) 100vw, 65vw",
}: Readonly<{
  photo: WeddingPhoto;
  className?: string;
  priority?: boolean;
  sizes?: string;
}>) {
  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      width={photo.orientation === "portrait" ? 1333 : 2000}
      height={photo.orientation === "portrait" ? 2000 : 1333}
      sizes={sizes}
      priority={priority}
      className={className}
      style={{
        objectPosition: `${photo.focalPoint.x}% ${photo.focalPoint.y}%`,
      }}
    />
  );
}

function Countdown({ telugu }: Readonly<{ telugu: boolean }>) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setRemaining(Math.max(0, weddingTime - Date.now()));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);
  const units =
    remaining === null
      ? [null, null, null, null]
      : [
          Math.floor(remaining / 86400000),
          Math.floor(remaining / 3600000) % 24,
          Math.floor(remaining / 60000) % 60,
          Math.floor(remaining / 1000) % 60,
        ];
  return (
    <div
      className="countdown"
      aria-label={telugu ? "శుభముహూర్తానికి సమయం" : "Time until the wedding"}
    >
      {units.map((value, index) => (
        <div key={["days", "hours", "minutes", "seconds"][index]}>
          <span>{value === null ? "--" : String(value).padStart(2, "0")}</span>
          <small>
            {
              (telugu
                ? ["రోజులు", "గంటలు", "నిమిషాలు", "క్షణాలు"]
                : ["days", "hours", "minutes", "seconds"])[index]
            }
          </small>
        </div>
      ))}
    </div>
  );
}

export default function Invitation() {
  const [language, setLanguage] = useState<Language>("en");
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [copied, setCopied] = useState(false);
  const [modal, setModal] = useState<"photo" | "video" | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const telugu = language === "te";
  const text = (english: string, translated: string) =>
    telugu ? translated : english;

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.from(".hero-reveal", {
          y: 24,
          opacity: 0,
          duration: 1.2,
          stagger: 0.13,
          ease: "power2.out",
        });
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          gsap.from(element, {
            y: 35,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 93%", once: true },
          });
        });
        gsap.utils
          .toArray<HTMLElement>("[data-photo-reveal]")
          .forEach((element) => {
            gsap.from(element, {
              y: 20,
              opacity: 0.7,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: { trigger: element, start: "top 93%", once: true },
            });
          });
        gsap.utils
          .toArray<HTMLElement>("[data-parallax]")
          .forEach((element) => {
            gsap.fromTo(
              element,
              { yPercent: -3 },
              {
                yPercent: 3,
                ease: "none",
                scrollTrigger: {
                  trigger: element.parentElement,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                },
              },
            );
          });
        gsap.to(".reading-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });
        gsap.to(".hero-rangoli", {
          rotation: 22,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 1.8,
          },
        });
        gsap.to(".ceremony-rangoli", {
          rotation: -24,
          ease: "none",
          scrollTrigger: {
            trigger: ".celebration",
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      }, root);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);

  useEffect(() => {
    if (!modal) return;
    const element = dialog.current;
    trigger.current = document.activeElement as HTMLElement;
    element?.showModal();
    closeButton.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        video.current?.pause();
        setModal(null);
      }
      if (modal === "photo" && event.key === "ArrowRight") {
        event.preventDefault();
        setActivePhoto((index) => (index + 1) % photos.length);
      }
      if (modal === "photo" && event.key === "ArrowLeft") {
        event.preventDefault();
        setActivePhoto((index) => (index - 1 + photos.length) % photos.length);
      }
    }
    function handleBackdrop(event: MouseEvent) {
      if (event.target === element) {
        video.current?.pause();
        setModal(null);
      }
    }
    function handleCancel(event: Event) {
      event.preventDefault();
      video.current?.pause();
      setModal(null);
    }
    element?.addEventListener("keydown", handleKey);
    element?.addEventListener("click", handleBackdrop);
    element?.addEventListener("cancel", handleCancel);
    return () => {
      element?.removeEventListener("keydown", handleKey);
      element?.removeEventListener("click", handleBackdrop);
      element?.removeEventListener("cancel", handleCancel);
      element?.close();
      document.body.style.overflow = previousOverflow;
      trigger.current?.focus();
    };
  }, [modal]);

  function closeModal() {
    video.current?.pause();
    setModal(null);
  }

  function openPhoto(photo: WeddingPhoto) {
    setActivePhoto(photos.indexOf(photo));
    setModal("photo");
  }

  async function shareInvitation() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const filtered = photos.filter(
    (photo) =>
      filter === "all" ||
      (filter === "couple"
        ? photo.category === "couple" || photo.category === "groom"
        : photo.category === filter),
  );
  const shown = expanded ? filtered : filtered.slice(0, 6);

  return (
    <div ref={root}>
      <a className="skip-link" href="#invitation">
        Skip to invitation
      </a>
      <div className="reading-progress" aria-hidden="true" />
      <Atmosphere />
      <div className="toran" aria-hidden="true" />
      <header className="header">
        <a
          className="monogram"
          href="#home"
          aria-label="Deepa and Yashovardhan, home"
        >
          D<span>&</span>Y<span className="monogram-dot">.</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#sacred-story">{text("The story", "పవిత్ర కథ")}</a>
          <a href="#couple">{text("The couple", "వధూవరులు")}</a>
          <a href="#celebration">{text("The wedding", "శుభవివాహం")}</a>
          <a href="#moments">{text("Our moments", "మధుర క్షణాలు")}</a>
        </nav>
        <div className="header-controls">
          <BackgroundMusic telugu={telugu} suspended={modal === "video"} />
          <MotionControl telugu={telugu} />
          <fieldset
            className="language-switch"
            aria-label="Invitation language"
          >
            <button aria-pressed={!telugu} onClick={() => setLanguage("en")}>
              EN
            </button>
            <button
              lang="te"
              aria-pressed={telugu}
              onClick={() => setLanguage("te")}
            >
              తెలుగు
            </button>
          </fieldset>
        </div>
      </header>

      <main id="invitation">
        <section id="home" className="hero">
          <HeroOrnaments />
          <div className="hero-intro">
            <p className="invocation hero-reveal" lang="te">
              శ్రీ సీతారామచంద్ర స్వామినే నమః
            </p>
            <Image
              className="blessing hero-reveal"
              src="/art/sacred-wedding.webp"
              width={500}
              height={390}
              sizes="(max-width: 700px) 168px, 210px"
              alt="Traditional illustration of the sacred wedding of Sita and Rama, from the family invitation"
              loading="eager"
            />
            <p className="eyebrow hero-reveal">
              {text("WITH THE BLESSINGS OF OUR FAMILIES", "పెద్దల ఆశీస్సులతో")}
            </p>
            <h1 className="hero-reveal">
              <span>{text("Deepa", "దీప")}</span>
              <i>&</i>
              <span>{text("Yashovardhan", "యశోవర్ధన్")}</span>
            </h1>
            <p className="hero-subtitle hero-reveal">
              {text(
                "Two hearts. One beautiful beginning.",
                "రెండు మనసులు. ఒక అందమైన ఆరంభం.",
              )}
            </p>
            <div className="hero-date hero-reveal">
              <span>{text("FRIDAY", "శుక్రవారం")}</span>
              <span className="date-number">20 . 11 . 2026</span>
              <span>{text("DAVANGERE", "దావణగెరె")}</span>
            </div>
            <a className="scroll-link hero-reveal" href="#sacred-story">
              {text("Our forever begins", "మా నూతన ప్రయాణం")}
              <ArrowDown size={16} />
            </a>
          </div>
          <div className="hero-photo" data-reveal>
            <Photo photo={photoFor("hero")} priority />
            <span className="photo-gold-overlay" aria-hidden="true" />
            <span className="photo-note">
              {text(
                "a little moment. a lifetime of love.",
                "ఒక మధుర క్షణం. జీవితాంతం ప్రేమ.",
              )}
            </span>
          </div>
          <div className="hero-footnote">
            <span>DEEPA & YASHOVARDHAN</span>
            <span>20 NOVEMBER 2026</span>
          </div>
        </section>

        <SacredStory telugu={telugu} />
        <OrnamentalBand />

        <section id="couple" className="couple-section section-shell section-with-bananas">
          <BananaTrees />
          <Rangoli className="couple-rangoli" />
          <div className="section-heading" data-reveal>
            <span className="eyebrow">
              {text("WRITTEN IN THE STARS", "విధి కలిపిన బంధం")}
            </span>
            <h2>
              {text("A together kind of forever.", "కలకాలం కలిసే ప్రయాణం.")}
            </h2>
            <p>
              {text(
                "Two lives, two families, and a whole world of love.",
                "రెండు జీవితాలు, రెండు కుటుంబాలు, అనంతమైన ప్రేమ.",
              )}
            </p>
            <LotusDivider />
          </div>
          <article className="person bride" data-reveal>
            <div className="portrait-wrap">
              <Photo
                photo={photoFor("bride")}
                sizes="(max-width: 700px) 90vw, 40vw"
              />
              <span className="portrait-index">
                01 / {text("THE BRIDE", "వధువు")}
              </span>
            </div>
            <div className="person-copy">
              <span className="eyebrow">{text("THE BRIDE", "వధువు")}</span>
              <h3>{text("Deepa", "దీప")}</h3>
              {!telugu && (
                <span className="telugu-name" lang="te">
                  దీప
                </span>
              )}
              <div className="fine-line" />
              <p className="family-label">
                {text("Beloved daughter of", "ప్రియమైన కుమార్తె")}
              </p>
              <p className="parents">
                Sri. Edara Ramakrishna
                <br />& Smt. Vanajakshi
              </p>
              <p className="address">
                Nanditavare Camp, Harihara Taluk,
                <br />
                Davangere District, Karnataka.
              </p>
              <p className="handwritten">
                {text(
                  "A smile that feels like home.",
                  "ఇల్లులా అనిపించే చిరునవ్వు.",
                )}
              </p>
            </div>
          </article>
          <article className="person groom" data-reveal>
            <div className="portrait-wrap groom-portrait">
              <Photo
                photo={photoFor("groom")}
                sizes="(max-width: 700px) 90vw, 40vw"
              />
              <span className="portrait-index">
                02 / {text("THE GROOM", "వరుడు")}
              </span>
            </div>
            <div className="person-copy">
              <span className="eyebrow">{text("THE GROOM", "వరుడు")}</span>
              <h3>{text("Yashovardhan", "యశోవర్ధన్")}</h3>
              {!telugu && (
                <span className="telugu-name" lang="te">
                  యశోవర్ధన్
                </span>
              )}
              <div className="fine-line" />
              <p>
                {text(
                  "With a heart full of love, and a lifetime of little moments waiting to be shared.",
                  "నిండు మనసుతో, జీవితాంతం పంచుకునే మధుర క్షణాల కోసం.",
                )}
              </p>
              <p className="handwritten">
                {text(
                  "Her today. Her every tomorrow.",
                  "ఆమె నేడు. ఆమె ప్రతి రేపు.",
                )}
              </p>
            </div>
          </article>
        </section>

        <section className="together-scene section-with-bananas banana-photo-scene" aria-label="Together, always">
          <BananaTrees />
          <div className="scene-border-overlay" aria-hidden="true" />
          <div className="scene-image" data-parallax>
            <Photo photo={photoFor("couple")} sizes="100vw" />
          </div>
          <div className="scene-caption" data-reveal>
            <span className="eyebrow">
              {text("IN EACH OTHER, A WHOLE WORLD", "ఒకరికొకరు ఓ ప్రపంచం")}
            </span>
            <h2>{text("It was always you.", "ఎప్పటికీ నువ్వే.")}</h2>
          </div>
        </section>

        <section
          id="our-photo-story"
          className="photo-story section-shell"
          aria-labelledby="photo-story-title"
        >
          <PhotoStoryBackdrop />
          <div className="section-heading" data-reveal>
            <span className="eyebrow">
              {text("A FEW MEMORIES FROM OUR FAMILY", "మా కుటుంబ మధురస్మృతులు")}
            </span>
            <h2 id="photo-story-title">
              {text(
                "Memories we are happy to share.",
                "మీతో పంచుకొను మధురస్మృతులు.",
              )}
            </h2>
            <p>
              {text(
                "With love, we share these moments of Deepa and Yashovardhan.",
                "మా పిల్లల సంతోషమును మీతో పంచుకొనుచున్నాము.",
              )}
            </p>
            <LotusDivider />
          </div>
          {photoChapters.map((chapter, index) => (
            <article
              key={chapter.id}
              className={`photo-story-row photo-story-layout-${chapter.layout} ${index % 2 === 1 ? "is-reversed" : ""}`}
              aria-labelledby={`photo-story-${chapter.id}`}
            >
              <PhotoSceneGraphics kind={chapter.verse.symbol} />
              <div
                className={`photo-story-images ${chapter.photoIds.length === 1 ? "single-photo" : "paired-photos"}`}
              >
                {chapter.photoIds.map((id, photoIndex) => {
                  const photo = photos.find((item) => item.id === id)!;
                  const caption = chapter.captions[photoIndex][telugu ? 1 : 0];
                  const regularSizes =
                    chapter.photoIds.length === 1
                      ? "(max-width: 700px) 90vw, 380px"
                      : "(max-width: 700px) 90vw, 45vw";
                  const imageSizes =
                    chapter.layout === "wide"
                      ? "(max-width: 700px) 90vw, 85vw"
                      : regularSizes;
                  return (
                    <figure
                      className={`photo-story-figure ${photo.orientation}`}
                      key={id}
                      data-photo-reveal
                    >
                      <button
                        className="photo-story-photo"
                        onClick={() => openPhoto(photo)}
                        aria-label={`${text("View photograph", "చిత్రాన్ని చూడండి")}: ${caption}`}
                        aria-describedby={`photo-caption-${chapter.id}-${id}`}
                        title={text("View photograph", "చిత్రాన్ని చూడండి")}
                      >
                        <Photo photo={photo} sizes={imageSizes} />
                      </button>
                      <figcaption
                        className="photo-story-image-caption"
                        id={`photo-caption-${chapter.id}-${id}`}
                      >
                        {caption}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
              <div className="photo-story-copy" data-reveal>
                <span className="photo-story-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="eyebrow">{chapter.label[telugu ? 1 : 0]}</span>
                <h3 id={`photo-story-${chapter.id}`}>
                  {chapter.title[telugu ? 1 : 0]}
                </h3>
                <p>{chapter.body[telugu ? 1 : 0]}</p>
                <figure className="photo-story-verse">
                  <div className="photo-story-symbolism">
                    <LoveSymbol kind={chapter.verse.symbol} />
                    <span>{chapter.verse.symbolism[telugu ? 1 : 0]}</span>
                  </div>
                  <blockquote lang="te">
                    <p>{chapter.verse.line}</p>
                  </blockquote>
                  {!telugu && (
                    <p className="photo-story-verse-meaning">
                      {chapter.verse.meaning}
                    </p>
                  )}
                  <figcaption>
                    <cite>{chapter.verse.source[telugu ? 1 : 0]}</cite>
                  </figcaption>
                </figure>
                <span className="photo-story-rule" aria-hidden="true" />
              </div>
            </article>
          ))}
        </section>

        <section id="celebration" className="celebration section-shell section-with-bananas">
          <BananaTrees />
          <CeremonyOrnaments />
          <div className="section-heading" data-reveal>
            <span className="eyebrow">
              {text("AN INVITATION FROM THE HEART", "హృదయపూర్వక ఆహ్వానం")}
            </span>
            <h2 lang="te">శుభ వివాహ ఆహ్వానం</h2>
            <p>
              {text(
                "We warmly invite you to our daughter Deepa's wedding with Yashovardhan.",
                "మా కుమార్తె దీప వివాహమునకు విచ్చేసి వధూవరులను ఆశీర్వదింపవలెను.",
              )}
            </p>
            <LotusDivider />
          </div>
          <div className="wedding-date" data-reveal>
            <span>{text("NOVEMBER", "నవంబర్")}</span>
            <strong>20</strong>
            <span>{text("FRIDAY · 2026", "శుక్రవారం · 2026")}</span>
          </div>
          <div className="event-row" data-reveal>
            <div>
              <span className="event-number">01</span>
              <span className="eyebrow">
                {text("THE WEDDING FEAST", "విందు")}
              </span>
              <h3>
                {text("Come, celebrate with us.", "మాతో కలిసి ఆనందించండి.")}
              </h3>
              <p>
                {text("Dinner from", "విందు ప్రారంభం")} <strong>7:30 PM</strong>
              </p>
            </div>
            <div>
              <span className="event-number">02</span>
              <span className="eyebrow">
                {text("THE AUSPICIOUS MOMENT", "సుముహూర్తం")}
              </span>
              <h3>
                {text("A promise for a lifetime.", "జీవితాంతం నిలిచే బంధం.")}
              </h3>
              <p>
                {text("Muhurtham at", "శుభముహూర్తం")} <strong>9:22 PM</strong>
              </p>
            </div>
          </div>
          <p className="timezone">
            {text(
              "All times in Indian Standard Time (IST)",
              "సమయాలు భారత ప్రామాణిక కాలమానం (IST)",
            )}
          </p>
          <a
            className="button primary"
            href="/calendar"
            download="Deepa-and-Yashovardhan.ics"
          >
            <CalendarDays size={17} />
            {text("Save the date", "తేదీని సేవ్ చేయండి")}
          </a>
          <div className="countdown-area" data-reveal>
            <p className="handwritten">
              {text(
                "Every moment brings us closer.",
                "ప్రతి క్షణం మమ్మల్ని దగ్గర చేస్తోంది.",
              )}
            </p>
            <Countdown telugu={telugu} />
          </div>
          <div className="venue" data-reveal>
            <MapPin size={22} strokeWidth={1.3} />
            <span className="eyebrow">
              {text("THE WEDDING VENUE", "వివాహ వేదిక")}
            </span>
            <h3 lang={telugu ? "te" : "en"}>
              {text("Sushi Convention Hall", "సుషి కన్వెన్షన్ హాల్")}
            </h3>
            <p>
              {text(
                "3622, Sushi Greens, NH-4",
                "3622, సుషి గ్రీన్స్, ఎన్‌హెచ్-4",
              )}
              <br />
              {text("Davangere, Karnataka 577566", "దావణగెరె, కర్ణాటక 577566")}
            </p>
            <a
              className="text-link"
              href="https://maps.app.goo.gl/e5Lix5gwTppnGJtk9"
              target="_blank"
              rel="noopener noreferrer"
            >
              {text("Find the venue", "వేదికకు దారి")}
              <ArrowRight size={17} />
            </a>
          </div>
        </section>

        <Rsvp telugu={telugu} />

        <section id="moments" className="moments section-shell section-with-bananas">
          <BananaTrees />
          <div className="gallery-heading">
            <div data-reveal>
              <span className="eyebrow">
                {text(
                  "THE LITTLE THINGS, THE EVERYTHING",
                  "ప్రతి క్షణం ఓ జ్ఞాపకం",
                )}
              </span>
              <h2>{text("Our moments.", "మధుర క్షణాలు.")}</h2>
            </div>
            <p data-reveal>
              {text(
                "Some stories are best told without words.",
                "కొన్ని కథలకు మాటలు అవసరం లేదు.",
              )}
            </p>
          </div>
          <fieldset className="gallery-filters" aria-label="Filter photographs">
            {(["all", "couple", "bride", "candid"] as Filter[]).map(
              (value, index) => (
                <button
                  key={value}
                  aria-pressed={filter === value}
                  onClick={() => {
                    setFilter(value);
                    setExpanded(false);
                  }}
                >
                  {
                    (telugu
                      ? ["అన్నీ", "మేమిద్దరం", "దీప", "మధుర క్షణాలు"]
                      : ["All moments", "Together", "Deepa", "Candid"])[index]
                  }
                </button>
              ),
            )}
          </fieldset>
          <div className="photo-grid">
            {shown.map((photo, index) => (
              <button
                className={`gallery-photo ${photo.orientation}`}
                key={photo.id}
                onClick={() => openPhoto(photo)}
                aria-label={`View photograph: ${photo.alt}`}
              >
                <Photo photo={photo} sizes="(max-width: 600px) 48vw, 33vw" />
                <span className="gallery-photo-caption">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>↗</span>
                </span>
              </button>
            ))}
          </div>
          {!expanded && filtered.length > 6 && (
            <button
              className="button outline"
              onClick={() => setExpanded(true)}
            >
              {text(
                `All ${filtered.length} photographs`,
                `మొత్తం ${filtered.length} చిత్రాలు`,
              )}
              <ChevronDown size={17} />
            </button>
          )}
          <p className="photographer-credit">
            {text(
              "Photographs by Kishore Photography",
              "ఛాయాచిత్రాలు: Kishore Photography",
            )}
          </p>
        </section>

        <section className="film-section section-shell section-with-bananas" data-reveal>
          <BananaTrees />
          <LotusDivider />
          <span className="eyebrow">
            {text(
              "A LITTLE TRADITION. A LOT OF LOVE.",
              "సంప్రదాయం, ప్రేమ కలిసిన వేళ",
            )}
          </span>
          <h2>{text("You're part of our story.", "మా కథలో మీరూ భాగమే.")}</h2>
          <p>
            {text(
              "An invitation, with love, from our families to yours.",
              "మా కుటుంబం నుంచి మీ కుటుంబానికి ప్రేమతో ఆహ్వానం.",
            )}
          </p>
          <button className="film-button" onClick={() => setModal("video")}>
            <span className="play-circle">
              <Play size={20} fill="currentColor" />
            </span>
            <span>
              {text("Watch our invitation", "మా ఆహ్వాన వీడియో")}
              <small>
                {text("THE ORIGINAL WEDDING FILM", "శుభవివాహ ఆహ్వానం")}
              </small>
            </span>
          </button>
        </section>

        <section className="closing section-with-bananas banana-photo-scene">
          <BananaTrees />
          <div className="closing-photo" data-reveal>
            <Photo
              photo={photoFor("closing")}
              sizes="(max-width: 700px) 100vw, 55vw"
            />
          </div>
          <div className="closing-copy" data-reveal>
            <Rangoli className="closing-rangoli" />
            <span className="eyebrow">
              {text("WITH LOVE & GRATITUDE", "ప్రేమతో, కృతజ్ఞతతో")}
            </span>
            <h2>
              {text("All we need", "మా ఆనందానికి")}
              <br />
              <em>{text("is you.", "మీరు కావాలి.")}</em>
            </h2>
            <p>
              {text(
                "Your presence, your blessings, and your love will make our day complete.",
                "మీ రాక, మీ ఆశీస్సులు, మీ ప్రేమ మా వేడుకకు పరిపూర్ణత.",
              )}
            </p>
            <p className="closing-signature">
              Deepa <i>&</i> Yashovardhan
            </p>
            <span className="closing-date">20 NOVEMBER 2026</span>
            <button className="text-link" onClick={shareInvitation}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied
                ? text("Link copied", "లింక్ కాపీ అయింది")
                : text("Share the invitation", "ఆహ్వానం పంచుకోండి")}
            </button>
            <output className="sr-only" aria-live="polite">
              {copied ? "Invitation link copied to clipboard" : ""}
            </output>
          </div>
        </section>
      </main>
      <footer>
        <a className="monogram" href="#home">
          D<span>&</span>Y<span className="monogram-dot">.</span>
        </a>
        <p>
          {text(
            "Two hearts. Two families. One beautiful beginning.",
            "రెండు మనసులు. రెండు కుటుంబాలు. ఒక అందమైన ఆరంభం.",
          )}
        </p>
        <a href="#home">
          {text("Back to the beginning", "తిరిగి ఆరంభానికి")}
          <ArrowDown size={14} />
        </a>
      </footer>

      <dialog
        ref={dialog}
        className="media-dialog"
        aria-labelledby="media-title"
      >
        <div className="modal-toolbar">
          <span id="media-title">
            {modal === "video"
              ? text("Our wedding invitation", "మా శుభవివాహ ఆహ్వానం")
              : `${activePhoto + 1} / ${photos.length}`}
          </span>
          <button
            ref={closeButton}
            className="icon-button"
            onClick={closeModal}
            aria-label="Close viewer"
            title="Close viewer"
          >
            <X />
          </button>
        </div>
        {modal === "photo" && (
          <>
            <div className="lightbox-image">
              <Photo photo={photos[activePhoto]} sizes="100vw" />
            </div>
            <div className="lightbox-bottom">
              <button
                className="icon-button"
                aria-label="Previous photograph"
                title="Previous photograph"
                onClick={() =>
                  setActivePhoto(
                    (activePhoto - 1 + photos.length) % photos.length,
                  )
                }
              >
                <ArrowLeft />
              </button>
              <p aria-live="polite">{photos[activePhoto].alt}</p>
              <button
                className="icon-button"
                aria-label="Next photograph"
                title="Next photograph"
                onClick={() =>
                  setActivePhoto((activePhoto + 1) % photos.length)
                }
              >
                <ArrowRight />
              </button>
            </div>
          </>
        )}
        {modal === "video" && (
          <video
            ref={video}
            className="invitation-video"
            controls
            playsInline
            preload="metadata"
            poster="/art/video-poster.jpg"
            src="/invitation.mp4"
          >
            <track
              kind="captions"
              src="/invitation.vtt"
              srcLang="en"
              label="English"
              default
            />
          </video>
        )}
      </dialog>
    </div>
  );
}
