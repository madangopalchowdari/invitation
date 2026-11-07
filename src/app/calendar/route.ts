export function GET() {
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Deepa and Yashovardhan//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:deepa-yashovardhan-20261120@wedding",
    "DTSTAMP:20261107T000000Z",
    "DTSTART:20261120T155200Z",
    "DTEND:20261120T175200Z",
    "SUMMARY:Deepa & Yashovardhan's Wedding",
    "LOCATION:Sushi Convention Hall\\, 3622\\, Sushi Greens\\, NH-4\\,",
    " Davangere\\, Karnataka 577566",
    "GEO:14.4509289;75.875412",
    "URL:https://maps.app.goo.gl/e5Lix5gwTppnGJtk9",
    "DESCRIPTION:Dinner from 7:30 PM IST. Muhurtham at 9:22 PM IST.",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="Deepa-and-Yashovardhan.ics"',
    },
  });
}
