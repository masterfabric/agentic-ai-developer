#!/usr/bin/env node
/**
 * Generate MasterFabric Academy Trainee certificates via the in-repo Trainee
 * Certificate Generator UI (/[locale]/certificate-generator-trainee).
 *
 * Unlike the Mobile Developer cohort script, the Trainee certificate is a
 * two-page PDF whose second page is the program's 100-day roadmap fetched live
 * from masterfabric/one-hundered-days. This script:
 *   1. boots the dev server (unless SKIP_SERVER=1),
 *   2. selects the requested PROGRAM (e.g. "flutter") so page two is populated,
 *   3. loads the recipient CSV,
 *   4. exports the 2-page PDF per recipient, and
 *   5. writes a per-credential metadata CSV alongside each PDF.
 *
 * Usage: node scripts/generate-trainee.mjs [csvPath] [outputDir]
 * Env:   PROGRAM=flutter PROGRAM_LABEL=Flutter SKIP_SERVER=1 PORT=3202
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CSV_PATH = path.resolve(
  ROOT,
  process.argv[2] ?? "scripts/cohort-yunus-flutter-june-2026.csv",
);
const OUT_DIR = path.resolve(ROOT, process.argv[3] ?? "certificated-developers");
const PORT = Number(process.env.PORT ?? 3202);
const LOCALE = process.env.LOCALE ?? "en";
const BASE = `http://localhost:${PORT}/${LOCALE}/certificate-generator-trainee`;
const SKIP_SERVER = process.env.SKIP_SERVER === "1";

const PROGRAM_SLUG = process.env.PROGRAM ?? "flutter";
const PROGRAM_LABEL = process.env.PROGRAM_LABEL ?? "Flutter";
const PROGRAM_LINE = `${PROGRAM_LABEL} — 100 Days Trainee Program`;

const TEMPLATE = {
  directorName: "Gurkan Fikret Gunak",
  instructorName: "Gürkan Fikret Günak",
  instructorGithub: "gurkanfikretgunak",
  instructorLinkedin: "gurkanfikretgunak",
};

const ISSUER = "MasterFabric Academy";
const DOCUMENT_TITLE = "Certificate of Trainee Participation";
const REPO_VERIFY_BASE =
  "https://github.com/masterfabric/agentic-ai-developer/certificated-developers";

function waitForServer(url, timeoutMs = 120_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok || res.status === 404) return resolve();
      } catch {
        // not ready yet
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Dev server did not start within ${timeoutMs}ms`));
        return;
      }
      setTimeout(tick, 800);
    };
    tick();
  });
}

function startDevServer() {
  const child = spawn("npm", ["run", "dev", "--", "-p", String(PORT)], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT: String(PORT) },
  });
  child.stdout?.on("data", () => {});
  child.stderr?.on("data", () => {});
  return child;
}

function slugFromCredentialId(id) {
  return `masterfabric-academy-${id
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

function parseRecipientCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = header.indexOf("name");
  const idIdx = header.indexOf("credentialid");
  const dateIdx = header.indexOf("date");
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    return {
      name: cols[nameIdx] ?? "",
      credentialId: cols[idIdx] ?? "",
      date: dateIdx === -1 ? "" : cols[dateIdx] ?? "",
    };
  });
}

function csvEscape(value) {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function buildIndividualCsv(row) {
  const slug = slugFromCredentialId(row.credentialId);
  const fileName = `${slug}.pdf`;
  const verifyUrl = `${REPO_VERIFY_BASE}/${slug}`;
  const header =
    "fileName,recipientName,credentialId,issueDate,program,documentTitle,instructor,instructorGithub,instructorLinkedin,verifyUrl,issuer";
  const values = [
    fileName,
    row.name,
    row.credentialId,
    row.date || "June 2026",
    PROGRAM_LINE,
    DOCUMENT_TITLE,
    TEMPLATE.instructorName,
    `github.com/${TEMPLATE.instructorGithub}`,
    `linkedin.com/in/${TEMPLATE.instructorLinkedin}`,
    verifyUrl,
    ISSUER,
  ]
    .map((v) => csvEscape(String(v ?? "")))
    .join(",");
  return `${header}\r\n${values}\r\n`;
}

async function automate(rows) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  await page.goto(BASE, { waitUntil: "networkidle" });

  // 2 · Program — pick the program so page two (the roadmap) is populated.
  await page.getByRole("button", { name: /2 · Program/i }).click();
  const select = page.locator("select").first();
  await select.waitFor({ state: "visible", timeout: 30_000 });

  const roadmapLoaded = page.waitForResponse(
    (res) =>
      res.url().includes(`/api/trainee-roadmap?program=${PROGRAM_SLUG}`) &&
      res.ok(),
    { timeout: 60_000 },
  );
  await select.selectOption({ label: PROGRAM_LABEL });
  await roadmapLoaded;
  // Give React a beat to commit the roadmap into the offscreen render targets.
  await page.waitForTimeout(1500);

  // 1 · Data — load the recipient(s) by pasting the CSV.
  await page.getByRole("button", { name: /1 · Data/i }).click();
  const csvText = `name,credentialId,date\n${rows
    .map((r) => `${r.name},${r.credentialId},${r.date}`)
    .join("\n")}`;
  await page.locator("textarea").first().fill(csvText);
  await page.getByRole("button", { name: /Load pasted CSV/i }).click();
  await page.waitForFunction(
    (name) => document.body.innerText.includes(name),
    rows[0].name,
    { timeout: 30_000 },
  );

  // 5 · Export — one 2-page PDF per recipient.
  await page.getByRole("button", { name: /5 · Export/i }).click();

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (let i = 0; i < rows.length; i++) {
    if (rows.length > 1) {
      // Navigate preview/current pointer via the recipient row buttons.
      await page.getByRole("button", { name: /4 · Preview/i }).click();
      // Best-effort: click the nth recipient index in the data list.
      await page.getByRole("button", { name: /1 · Data/i }).click();
      const rowButtons = page.getByRole("button", {
        name: new RegExp(`^${String(i + 1).padStart(2, "0")}$`),
      });
      if (await rowButtons.count()) await rowButtons.first().click();
      await page.getByRole("button", { name: /5 · Export/i }).click();
    }

    const downloadPromise = page.waitForEvent("download", { timeout: 120_000 });
    await page.getByRole("button", { name: /Download PDF \(2 pages\)/i }).click();
    const download = await downloadPromise;

    const slug = slugFromCredentialId(rows[i].credentialId);
    const pdfPath = path.join(OUT_DIR, `${slug}.pdf`);
    await download.saveAs(pdfPath);
    fs.writeFileSync(
      path.join(OUT_DIR, `${slug}.csv`),
      buildIndividualCsv(rows[i]),
      "utf8",
    );
    console.log(`  ✓ ${slug}.pdf + .csv`);
  }

  await browser.close();
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV not found: ${CSV_PATH}`);
    process.exit(1);
  }
  const rows = parseRecipientCsv(fs.readFileSync(CSV_PATH, "utf8")).filter(
    (r) => r.name && r.credentialId,
  );
  if (rows.length === 0) {
    console.error("CSV has no usable recipients (need name + credentialId).");
    process.exit(1);
  }

  let server = null;
  if (!SKIP_SERVER) {
    console.log(`Starting dev server on :${PORT}…`);
    server = startDevServer();
    await waitForServer(BASE);
  } else {
    console.log(`Using existing dev server at ${BASE}`);
    await waitForServer(BASE, 15_000);
  }

  try {
    console.log(
      `Generating ${rows.length} Trainee certificate(s) for ${PROGRAM_LABEL}…`,
    );
    await automate(rows);
    console.log(`Done — output in ${OUT_DIR}`);
  } finally {
    server?.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
