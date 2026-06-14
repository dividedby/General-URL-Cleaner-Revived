# 1. Test through a pure URL-transform seam; verify Link adapters live

Date: 2026-06-14

## Status

Accepted

## Context

The script is a single userscript. Its correctness is the product, but most link
handling lives in DOM-coupled `parser<Site>()` functions that read and write
anchor attributes — untestable in Node without a DOM. The pure Cleaners are
already unit-tested through a `module.exports` seam consumed by a `node:test`
suite in CI; the parsers are not.

To close that gap we can either:

1. Add a DOM shim (jsdom / linkedom) so the parsers test as-is, or
2. Split each parser into a pure **URL transform** (string → string, exported,
   unit-tested) plus a thin **Link adapter** (attribute I/O only), and verify the
   adapters against real pages via live `--chrome` sessions.

The repo is deliberately zero-dependency: no `package.json`, no bundler, the
`.user.js` is the deliverable. A DOM shim would be the project's first runtime/dev
dependency and would let unit tests pass against a fake DOM that may not match real
site markup — the exact thing that has bitten this script before.

## Decision

Test through a pure URL-transform seam. Extract the string logic out of each
parser into an exported URL transform tested offline in `node --test`; keep the
Link adapter as thin attribute I/O verified live with `--chrome`. Do **not** add a
DOM-shim dependency. Performance is verified the same way — report-only `--chrome`
profiles, never an automated benchmark in CI.

## Consequences

- The offline test suite stays deterministic, fast, and dependency-free; it covers
  the logic that actually decides what gets stripped.
- Real-site behavior is confirmed against real markup, not a shim's approximation —
  but that confirmation is manual (`--chrome` checklists), so adapter regressions
  can still slip past CI. The thinness of adapters is what keeps that risk small;
  any branching logic in an adapter is a smell to push down into the transform.
- Adding a Site now means: a Parameter registry entry, a Cleaner (via
  `cleanParams`), and — if links need rewriting — a URL transform + Link adapter.
- If adapters ever grow logic that can't be made thin, revisit the DOM-shim option.
