# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A single Greasemonkey/Tampermonkey **userscript** (`URLClean.user.js`, ~900 lines) that strips tracking
parameters from URLs on shopping/search/social sites. There is **no `package.json`, no bundler, and no linter**. The pure cleaner functions and redirect decoders are unit-tested via a `node --test` suite (`test/cleaners.test.js`, `test/parsers.test.js`, `test/ampersand.test.mjs`, `test/hardening.test.js`), which are exported from `URLClean.user.js` via a guarded `module.exports` block; a CI gate at `.github/workflows/test.yml` runs them (`node --test`, Node 22) on all pushes and PRs. Run plain `node --test`; passing a directory (`node --test test/`) fails on Node 22. The DOM integration paths (MutationObserver, live link parsing, click-tracking attributes) remain manual in-browser testing. The `.user.js` file is the deliverable; it installs directly into Tampermonkey and is distributed via GreasyFork.

## Architecture

All logic lives in `URLClean.user.js`. The shape that requires reading multiple regions to understand:

- **Metadata header** (top of file): `@include` regexes and `@exclude`s declare which sites the script runs on.
- **Parameter registry** (~lines 54–72): per-site regexes naming which query params to strip
  (`googleParams`, `amazonParams`, `ebayParams`, etc.). This is the data you edit to change *what* gets removed.
- **Site dispatch** (~lines 78–219): host regexes detect the current site and route to its handlers.
- **Cleaning engine** (~lines 498–629): one `clean<Site>()` per site applies that site's param regex.
  The recurring idiom is `.replace("?","?&").replace(params,"").replace("&","")` — prefix every param with
  `&`, delete the matched params, then fix up the leading separator. `cleanUtm()` strips all `utm_*` globally.
- **Live link cleaning** (~lines 241–265): a `MutationObserver` (`cleanLinks`/`cleanLinksAlways`) rewrites
  links as the page adds them; per-site `parser<Site>()` functions (~303–450) also strip click-tracking
  attributes (`onmousedown`, `jsaction`).
- **Current-page rewrite**: `setCurrUrl()` cleans `location.href` via `history.replaceState()`
  (passing `history.state` through). `watchAddress()` re-runs a site's address-bar cleaner on
  YouTube's `yt-navigate-finish` and the Navigation API's `navigatesuccess` (no polling);
  Google instead relies on its `pushState`/`replaceState` patch.
- **Redirect decoders** (`cleanRedir()`, `cleanEbayPulsar()`) return `null` when there is no
  target or it isn't `http`/`https`; every caller must keep the original link in that case.
  Each link in a sweep is processed in its own `try`, so one bad link can't stop the rest.

To add a site: add an anchored `@include` regex (only the real domain and its subdomains; `test/hardening.test.js` checks look-alikes), a param regex in the registry, a `clean<Site>()`, and (if needed) a
`parser<Site>()`, then wire it into site dispatch.

## Userscript engineering

Before changing a `.user.js`, read [`docs/agents/userscript-guidelines.md`](docs/agents/userscript-guidelines.md),
the full checklist (shared by all the dividedby userscript repos). The rules that matter most:

- **Smallest reliable change.** Preserve existing behavior, fix the problem at hand without
  unrelated rewrites, and add no dependency, build step or abstraction without a reason.
- **Metadata.** Narrow `@match`; only the `@grant`s actually used (`@grant none` stated
  explicitly); no wildcard `@connect`; `@run-at` chosen by need. Never change `@namespace` or
  the update URLs.
- **Untrusted input** (page text, network responses, anything read back from storage) never
  goes into `innerHTML`: build DOM with `textContent`. No `eval`, `new Function` or remote code.
- **Validate stored values** (type and shape) before using them; keep storage keys namespaced.
- **Safe to run twice** (a second install, re-initialization): no duplicate UI, listeners,
  styles or observers.
- **Observers and timers.** Observe the smallest stable root with filters, ignore the script's
  own mutations, never poll without a bound, and read layout before writing it.
- **Network and errors.** Time out, check status and response shape, ignore stale results; no
  silent `catch {}` for unexpected errors (log with the script's prefix; leave a comment where
  swallowing is intended, e.g. storage in private mode).
- **Navigation.** `popstate` doesn't see `pushState`; redirects use `location.replace` so Back
  still works; a patched page API keeps its arguments, `this` and return value.
- **Validation.** Node/jsdom tests don't prove the script works in a manager: check it on the
  real site and say exactly what was and wasn't tested.

Deliberate exceptions here: it also runs in subframes (for Disqus comment embeds), and it
patches `history.pushState`/`replaceState` on Google to clean Instant-search URLs; any change
there must keep the original arguments, `this` and return value. Line references above are
approximate; search for the function names.

## Definition of done

Every **user-facing change** (a new or changed param strip, a new site, a
behavior fix) moves these four together in the same PR — never as a follow-up:

- **`URLClean.user.js`** `@version` header — bump per semver (new capability →
  minor, fix → patch).
- **`CHANGELOG.md`** — entry under `## [Unreleased]`, rolled into a dated
  `## [x.y.z]` section at release.
- **`README.md`** — a `### x.y.z` entry under "What's new"; refresh the Examples
  table when the change alters a shown site.
- **`greasyfork-description.md`** — a matching `**New in x.y.z**` entry. This is
  the GreasyFork listing copy; keep it in sync with the README (its own
  Examples table too).

Plus the usual: `node --test` passes, and new pure logic gets a characterization
test. Internal-only changes (refactors, test-only, tooling) skip the README /
GreasyFork entries and the version bump, but still get a `CHANGELOG.md` note when
notable.

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
