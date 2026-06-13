# Issue tracker: GitHub

This repo's issues and PRDs live as GitHub issues, managed via the `gh` CLI.
Generic `gh` mechanics (create/view/list/comment/label/close, repo inference)
and the shared label vocabulary are the common `dividedby` convention —
canonical reference: the `skills` repo,
[`docs/agents/issue-tracker.md`](https://github.com/dividedby/skills/blob/main/docs/agents/issue-tracker.md)
and [`docs/agents/labels.md`](https://github.com/dividedby/skills/blob/main/docs/agents/labels.md).

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.
