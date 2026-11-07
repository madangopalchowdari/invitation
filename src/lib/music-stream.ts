import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

export async function streamNasMusic(request: Request, filename?: string) {
  if (!filename || !path.isAbsolute(filename)) return Response.json({ error: "NAS music is not configured." }, { status: 503 });
  let metadata;
  try { metadata = await stat(filename); } catch { return Response.json({ error: "The NAS music file is unavailable." }, { status: 404 }); }
  if (!metadata.isFile() || metadata.size === 0) return Response.json({ error: "The NAS music file is unavailable." }, { status: 404 });
  const size = metadata.size;
  const headers = new Headers({
    "Content-Type": "audio/mpeg",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });
  let start = 0;
  let end = size - 1;
  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    if (!match[1]) {
      const suffix = Number(match[2]);
      if (!Number.isSafeInteger(suffix) || suffix < 1) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
      start = Math.max(0, size - suffix);
    } else {
      start = Number(match[1]);
      end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  }
  headers.set("Content-Length", String(end - start + 1));
  const status = range ? 206 : 200;
  if (request.method === "HEAD") return new Response(null, { status, headers });
  const stream = createReadStream(filename, { start, end });
  const abort = () => { stream.destroy(); };
  request.signal.addEventListener("abort", abort, { once: true });
  stream.once("close", () => request.signal.removeEventListener("abort", abort));
  if (request.signal.aborted) stream.destroy();
  return new Response(Readable.toWeb(stream) as ReadableStream<Uint8Array>, { status, headers });
}