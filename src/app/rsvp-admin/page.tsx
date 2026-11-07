"use client";

import { useState, type SubmitEvent } from "react";
import { Download, LoaderCircle, LockKeyhole } from "lucide-react";

export default function RsvpAdmin() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function download(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const accessKey = new FormData(form).get("accessKey");
    const token = typeof accessKey === "string" ? accessKey : "";
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/rsvp/export", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(
          result.error || "The guest list could not be downloaded.",
        );
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "Deepa-Yashovardhan-Guest-List.xlsx";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      form.reset();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="rsvp-admin section-shell">
      <LockKeyhole size={26} />
      <span className="eyebrow">DEEPA & YASHOVARDHAN</span>
      <h1>Guest responses</h1>
      <form onSubmit={download}>
        <label className="rsvp-field">
          <span>Host access key</span>
          <input
            type="password"
            name="accessKey"
            required
            autoComplete="off"
            disabled={pending}
          />
        </label>
        {error && (
          <p className="rsvp-error" role="alert">
            {error}
          </p>
        )}
        <button className="button primary" type="submit" disabled={pending}>
          {pending ? (
            <LoaderCircle className="rsvp-spinner" size={18} />
          ) : (
            <Download size={18} />
          )}
          Download Excel
        </button>
      </form>
      <a className="text-link" href="/#rsvp">
        Return to invitation
      </a>
    </main>
  );
}
