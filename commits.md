# Commit Conventions

Commit messages follow the `type(scope): description` format. The scope is optional but encouraged — use the area of the repository you touched.

## Commit types

The commit type can include the following:

- [ ] feat – a new feature is introduced with the changes
- [ ] fix – a bug fix has occurred
- [ ] chore – changes that do not relate to a fix or feature and don't modify src or test files (for example updating dependencies)
- [ ] refactor – refactored code that neither fixes a bug nor adds a feature
- [ ] docs – updates to documentation such as the README or other markdown files
- [ ] style – changes that do not affect the meaning of the code, likely related to code formatting such as white-space, missing semi-colons, and so on
- [ ] test – including new or correcting previous tests
- [ ] perf – performance improvements
- [ ] ci – continuous integration related
- [ ] build – changes that affect the build system or external dependencies
- [ ] revert – reverts a previous commit
- [ ] add – when adding a new file, function, method, variable, and so on
- [ ] remove – when removing a file, function, method, variable, and so on
- [ ] update – when updating a file, function, method, variable, and so on
- [ ] rename – when renaming a file, function, method, variable, and so on
- [ ] move – when moving a file, function, method, variable, and so on
- [ ] copy – when copying a file, function, method, variable, and so on
- [ ] security – in case of vulnerabilities
- [ ] hotfix – a bug hot fix has occurred

## Common scopes for this repository

| Scope        | Area                                                        |
| ------------ | ----------------------------------------------------------- |
| `content`    | Curriculum markdown under `content/en/` and `content/tr/`   |
| `prompts`    | AI application prompt templates under `prompts/`            |
| `components` | React components under `src/components/`                    |
| `guide`      | The A4 study guide pages and print CSS                      |
| `i18n`       | Dictionaries and locale handling                            |
| `lib`        | Content loading and shared utilities under `src/lib/`       |
| `docs`       | README, governance files, and `docs/` assets                |

## Examples

```
feat(content): add Domain 9 — agent observability module
fix(guide): correct A4 page break inside mermaid diagrams
docs: refresh README hero screenshot
update(prompts): align application template with new cohort dates
refactor(components): extract certificate module list
```

When editing curriculum, keep `content/en/` and `content/tr/` in sync within the same commit whenever possible.

- signed by the author @gurkanfikretgunak
