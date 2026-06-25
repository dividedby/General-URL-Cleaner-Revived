# Changelog Guideline (fleet)

What a `CHANGELOG.md` in any dividedby fleet repo should contain and how each
entry should read. Distills [Keep a Changelog 2.0.0](https://keepachangelog.com/en/2.0.0/)
into a concrete, fleet-adoptable rubric. Two readers:

- **A maintainer or agent writing an entry** — the authoring rules below.
- **The weekly changelog-health evaluator** ([#457](https://github.com/dividedby/skills/issues/457)) —
  the same rules, read as **grading criteria**. Every rule is phrased so it can
  be checked against a `git log` since the last changelog entry plus the
  changelog diff; the [Grading checklist](#grading-checklist) collects them.

Binding decision: [ADR 0034](https://github.com/dividedby/skills/blob/main/docs/adr/0034-fleet-changelogs-are-hand-maintained-and-llm-evaluated.md)
— fleet changelogs are **hand-maintained + LLM-evaluated**, not generated from
commits. The evaluator **flags, never rewrites** — it is a nudge, not a gate.

## Audience: downstream consumer, not commit replay

- One line per **notable** change — something a person who installs or uses the
  surface would care about. Not one line per commit. Pure refactors, formatting,
  internal churn, and CI tweaks that change nothing downstream get **no** entry.
  - _check:_ no entry maps to a commit that touched only internal/CI/format
    surface; no notable shipped change is missing an entry.
- Phrase the entry as **what changed for the user of the surface**, in plain
  language — not "bumped X" or "refactored Y". A PR link is allowed as a trailing
  reference; the PR number is **not** the substance.
  - _check:_ each entry reads as a standalone sentence understandable without
    opening the PR; no entry's content is just a restated commit subject or a
    bare `(#123)`.

## Section taxonomy: the six categories, no more

Every entry lives under exactly one of these `###` headings — "there are only
six types on purpose" ([2.0.0](https://keepachangelog.com/en/2.0.0/)):

- **Added** — new features or surfaces.
- **Changed** — changes to existing behavior.
- **Deprecated** — soon-to-be-removed features.
- **Removed** — features taken out.
- **Fixed** — bug fixes.
- **Security** — vulnerabilities.

- _check:_ every `###` heading under a version is one of the six exactly; no
  custom categories (`Docs`, `Internal`, `Misc`, …).

## `## [Unreleased]` discipline

- The file opens with a `## [Unreleased]` section that accumulates entries as
  work ships. At a version bump it rolls up into a dated
  `## [x.y.z] - YYYY-MM-DD` section, and a fresh empty `## [Unreleased]` takes
  its place at the top.
  - _check:_ exactly one `## [Unreleased]` exists and it is the first version
    section; dated sections are in descending date order.
- An entry lands when its change **merges**, not when it is planned. Unreleased
  is the record of shipped-but-unversioned work, not a backlog.
  - _check:_ no `## [Unreleased]` entry describes work not present in `git log`.

## 2.0.0 conventions (absorb these — they change vs 1.1.0)

Deltas a repo seeded against the older 1.x convention must adopt:

- **Breaking changes** carry an inline `**Breaking:**` prefix inside their
  category (usually Changed or Removed), stating what breaks and which interface
  (CLI, library API, network protocol, file format, config schema).
  - _check:_ any entry describing a backward-incompatible change starts with
    `**Breaking:**`.
- **Security** entries with a CVE **lead with the identifier**
  (`- CVE-2024-12345: …`) so readers and security tools can match the advisory.
  - _check:_ a Security entry referencing a known vuln puts the CVE id first.
- **Changelog ≠ release notes.** The changelog is the complete, ongoing record
  of every notable change; release notes are a curated per-release announcement
  *drawn from* it. Keep the changelog exhaustive-of-notable — don't prune it down
  to a highlight reel.
  - _check:_ the changelog is not trimmed to only headline changes; minor notable
    entries survive.
- **Optional per-release summary.** A dated version may open with a sentence or
  two on the release theme before the typed sections. Optional, not required.
- **URL ref points at 2.0.0.** The "based on Keep a Changelog" link uses
  `/en/2.0.0/`, not `/en/1.x/`.
  - _check:_ the KaC reference URL is the 2.0.0 one.
- **No dead 1.x anchors.** 2.0.0 dropped the FAQ scaffolding, so old
  `#how-do-i-...`-style anchor links into keepachangelog.com no longer resolve.
  Fix or drop them.
  - _check:_ no link targets a removed 1.x FAQ anchor.

## Each repo states the surfaces it tracks

The header names the published surface(s) the changelog records — e.g. "the
skills catalog and `harness/` Python", "the CLI", "the bot". A change to anything
outside the tracked surfaces doesn't earn an entry.

- _check:_ a header line enumerates the tracked surface(s); every entry maps to
  one of them.

## Grading checklist

The evaluator reads the changelog diff plus `git log` since the last changelog
entry and **flags** (comment/issue) — never rewrites (ADR 0034) — any of:

| # | Rule | Fail signal |
|---|------|-------------|
| 1 | Notable-only | An entry maps to a non-notable commit (refactor / format / CI-only), **or** a notable shipped change has no entry |
| 2 | Consumer voice | An entry restates a commit subject, or is unintelligible without opening the PR |
| 3 | Six categories | A `###` heading is not one of the six |
| 4 | Unreleased discipline | Missing or duplicate `## [Unreleased]`; un-rolled entries after a tagged release; dated sections out of order |
| 5 | Breaking marked | A backward-incompatible change lacks the `**Breaking:**` prefix |
| 6 | CVE-first | A Security entry buries (or omits) its CVE id |
| 7 | 2.0.0 reference | KaC URL still points at 1.x, or a dead 1.x FAQ anchor survives |
| 8 | Tracked surfaces | Header doesn't name the surfaces, or an entry falls outside them |

A clean changelog passes all eight. The evaluator's output is a flag, not an
edit, and never blocks a merge.
