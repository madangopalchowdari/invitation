import { timingSafeEqual } from "node:crypto";
import { exportRsvps } from "@/lib/rsvp-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = process.env.RSVP_ADMIN_TOKEN;
  if (!token)
    return Response.json(
      { error: "Host export is not configured." },
      { status: 503 },
    );
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  const actual = Buffer.from(token);
  const supplied = Buffer.from(provided);
  if (actual.length !== supplied.length || !timingSafeEqual(actual, supplied))
    return Response.json(
      { error: "The host access key is not correct." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  try {
    const workbook = await exportRsvps();
    return new Response(new Uint8Array(workbook), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="Deepa-Yashovardhan-Guest-List.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      {
        error:
          "The guest list could not be read. Check the NAS folder connection.",
      },
      { status: 503 },
    );
  }
}
