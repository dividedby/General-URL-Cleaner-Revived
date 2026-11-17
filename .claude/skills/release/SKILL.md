---
name: release
description: Version bump, CHANGELOG, README and Greasy Fork listing updates for a user-facing change or a release cut. Use when shipping a new site, param strip or behavior fix.
disable-model-invocation: true
---

# Release / definition of done

Every **user-facing change** (a new or changed param strip, a new site, a behavior fix) moves these four together in the same PR, never as a follow-up:

- **`URLClean.user.js`** `@version` header: bump per semver (new capability → minor, fix → patch). Installed copies never update without it.
- **`CHANGELOG.md`**: entry under `## [Unreleased]`, rolled into a dated `## [x.y.z]` section at release.
- **`README.md`**: a `### x.y.z` entry under "What's new"; refresh the Examples table when the change alters a shown site.
- **`greasyfork-description.md`**: a matching `**New in x.y.z**` entry. This is the Greasy Fork listing copy; keep it in sync with the README (its own Examples table too).

Plus the usual: `node --test` passes and `pnpm format:check` is clean, and new pure logic gets a characterization test.

Internal-only changes (refactors, test-only, tooling) skip the README / Greasy Fork entries and the version bump, but still get a `CHANGELOG.md` note when notable.

`greasyfork-description.md` is pasted by hand into the script's "Description" field on Greasy Fork (see its first lines); the repo has no workflow or webhook for it.
