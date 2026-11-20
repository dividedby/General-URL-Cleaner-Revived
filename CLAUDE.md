# CLAUDE.md

## Project

A single Greasemonkey/Tampermonkey **userscript** (`URLClean.user.js`) that strips tracking parameters from URLs on shopping/search/social sites. No bundler; `package.json` exists only for the Prettier format scripts. The `.user.js` file is the deliverable: it installs directly into Tampermonkey and is distributed via Greasy Fork.

## Commands

- `node --test`: unit tests for the pure cleaners and redirect decoders (`test/*.test.js|mjs`, exported from the script via a guarded `module.exports` block). Run it plain: passing a directory (`node --test test/`) fails on Node 22. CI: `.github/workflows/test.yml` (Node 22).
- `pnpm format:check` (`pnpm format` to fix): Prettier defaults; CI: `.github/workflows/format.yml`.
- Lint: `pnpm lint` (oxlint, default rules, warnings fail; CI `lint` job in `.github/workflows/test.yml`). Secret scan: gitleaks over the commits in a change (CI `secret-scan` job, same workflow).
- The DOM paths (MutationObserver, live link parsing, click-tracking attributes) are manual in-browser testing only.

## Architecture

All logic is in `URLClean.user.js`; search for function names, not line numbers. Non-obvious parts:

- `cleanParams()` is the shared idiom: `.replace("?","?&").replace(regex,"").replace("&","")` prefixes every param with `&`, deletes the matched params, then fixes the leading separator. `cleanUtm()` strips all `utm_*` globally.
- Redirect decoders (`cleanRedir()`, `cleanEbayPulsar()`) return `null` when there is no target or it isn't `http`/`https`; every caller must keep the original link in that case. Each link in a sweep is processed in its own `try`, so one bad link can't stop the rest.

To add a site:

1. Add an anchored `@include` regex (real domain and subdomains only; `test/hardening.test.js` checks look-alikes).
2. Add a param regex to the parameter registry and a `clean<Site>()` calling `cleanParams()`.
3. Add a `parser<Site>()` if the site needs click-tracking attributes stripped.
4. Wire it into site dispatch and add tests.

## Rules

- Bump `@version` on every user-facing change, or installed copies never update. A user-facing change also moves `CHANGELOG.md`, `README.md` and `greasyfork-description.md` in the same PR: see the `release` skill.
- Never rename `URLClean.user.js` or change `@namespace`: Greasy Fork and the managers key installs on them.
- Public identity is `dividedby` only: no real name or personal email in code, headers, docs or commits. Commit as `dividedby <64715420+dividedby@users.noreply.github.com>`.
- Pushing to `main` is a release once Greasy Fork syncs from it: unfinished work goes on a branch.

## Where things live

| Topic                                                          | File                                                                                                       |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Userscript engineering checklist                               | global `~/.claude/rules/userscripts.md`; full version `docs/agents/userscript-guidelines.md`               |
| Deliberate exceptions (subframes, Google history patch)        | `.claude/rules/userscripts-local.md`                                                                       |
| Definition of done / release steps                             | `.claude/skills/release/SKILL.md`                                                                          |
| Issue tracker, triage labels, domain docs, changelog guideline | `docs/agents/{issue-tracker,triage-labels,domain,changelog-guideline}.md`; root `GLOSSARY.md`, `docs/adr/` |

Ideas: Idea Inbox is issue #18 (label idea-inbox); protocol in docs/agents/idea-inbox.md.
