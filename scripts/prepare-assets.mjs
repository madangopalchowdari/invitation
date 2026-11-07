import sharp from "sharp";
import { readdir, mkdir, copyFile, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "public");
await mkdir(path.join(output, "photos"), { recursive: true });
await mkdir(path.join(output, "art"), { recursive: true });
await mkdir(path.join(output, "story"), { recursive: true });
const names = (await readdir("brideandgroomphotos"))
  .filter((name) => /\.jpe?g$/i.test(name))
  .sort();
const tiles = [];
for (const [index, name] of names.entries()) {
  const source = path.join(root, "brideandgroomphotos", name);
  const metadata = await sharp(source).metadata();
  await sharp(source)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(path.join(output, "photos", name.replace(/\.jpe?g$/i, ".webp")));
  const thumbnail = await sharp(source)
    .rotate()
    .resize(200, 220, { fit: "contain", background: "#f4eddf" })
    .extend({ bottom: 30, background: "#f4eddf" })
    .toBuffer();
  const label = Buffer.from(
    `<svg width="200" height="30"><text x="10" y="21" font-size="16" fill="#532c32">${name}</text></svg>`,
  );
  tiles.push({
    input: await sharp(thumbnail)
      .composite([{ input: label, top: 220, left: 0 }])
      .png()
      .toBuffer(),
    left: (index % 5) * 200,
    top: Math.floor(index / 5) * 250,
  });
  console.log(`${name}: ${metadata.width}x${metadata.height}`);
}
await sharp({
  create: {
    width: 1000,
    height: Math.ceil(names.length / 5) * 250,
    channels: 3,
    background: "#f4eddf",
  },
})
  .composite(tiles)
  .jpeg()
  .toFile(".analysis/photo-contact.jpg");
const frame = path.join(root, ".videoframes/frame_001.jpg");
await sharp(frame)
  .extract({ left: 0, top: 0, width: 640, height: 66 })
  .webp({ quality: 95 })
  .toFile(path.join(output, "art/toran.webp"));
await sharp(frame)
  .extract({ left: 0, top: 96, width: 65, height: 264 })
  .webp({ quality: 95 })
  .toFile(path.join(output, "art/left-border.webp"));
await sharp(frame)
  .extract({ left: 575, top: 96, width: 65, height: 264 })
  .webp({ quality: 95 })
  .toFile(path.join(output, "art/right-border.webp"));
await sharp(frame)
  .extract({ left: 190, top: 90, width: 255, height: 200 })
  .webp({ quality: 95 })
  .toFile(path.join(output, "art/blessing.webp"));
const originalFrame = execFileSync(
  "ffmpeg",
  [
    "-v",
    "error",
    "-ss",
    "0.3",
    "-i",
    "Deepa_Yashovardhan_Wedding_Invitation_Photos_Final.mp4",
    "-frames:v",
    "1",
    "-f",
    "image2pipe",
    "-vcodec",
    "png",
    "pipe:1",
  ],
  { maxBuffer: 20 * 1024 * 1024 },
);

async function extractDecoration(name, region) {
  const { data, info } = await sharp(originalFrame)
    .extract(region)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let offset = 0; offset < data.length; offset += 4) {
    const brightest = Math.max(
      data[offset],
      data[offset + 1],
      data[offset + 2],
    );
    const darkest = Math.min(data[offset], data[offset + 1], data[offset + 2]);
    const saturation = brightest === 0 ? 0 : (brightest - darkest) / brightest;
    const pigment = Math.max(
      (saturation - 0.23) / 0.13,
      (175 - brightest) / 55,
    );
    data[offset + 3] = Math.round(255 * Math.max(0, Math.min(1, pigment)));
  }
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .webp({ quality: 96, alphaQuality: 100 })
    .toFile(path.join(output, `art/${name}.webp`));
}

await extractDecoration("hanging-toran", {
  left: 0,
  top: 0,
  width: 1280,
  height: 130,
});
await extractDecoration("banana-left", {
  left: 0,
  top: 205,
  width: 134,
  height: 300,
});
await extractDecoration("banana-right", {
  left: 1146,
  top: 205,
  width: 134,
  height: 300,
});
await extractDecoration("kalash-left", {
  left: 0,
  top: 594,
  width: 125,
  height: 126,
});
await extractDecoration("kalash-right", {
  left: 1155,
  top: 594,
  width: 125,
  height: 126,
});
await extractDecoration("sacred-wedding", {
  left: 385,
  top: 182,
  width: 500,
  height: 390,
});
const flowerCrop = await sharp(
  path.join(root, "brideandgroomphotos/KP-29.jpeg"),
)
  .extract({ left: 0, top: 250, width: 4672, height: 1050 })
  .resize(1600, 360)
  .ensureAlpha()
  .toBuffer();
const flowerMask = Buffer.from(
  `<svg width="1600" height="360" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="edge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="white" stop-opacity="0"/><stop offset=".2" stop-color="white"/><stop offset=".6" stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient></defs><path d="M0 0H1600V360H0Z" fill="url(#edge)"/></svg>`,
);
await sharp(flowerCrop)
  .composite([{ input: flowerMask, blend: "dest-in" }])
  .webp({ quality: 93, alphaQuality: 100 })
  .toFile(path.join(output, "art/engagement-flowers.webp"));
const videoStory = JSON.parse(
  await readFile(path.join(root, "src/data/video-story.json"), "utf8"),
);
const storyTiles = [];
for (const [index, chapter] of videoStory.entries()) {
  const image = execFileSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-ss",
      String(chapter.timestamp),
      "-i",
      "Deepa_Yashovardhan_Wedding_Invitation_Photos_Final.mp4",
      "-frames:v",
      "1",
      "-f",
      "image2pipe",
      "-vcodec",
      "png",
      "pipe:1",
    ],
    { maxBuffer: 20 * 1024 * 1024 },
  );
  await sharp(image)
    .webp({ quality: 95 })
    .toFile(path.join(output, `story/${chapter.id}.webp`));
  const label = Buffer.from(
    `<svg width="480" height="30"><text x="12" y="21" font-size="15" fill="#77333f">${chapter.id} · ${chapter.timestamp}s</text></svg>`,
  );
  const tile = await sharp(image)
    .resize(480, 270)
    .extend({ bottom: 30, background: "#f5efe3" })
    .composite([{ input: label, left: 0, top: 270 }])
    .png()
    .toBuffer();
  storyTiles.push({
    input: tile,
    left: (index % 2) * 480,
    top: Math.floor(index / 2) * 300,
  });
  console.log(`Story frame: ${chapter.id} at ${chapter.timestamp}s`);
}
await sharp({
  create: {
    width: 960,
    height: Math.ceil(videoStory.length / 2) * 300,
    channels: 3,
    background: "#f5efe3",
  },
})
  .composite(storyTiles)
  .jpeg({ quality: 90 })
  .toFile(path.join(root, ".analysis/video-story-contact.jpg"));
await copyFile(
  "Deepa_Yashovardhan_Wedding_Invitation_Photos_Final.mp4",
  path.join(output, "invitation.mp4"),
);
const videoMetadata = JSON.parse(execFileSync("ffprobe", [
  "-v", "error", "-show_entries", "format=duration", "-of", "json",
  path.join(output, "invitation.mp4"),
], { encoding: "utf8" }));
const audioFadeOut = Math.max(0, Number(videoMetadata.format.duration) - 4);
execFileSync("ffmpeg", [
  "-y", "-v", "error", "-i", path.join(output, "invitation.mp4"),
  "-map", "0:a:0", "-vn", "-ac", "2", "-ar", "44100",
  "-af", `highpass=f=65,lowpass=f=6500,loudnorm=I=-20:TP=-3:LRA=7,afade=t=in:st=0:d=2,afade=t=out:st=${audioFadeOut}:d=4`,
  "-c:a", "libmp3lame", "-b:a", "128k", path.join(output, "invitation-music.mp3"),
], { stdio: "inherit" });
await copyFile(
  ".videoframes/frame_016.jpg",
  path.join(output, "art/video-poster.jpg"),
);
console.log("Prepared original-photo derivatives and video-matched artwork.");
