import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export async function cleanBuild(root, storageDirectory = process.env.RSVP_STORAGE_DIR) {
  const storage = path.resolve(root, storageDirectory || ".rsvp-data");
  const generated = [".next", "tsconfig.tsbuildinfo"];
  for (const filename of generated) {
    const target = path.resolve(root, filename);
    const relative = path.relative(target, storage);
    if (relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))) {
      throw new Error(`Refusing cleanup: RSVP storage overlaps ${filename}. Move guest data outside build-cache folders.`);
    }
  }
  for (const filename of generated) {
    await rm(path.join(root, filename), { recursive: true, force: true });
    console.log(`Cleaned generated cache: ${filename}`);
  }
  console.log("RSVP storage, Excel guest lists, photos, videos, and environment files were preserved.");
}

const invoked = process.argv[1] && path.resolve(process.argv[1]);
if (invoked === fileURLToPath(import.meta.url)) {
  await cleanBuild(fileURLToPath(new URL("../", import.meta.url)));
}