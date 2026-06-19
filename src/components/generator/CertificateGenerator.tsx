"use client";

import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { useMemo, useRef, useState } from "react";
import {
  CertificateDocument,
  type CertModule,
  type CertTemplate,
  type Recipient,
} from "@/components/generator/CertificateDocument";
import { credentialSlug, csvToRecipients, SAMPLE_CSV } from "@/lib/csv";

export interface GeneratorCopy {
  kicker: string;
  title: string;
  subtitle: string;
  steps: [string, string, string];
  tabs: { data: string; template: string; preview: string; export: string };
  uploadTitle: string;
  uploadHint: string;
  uploadButton: string;
  pasteLabel: string;
  pastePlaceholder: string;
  parseButton: string;
  sampleButton: string;
  recipientsTitle: string;
  recipientsEmpty: string;
  addRecipient: string;
  nameCol: string;
  idCol: string;
  dateCol: string;
  remove: string;
  templateTitle: string;
  fields: {
    docTitle: string;
    program: string;
    presentedTo: string;
    completedText: string;
    issuedLabel: string;
    issuedValue: string;
    refLabel: string;
    directorLabel: string;
    directorName: string;
    credentialPrefix: string;
    instructorName: string;
    instructorGithub: string;
    instructorLinkedin: string;
    verifyUrl: string;
  };
  showModules: string;
  showSeal: string;
  previewTitle: string;
  prev: string;
  next: string;
  exportTitle: string;
  downloadPng: string;
  downloadPdf: string;
  downloadMeta: string;
  metaNote: string;
  zipFormatLabel: string;
  downloadZip: string;
  generating: string;
  noRecipients: string;
}

/** Capture width (px) for export — fixed so output is resolution-deterministic. */
const EXPORT_WIDTH = 1000;

type TabId = "data" | "template" | "preview" | "export";
const TABS: { id: TabId }[] = [
  { id: "data" },
  { id: "template" },
  { id: "preview" },
  { id: "export" },
];

/** masterfabric-academy-mfa-ag-2026-0001 — shares the Credential ID slug with the verify URL. */
function fileBase(recipient: Recipient): string {
  return `masterfabric-academy-${credentialSlug(recipient.credentialId)}`;
}

function csvEscape(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** A single metadata CSV describing every generated certificate in the batch. */
function buildMetadataCsv(recipients: Recipient[], template: CertTemplate): string {
  const header = [
    "fileName",
    "recipientName",
    "credentialId",
    "issueDate",
    "program",
    "documentTitle",
    "instructor",
    "instructorGithub",
    "instructorLinkedin",
    "verifyUrl",
    "issuer",
  ];
  const rows = recipients.map((r) => {
    const issued = r.date?.trim() || template.issuedValue;
    return [
      `${fileBase(r)}.pdf`,
      r.name,
      r.credentialId,
      issued,
      template.program,
      template.docTitle,
      template.instructorName,
      template.instructorGithub ? `github.com/${template.instructorGithub}` : "",
      template.instructorLinkedin
        ? `linkedin.com/in/${template.instructorLinkedin}`
        : "",
      template.verifyUrl
        ? `${template.verifyUrl.replace(/\/$/, "")}/${credentialSlug(r.credentialId)}`
        : "",
      template.directorName,
    ]
      .map((c) => csvEscape(String(c ?? "")))
      .join(",");
  });
  return [header.join(","), ...rows].join("\r\n");
}

const META_FILENAME = "masterfabric-academy-certificates.csv";

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function nodeToPng(node: HTMLElement): Promise<string> {
  await document.fonts.ready;
  return toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#000000",
  });
}

function pngToPdf(dataUrl: string, widthPx: number, heightPx: number): jsPDF {
  const orientation = widthPx >= heightPx ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "px", format: [widthPx, heightPx] });
  pdf.addImage(dataUrl, "PNG", 0, 0, widthPx, heightPx);
  return pdf;
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-white/40">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full resize-none border border-white/20 bg-white/[0.03] px-3 py-2 text-xs text-white outline-none transition focus:border-white/60"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-white/20 bg-white/[0.03] px-3 py-2 text-xs text-white outline-none transition focus:border-white/60"
        />
      )}
    </label>
  );
}

export function CertificateGenerator({
  copy,
  modules,
  defaults,
}: {
  copy: GeneratorCopy;
  modules: CertModule[];
  defaults: CertTemplate & { credentialPrefix: string; sampleName: string };
}) {
  const [credentialPrefix, setCredentialPrefix] = useState(defaults.credentialPrefix);
  const [template, setTemplate] = useState<CertTemplate>({
    docTitle: defaults.docTitle,
    program: defaults.program,
    presentedTo: defaults.presentedTo,
    completedText: defaults.completedText,
    issuedLabel: defaults.issuedLabel,
    issuedValue: defaults.issuedValue,
    refLabel: defaults.refLabel,
    directorLabel: defaults.directorLabel,
    directorName: defaults.directorName,
    weightWord: defaults.weightWord,
    instructorLabel: defaults.instructorLabel,
    instructorName: defaults.instructorName,
    instructorGithub: defaults.instructorGithub,
    instructorLinkedin: defaults.instructorLinkedin,
    verifyLabel: defaults.verifyLabel,
    verifyUrl: defaults.verifyUrl,
    showModules: true,
    showSeal: true,
  });
  const [recipients, setRecipients] = useState<Recipient[]>([
    { name: defaults.sampleName, credentialId: `${defaults.credentialPrefix}-0001` },
  ]);
  const [current, setCurrent] = useState(0);
  const [pasteText, setPasteText] = useState("");
  const [zipFormat, setZipFormat] = useState<"png" | "pdf">("png");
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("data");

  const exportRef = useRef<HTMLDivElement>(null);

  const setField = <K extends keyof CertTemplate>(key: K, value: CertTemplate[K]) =>
    setTemplate((t) => ({ ...t, [key]: value }));

  const safeCurrent = Math.min(current, Math.max(recipients.length - 1, 0));
  const activeRecipient = recipients[safeCurrent];

  const previewTemplate = useMemo(() => template, [template]);

  function loadRecipients(text: string) {
    const parsed = csvToRecipients(text, credentialPrefix);
    if (parsed.length === 0) return;
    setRecipients(parsed);
    setCurrent(0);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadRecipients(String(reader.result ?? ""));
    reader.readAsText(file);
    e.target.value = "";
  }

  function updateRecipient(index: number, patch: Partial<Recipient>) {
    setRecipients((rs) => rs.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeRecipient(index: number) {
    setRecipients((rs) => rs.filter((_, i) => i !== index));
  }

  function addRecipient() {
    setRecipients((rs) => {
      const id = `${credentialPrefix}-${String(rs.length + 1).padStart(4, "0")}`;
      const next = [...rs, { name: "", credentialId: id }];
      setCurrent(next.length - 1);
      return next;
    });
  }

  function getNodes(): HTMLElement[] {
    const root = exportRef.current;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>("[data-cert-node]"));
  }

  async function exportCurrent(format: "png" | "pdf") {
    const node = getNodes()[safeCurrent];
    if (!node || !activeRecipient) return;
    setBusy({ done: 0, total: 1 });
    try {
      const dataUrl = await nodeToPng(node);
      const base = fileBase(activeRecipient);
      if (format === "png") {
        triggerDownload(dataUrl, `${base}.png`);
      } else {
        const pdf = pngToPdf(dataUrl, node.offsetWidth, node.offsetHeight);
        triggerDownload(pdf.output("bloburl") as unknown as string, `${base}.pdf`);
      }
    } finally {
      setBusy(null);
    }
  }

  function downloadMetadata() {
    // Only the currently selected attendee — not the whole list.
    if (!activeRecipient) return;
    const csv = buildMetadataCsv([activeRecipient], template);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${fileBase(activeRecipient)}.csv`);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function exportZip(format: "png" | "pdf") {
    const nodes = getNodes();
    if (nodes.length === 0) return;
    const zip = new JSZip();
    setBusy({ done: 0, total: nodes.length });
    try {
      for (let i = 0; i < nodes.length; i++) {
        const r = recipients[i];
        const dataUrl = await nodeToPng(nodes[i]);
        const base = fileBase(r);
        if (format === "png") {
          zip.file(`${base}.png`, dataUrl.split(",")[1], { base64: true });
        } else {
          const pdf = pngToPdf(dataUrl, nodes[i].offsetWidth, nodes[i].offsetHeight);
          zip.file(`${base}.pdf`, pdf.output("arraybuffer"));
        }
        setBusy({ done: i + 1, total: nodes.length });
      }
      // Bundle a metadata CSV describing every certificate in the archive.
      zip.file(META_FILENAME, buildMetadataCsv(recipients, template));
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `certificates-${format}-${nodes.length}.zip`);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } finally {
      setBusy(null);
    }
  }

  const hasRecipients = recipients.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/45">
        {copy.kicker}
      </span>
      <h1
        className="mt-4 text-3xl font-bold text-white sm:text-4xl"
        style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
      >
        {copy.title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-white/55">{copy.subtitle}</p>

      {/* Tab bar */}
      <div className="mt-6 flex flex-wrap gap-px border border-white/15 bg-white/15 font-mono text-[10px] font-bold uppercase tracking-widest">
        {TABS.map((t, i) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 px-4 py-2.5 text-left transition ${
                isActive ? "bg-white text-black" : "bg-black text-white/55 hover:text-white"
              }`}
            >
              <span className={isActive ? "text-black/50" : "text-white"}>
                {i + 1}
              </span>{" "}
              · {copy.tabs[t.id]}
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-8">
        {activeTab === "data" && (
          <>
          {/* CSV upload */}
          <section className="border border-white/15 p-5">
            <h2 className="font-mono text-xs uppercase tracking-widest text-white">
              {copy.uploadTitle}
            </h2>
            <p className="mt-2 text-xs text-white/45">{copy.uploadHint}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <label className="cursor-pointer border border-white bg-white px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-black transition hover:bg-black hover:text-white">
                {copy.uploadButton}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={onFile}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setPasteText(SAMPLE_CSV);
                  loadRecipients(SAMPLE_CSV);
                }}
                className="border border-white/40 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white transition hover:border-white hover:bg-white hover:text-black"
              >
                {copy.sampleButton}
              </button>
            </div>

            <label className="mt-4 block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-white/40">
                {copy.pasteLabel}
              </span>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={copy.pastePlaceholder}
                rows={4}
                className="w-full resize-y border border-white/20 bg-white/[0.03] px-3 py-2 font-mono text-[11px] text-white outline-none transition focus:border-white/60"
              />
            </label>
            <button
              type="button"
              onClick={() => loadRecipients(pasteText)}
              className="mt-3 border border-white/40 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              {copy.parseButton}
            </button>
          </section>

          {/* Recipients */}
          <section className="border border-white/15 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs uppercase tracking-widest text-white">
                {copy.recipientsTitle}
              </h2>
              <span className="font-mono text-[11px] text-white/45">
                {recipients.length}
              </span>
            </div>

            {hasRecipients ? (
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_1.5rem] gap-2 font-mono text-[9px] uppercase tracking-widest text-white/35">
                  <span>#</span>
                  <span>{copy.nameCol}</span>
                  <span>{copy.idCol}</span>
                  <span>{copy.dateCol}</span>
                  <span />
                </div>
                {recipients.map((r, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-[1.5rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_1.5rem] items-center gap-2 ${
                      i === safeCurrent ? "opacity-100" : "opacity-70"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setCurrent(i)}
                      className="text-left font-mono text-[10px] text-white/40 hover:text-white"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </button>
                    <input
                      value={r.name}
                      onChange={(e) => updateRecipient(i, { name: e.target.value })}
                      onFocus={() => setCurrent(i)}
                      className="min-w-0 border border-white/15 bg-white/[0.03] px-2 py-1 text-xs text-white outline-none focus:border-white/60"
                    />
                    <input
                      value={r.credentialId}
                      onChange={(e) =>
                        updateRecipient(i, { credentialId: e.target.value })
                      }
                      onFocus={() => setCurrent(i)}
                      className="min-w-0 border border-white/15 bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-white outline-none focus:border-white/60"
                    />
                    <input
                      value={r.date ?? ""}
                      onChange={(e) => updateRecipient(i, { date: e.target.value })}
                      onFocus={() => setCurrent(i)}
                      className="min-w-0 border border-white/15 bg-white/[0.03] px-2 py-1 text-[10px] text-white outline-none focus:border-white/60"
                    />
                    <button
                      type="button"
                      onClick={() => removeRecipient(i)}
                      aria-label={copy.remove}
                      className="text-white/40 transition hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs text-white/40">{copy.recipientsEmpty}</p>
            )}

            <button
              type="button"
              onClick={addRecipient}
              className="mt-4 border border-white/40 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              + {copy.addRecipient}
            </button>
          </section>
          </>
        )}

        {activeTab === "template" && (
          <section className="border border-white/15 p-5">
            <h2 className="font-mono text-xs uppercase tracking-widest text-white">
              {copy.templateTitle}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label={copy.fields.program}
                value={template.program}
                onChange={(v) => setField("program", v)}
              />
              <Field
                label={copy.fields.docTitle}
                value={template.docTitle}
                onChange={(v) => setField("docTitle", v)}
              />
              <Field
                label={copy.fields.presentedTo}
                value={template.presentedTo}
                onChange={(v) => setField("presentedTo", v)}
              />
              <Field
                label={copy.fields.credentialPrefix}
                value={credentialPrefix}
                onChange={setCredentialPrefix}
              />
              <div className="sm:col-span-2">
                <Field
                  label={copy.fields.completedText}
                  value={template.completedText}
                  onChange={(v) => setField("completedText", v)}
                  textarea
                />
              </div>
              <Field
                label={copy.fields.issuedLabel}
                value={template.issuedLabel}
                onChange={(v) => setField("issuedLabel", v)}
              />
              <Field
                label={copy.fields.issuedValue}
                value={template.issuedValue}
                onChange={(v) => setField("issuedValue", v)}
              />
              <Field
                label={copy.fields.refLabel}
                value={template.refLabel}
                onChange={(v) => setField("refLabel", v)}
              />
              <Field
                label={copy.fields.directorName}
                value={template.directorName}
                onChange={(v) => setField("directorName", v)}
              />
              <Field
                label={copy.fields.directorLabel}
                value={template.directorLabel}
                onChange={(v) => setField("directorLabel", v)}
              />
              <Field
                label={copy.fields.instructorName}
                value={template.instructorName}
                onChange={(v) => setField("instructorName", v)}
              />
              <Field
                label={copy.fields.instructorGithub}
                value={template.instructorGithub}
                onChange={(v) => setField("instructorGithub", v)}
              />
              <Field
                label={copy.fields.instructorLinkedin}
                value={template.instructorLinkedin}
                onChange={(v) => setField("instructorLinkedin", v)}
              />
              <div className="sm:col-span-2">
                <Field
                  label={copy.fields.verifyUrl}
                  value={template.verifyUrl}
                  onChange={(v) => setField("verifyUrl", v)}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-5">
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input
                  type="checkbox"
                  checked={template.showModules}
                  onChange={(e) => setField("showModules", e.target.checked)}
                  className="accent-white"
                />
                {copy.showModules}
              </label>
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input
                  type="checkbox"
                  checked={template.showSeal}
                  onChange={(e) => setField("showSeal", e.target.checked)}
                  className="accent-white"
                />
                {copy.showSeal}
              </label>
            </div>
          </section>
        )}

        {activeTab === "preview" && (
          <section className="border border-white/15 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs uppercase tracking-widest text-white">
                {copy.previewTitle}
              </h2>
              {hasRecipients && (
                <div className="flex items-center gap-3 font-mono text-[11px] text-white/60">
                  <button
                    type="button"
                    onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                    disabled={safeCurrent === 0}
                    className="transition hover:text-white disabled:opacity-30"
                  >
                    ← {copy.prev}
                  </button>
                  <span className="text-white/40">
                    {safeCurrent + 1} / {recipients.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrent((c) => Math.min(recipients.length - 1, c + 1))
                    }
                    disabled={safeCurrent >= recipients.length - 1}
                    className="transition hover:text-white disabled:opacity-30"
                  >
                    {copy.next} →
                  </button>
                </div>
              )}
            </div>

            <div className="mx-auto mt-4 max-w-3xl">
              {activeRecipient ? (
                <CertificateDocument
                  template={previewTemplate}
                  recipient={activeRecipient}
                  modules={modules}
                />
              ) : (
                <p className="py-12 text-center text-xs text-white/40">
                  {copy.noRecipients}
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === "export" && (
          <section className="border border-white/15 p-5">
            <h2 className="font-mono text-xs uppercase tracking-widest text-white">
              {copy.exportTitle}
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => exportCurrent("png")}
                disabled={!hasRecipients || busy !== null}
                className="border border-white bg-white px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-black transition hover:bg-black hover:text-white disabled:opacity-40"
              >
                {copy.downloadPng}
              </button>
              <button
                type="button"
                onClick={() => exportCurrent("pdf")}
                disabled={!hasRecipients || busy !== null}
                className="border border-white/40 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white transition hover:border-white hover:bg-white hover:text-black disabled:opacity-40"
              >
                {copy.downloadPdf}
              </button>
              <button
                type="button"
                onClick={downloadMetadata}
                disabled={!hasRecipients || busy !== null}
                className="border border-white/40 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white transition hover:border-white hover:bg-white hover:text-black disabled:opacity-40"
              >
                {copy.downloadMeta}
              </button>
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  {copy.zipFormatLabel}
                </span>
                <div className="flex border border-white/20">
                  {(["png", "pdf"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setZipFormat(f)}
                      className={`px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition ${
                        zipFormat === f
                          ? "bg-white text-black"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => exportZip(zipFormat)}
                disabled={!hasRecipients || busy !== null}
                className="rgb-button mt-4 block w-full disabled:opacity-40"
              >
                <span className="rgb-button-inner block bg-black px-5 py-3 text-center font-mono text-[11px] font-bold uppercase tracking-widest text-white">
                  {busy && busy.total > 1
                    ? copy.generating
                        .replace("{done}", String(busy.done))
                        .replace("{total}", String(busy.total))
                    : `${copy.downloadZip} (${recipients.length})`}
                </span>
              </button>
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-white/35">
                {copy.metaNote}
              </p>
            </div>
          </section>
        )}
      </div>

      {/* Offscreen fixed-width render targets for deterministic export */}
      <div
        ref={exportRef}
        aria-hidden
        className="pointer-events-none fixed left-[-100000px] top-0"
      >
        {recipients.map((r, i) => (
          <div key={i} data-cert-node style={{ width: EXPORT_WIDTH }}>
            <CertificateDocument template={template} recipient={r} modules={modules} />
          </div>
        ))}
      </div>
    </div>
  );
}
