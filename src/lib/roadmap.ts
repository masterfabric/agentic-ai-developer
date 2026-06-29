import "server-only";

/**
 * Fetches and parses the "100 Days" program roadmaps that back the
 * MasterFabric Academy Trainee certificate. Each program lives in a folder
 * under `days/` in the source repo and ships a `<program>_roadmap.md` file
 * containing a markdown table of the day-by-day curriculum scope.
 *
 * Source: https://github.com/masterfabric/one-hundered-days/tree/main/days
 */

const REPO = "masterfabric/one-hundered-days";
const BRANCH = "main";
const DAYS_PATH = "days";
const API_BASE = `https://api.github.com/repos/${REPO}/contents/${DAYS_PATH}`;
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${DAYS_PATH}`;
const TREE_BASE = `https://github.com/${REPO}/tree/${BRANCH}/${DAYS_PATH}`;

/** Cache upstream GitHub responses for an hour. */
const REVALIDATE_SECONDS = 3600;

export interface RoadmapRow {
  /** Day range, e.g. "1-5". */
  days: string;
  /** Focus area / topic for the range. */
  focus: string;
  /** Detailed content covered. */
  content: string;
  /** Stated goal for the range. */
  goal: string;
}

export interface ProgramInfo {
  /** Folder name, e.g. "flutter". */
  slug: string;
  /** Human-friendly display name, e.g. "Flutter". */
  name: string;
}

export interface ProgramRoadmap extends ProgramInfo {
  /** Roadmap heading parsed from the markdown. */
  title: string;
  /** Parsed curriculum rows. */
  rows: RoadmapRow[];
  /** GitHub tree URL for the program folder. */
  sourceUrl: string;
}

/** Pretty names for known program folders; falls back to title-casing. */
const DISPLAY_NAMES: Record<string, string> = {
  "ai-agents": "AI Agents",
  devops: "DevOps",
  expo: "Expo",
  flutter: "Flutter",
  git: "Git",
  nestjs: "NestJS",
  nextjs: "Next.js",
};

function displayName(slug: string): string {
  if (DISPLAY_NAMES[slug]) return DISPLAY_NAMES[slug];
  return slug
    .split(/[-_]/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function ghHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "masterfabric-academy-trainee",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

interface GhContentItem {
  name: string;
  type: "dir" | "file" | "symlink" | "submodule";
}

/** Lists the program folders available under `days/`. */
export async function listPrograms(): Promise<ProgramInfo[]> {
  const res = await fetch(API_BASE, {
    headers: ghHeaders(),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`GitHub listing failed (${res.status}) for ${API_BASE}`);
  }
  const items = (await res.json()) as GhContentItem[];
  return items
    .filter((item) => item.type === "dir")
    .map((item) => ({ slug: item.name, name: displayName(item.name) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Strips markdown emphasis / inline-code / line-break artifacts from a cell. */
function cleanCell(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.every((c) => /^:?-{2,}:?$/.test(c.replace(/\s/g, "")));
}

/** Tokens that signal a markdown table's header row across roadmap formats. */
const HEADER_TOKENS = new Set([
  "day",
  "days",
  "day(s)",
  "scenario",
  "step",
  "phase",
  "week",
  "focus area",
  "content details",
  "goal",
]);

function isHeaderRow(cells: string[]): boolean {
  const normalized = cells.map((c) => cleanCell(c).toLowerCase());
  return normalized.some((c) => HEADER_TOKENS.has(c));
}

/** Parses a roadmap markdown document into a title and structured rows. */
export function parseRoadmap(markdown: string): {
  title: string;
  rows: RoadmapRow[];
} {
  const lines = markdown.split(/\r?\n/);
  let title = "";
  const rows: RoadmapRow[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!title && trimmed.startsWith("#")) {
      title = cleanCell(trimmed.replace(/^#+\s*/, ""));
      continue;
    }
    if (!trimmed.startsWith("|")) continue;

    const cells = trimmed
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());

    if (cells.length < 2) continue;
    if (isSeparatorRow(cells)) continue;
    if (isHeaderRow(cells)) continue;

    rows.push({
      days: cleanCell(cells[0] ?? ""),
      focus: cleanCell(cells[1] ?? ""),
      content: cleanCell(cells[2] ?? ""),
      goal: cleanCell(cells[3] ?? ""),
    });
  }

  return { title, rows };
}

/** Fetches raw text, returning null on 404 so callers can fall back. */
async function fetchRaw(url: string): Promise<string | null> {
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Roadmap fetch failed (${res.status}) for ${url}`);
  return res.text();
}

/** Resolves the roadmap markdown for a program, trying the conventional
 * `<slug>_roadmap.md` name first, then any `*roadmap.md` in the folder. */
async function fetchRoadmapMarkdown(slug: string): Promise<string> {
  const conventional = await fetchRaw(`${RAW_BASE}/${slug}/${slug}_roadmap.md`);
  if (conventional) return conventional;

  const res = await fetch(`${API_BASE}/${slug}`, {
    headers: ghHeaders(),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`GitHub listing failed (${res.status}) for ${slug}`);
  }
  const items = (await res.json()) as GhContentItem[];
  const roadmapFile = items.find(
    (item) => item.type === "file" && /roadmap\.md$/i.test(item.name),
  );
  if (!roadmapFile) {
    throw new Error(`No roadmap.md found in days/${slug}`);
  }
  const md = await fetchRaw(`${RAW_BASE}/${slug}/${roadmapFile.name}`);
  if (!md) throw new Error(`Roadmap markdown missing for days/${slug}`);
  return md;
}

/** Fetches and parses the full roadmap for a single program. */
export async function getRoadmap(slug: string): Promise<ProgramRoadmap> {
  const safeSlug = slug.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-_]*$/.test(safeSlug)) {
    throw new Error(`Invalid program slug: ${slug}`);
  }
  const markdown = await fetchRoadmapMarkdown(safeSlug);
  const { title, rows } = parseRoadmap(markdown);
  return {
    slug: safeSlug,
    name: displayName(safeSlug),
    title: title || `${displayName(safeSlug)} Roadmap`,
    rows,
    sourceUrl: `${TREE_BASE}/${safeSlug}`,
  };
}
