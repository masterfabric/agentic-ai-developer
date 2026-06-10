# Contributing to MasterFabric Academy — Agentic AI Developer

Thank you for your interest in contributing. This repository holds the public site and curriculum of the **Agentic AI Developer Training** program by MasterFabric Academy: a bilingual (EN/TR), markdown-driven, strict black & white Next.js application. Every contribution — code, curriculum, or documentation — is welcome.

## Ways to contribute

### Reporting issues

- **Bug reports** — rendering problems, broken routes, print-layout defects
- **Curriculum feedback** — factual errors, unclear passages, outdated tooling references
- **Feature requests** — improvements to the guide, certificate, or apply flow
- **Documentation** — README, governance files, inline docs

### Code contributions

- **Components** — `src/components/` (A4 sheets, prism scene, charts, markdown rendering)
- **Curriculum** — markdown documents under `content/en/` and `content/tr/`
- **Prompts** — AI application templates under `prompts/`
- **Internationalization** — `src/dictionaries/` and locale handling in `src/lib/i18n.ts`

## Development setup

### Prerequisites

- Node.js 20+
- npm
- Git

### Quick start

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/agentic-ai-developer.git
cd agentic-ai-developer

npm install
npm run dev
```

The site serves `/en`, `/tr`, `/en/guide`, and `/tr/guide`. All curriculum pages render dynamically — edit any markdown file under `content/` and refresh to see the change.

### Project structure

```
content/            # Curriculum markdown (en/ and tr/), single source of truth
prompts/            # AI application prompt templates (public reference)
docs/               # README assets (screenshots)
public/             # Badge and logo assets
src/
  app/              # Next.js App Router pages ([locale]/, guide/)
  components/       # a4/, brand/, charts/, evolution/, layout/, markdown/
  dictionaries/     # en.json / tr.json UI strings
  lib/              # content.ts (per-request markdown loading), i18n.ts
```

## Contribution workflow

### 1. Branch

```bash
git checkout -b feature/short-description
# or fix/short-description, docs/short-description, content/short-description
```

### 2. Make changes

- **TypeScript / React** — follow the existing strict TypeScript and React Server Components patterns; keep the design strictly black & white (no color utilities).
- **Curriculum markdown** — keep frontmatter complete (`order`, `title`, `section`, `weight`, and optionally `badge`, `infrastructure`). Update **both** `content/en/` and `content/tr/` in the same change whenever possible; English is the source of truth.
- **Diagrams** — use fenced ```mermaid blocks; they render with the monochrome theme automatically.
- **Never introduce static generation** — curriculum pages must keep `export const dynamic = "force-dynamic"`.

### 3. Commit

Follow our [commit conventions](commits.md):

```
feat(content): add Domain 9 — agent observability module
fix(guide): correct A4 page break inside mermaid diagrams
docs: clarify frontmatter table in README
```

### 4. Quality checklist

- [ ] `npm run build` succeeds
- [ ] No lint warnings (`npm run lint`, if configured)
- [ ] EN and TR content stay in sync (when touching `content/`)
- [ ] A4 guide still prints correctly (when touching guide or markdown components)
- [ ] Commit messages follow [commits.md](commits.md)

### 5. Submit a pull request

1. Open a PR with a descriptive title
2. Explain what changed and why
3. Link related issues (`fixes #123`)
4. Address review feedback promptly

## Reporting bugs

Include:

- A clear description of the problem
- Steps to reproduce (route, locale, browser)
- Expected vs. actual behavior
- Screenshots for visual or print-layout issues
- Environment (OS, browser, Node.js version)

## Security issues

Do **not** open public issues for vulnerabilities. Follow our [Security Policy](SECURITY.md) and report privately to academy@masterfabric.co.

## Community guidelines

All contributors must follow our [Code of Conduct](CODE_OF_CONDUCT.md). In short: be respectful, constructive, patient, and collaborative.

### Communication channels

- **GitHub Issues** — bug reports and feature requests
- **GitHub Discussions** — questions and community conversation
- **Email** — academy@masterfabric.co for private matters

## Legal information

### License

This project is licensed under the [GNU AGPL v3.0](LICENSE) with MasterFabric additional terms. By contributing, you agree that your contributions will be licensed under the same terms.

### Copyright

- **Owner:** MASTERFABRIC Bilişim Teknolojileri A.Ş. (MASTERFABRIC Information Technologies Inc.)
- **Maintainer:** Gürkan Fikret Günak ([@gurkanfikretgunak](https://github.com/gurkanfikretgunak))
- **Contributors:** All contributors retain copyright of their contributions

### Contributor License Agreement

By submitting a pull request, you confirm that:

- You have the right to license your contribution to us
- You agree to license your contribution under GNU AGPL v3.0
- Your contribution is your original work

---

**Questions?**

- Email: academy@masterfabric.co
- GitHub: [@gurkanfikretgunak](https://github.com/gurkanfikretgunak)
- Website: [masterfabric.co](https://masterfabric.co)
