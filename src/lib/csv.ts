import type { Recipient } from "@/components/generator/CertificateDocument";

/**
 * Canonical slug derived from a Credential ID. This is the single source of
 * truth shared by the downloadable file name and the verification URL segment,
 * so `masterfabric-academy-<slug>.pdf` and `…/certificated-developers/<slug>`
 * always match. e.g. "MFA-AG-2026-0026" -> "mfa-ag-2026-0026".
 */
export function credentialSlug(credentialId: string): string {
  return (
    credentialId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "credential"
  );
}

/** Minimal RFC-4180-ish CSV parser: supports quotes, escaped quotes and commas. */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const NAME_KEYS = ["name", "fullname", "full name", "recipient", "ad", "isim", "ad soyad", "adsoyad"];
const ID_KEYS = ["credentialid", "credential id", "credential", "id", "ref", "no"];
const DATE_KEYS = ["date", "issued", "issue date", "tarih"];

function indexOfHeader(headers: string[], keys: string[]): number {
  return headers.findIndex((h) => keys.includes(h.trim().toLowerCase()));
}

/**
 * Turn raw CSV text into recipients. Detects name / credentialId / date
 * columns by header. Falls back to one-name-per-line when there is no header.
 */
export function csvToRecipients(
  input: string,
  credentialPrefix: string,
): Recipient[] {
  const rows = parseCsv(input);
  if (rows.length === 0) return [];

  const header = rows[0].map((c) => c.trim());
  const nameIdx = indexOfHeader(header, NAME_KEYS);
  const hasHeader = nameIdx !== -1;

  const idIdx = hasHeader ? indexOfHeader(header, ID_KEYS) : -1;
  const dateIdx = hasHeader ? indexOfHeader(header, DATE_KEYS) : -1;

  const dataRows = hasHeader ? rows.slice(1) : rows;
  const pad = (n: number) => String(n).padStart(4, "0");

  return dataRows
    .map((cols, i): Recipient => {
      const name = (hasHeader ? cols[nameIdx] : cols[0])?.trim() ?? "";
      const credentialId =
        idIdx !== -1 && cols[idIdx]?.trim()
          ? cols[idIdx].trim()
          : `${credentialPrefix}-${pad(i + 1)}`;
      const date = dateIdx !== -1 ? cols[dateIdx]?.trim() : undefined;
      return { name, credentialId, date: date || undefined };
    })
    .filter((r) => r.name !== "");
}

export const SAMPLE_CSV = `name,credentialId,date
Ali Yurtsever,MFA-AG-2026-0001,June 2026
Mei Lin,MFA-AG-2026-0002,June 2026
Diego Hernández,MFA-AG-2026-0003,July 2026
Aïsha Bello,,July 2026`;
