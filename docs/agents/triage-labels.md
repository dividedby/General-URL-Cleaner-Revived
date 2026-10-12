# Label Convention

The canonical source of truth for issue-label **names, colors, and descriptions**
across all of `dividedby`'s repos.

Labels fall into two tiers plus a remove-stock rule.

## Tiering rule

- **CORE** — every repo carries these.
- **LOCAL** — domain one-off labels; private to a repo, untouched by the convention.

The convention governs the shared vocabulary, not a repo's private labels.

## CORE — State (all repos)

Where the issue sits in the workflow. Combine freely with a category label.

| Label             | Color    | Description                                                       |
| ----------------- | -------- | ----------------------------------------------------------------- |
| `needs-triage`    | `FBCA04` | Maintainer needs to evaluate this issue                          |
| `ready-for-agent` | `0E8A16` | Fully specified, ready for an AFK agent                          |
| `ready-for-human` | `1D76DB` | Requires human implementation                                    |
| `blocked`         | `E4820A` | Ready to proceed but waiting on an external dependency or decision |
| `wontfix`         | `FFFFFF` | Will not be actioned                                             |
| `idea-inbox`      | `D4C5F9` | The single freeform idea-intake issue for this repo (one per repo) |

## CORE — Category (all repos)

What kind of work it is. Combine freely with a state label.

| Label         | Color    | Description                                              |
| ------------- | -------- | -------------------------------------------------------- |
| `bug`         | `D73A4A` | Something is broken                                      |
| `enhancement` | `84B6EB` | New capability or improvement                            |
| `chore`       | `BFD4F2` | Maintenance or tooling with no user-facing change        |
| `epic`        | `7057FF` | Aggregate issue grouping related child issues            |

## CORE — Size (all repos)

Best-effort effort estimate. Applied when filing or triaging an issue.

| Label    | Color    | Description          |
| -------- | -------- | -------------------- |
| `size:S` | `E6E6E6` | Small: < 1 day       |
| `size:M` | `C8C8C8` | Medium: 1–2 days     |
| `size:L` | `AAAAAA` | Large: 3–5 days      |
| `size:XL`| `888888` | Extra large: > 1 week |

## Issue title convention

With category, state, and size labels covering what the work is, where it sits, and how big it is, issue titles don't need to encode any of that. Keep titles short and descriptive — a plain statement of the thing, not a prefixed summary. Prefer:

> `Fix login redirect after OAuth callback`

over:

> `[bug][S] Fix login redirect after OAuth callback`

The labels do that work. A glanceable title is faster to scan in the issue list.

## Role aliases

Skills and docs speak in terms of canonical triage *roles*. This table maps those role names to the actual label strings used in the issue tracker.

| Role             | Label             |
| ---------------- | ----------------- |
| Needs evaluation | `needs-triage`    |
| AFK-ready        | `ready-for-agent` |
| Human required   | `ready-for-human` |
| Blocked          | `blocked`         |
| Won't action     | `wontfix`         |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table. Edit state-label rows to match whatever vocabulary you actually use in a given repo.

## Remove stock

Every repo removes these unused GitHub stock defaults on setup:

`documentation`, `duplicate`, `good first issue`, `help wanted`, `invalid`, `question`.

Before deleting, re-label any issue carrying a stock label onto the appropriate
convention label. Recreate `bug` and `enhancement` with the canonical colors above
in place of GitHub's defaults.
