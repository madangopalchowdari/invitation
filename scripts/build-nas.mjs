import { cp, mkdir, rm, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const staging = path.join(root, ".nas-package");
const archive = path.join(root, "invitation-nas.tar.gz");
const zipArchive = path.join(root, "invitation-nas.zip");
const sourceFiles = [
  "src", "public", "scripts", "deploy", "package.json", "package-lock.json",
  "next.config.ts", "next-env.d.ts", "tsconfig.json", "Dockerfile",
  ".dockerignore",
];

function run(command, args, options = {}) {
  return execFileSync(command, args, { cwd: root, stdio: "inherit", ...options });
}

const platform = run("docker", ["version", "--format", "{{.Server.Os}}/{{.Server.Arch}}"], { encoding: "utf8", stdio: "pipe" }).trim();
if (!platform.startsWith("linux/")) throw new Error("Use a Docker Linux engine for the NAS build.");
run("tar", ["--version"], { stdio: "pipe" });
if (process.env.RSVP_STORAGE_DIR) {
  const relative = path.relative(staging, path.resolve(root, process.env.RSVP_STORAGE_DIR));
  if (relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))) throw new Error("RSVP storage must not be inside build staging.");
}
console.log(`Validating a standalone Linux build on ${platform}.`);
run("docker", ["build", "--progress=plain", "--tag", "deepa-yashovardhan-invitation:nas", "--build-arg", `NEXT_PUBLIC_SITE_URL=${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}`, "."]);
await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
try {
  for (const filename of sourceFiles) await cp(path.join(root, filename), path.join(staging, filename), {
    recursive: true,
    filter: (source) => !/\.(mp3|m4a|aac|wav|ogg|flac)$/i.test(source) && !["nas-media", "rsvp-data", ".rsvp-data"].includes(path.basename(source)),
  });
  await cp(path.join(root, "deploy/compose.nas.yaml"), path.join(staging, "compose.yaml"));
  await cp(path.join(root, "deploy/NAS-UPDATE.txt"), path.join(staging, "START-HERE.txt"));
  run("tar", ["-czf", archive, "-C", staging, "."]);
  if (process.platform === "win32") {
    const quote = (value) => `'${value.replaceAll("'", "''")}'`;
    const command = `$archive = [System.IO.Compression.ZipFile]::Open(${quote(zipArchive)}, [System.IO.Compression.ZipArchiveMode]::Create); try { Get-ChildItem -LiteralPath ${quote(staging)} -File -Recurse -Force | ForEach-Object { $entry = $_.FullName.Substring(${staging.length + 1}).Replace([char]92, [char]47); [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $entry, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null } } finally { $archive.Dispose() }`;
    await rm(zipArchive, { force: true });
    run("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", `$ErrorActionPreference = 'Stop'; Add-Type -AssemblyName System.IO.Compression; Add-Type -AssemblyName System.IO.Compression.FileSystem; ${command}`]);
    console.log(`Created invitation-nas.zip (${((await stat(zipArchive)).size / 1024 / 1024).toFixed(1)} MB).`);
  }
  const bytes = (await stat(archive)).size;
  console.log(`Created invitation-nas.tar.gz (${(bytes / 1024 / 1024).toFixed(1)} MB).`);
  console.log("All RSVP records were preserved and excluded from the public deployment archive.");
} finally { await rm(staging, { recursive: true, force: true }); }