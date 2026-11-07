import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import gsap from "gsap";
import { createMusicController } from "../src/lib/music-controller";
import { streamNasMusic } from "../src/lib/music-stream";

class TestAudio extends EventTarget {
  currentTime = 0;
  duration = 65;
  volume = 0;
  paused = true;
  ended = false;
  readyState = 0;
  error = null;
  play() {
    if (this.readyState === 0) { this.readyState = 4; this.dispatchEvent(new Event("loadedmetadata")); }
    this.paused = false;
    this.dispatchEvent(new Event("playing"));
    return Promise.resolve();
  }
  pause() { this.paused = true; this.dispatchEvent(new Event("pause")); }
  load() { this.readyState = 0; }
}

async function testPlayback() {
  const first = new TestAudio();
  const second = new TestAudio();
  let playing = false;
  let failed = false;
  const controller = createMusicController([first, second] as unknown as HTMLAudioElement[], () => true, (value) => { playing = value; }, () => { failed = true; });
  try {
    await controller.play();
    assert.equal(first.currentTime, 5);
    gsap.getTweensOf(first)[0].progress(1);
    assert.equal(first.volume, .28);
    first.currentTime = first.duration - 6;
    first.dispatchEvent(new Event("timeupdate"));
    await Promise.resolve();
    const transition = gsap.getTweensOf(first)[0].parent;
    assert.ok(transition);
    transition.progress(.5);
    assert.ok(first.volume > 0 && first.volume < .28);
    assert.ok(second.volume > 0 && second.volume < .28);
    assert.equal(second.currentTime, 5);
    transition.progress(1);
    assert.equal(first.paused, true);
    assert.equal(second.paused, false);
    assert.equal(second.volume, .28);
    controller.pause();
    assert.equal(first.paused, true);
    assert.equal(second.paused, true);
    assert.equal(first.volume, 0);
    assert.equal(second.volume, 0);
    assert.equal(playing, false);
    await controller.play();
    assert.equal(second.paused, false);
    const resumeFade = gsap.getTweensOf(second)[0];
    resumeFade.progress(.5);
    assert.ok(second.volume > 0 && second.volume < .28);
    resumeFade.progress(1);
    assert.equal(second.volume, .28);
    second.dispatchEvent(new Event("error"));
    assert.equal(failed, true);
    assert.equal(second.paused, true);
    console.log("Custom audio start, overlapping fades, silent old stream, mute/resume, and error handling passed.");
  } finally { controller.destroy(); }
}

async function main() {
  await testPlayback();
  const folder = await mkdtemp(path.join(tmpdir(), "nas-music-test-"));
  const filename = path.join(folder, "test.mp3");
  try {
    await writeFile(filename, "0123456789");
    const full = await streamNasMusic(new Request("http://localhost/api/music"), filename);
    assert.equal(full.status, 200);
    assert.equal(full.headers.get("accept-ranges"), "bytes");
    assert.equal(await full.text(), "0123456789");
    const range = await streamNasMusic(new Request("http://localhost/api/music", { headers: { Range: "bytes=2-5" } }), filename);
    assert.equal(range.status, 206);
    assert.equal(range.headers.get("content-range"), "bytes 2-5/10");
    assert.equal(await range.text(), "2345");
    const suffix = await streamNasMusic(new Request("http://localhost/api/music", { headers: { Range: "bytes=-3" } }), filename);
    assert.equal(await suffix.text(), "789");
    const outside = await streamNasMusic(new Request("http://localhost/api/music", { headers: { Range: "bytes=99-100" } }), filename);
    assert.equal(outside.status, 416);
    const multiple = await streamNasMusic(new Request("http://localhost/api/music", { headers: { Range: "bytes=0-1,3-4" } }), filename);
    assert.equal(multiple.status, 416);
    const head = await streamNasMusic(new Request("http://localhost/api/music", { method: "HEAD" }), filename);
    assert.equal(head.headers.get("content-length"), "10");
    assert.equal(await head.text(), "");
    assert.equal((await streamNasMusic(new Request("http://localhost/api/music"))).status, 503);
    assert.equal((await streamNasMusic(new Request("http://localhost/api/music"), path.join(folder, "missing.mp3"))).status, 404);
    console.log("NAS stream, full playback bytes, seek ranges, suffix ranges, HEAD, invalid ranges, and missing-file responses passed.");
  } finally { await rm(folder, { recursive: true, force: true }); }
}
void main().catch((error) => { console.error(error); process.exitCode = 1; });