# Changelog

All notable changes to the **URLClean** userscript (`URLClean.user.js`,
distributed via [GreasyFork](https://greasyfork.org/)) are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/2.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [5.2.0] - 2026-10-13

Hardening release from a code audit.

### Added
- The address bar is cleaned again after in-page navigation on single-page
  sites (YouTube's own navigation event, and the browser Navigation API where
  available), not only on the first page load.

### Changed
- Redirect pages (YouTube `/redirect`, Google `/url`) now replace the history
  entry, so Back no longer lands on the redirect page and bounces forward again.
- Address-bar cleaning keeps the page's `#fragment` and the site's history
  state instead of dropping them.
- The script declares `@grant none` explicitly.
- Known-limitation code comments renamed from a third-party plugin's prefix to the neutral `shortcut:` marker after that plugin was removed globally (dividedby/claude-config#188); comments only, no behaviour change.

### Removed
- Per-repo Serena MCP config (`.serena/`) removed — Serena is no longer used (dividedby/claude-config#180)

### Fixed
- A link with no usable redirect target (for example a Disqus profile link, a
  Google `/url?q=` link, or a YouTube `/redirect` without `q`) no longer stops
  the script; previously one such link ended link cleaning for the whole page.
  Such links are now left as they are.
- Google `/url` redirect links that carry the target in `q=` are now unwrapped.
- Redirect targets that aren't `http`/`https` (such as `javascript:`) are never
  used; the original link is kept.
- Google's in-page search navigation keeps its history state and title, and no
  longer breaks when the page calls `pushState`/`replaceState` without a URL.
- The script no longer replaces Amazon, eBay, Target and IMDb's own
  `hashchange` handler.
- Amazon `/gp/product` pages and links without a product ID are left alone
  instead of being rewritten to `/gp/productnull`.
- eBay tracking links without an item ID are left alone.
- The sites the script runs on are matched exactly, so look-alike domains such
  as `notgoogle.com` are no longer cleaned.
- Removed a leftover debug log on Google Images.

## [5.1.0] - 2026-07-10
### Added
- Strip YouTube's `pp` (player-params attribution blob) tracking param. (#101)

### Fixed
- Preserve the original `href` attribute form (empty, hash-only, relative)
  when rewriting links on all supported sites, instead of clobbering it with
  an absolute URL. (#102)

## [5.0.1] - 2026-06-18
### Added
- Strip `utm_*` and click-ID tracking params on all supported sites.

### Fixed
- Scope cleaning to supported sites only; stop touching unrelated pages.
- Preserve Amazon order-details links instead of breaking them.
- Strip click-ID params from the address bar, not just from in-page links.

## [5.0.0] - 2026-06-14
### Changed
- Major rewrite: per-site handling folded into a single data-driven table;
  dead redirect decoder removed.
- README rewritten; GreasyFork listing added.
