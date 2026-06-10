"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  ChatGptIcon,
  ClaudeIcon,
  CursorIcon,
  GeminiIcon,
} from "@/components/brand/AiProviderIcons";
import { Turnstile } from "@/components/security/Turnstile";

const ACADEMY_EMAIL = "academy@masterfabric.co";

export interface ApplyCopy {
  kicker: string;
  title: string;
  subtitle: string;
  cohort1Label: string;
  cohort1Date: string;
  cohort2Label: string;
  cohort2Date: string;
  capacity: string;
  emailSubject: string;
  form: {
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    role: string;
    rolePlaceholder: string;
    experience: string;
    experiencePlaceholder: string;
    cohort: string;
    motivation: string;
    motivationPlaceholder: string;
    send: string;
    copy: string;
    copied: string;
    cursor: string;
    claude: string;
    chatgpt: string;
    gemini: string;
    verifyHint: string;
    deeplinkTitle: string;
    deeplinkHint: string;
  };
}

const inputClass =
  "w-full border border-white/25 bg-black px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-white";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-white/50">
        {label}
      </span>
      {children}
    </label>
  );
}

/**
 * Contact & Apply: builds an application from the form input three ways —
 * a mailto draft to academy@masterfabric.co, a Cursor deeplink, and a Claude
 * deeplink. The prompt template comes from the /prompts reference folder.
 */
export function ApplySection({
  copy,
  promptTemplate,
}: {
  copy: ApplyCopy;
  promptTemplate: string;
}) {
  const cohorts = [
    `${copy.cohort1Label} — ${copy.cohort1Date}`,
    `${copy.cohort2Label} — ${copy.cohort2Date}`,
  ];

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    experience: "",
    cohort: cohorts[0],
    motivation: "",
  });
  const [copied, setCopied] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const verified = turnstileToken !== "";

  const lockedClass = verified ? "" : " pointer-events-none opacity-50";

  function guardClick(e: React.MouseEvent) {
    if (!verified) e.preventDefault();
  }

  const prompt = useMemo(() => {
    return promptTemplate
      .replaceAll("{{name}}", form.name || "—")
      .replaceAll("{{email}}", form.email || "—")
      .replaceAll("{{role}}", form.role || "—")
      .replaceAll("{{experience}}", form.experience || "—")
      .replaceAll("{{cohort}}", form.cohort)
      .replaceAll("{{motivation}}", form.motivation || "—");
  }, [form, promptTemplate]);

  const encoded = encodeURIComponent(prompt);
  const mailtoHref = `mailto:${ACADEMY_EMAIL}?subject=${encodeURIComponent(
    `${copy.emailSubject}${form.name ? ` — ${form.name}` : ""}`,
  )}&body=${encoded}`;
  const cursorHref = `cursor://anysphere.cursor-deeplink/prompt?text=${encoded}`;
  const claudeHref = `https://claude.ai/new?q=${encoded}`;
  const chatgptHref = `https://chatgpt.com/?q=${encoded}`;
  // Gemini has no official prompt-prefill param; Google AI Mode (udm=50) does.
  const geminiHref = `https://www.google.com/search?udm=50&q=${encoded}`;

  function update(key: keyof typeof form) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="apply" className="border-t border-white/15">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/45">
            {copy.kicker}
          </span>
          <h2
            className="mt-4 text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {copy.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-white/55">{copy.subtitle}</p>
        </motion.div>

        {/* Cohort cards */}
        <div className="mt-10 grid gap-px border border-white/15 bg-white/15 sm:grid-cols-2">
          {[
            [copy.cohort1Label, copy.cohort1Date],
            [copy.cohort2Label, copy.cohort2Date],
          ].map(([label, date]) => (
            <div key={label} className="bg-black p-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">
                {label}
              </span>
              <p
                className="mt-2 text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
              >
                {date}
              </p>
              <p className="mt-3 inline-block border border-white/25 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/60">
                {copy.capacity}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          {/* Form */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={copy.form.name}>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={update("name")}
                  placeholder={copy.form.namePlaceholder}
                />
              </Field>
              <Field label={copy.form.email}>
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={update("email")}
                  placeholder={copy.form.emailPlaceholder}
                />
              </Field>
              <Field label={copy.form.role}>
                <input
                  className={inputClass}
                  value={form.role}
                  onChange={update("role")}
                  placeholder={copy.form.rolePlaceholder}
                />
              </Field>
              <Field label={copy.form.experience}>
                <input
                  className={inputClass}
                  value={form.experience}
                  onChange={update("experience")}
                  placeholder={copy.form.experiencePlaceholder}
                />
              </Field>
            </div>
            <Field label={copy.form.cohort}>
              <select
                className={inputClass}
                value={form.cohort}
                onChange={update("cohort")}
              >
                {cohorts.map((c) => (
                  <option key={c} value={c} className="bg-black">
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={copy.form.motivation}>
              <textarea
                rows={4}
                className={inputClass}
                value={form.motivation}
                onChange={update("motivation")}
                placeholder={copy.form.motivationPlaceholder}
              />
            </Field>

            {/* Human verification gate for all send actions */}
            <div className="space-y-2 pt-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                {copy.form.verifyHint}
              </p>
              <Turnstile onVerify={setTurnstileToken} />
            </div>

            <a
              href={mailtoHref}
              onClick={guardClick}
              aria-disabled={!verified}
              className={`inline-block border border-white bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-black transition hover:bg-black hover:text-white${lockedClass}`}
            >
              {copy.form.send} → {ACADEMY_EMAIL}
            </a>
          </motion.div>

          {/* AI deeplinks */}
          <motion.div
            className="flex flex-col gap-4 border border-white/15 bg-white/[0.03] p-6"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              {copy.form.deeplinkTitle}
            </h3>
            <p className="text-xs leading-relaxed text-white/50">
              {copy.form.deeplinkHint}
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { href: cursorHref, label: copy.form.cursor, Icon: CursorIcon, newTab: false },
                { href: claudeHref, label: copy.form.claude, Icon: ClaudeIcon, newTab: true },
                { href: chatgptHref, label: copy.form.chatgpt, Icon: ChatGptIcon, newTab: true },
                { href: geminiHref, label: copy.form.gemini, Icon: GeminiIcon, newTab: true },
              ].map(({ href, label, Icon, newTab }) => (
                <a
                  key={label}
                  href={href}
                  onClick={guardClick}
                  aria-disabled={!verified}
                  className={`rgb-button block${lockedClass}`}
                  {...(newTab
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <span className="rgb-button-inner flex items-center justify-center gap-2 bg-black px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-white">
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </span>
                </a>
              ))}
              <button
                type="button"
                onClick={copyPrompt}
                className="border border-white/30 px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white/70 transition hover:border-white hover:text-white sm:col-span-2"
              >
                {copied ? copy.form.copied : copy.form.copy}
              </button>
            </div>

            {/* Live prompt preview */}
            <pre className="mt-2 max-h-56 overflow-auto border border-white/15 bg-black p-4 font-mono text-[10px] leading-relaxed whitespace-pre-wrap text-white/45">
              {prompt}
            </pre>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
