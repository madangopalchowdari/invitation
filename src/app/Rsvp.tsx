"use client";

import { useRef, useState, type SubmitEvent } from "react";
import { v4 as uuid } from "uuid";
import { Check, LoaderCircle, Send, UserCheck, UserX } from "lucide-react";
import { BananaTrees, LotusDivider } from "./WeddingDecor";

const responseKey = "deepa-yashovardhan:rsvp-id";

function savedResponseId() {
  try {
    return localStorage.getItem(responseKey);
  } catch {
    return null;
  }
}

export default function Rsvp({ telugu }: Readonly<{ telugu: boolean }>) {
  const [attendance, setAttendance] = useState<"in" | "out">("in");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const responseId = useRef<string | null>(null);
  const text = (english: string, translated: string) =>
    telugu ? translated : english;

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const values = new FormData(event.currentTarget);
    if (!responseId.current) {
      responseId.current = savedResponseId() ?? uuid();
    }
    setSubmitting(true);
    setSaved(false);
    setError("");
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: responseId.current,
          name: values.get("name"),
          attendance,
          guests: attendance === "in" ? Number(values.get("guests")) : 0,
          phone: values.get("phone"),
          message: values.get("message"),
          website: values.get("website"),
        }),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        if (response.status === 400)
          throw new Error(
            text(
              "Please check your name and guest count.",
              "మీ పేరు, అతిథుల సంఖ్యను సరిచూసుకోండి.",
            ),
          );
        if (response.status === 429)
          throw new Error(
            text(
              "Please wait a minute before trying again.",
              "దయచేసి ఒక నిమిషం తరువాత ప్రయత్నించండి.",
            ),
          );
        throw new Error(
          text(
            "We could not save your response. Please try again or contact the family.",
            "మీ సమాధానాన్ని భద్రపరచలేకపోయాము. మరలా ప్రయత్నించండి లేదా కుటుంబ సభ్యులను సంప్రదించండి.",
          ),
        );
      }
      responseId.current = result.id;
      try {
        localStorage.setItem(responseKey, result.id);
      } catch {}
      setSaved(true);
    } catch (error_) {
      setError(
        error_ instanceof Error
          ? error_.message
          : text("Please try again.", "మరలా ప్రయత్నించండి."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const sendLabel = saved
    ? text("Update response", "సమాధానము మార్చండి")
    : text("Send response", "సమాధానము పంపండి");
  const submitLabel = submitting
    ? text("Saving your response...", "మీ సమాధానము భద్రపరచుచున్నాము...")
    : sendLabel;

  return (
    <section
      id="rsvp"
      className="rsvp-section section-shell section-with-bananas"
      aria-labelledby="rsvp-heading"
    >
      <BananaTrees />
      <div className="section-heading">
        <span className="eyebrow">
          {text(
            "WITH LOVE, WE AWAIT YOUR PRESENCE",
            "మీ రాకను ఆప్యాయముగా ఎదురుచూచుచున్నాము",
          )}
        </span>
        <h2 id="rsvp-heading">
          {text("Will you join us?", "మా వేడుకకు విచ్చేయగలరా?")}
        </h2>
        <p>
          {text(
            "A word from you will help us welcome your family with care.",
            "మీ రాకను తెలియజేసినచో, ఆప్యాయముగా ఆతిథ్యమిచ్చుటకు మాకు తోడ్పడును.",
          )}
        </p>
        <LotusDivider />
      </div>
      <form className="rsvp-form" onSubmit={submit}>
        <fieldset className="rsvp-options" disabled={submitting}>
          <legend>{text("Your response", "మీ సమాధానము")}</legend>
          <label className={attendance === "in" ? "is-selected" : ""}>
            <input
              type="radio"
              name="attendance"
              value="in"
              checked={attendance === "in"}
              onChange={() => {
                setAttendance("in");
                setSaved(false);
              }}
            />
            <UserCheck size={20} />
            <span>{text("Count me in", "విచ్చేస్తాము")}</span>
          </label>
          <label className={attendance === "out" ? "is-selected" : ""}>
            <input
              type="radio"
              name="attendance"
              value="out"
              checked={attendance === "out"}
              onChange={() => {
                setAttendance("out");
                setSaved(false);
              }}
            />
            <UserX size={20} />
            <span>{text("Count me out", "రాలేము")}</span>
          </label>
        </fieldset>
        <fieldset className="rsvp-fields" disabled={submitting}>
          <label className="rsvp-field">
            <span>{text("Your name", "మీ పేరు")}</span>
            <input
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              onChange={() => setSaved(false)}
            />
          </label>
          {attendance === "in" && (
            <label className="rsvp-field">
              <span>
                {text(
                  "Number attending, including you",
                  "మీతో కలిపి విచ్చేసే వారి సంఖ్య",
                )}
              </span>
              <input
                name="guests"
                type="number"
                min={1}
                max={20}
                step={1}
                defaultValue={1}
                inputMode="numeric"
                required
                onChange={() => setSaved(false)}
              />
            </label>
          )}
          <label className="rsvp-field">
            <span>{text("Phone (optional)", "ఫోన్ నంబరు (ఐచ్ఛికము)")}</span>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={40}
              onChange={() => setSaved(false)}
            />
          </label>
          <label className="rsvp-field rsvp-field-wide">
            <span>
              {text(
                "A message for the family (optional)",
                "కుటుంబమునకు సందేశము (ఐచ్ఛికము)",
              )}
            </span>
            <textarea
              name="message"
              rows={3}
              maxLength={400}
              onChange={() => setSaved(false)}
            />
          </label>
          <label className="rsvp-trap" aria-hidden="true">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </fieldset>
        {error && (
          <p className="rsvp-error" role="alert">
            {error}
          </p>
        )}
        {saved && (
          <div className="rsvp-success">
            <Check size={21} />
            <output aria-live="polite">
              {attendance === "in"
                ? text(
                    "Thank you. We look forward to welcoming you and your family.",
                    "ధన్యవాదములు. మీకును మీ కుటుంబమునకును ఆప్యాయ స్వాగతము.",
                  )
                : text(
                    "Thank you for letting us know. Your good wishes mean a great deal to us.",
                    "తెలియజేసినందుకు ధన్యవాదములు. మీ శుభాకాంక్షలు మాకెంతో విలువైనవి.",
                  )}
            </output>
          </div>
        )}
        <button
          className="button primary rsvp-submit"
          type="submit"
          disabled={submitting}
        >
          {submitting ? (
            <LoaderCircle className="rsvp-spinner" size={18} />
          ) : (
            <Send size={18} />
          )}
          {submitLabel}
        </button>
        <p className="rsvp-privacy">
          {text(
            "Only the hosts can view your response.",
            "మీ సమాధానమును ఆహ్వానించువారు మాత్రమే చూడగలరు.",
          )}
        </p>
      </form>
    </section>
  );
}
