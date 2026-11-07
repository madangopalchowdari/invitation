"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Volume2, VolumeX, X } from "lucide-react";
import { invitationMusic } from "@/data/music";
import { createMusicController } from "@/lib/music-controller";
import { BananaTrees, LotusDivider, Rangoli } from "./WeddingDecor";

const preferenceKey = "deepa-yashovardhan:music";

function savePreference(enabled: boolean) {
  try { localStorage.setItem(preferenceKey, enabled ? "enabled" : "muted"); } catch {}
}

export default function BackgroundMusic({ telugu, suspended }: Readonly<{ telugu: boolean; suspended: boolean }>) {
  const firstAudio = useRef<HTMLAudioElement>(null);
  const secondAudio = useRef<HTMLAudioElement>(null);
  const player = useRef<ReturnType<typeof createMusicController> | null>(null);
  const welcome = useRef<HTMLDialogElement>(null);
  const wantsMusic = useRef(false);
  const isSuspended = useRef(suspended);
  const resume = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [failed, setFailed] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const text = (english: string, translated: string) => telugu ? translated : english;

  useEffect(() => {
    const first = firstAudio.current;
    const second = secondAudio.current;
    if (!first || !second) return;
    let disposed = false;
    try { wantsMusic.current = localStorage.getItem(preferenceKey) !== "muted"; } catch { wantsMusic.current = true; }
    setShowWelcome(wantsMusic.current);
    player.current = createMusicController([first, second], () => wantsMusic.current && !isSuspended.current && !document.hidden,
      setPlaying, () => { wantsMusic.current = false; setEnabled(false); setFailed(true); });
    resume.current = () => {
      if (!wantsMusic.current || isSuspended.current || document.hidden) return;
      void player.current?.play().then(() => {
        if (!disposed && wantsMusic.current) { setEnabled(true); setFailed(false); setShowWelcome(false); }
      }).catch(() => {
        if (disposed || !wantsMusic.current) return;
        if (first.error || second.error) { wantsMusic.current = false; setEnabled(false); setFailed(true); setShowWelcome(false); }
        else setShowWelcome(true);
      });
    };
    function handleVisibility() {
      if (document.hidden) player.current?.pause();
      else resume.current();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      disposed = true;
      resume.current = () => {};
      player.current?.destroy();
      player.current = null;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    isSuspended.current = suspended;
    if (suspended) {
      player.current?.pause();
      setShowWelcome(false);
    } else resume.current();
  }, [suspended]);

  useEffect(() => {
    const dialog = welcome.current;
    if (!showWelcome || !dialog) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [showWelcome]);

  function openWithMusic() {
    wantsMusic.current = true;
    savePreference(true);
    setShowWelcome(false);
    setFailed(false);
    setEnabled(true);
    resume.current();
  }

  function continueSilently() {
    wantsMusic.current = false;
    savePreference(false);
    player.current?.pause();
    setPlaying(false);
    setShowWelcome(false);
    setEnabled(false);
  }

  function toggleMusic() {
    if (enabled) continueSilently();
    else openWithMusic();
  }

  const label = enabled ? text("Mute background music", "నేపథ్య సంగీతం ఆపండి") : text("Play background music", "నేపథ్య సంగీతం వినండి");

  return <>
    <audio ref={firstAudio} src={invitationMusic.url} preload="none" aria-label={text("NAS background music", "నేపథ్య సంగీతము")}><track kind="captions" src="/invitation-music.vtt" srcLang="en" label="Soundtrack description" /></audio>
    <audio ref={secondAudio} src={invitationMusic.url} preload="none" aria-label={text("Background music repeat stream", "నేపథ్య సంగీతము పునరావృతము")}><track kind="captions" src="/invitation-music.vtt" srcLang="en" label="Soundtrack description" /></audio>
    <button className="music-toggle" onClick={toggleMusic} aria-label={label} aria-pressed={enabled} disabled={suspended} title={label}>{playing ? <Volume2 size={17} /> : <VolumeX size={17} />}<span className="music-playing-dot" data-playing={playing} aria-hidden="true" /></button>
    {failed && !showWelcome && <div className="nas-music-error"><p role="alert">{text("Music is not available yet. You can continue enjoying the invitation.", "సంగీతము ఇంకా అందుబాటులో లేదు. ఆహ్వానాన్ని చూడవచ్చు.")}</p><button onClick={() => setFailed(false)} aria-label={text("Dismiss music message", "సంగీత సందేశము మూసివేయండి")}><X size={16} /></button></div>}
    <dialog ref={welcome} className="music-welcome" aria-labelledby="music-welcome-title" onCancel={(event) => { event.preventDefault(); continueSilently(); }}>
      <div className="music-welcome-frame" aria-hidden="true">
        <BananaTrees />
        <svg className="music-welcome-arch" viewBox="0 0 440 680" preserveAspectRatio="none" fill="none">
          <path d="M16 644V125C16 50 105 13 220 13C335 13 424 50 424 125V644Q424 664 404 664H36Q16 664 16 644Z" stroke="#b49a5e" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d="M24 641V128C24 56 109 22 220 22C331 22 416 56 416 128V641Q416 656 401 656H39Q24 656 24 641Z" stroke="#b49a5e" strokeOpacity=".42" strokeWidth=".7" vectorEffect="non-scaling-stroke" />
          <path d="M25 596C51 574 58 542 43 518M34 582C49 584 61 575 61 566C47 563 39 570 34 582ZM43 562C29 560 25 548 29 540C42 543 47 551 43 562ZM47 541C58 534 58 523 52 516C41 525 40 532 47 541ZM415 596C389 574 382 542 397 518M406 582C391 584 379 575 379 566C393 563 401 570 406 582ZM397 562C411 560 415 548 411 540C398 543 393 551 397 562ZM393 541C382 534 382 523 388 516C399 525 400 532 393 541Z" stroke="#7c8e66" strokeWidth=".8" fill="#8fa37b14" />
          <path d="M207 39L220 32L233 39L220 46Z" fill="#b49a5e" fillOpacity=".8" />
          <circle cx="198" cy="39" r="1.7" fill="#ad7a87" /><circle cx="242" cy="39" r="1.7" fill="#ad7a87" />
        </svg>
        <Rangoli className="music-welcome-mandala" />
      </div>
      <p className="music-welcome-invocation" lang="te">శ్రీ సీతారామచంద్ర స్వామినే నమః</p>
      <Image className="music-welcome-blessing" src="/art/sacred-wedding.webp" width={500} height={390} sizes="180px" alt="The sacred wedding of Sita and Rama, from the family invitation" />
      <span className="eyebrow">{text("WITH THE BLESSINGS OF OUR FAMILIES", "పెద్దల ఆశీస్సులతో")}</span>
      <h2 id="music-welcome-title">{text("Deepa", "దీప")} <i>&</i><br />{text("Yashovardhan", "యశోవర్ధన్")}</h2>
      <LotusDivider />
      <p className="music-welcome-date">20 NOVEMBER 2026</p>
      {failed ? <p className="music-error" role="alert">{text("Music is unavailable. You can still open the invitation.", "సంగీతం అందుబాటులో లేదు. ఆహ్వానాన్ని చూడవచ్చు.")}</p> : <button className="button primary" onClick={openWithMusic}>{text("Open invitation", "ఆహ్వానం చూడండి")}<ArrowRight size={17} /></button>}
      <button className="music-silent" onClick={continueSilently}>{text("Continue without sound", "సంగీతం లేకుండా కొనసాగండి")}</button>
    </dialog>
    <output className="sr-only" aria-live="polite">{playing ? text("Background music playing from the NAS", "నేపథ్య సంగీతము వినిపిస్తోంది") : ""}</output>
  </>;
}