import "server-only";
import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "@/lib/csv";

export interface CertifiedDeveloper {
  fileName: string;
  recipientName: string;
  credentialId: string;
  issueDate: string;
  program: string;
  documentTitle: string;
  instructor: string;
  instructorGithub: string;
  instructorLinkedin: string;
  verifyUrl: string;
  issuer: string;
}

const DIR = path.join(process.cwd(), "certificated-developers");

/**
 * Read every per-credential metadata CSV in `certificated-developers/` and
 * return one record per certificate. The folder is the single source of
 * truth — dropping a new `masterfabric-academy-<id>.csv` + `.pdf` pair in it
 * makes the developer show up here automatically.
 */
export function getCertifiedDevelopers(): CertifiedDeveloper[] {
  let files: string[];
  try {
    files = fs.readdirSync(DIR).filter((f) => f.toLowerCase().endsWith(".csv"));
  } catch {
    return [];
  }

  const developers = files
    .map((file): CertifiedDeveloper | null => {
      const raw = fs.readFileSync(path.join(DIR, file), "utf8");
      const rows = parseCsv(raw);
      if (rows.length < 2) return null;

      const header = rows[0].map((h) => h.trim());
      const values = rows[1];
      const get = (key: string) => {
        const idx = header.indexOf(key);
        return idx === -1 ? "" : (values[idx] ?? "").trim();
      };

      const credentialId = get("credentialId");
      if (!credentialId) return null;

      return {
        fileName: get("fileName") || file.replace(/\.csv$/i, ".pdf"),
        recipientName: get("recipientName"),
        credentialId,
        issueDate: get("issueDate"),
        program: get("program"),
        documentTitle: get("documentTitle"),
        instructor: get("instructor"),
        instructorGithub: get("instructorGithub"),
        instructorLinkedin: get("instructorLinkedin"),
        verifyUrl: get("verifyUrl"),
        issuer: get("issuer"),
      };
    })
    .filter((d): d is CertifiedDeveloper => d !== null);

  // Newest credential first (e.g. …-0033 before …-0027).
  developers.sort((a, b) => b.credentialId.localeCompare(a.credentialId));
  return developers;
}
