# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A single Greasemonkey/Tampermonkey **userscript** (`URLClean.user.js`, ~630 lines) that strips tracking
parameters from URLs on shopping/search/social sites. There is **no build, lint, or test tooling** — no
`package.json`, no bundler, no test framework. The `.user.js` file is the deliverable; it installs directly
into Tampermonkey and is distributed via GreasyFork. Testing is manual in-browser.

## Architecture

All logic lives in `URLClean.user.js`. The shape that requires reading multiple regions to understand:

- **Metadata header** (top of file): `@match` rules declare which sites the script runs on.
- **Parameter registry** (~lines 54–72): per-site regexes naming which query params to strip
  (`googleParams`, `amazonParams`, `ebayParams`, etc.). This is the data you edit to change *what* gets removed.
- **Site dispatch** (~lines 78–219): host regexes detect the current site and route to its handlers.
- **Cleaning engine** (~lines 498–629): one `clean<Site>()` per site applies that site's param regex.
  The recurring idiom is `.replace("?","?&").replace(params,"").replace("&","")` — prefix every param with
  `&`, delete the matched params, then fix up the leading separator. `cleanUtm()` strips all `utm_*` globally.
- **Live link cleaning** (~lines 241–265): a `MutationObserver` (`cleanLinks`/`cleanLinksAlways`) rewrites
  links as the page adds them; per-site `parser<Site>()` functions (~303–450) also strip click-tracking
  attributes (`onmousedown`, `jsaction`).
- **Current-page rewrite**: `setCurrUrl()` (~line 225) cleans `location.href` via `history.replaceState()`.

To add a site: add an `@match`, a param regex in the registry, a `clean<Site>()`, and (if needed) a
`parser<Site>()`, then wire it into site dispatch.

## Agent skills

### Issue tracker
GitHub issues in `dividedby/General-URL-Cleaner-Revived` (via `gh`). See `docs/agents/issue-tracker.md`.

### Triage labels
State: `needs-triage`, `ready-for-agent`, `ready-for-human`, `blocked`, `wontfix`. Category: `bug`, `enhancement`, `chore`, `epic`. Size: `size:S/M/L/XL`. See `docs/agents/triage-labels.md`.

### Domain docs
Single-context: root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.

## Intake convention

When I say **"file an idea"** or **"file an issue"** (unqualified), append an
**enriched row** to this repo's [**Idea Inbox**](https://github.com/dividedby/General-URL-Cleaner-Revived/issues/18) issue (label
`idea-inbox`, one per repo): the raw idea **plus the ambient context/links
available right now** — the source file/issue/PR that prompted it and a sentence
of why — as an unchecked item at the TOP of `## Ideas`. Do not grill or scope it
yet; that happens at drain. The capture and drain protocol lives once in
[`docs/agents/idea-inbox.md`](./docs/agents/idea-inbox.md) (the issue body is
human-facing and carries no operating instructions).

When I say **"file a *tracked* issue"** — or hand you a **plainly-scoped bug** —
skip the Inbox and file a `needs-triage` issue directly via `gh`.
