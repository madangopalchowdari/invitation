import { rsvpSchema } from "@/lib/rsvp";
import { RsvpStorageError, saveRsvp } from "@/lib/rsvp-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const submissions = new Map<string, { count: number; expires: number }>();

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(process.env.RSVP_PUBLIC_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || request.url).origin;
  if (origin && origin !== expectedOrigin)
    return Response.json(
      { error: "Request origin is not allowed." },
      { status: 403 },
    );
  if (!request.headers.get("content-type")?.includes("application/json"))
    return Response.json({ error: "Send a JSON response." }, { status: 415 });
  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "shared";
  const now = Date.now();
  for (const [key, entry] of submissions)
    if (entry.expires <= now) submissions.delete(key);
  const entry = submissions.get(address) ?? { count: 0, expires: now + 60000 };
  if (entry.count >= 30 || submissions.size >= 5000)
    return Response.json(
      { error: "Please wait a minute before trying again." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  entry.count += 1;
  submissions.set(address, entry);
  try {
    const contents = await request.text();
    if (Buffer.byteLength(contents, "utf8") > 4096)
      return Response.json(
        { error: "The response is too long." },
        { status: 413 },
      );
    const result = rsvpSchema.safeParse(JSON.parse(contents));
    if (!result.success)
      return Response.json(
        { error: "Check your name, attendance, and guest count." },
        { status: 400 },
      );
    const record = await saveRsvp(result.data);
    return Response.json(
      {
        ok: true,
        id: record.id,
        attendance: record.attendance,
        guests: record.guests,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof SyntaxError)
      return Response.json(
        { error: "The response could not be read." },
        { status: 400 },
      );
    if (error instanceof RsvpStorageError)
      return Response.json(
        {
          error:
            "RSVP collection is not configured yet. Please contact the hosts.",
        },
        { status: 503 },
      );
    console.error(
      "RSVP save failed:",
      error instanceof Error ? error.message : "Storage error",
    );
    return Response.json(
      {
        error:
          "Your response could not be saved. Please try again or contact the hosts.",
      },
      { status: 503 },
    );
  }
}
