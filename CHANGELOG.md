# Changelog

All notable changes to the **URLClean** userscript (`URLClean.user.js`,
distributed via [GreasyFork](https://greasyfork.org/)) are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/2.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
