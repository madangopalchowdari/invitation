import { streamNasMusic } from "@/lib/music-stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return streamNasMusic(request, process.env.NAS_MUSIC_FILE);
}

export function HEAD(request: Request) {
  return streamNasMusic(request, process.env.NAS_MUSIC_FILE);
}