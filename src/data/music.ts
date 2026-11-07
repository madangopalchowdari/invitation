export const invitationMusic = {
  url: "/api/music",
  startSeconds: 5,
  volume: 28,
  fadeInSeconds: 5,
  fadeOutSeconds: 7,
} as const;

export function invitationMusicVolume(time: number, duration: number): number {
  if (!Number.isFinite(time) || !Number.isFinite(duration) || duration <= 0) return 0;
  const fadeIn = Math.min(1, Math.max(0, (time - invitationMusic.startSeconds) / invitationMusic.fadeInSeconds));
  const fadeOut = Math.min(1, Math.max(0, (duration - time) / invitationMusic.fadeOutSeconds));
  return Math.round(invitationMusic.volume * Math.min(fadeIn, fadeOut));
}