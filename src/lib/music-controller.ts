import gsap from "gsap";
import { invitationMusic } from "../data/music";

export function createMusicController(players: HTMLAudioElement[], canPlay: () => boolean, onPlaying: (playing: boolean) => void, onFailure: () => void) {
  let active = 0;
  let mixing = false;
  let disposed = false;
  let fade: gsap.core.Timeline | null = null;
  const volume = invitationMusic.volume / 100;
  const start = invitationMusic.startSeconds;
  const updateState = () => onPlaying(players.some((player) => !player.paused && !player.ended));
  const metadataHandlers = players.map((player) => () => {
    if (Number.isFinite(player.duration) && player.duration > start) player.currentTime = start;
  });
  const playHandlers = players.map((player, index) => () => {
    if (disposed || !canPlay()) { player.pause(); return; }
    updateState();
    if (!mixing && index === active && !fade) fade = gsap.timeline().to(player, { volume, duration: invitationMusic.fadeInSeconds, ease: "sine.inOut" });
  });

  function pause() {
    fade?.kill();
    fade = null;
    if (mixing && players[1 - active].volume > players[active].volume) active = 1 - active;
    mixing = false;
    players.forEach((player) => { player.pause(); player.volume = 0; });
    onPlaying(false);
  }
  function failure() {
    if (disposed) return;
    pause();
    onFailure();
  }
  function handoff(index: number) {
    const outgoing = players[index];
    const remaining = outgoing.duration - outgoing.currentTime;
    if (disposed || index !== active || mixing || !canPlay() || !Number.isFinite(remaining) || remaining > invitationMusic.fadeOutSeconds || remaining <= 0) return;
    const nextIndex = 1 - index;
    const incoming = players[nextIndex];
    mixing = true;
    incoming.volume = 0;
    if (incoming.error) incoming.load();
    if (incoming.readyState >= 1) incoming.currentTime = Math.min(start, Math.max(0, incoming.duration - 1));
    void incoming.play().then(() => {
      if (disposed || !canPlay()) { incoming.pause(); mixing = false; return; }
      fade?.kill();
      const duration = Math.max(.25, Math.min(invitationMusic.fadeOutSeconds, outgoing.duration - outgoing.currentTime));
      fade = gsap.timeline({ onComplete: () => {
        active = nextIndex;
        mixing = false;
        outgoing.pause();
        outgoing.volume = 0;
        incoming.volume = volume;
        fade = null;
        updateState();
      } });
      fade.to(outgoing, { volume: 0, duration, ease: "sine.inOut" }, 0).to(incoming, { volume, duration, ease: "sine.inOut" }, 0);
    }).catch(() => { mixing = false; failure(); });
  }
  const progressHandlers = players.map((_, index) => () => handoff(index));
  const endHandlers = players.map((player, index) => () => {
    if (disposed || index !== active || mixing || !canPlay()) return;
    fade?.kill();
    fade = null;
    player.volume = 0;
    player.currentTime = Math.min(start, Math.max(0, player.duration - 1));
    void player.play().catch(failure);
  });
  players.forEach((player, index) => {
    player.volume = 0;
    player.addEventListener("loadedmetadata", metadataHandlers[index]);
    player.addEventListener("playing", playHandlers[index]);
    player.addEventListener("pause", updateState);
    player.addEventListener("timeupdate", progressHandlers[index]);
    player.addEventListener("ended", endHandlers[index]);
    player.addEventListener("error", failure);
  });
  return {
    async play() {
      if (disposed || !canPlay()) return;
      const targets = mixing ? players : [players[active]];
      for (const player of targets) if (player.error) player.load();
      try {
        await Promise.all(targets.map((player) => player.play()));
        if (disposed || !canPlay()) { pause(); return; }
        fade?.resume();
        updateState();
      } catch (error_) { pause(); throw error_; }
    },
    pause,
    destroy() {
      disposed = true;
      fade?.kill();
      players.forEach((player, index) => {
        player.removeEventListener("loadedmetadata", metadataHandlers[index]);
        player.removeEventListener("playing", playHandlers[index]);
        player.removeEventListener("pause", updateState);
        player.removeEventListener("timeupdate", progressHandlers[index]);
        player.removeEventListener("ended", endHandlers[index]);
        player.removeEventListener("error", failure);
        player.pause();
      });
    },
  };
}