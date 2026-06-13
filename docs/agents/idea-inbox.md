# Idea Inbox — drain protocol

The canonical, single source for how an agent operates the repo's **Idea Inbox**
issue (label `idea-inbox`, one per repo). The Inbox body is **human-facing** — the
live `## Ideas` list plus a collapsed `✅ Actioned` window — and carries no
operating instructions; those live here, discovered via the body's breadcrumb.
The Inbox stays a **convention**, not a skill or a hook: this doc plus the
breadcrumb are the discovery path.

## Discovery — the breadcrumb

The Inbox body's first line is a hidden HTML-comment breadcrumb:

```
<!-- agent-protocol: drain=docs/agents/idea-inbox.md -->
```

`drain=docs/agents/idea-inbox.md` points an agent that reads the raw body — without
entering via the intake convention — at this doc.

## Capture (enriched intake)

A new idea goes in as an unchecked item at the **TOP** of `## Ideas`. Capture the
idea **and the ambient context** available right now — the source file/issue/PR/link
that prompted it and a sentence of why it matters — so a later drain isn't starting
cold. Do **not** grill, expand, or scope it yet; that happens at drain. Keep
`## Ideas` sorted newest-on-top.

## Drain

When asked to "drain the inbox" (or to drain a specific item), promote the item
end-to-end, adapting to what *this* idea needs:

1. **Dedup / relate** — before acting, review the OPEN issues in this repo. Decide
   whether the idea (a) already exists → note it and move it to `✅ Actioned`
   pointing at the existing issue, (b) fits INTO an open issue → comment there
   instead of filing new, or (c) BLOCKS / DEPENDS ON an open issue → record that
   relationship.
2. **Pick only the steps it needs** — do not run the whole pipeline by rote. Choose
   from:
   - `/grill-with-docs` — when the idea is fuzzy or contends with the domain model
     (CONTEXT.md / ADRs); build shared understanding first.
   - `/to-prd` — when it's big enough to warrant a spec before issues.
   - `/to-issues` — to carve it into independently-grabbable tracked work.
   - `/software-design` — when the work spans modules/seams and needs a design pass.
   A small, clear idea may need only `/to-issues`.
3. **Labels** — when filing issues, apply labels from `docs/agents/labels.md`: state
   (`needs-triage` to start), category (`bug` / `enhancement` / `chore` / `epic`),
   and a size estimate (`size:S` / `size:M` / `size:L` / `size:XL`). The compact
   vocabulary reference is `docs/agents/labels.md`.

4. **Aim for a strong agent brief** — strive to emit a `ready-for-agent` issue that
   clears the strong-agent-brief bar (clear module + acceptance criteria + TDD
   notes; a determinism/offline boundary that stubs external deps; a report-only
   boundary where applicable; explicit out-of-scope + a single named follow-up
   owner). Where full automation isn't safe, **fold in deliberate HITL** —
   step-by-step instructions and QA checkpoints for the human-in-the-loop parts —
   rather than handing an agent unbounded judgment. Split a blocked/human-only idea
   into an AFK-able slice plus a human sibling when that's the cleaner carve.
5. **Move to Actioned** — once the idea becomes an issue/PR (or is resolved as a
   dup/relation), move it into `✅ Actioned`, check it, and append `→ #<num>`.

Never delete an idea silently — either drain it or move it with a one-line
disposition.

## Actioned rolling window (default 8)

`✅ Actioned` is a **rolling window**, not an archive — the full history lives on
GitHub (the linked issues/PRs), so the body need not hold it. On every drain:

- **Prepend** the just-actioned item to the top of `✅ Actioned`.
- **Prune the tail** to the most recent **~8** items. Older items drop off — their
  record survives on the issue/PR each one links to (`→ #<num>`).

The window keeps the collapsed section scannable and the raw body bounded by recent
activity, not by total history.
