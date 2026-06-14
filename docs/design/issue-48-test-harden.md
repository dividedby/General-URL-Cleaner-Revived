---
status: in-progress
epic: "#48"
adr: docs/adr/0001-pure-url-transform-seam.md
---

# Design Plan — Test-harden & refactor URLClean.user.js (#48)

Short-lived implementation scaffolding for epic #48. The issue tracker is
authoritative for issue bodies; this records the module map, seams, and testing
strategy. Vocabulary is defined in [CONTEXT.md](../../CONTEXT.md).

## Modules & seams

| Module | Kind | Seam (test entry) | Owns | Must not depend on |
|--------|------|-------------------|------|--------------------|
| Parameter registry | data | — | which params are Tracking, per Site | anything |
| Cleaner engine | pure | `module.exports` → `node --test` | strip Tracking params, preserve Functional, well-formed separators | DOM |
| Redirect decoder | pure | `module.exports` → `node --test` | unwrap redirect URLs to the real destination | DOM |
| URL transform | pure | `module.exports` → `node --test` | per-Site link URL cleaning logic | DOM |
| Link adapter | DOM | live `--chrome` checklist | read/write link attributes, delegate to URL transform/Cleaner | URL/parse logic |
| Link cleaning / observer | DOM | behavior via transform tests + `--chrome` profile | run adapters over mutating links, bounded cost | — |
| Metadata & dispatch | config | `--chrome` | `@include`/`@noframes`, host routing | — |

## Core invariant (ADR-0001)

All parse/strip/decode logic lives in the pure modules behind `module.exports` and
is unit-tested offline. Link adapters are attribute-I/O only and verified live via
`--chrome`. No DOM-shim dependency; no automated performance benchmark in CI.

## Testing strategy

- **Pure modules (Cleaner engine, Redirect decoder, URL transform):** unit-tested
  through `module.exports` with `node --test`, offline, asserting on returned
  strings only — never on regex internals. Characterization-first: pin current
  behavior before any consolidation, so the refactor is provably behavior-preserving.
- **Link adapter:** no unit tests. Confirmed against real markup via per-Site
  `--chrome` checklists. Branching that resists extraction is a smell to push into
  the URL transform.
- **Link cleaning / observer:** correctness of *what* gets cleaned is owned by the
  pure-module tests; this layer is verified for *cost* via report-only `--chrome`
  before/after profiles.
- **Refactor gate:** consolidation slices (#57, #58) keep exported signatures as
  thin aliases so the prior coverage suite stays green with no test edits beyond
  renames.

## Sequencing

Tracer → core → edge → integration:
`#49` → {`#51`, `#56`} → {`#52`, `#53`} → {`#57`, `#58`} → {`#54`, `#55`}. `#50`
(docs) anytime.

## Issue index

- #49 — Remove Twitter / x.com (remove-a-Site deletion; tracer; unblocks #56)
- #50 — Fix CLAUDE.md "no test framework" claim (docs; design-skipped)
- #51 — Characterization tests for the 5 redirect decoders
- #52 — Extract + test URL transforms: Google / Amazon / eBay
- #53 — Extract + test URL transforms: remaining sites
- #54 — Observer perf: mark-and-skip in `cleanLinksAlways`
- #55 — Evaluate/decide `@noframes`
- #56 — Characterization tests for remaining pure cleaners
- #57 — Collapse 14 cleaners into `cleanParams(url, regex)`
- #58 — Merge 5 redirect decoders into one parametrized decoder
