"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { artists, artworks } from "@/lib/data";
import { TOPICS, validate, LIMITS, type FieldErrors } from "@/lib/contact";

type Status = "idle" | "sending" | "success" | "error";
type Values = { name: string; email: string; topic: string; message: string; website: string };

const field =
  "w-full border-b bg-transparent py-3 text-ivory outline-none transition-colors placeholder:text-ivory/40 focus:border-gold";

const ERRORS: Record<string, string> = {
  not_configured:
    "Messages can't be sent from the website just yet. Please reach us on Instagram or TikTok in the meantime — we'd love to hear from you.",
  rate_limited: "That's a few messages in a short time. Please wait a few minutes and try again.",
  delivery_failed: "Your message couldn't be delivered just now. It's still here — please try again in a moment.",
  network: "The connection dropped before your message could be sent. It's still here — please try again.",
  generic: "Something went wrong sending your message. It's still here — please try again.",
};

export default function ContactForm() {
  const params = useSearchParams();
  const workSlug = params.get("work");
  const artistSlug = params.get("artist");
  const work = artworks.find((a) => a.slug === workSlug) ?? null;
  const workArtist = work ? artists.find((a) => a.id === work.artistId) : null;
  const artist = artists.find((a) => a.slug === artistSlug) ?? workArtist ?? null;

  const garment = params.get("garment");
  const placement = params.get("placement");
  const topicParam = params.get("topic");
  const initialTopic = topicParam === "wearable" ? "wearable" : work ? "artwork" : topicParam === "commission" ? "commission" : "general";
  const [values, setValues] = useState<Values>(() => ({
    name: "",
    email: "",
    topic: initialTopic,
    message:
      topicParam === "wearable" && work
        ? `I'd be interested in a wearable piece${garment ? ` (${garment}${placement ? `, ${placement.toLowerCase()}` : ""})` : ""} featuring “${work.title}”${workArtist ? ` by ${workArtist.name}` : ""}. `
        : work
          ? `I'd like to ask about “${work.title}”${workArtist ? ` by ${workArtist.name}` : ""}. `
          : "",
    website: "", // a hidden field: only bots fill it
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [problem, setProblem] = useState("");
  const submitting = useRef(false); // stops a second click / Enter from sending twice
  const startedAt = useRef(0);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const topicRef = useRef<HTMLSelectElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  useEffect(() => {
    if (status === "success" || status === "error") statusRef.current?.focus();
  }, [status]);

  const set = <K extends keyof Values>(k: K, v: Values[K]) => setValues((s) => ({ ...s, [k]: v }));
  const check = (k: keyof FieldErrors) => setErrors((e) => ({ ...e, [k]: validate(values)[k] }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    const found = validate(values);
    setErrors(found);
    const firstBad = (["name", "email", "topic", "message"] as const).find((k) => found[k]);
    if (firstBad) return { name: nameRef, email: emailRef, topic: topicRef, message: messageRef }[firstBad].current?.focus();

    submitting.current = true;
    setStatus("sending");
    setProblem("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, work: work?.title, artist: artist?.name, startedAt: startedAt.current }),
      });
      if (res.ok) return setStatus("success");
      const data = await res.json().catch(() => ({}));
      if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        setStatus("idle");
        return;
      }
      setProblem(ERRORS[data.error] ?? ERRORS.generic);
      setStatus("error");
    } catch {
      setProblem(ERRORS.network);
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  }

  if (status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="border border-ivory/15 p-8 outline-none">
        <p className="label-mono mb-3 text-gold">MESSAGE SENT</p>
        <h2 className="mb-3 font-editorial text-3xl">Thank you{values.name ? `, ${values.name.trim().split(" ")[0]}` : ""}.</h2>
        <p className="mb-8 max-w-prose text-ivory/75">Your message has been sent. We&apos;ll reply to {values.email.trim()}.</p>
        <button
          type="button"
          onClick={() => {
            setValues({ name: "", email: "", topic: "general", message: "", website: "" });
            setStatus("idle");
          }}
          className="label-mono rounded-full border border-ivory/40 px-6 py-3 transition-colors hover:border-ivory"
        >
          SEND ANOTHER
        </button>
      </div>
    );
  }

  const busy = status === "sending";
  const bad = (k: keyof FieldErrors) => (errors[k] ? "border-[#d98a6a]" : "border-ivory/30");
  return (
    <form id="form" onSubmit={onSubmit} noValidate aria-busy={busy} className="flex flex-col gap-7 scroll-mt-28">
      {work && (
        <p className="border-l-2 border-gold pl-4 text-ivory/80">
          Your enquiry is about <span className="text-ivory">{work.title}</span>
          {workArtist && <> by {workArtist.name}</>}.
        </p>
      )}
      {!work && artist && (
        <p className="border-l-2 border-gold pl-4 text-ivory/80">
          Your enquiry is about <span className="text-ivory">{artist.name}</span>.
        </p>
      )}

      <div>
        <label htmlFor="c-name" className="label-mono mb-1 block text-ivory/70">Your name</label>
        <input ref={nameRef} id="c-name" name="name" autoComplete="name" value={values.name} maxLength={LIMITS.name + 20}
          onChange={(e) => set("name", e.target.value)} onBlur={() => check("name")}
          aria-invalid={!!errors.name} aria-describedby={errors.name ? "c-name-err" : undefined} className={`${field} ${bad("name")}`} />
        <p id="c-name-err" className="mt-2 min-h-5 text-sm text-[#e7a58a]">{errors.name}</p>
      </div>

      <div>
        <label htmlFor="c-email" className="label-mono mb-1 block text-ivory/70">Email</label>
        <input ref={emailRef} id="c-email" name="email" type="email" inputMode="email" autoComplete="email" value={values.email}
          onChange={(e) => set("email", e.target.value)} onBlur={() => check("email")}
          aria-invalid={!!errors.email} aria-describedby={errors.email ? "c-email-err" : "c-email-help"} className={`${field} ${bad("email")}`} />
        {/* one fixed-height line for either the hint or the error, so nothing below ever jumps while someone is clicking */}
        <p id={errors.email ? "c-email-err" : "c-email-help"} className={`mt-2 min-h-5 text-sm ${errors.email ? "text-[#e7a58a]" : "text-ivory/60"}`}>
          {errors.email ?? "Only used to reply to you."}
        </p>
      </div>

      <div>
        <label htmlFor="c-topic" className="label-mono mb-1 block text-ivory/70">This is about</label>
        <select ref={topicRef} id="c-topic" name="topic" value={values.topic} onChange={(e) => set("topic", e.target.value)}
          aria-invalid={!!errors.topic} className={`${field} ${bad("topic")} appearance-none`}>
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value} className="bg-charcoal">{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="c-message" className="label-mono mb-1 block text-ivory/70">Message</label>
        <textarea ref={messageRef} id="c-message" name="message" rows={6} value={values.message} maxLength={LIMITS.message + 200}
          onChange={(e) => set("message", e.target.value)} onBlur={() => check("message")}
          aria-invalid={!!errors.message} aria-describedby={errors.message ? "c-message-err" : undefined} className={`${field} ${bad("message")}`} />
        <p id="c-message-err" className="mt-2 min-h-5 text-sm text-[#e7a58a]">{errors.message}</p>
      </div>

      {/* honeypot: hidden from people and from assistive tech; bots fill it in */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>Leave this empty<input tabIndex={-1} autoComplete="off" name="website" value={values.website} onChange={(e) => set("website", e.target.value)} /></label>
      </div>

      {status === "error" && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="border border-[#d98a6a]/60 p-5 text-sm leading-relaxed text-ivory/90 outline-none">
          {problem}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="label-mono inline-flex min-h-12 items-center rounded-full border border-gold px-8 py-3 text-gold transition-colors hover:bg-gold hover:text-charcoal disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-gold"
        >
          {busy ? "SENDING…" : status === "error" ? "TRY AGAIN" : "SEND MESSAGE"}
        </button>
        <p className="sr-only" role="status">{busy ? "Sending your message" : ""}</p>
      </div>
    </form>
  );
}
