import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import lockfile from "proper-lockfile";
import { rsvpRecordsSchema, type RsvpInput, type RsvpRecord } from "./rsvp";

export class RsvpStorageError extends Error {}

function storageFolder() {
  const configured = process.env.RSVP_STORAGE_DIR;
  if (configured) {
    if (!path.isAbsolute(configured))
      throw new RsvpStorageError(
        "RSVP_STORAGE_DIR must be an absolute mounted-folder path.",
      );
    return configured;
  }
  if (process.env.NODE_ENV === "production")
    throw new RsvpStorageError("RSVP storage is not configured.");
  return path.join(process.cwd(), ".rsvp-data");
}

async function readRecords(folder: string): Promise<RsvpRecord[]> {
  try {
    const contents = await readFile(
      path.join(folder, "guest-list.json"),
      "utf8",
    );
    return rsvpRecordsSchema.parse(JSON.parse(contents));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function atomicWrite(filename: string, contents: string | Buffer) {
  const temporary = `${filename}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, contents, { flag: "wx", mode: 0o600 });
    await rename(temporary, filename);
  } finally {
    await rm(temporary, { force: true });
  }
}

export async function createRsvpWorkbook(
  records: RsvpRecord[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Deepa & Yashovardhan Wedding Invitation";
  const sheet = workbook.addWorksheet("Guest responses", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = [
    { header: "Name", key: "name", width: 28 },
    { header: "Attendance", key: "attendance", width: 20 },
    { header: "Guest count", key: "guests", width: 16 },
    { header: "Phone", key: "phone", width: 22 },
    { header: "Message", key: "message", width: 55 },
    { header: "Submitted (UTC)", key: "submittedAt", width: 28 },
    { header: "Updated (UTC)", key: "updatedAt", width: 28 },
    { header: "Response ID", key: "id", width: 38 },
  ];
  records.forEach((record) =>
    sheet.addRow({
      ...record,
      attendance: record.attendance === "in" ? "Count me in" : "Can't attend",
    }),
  );
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF77333F" },
  };
  sheet.autoFilter = { from: "A1", to: "H1" };
  sheet.getColumn("message").alignment = { wrapText: true, vertical: "top" };
  const summary = workbook.addWorksheet("Summary");
  summary.addRows([
    ["Deepa & Yashovardhan", "20 November 2026"],
    [
      "Attending responses",
      records.filter((record) => record.attendance === "in").length,
    ],
    [
      "Expected guests",
      records.reduce((total, record) => total + record.guests, 0),
    ],
    [
      "Declined responses",
      records.filter((record) => record.attendance === "out").length,
    ],
    ["Total responses", records.length],
  ]);
  summary.getColumn(1).width = 28;
  summary.getColumn(2).width = 24;
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

async function withStorageLock<T>(operation: (folder: string) => Promise<T>) {
  const folder = storageFolder();
  await mkdir(folder, { recursive: true, mode: 0o700 });
  const lockTarget = path.join(folder, ".rsvp-lock");
  await writeFile(lockTarget, "", { flag: "a", mode: 0o600 });
  const release = await lockfile.lock(lockTarget, {
    realpath: true,
    stale: 30000,
    update: 10000,
    retries: { retries: 6, minTimeout: 100, maxTimeout: 1000 },
  });
  try {
    return await operation(folder);
  } finally {
    await release();
  }
}

export async function saveRsvp(input: RsvpInput): Promise<RsvpRecord> {
  return withStorageLock(async (folder) => {
    const records = await readRecords(folder);
    const previousIndex = input.id
      ? records.findIndex((record) => record.id === input.id)
      : -1;
    if (previousIndex === -1 && records.length >= 5000)
      throw new RsvpStorageError(
        "The guest list has reached its response limit.",
      );
    const now = new Date().toISOString();
    const record: RsvpRecord = {
      id: input.id ?? randomUUID(),
      name: input.name,
      attendance: input.attendance,
      guests: input.guests,
      phone: input.phone,
      message: input.message,
      submittedAt:
        previousIndex >= 0 ? records[previousIndex].submittedAt : now,
      updatedAt: now,
    };
    if (previousIndex >= 0) records[previousIndex] = record;
    else records.push(record);
    const workbook = await createRsvpWorkbook(records);
    await atomicWrite(path.join(folder, "guest-list.xlsx"), workbook);
    await atomicWrite(
      path.join(folder, "guest-list.json"),
      JSON.stringify(records, null, 2),
    );
    return record;
  });
}

export async function exportRsvps(): Promise<Buffer> {
  return withStorageLock(async (folder) =>
    createRsvpWorkbook(await readRecords(folder)),
  );
}
