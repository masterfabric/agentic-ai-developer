<div align="center">

<img src="public/academy-badge.png" width="120" alt="MasterFabric Academy badge">

# MasterFabric Academy — Agentic AI Developer

**A bilingual, markdown-driven academic curriculum for the end-to-end autonomous AI agent development lifecycle.**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-000000?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-000000?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![MasterFabric](https://img.shields.io/badge/MasterFabric-Academy-000000?style=flat-square)](https://masterfabric.co)

<img src="docs/screenshot-hero.png" alt="MasterFabric Academy — Agentic AI Developer landing page" width="100%">

</div>

---

## Overview

This repository contains the public site for the **Agentic AI Developer Training** program by MasterFabric Academy. It is a strict black & white, A4-format study guide and landing experience, fully driven by markdown source files and rendered dynamically on every request — the markdown *is* the curriculum.

- Bilingual routes: `/en` and `/tr`
- Print-ready A4 study guide at `/en/guide` and `/tr/guide`
- Scroll-driven "prism" evolution section tracing the engineer's path from manual coding to agent orchestration
- A sample certificate whose module list is generated live from the curriculum
- An application flow with AI-agent deeplinks (Cursor, Claude, ChatGPT, Gemini)

## Stack

- **Next.js 16** — App Router, React Server Components, TypeScript
- **Tailwind CSS v4** — strict black & white design system
- **react-markdown + remark-gfm** — curriculum rendering
- **Mermaid** — monochrome flow / sequence / state diagrams from fenced code blocks
- **Framer Motion** — scroll-driven prism evolution section and animated metrics

## Architecture

```
content/
  en/*.md          # English curriculum (single source of truth)
  tr/*.md          # Turkish curriculum
prompts/
  application.en.md  # AI application prompt template (English)
  application.tr.md  # AI application prompt template (Turkish)
src/
  app/
    layout.tsx     # Fonts (Geist, Geist Mono, Lora) + globals
    page.tsx       # Redirects / -> /en
    [locale]/
      layout.tsx   # Locale validation, header, footer
      page.tsx     # Landing: hero, evolution, metrics, curriculum, certificate, apply
      guide/
        page.tsx   # A4 study guide, one sheet per markdown doc
  components/
    a4/            # A4Sheet, PrintButton (print-ready CSS)
    brand/         # MasterFabric logo (currentColor, monochrome)
    charts/        # WeightBars — domain weights from frontmatter
    evolution/     # PrismScene + EvolutionSection (Pink Floyd transition)
    layout/        # SiteHeader, SiteFooter, LocaleSwitcher
    markdown/      # MarkdownArticle + MermaidDiagram
  dictionaries/    # en.json / tr.json UI strings
  lib/
    content.ts     # Reads markdown from disk per request (never static)
    i18n.ts        # Locale + dictionary loading
```

## Content model

Every page that renders curriculum data declares `export const dynamic = "force-dynamic"`, and `lib/content.ts` reads the markdown files from disk on **every request** — there is no static generation. Edit any file under `content/` and refresh: the site updates immediately, in dev and in production.

Frontmatter fields per document:

| Field            | Purpose                                          |
| ---------------- | ------------------------------------------------ |
| `order`          | Sort order of the A4 sheet                       |
| `title`          | Document / domain title                          |
| `section`        | Section header shown on the A4 sheet             |
| `weight`         | Exam weight (%) — feeds the analytics bar chart  |
| `badge`          | Optional badge (e.g. `NEW MODULE`)               |
| `infrastructure` | "Infrastructure built in this module" callout    |

Fenced ` ```mermaid ` blocks inside the markdown body render as live, monochrome-themed diagrams.

## Site sections

### A4 study guide

The guide at `/en/guide` and `/tr/guide` maps each markdown document onto an on-screen A4 sheet. The "PDF / Print Format" button maps every sheet onto a physical A4 page with an inverted (black-on-white) palette, ready for print or PDF export.

### Prism evolution

The "Why the Agentic AI Developer?" section is a scroll-driven, Pink-Floyd-inspired prism scene: one input beam refracts into a spectrum of autonomous output, while six eras — from the Manual Era through the Copilot Moment to the Orchestrator — narrate how the role of the software engineer evolved.

### Certificate

The sample certificate's module list is generated live from the markdown curriculum. Publish a new module under `content/` and it automatically appears on every future certificate — no code change required.

### Apply

The application section lists two cohorts — **Cohort 1: July 1, 2026** and **Cohort 2: September 2026**, each capped at **25 seats** — with applications addressed to [academy@masterfabric.co](mailto:academy@masterfabric.co). Candidates can apply by email, or hand their details to an AI agent via deeplinks (Cursor, Claude, ChatGPT, Gemini) that assemble and verify the application before drafting the email. The prompt templates behind those deeplinks live in [`/prompts`](prompts/) as a public reference.

## Certification

Certificates issued for this program are generated with the in-repo **Certificate Generator** tool at `/en/certificate-generator` (and `/tr/certificate-generator`): upload a CSV of recipients, edit the template, and export each credential as PNG/PDF — or the whole cohort as a ZIP that also contains a metadata CSV.

Each certificate carries:

- the **recipient name** and a **Credential ID** in the form `MFA-AG-2026-00xx`,
- the **instructor** (name, GitHub and LinkedIn),
- and a **verification URL** of the form `…/agentic-ai-developer/certificated-developers/<credential-id>` — the credential ID is appended per certificate so each developer resolves to their own entry.

Exported files follow the `masterfabric-academy-<credential-id>.pdf` naming convention, and every batch ships with `masterfabric-academy-certificates.csv` listing the file name, recipient, credential ID, issue date, program, instructor and per-certificate verification URL. To verify a credential, match its Credential ID against the `certificated-developers/` directory and the cohort metadata CSV published here.

## Model stack

The curriculum and its tooling target a mixed model fleet:

- **Composer 2.5** — fast agentic editing inside Cursor
- **Claude Opus 4.8** — long-horizon reasoning and review
- **Fable 5** — frontier generalist work
- **Local open-weight models** — served via Ollama / vLLM on independent cloud servers (VPS)

## Development

```bash
npm install
npm run dev
```

The dev server serves `/en`, `/tr`, `/en/guide`, and `/tr/guide`. All curriculum content is read from `content/` on each request, so markdown edits appear on the next refresh.

---

<div align="center">

[academy.masterfabric.co](https://masterfabric.co) is a [MasterFabric](https://masterfabric.co) subsidiary.

</div>
