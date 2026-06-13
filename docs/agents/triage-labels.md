# Triage Labels

The skills speak in terms of canonical triage roles. This file maps those roles
to the actual label strings used in this repo's issue tracker.

## State labels

| Role               | Label             | Meaning                                          |
| ------------------ | ----------------- | ------------------------------------------------ |
| Needs evaluation   | `needs-triage`    | Maintainer needs to evaluate this issue          |
| AFK-ready          | `ready-for-agent` | Fully specified, ready for an AFK agent          |
| Human required     | `ready-for-human` | Requires human implementation                    |
| Blocked            | `blocked`         | Waiting on an external dependency or decision    |
| Won't action       | `wontfix`         | Will not be actioned                             |

## Category labels

| Category    | Label         | Meaning                                           |
| ----------- | ------------- | ------------------------------------------------- |
| Bug         | `bug`         | Something is broken                               |
| Enhancement | `enhancement` | New capability or improvement                     |
| Chore       | `chore`       | Maintenance or tooling, no user-facing change     |
| Epic        | `epic`        | Aggregate issue grouping related child issues     |

## Size labels

| Size       | Label     | Meaning              |
| ---------- | --------- | -------------------- |
| Small      | `size:S`  | < 1 day              |
| Medium     | `size:M`  | 1–2 days             |
| Large      | `size:L`  | 3–5 days             |
| Extra large| `size:XL` | > 1 week             |

For full label details (colors, tiers, remove-stock rule) see `docs/agents/labels.md`.

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the
corresponding label string from this table. Edit state-label rows to match whatever
vocabulary you actually use in a given repo.
