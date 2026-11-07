import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ExcelJS from "exceljs";
import { rsvpSchema } from "../src/lib/rsvp";
import {
  createRsvpWorkbook,
  exportRsvps,
  saveRsvp,
} from "../src/lib/rsvp-store";

async function main() {
  const folder = await mkdtemp(path.join(tmpdir(), "invitation-rsvp-"));
  const previousFolder = process.env.RSVP_STORAGE_DIR;
  process.env.RSVP_STORAGE_DIR = folder;
  try {
    assert.equal(
      rsvpSchema.safeParse({ name: "Guest", attendance: "out", guests: 1 })
        .success,
      false,
    );
    assert.equal(
      rsvpSchema.safeParse({ name: "Guest", attendance: "in", guests: 21 })
        .success,
      false,
    );
    assert.equal(
      rsvpSchema.safeParse({
        name: "Guest",
        attendance: "in",
        guests: 1,
        website: "spam",
      }).success,
      false,
    );
    const firstId = randomUUID();
    const first = await saveRsvp(
      rsvpSchema.parse({
        id: firstId,
        name: "=SUM(1,1)",
        attendance: "in",
        guests: 3,
        phone: "+91 9000000000",
        message: "Test response",
      }),
    );
    await saveRsvp(
      rsvpSchema.parse({
        id: randomUUID(),
        name: "దీప కుటుంబ మిత్రులు",
        attendance: "out",
        guests: 0,
      }),
    );
    const updated = await saveRsvp(
      rsvpSchema.parse({
        id: firstId,
        name: "=SUM(1,1)",
        attendance: "out",
        guests: 0,
      }),
    );
    assert.equal(first.submittedAt, updated.submittedAt);
    await Promise.all(
      Array.from({ length: 6 }, (_, index) =>
        saveRsvp(
          rsvpSchema.parse({
            id: randomUUID(),
            name: `Concurrent Guest ${index + 1}`,
            attendance: "in",
            guests: 2,
          }),
        ),
      ),
    );
    const filename = path.join(folder, "guest-list.json");
    const contents = await readFile(filename, "utf8");
    const records = JSON.parse(contents);
    assert.equal(records.length, 8);
    assert.equal(
      records.filter((record: { id: string }) => record.id === firstId).length,
      1,
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path.join(folder, "guest-list.xlsx"));
    const sheet = workbook.getWorksheet("Guest responses")!;
    assert.equal(sheet.rowCount, 9);
    assert.equal(sheet.getCell("A2").value, "=SUM(1,1)");
    assert.equal(sheet.getCell("A2").type, ExcelJS.ValueType.String);
    assert.equal(sheet.getCell("B2").value, "Can't attend");
    assert.equal(sheet.getCell("C2").value, 0);
    assert.equal(workbook.getWorksheet("Summary")!.getCell("B3").value, 12);
    assert.ok((await exportRsvps()).length > 0);
    assert.ok((await createRsvpWorkbook([])).length > 0);
    await writeFile(filename, "{not valid json", "utf8");
    await assert.rejects(
      saveRsvp(
        rsvpSchema.parse({
          name: "Should not overwrite",
          attendance: "in",
          guests: 1,
        }),
      ),
    );
    assert.equal(await readFile(filename, "utf8"), "{not valid json");
    console.log(
      "RSVP validation, concurrent NAS writes, response updates, Unicode, Excel totals, safe string cells, and corrupt-file protection passed.",
    );
  } finally {
    if (previousFolder === undefined) delete process.env.RSVP_STORAGE_DIR;
    else process.env.RSVP_STORAGE_DIR = previousFolder;
    await rm(folder, { recursive: true, force: true });
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
