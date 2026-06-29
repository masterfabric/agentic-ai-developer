#!/usr/bin/env node
/**
 * Batch-generate certificates via the in-repo Certificate Generator UI.
 * Usage: node scripts/generate-cohort.mjs [csvPath] [outputDir]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import JSZip from "jszip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CSV_PATH = path.resolve(ROOT, process.argv[2] ?? "scripts/cohort-melih-june-2026.csv");
const OUT_DIR = path.resolve(ROOT, process.argv[3] ?? "certificated-developers");
const PORT = Number(process.env.PORT ?? 3201);
const GENERATOR = process.env.GENERATOR ?? "certificate-generator-md";
const BASE = `http://localhost:${PORT}/en/${GENERATOR}`;
const SKIP_SERVER = process.env.SKIP_SERVER === "1";
const PROGRAM = process.env.PROGRAM ?? "Mobile Developer Training";

const TEMPLATE = {
  directorName: "Gurkan Fikret Gunak",
  instructorName: "Muhammed Melih Gundogan",
  instructorGithub: "melihgundogan",
  instructorLinkedin: "muhammed-melih-gundogan",
};

const ISSUER = "MasterFabric Academy";
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
        // not ready
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

function buildIndividualCsv(row) {
  const slug = slugFromCredentialId(row.credentialId);
  const fileName = `${slug}.pdf`;
  const verifyUrl = `${REPO_VERIFY_BASE}/${slug}`;
  const header =
    "fileName,recipientName,credentialId,issueDate,program,documentTitle,instructor,instructorGithub,instructorLinkedin,verifyUrl,issuer";
  const values = [
    fileName,
    row.recipientName,
    row.credentialId,
    row.issueDate,
    row.program || PROGRAM,
    row.documentTitle || "Certificate of Completion",
    TEMPLATE.instructorName,
    `github.com/${TEMPLATE.instructorGithub}`,
    `linkedin.com/in/${TEMPLATE.instructorLinkedin}`,
    verifyUrl,
    ISSUER,
  ]
    .map((v) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v))
    .join(",");
  return `${header}\r\n${values}\r\n`;
}

function parseMasterCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    const get = (key) => cols[header.indexOf(key)] ?? "";
    return {
      recipientName: get("recipientName"),
      credentialId: get("credentialId"),
      issueDate: get("issueDate"),
      program: get("program"),
      documentTitle: get("documentTitle"),
    };
  });
}

async function automateExport(csvPath) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  await page.goto(BASE, { waitUntil: "networkidle" });

  // Upload CSV
  await page.locator('input[type="file"][accept*="csv"]').setInputFiles(csvPath);

  // Wait for recipients to load
  const firstId = fs.readFileSync(csvPath, "utf8").split(/\r?\n/)[1]?.split(",")[1]?.trim();
  if (!firstId) throw new Error("CSV has no recipients");
  await page.waitForFunction(
    (id) => document.body.innerText.includes(id),
    firstId,
    { timeout: 30_000 },
  );

  // Template tab
  await page.getByRole("button", { name: /2 · Template/i }).click();

  await page.getByText("Signatory name", { exact: false }).locator("..").locator("input").fill(TEMPLATE.directorName);
  await page.getByText("Instructor name", { exact: false }).locator("..").locator("input").fill(TEMPLATE.instructorName);
  await page.getByText("Instructor GitHub", { exact: false }).locator("..").locator("input").fill(TEMPLATE.instructorGithub);
  await page.getByText("Instructor LinkedIn", { exact: false }).locator("..").locator("input").fill(TEMPLATE.instructorLinkedin);

  // Export tab — PDF ZIP
  await page.getByRole("button", { name: /4 · Export/i }).click();
  await page.getByRole("button", { name: /^pdf$/i }).click();

  const downloadPromise = page.waitForEvent("download", { timeout: 600_000 });
  await page.getByRole("button", { name: /Download all as ZIP/i }).click();
  const download = await downloadPromise;

  const zipPath = path.join(OUT_DIR, "_batch-download.zip");
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await download.saveAs(zipPath);

  await browser.close();
  return zipPath;
}

async function extractAndWriteCsvs(zipPath) {
  const buf = fs.readFileSync(zipPath);
  const zip = await JSZip.loadAsync(buf);

  for (const [name, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    const outPath = path.join(OUT_DIR, path.basename(name));
    const data = await file.async("nodebuffer");
    fs.writeFileSync(outPath, data);
  }

  const masterName = "masterfabric-academy-certificates.csv";
  const masterEntry = zip.file(masterName);
  if (!masterEntry) throw new Error("ZIP missing master metadata CSV");

  const masterText = await masterEntry.async("string");
  const rows = parseMasterCsv(masterText);

  for (const row of rows) {
    const slug = slugFromCredentialId(row.credentialId);
    fs.writeFileSync(path.join(OUT_DIR, `${slug}.csv`), buildIndividualCsv(row), "utf8");
  }

  fs.unlinkSync(zipPath);
  fs.unlinkSync(path.join(OUT_DIR, masterName));

  return rows.length;
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV not found: ${CSV_PATH}`);
    process.exit(1);
  }

  let server = null;
  if (!SKIP_SERVER) {
    console.log(`Starting dev server on :${PORT}…`);
    server = startDevServer();
    await waitForServer(`${BASE}`);
  } else {
    console.log(`Using existing dev server at ${BASE}`);
    await waitForServer(`${BASE}`, 15_000);
  }

  try {
    console.log("Generating certificates via UI…");
    const zipPath = await automateExport(CSV_PATH);
    console.log("Extracting PDFs and writing per-credential CSVs…");
    const count = await extractAndWriteCsvs(zipPath);
    console.log(`Done — ${count} certificates in ${OUT_DIR}`);
  } finally {
    server?.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
