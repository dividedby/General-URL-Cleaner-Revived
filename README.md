# General URL Cleaner Revived

A Greasemonkey/Tampermonkey **userscript** that strips tracking and redirect
parameters from URLs on shopping, search, and social sites — both the address
in your browser bar and the links on the page.

- **Install / listing:** [GreasyFork](https://greasyfork.org/en/scripts/432387-general-url-cleaner-revived)
- **Issues / PRs:** [GitHub](https://github.com/dividedby/General-URL-Cleaner-Revived)
- **Forked from** [beck's General URL Cleaner](https://greasyfork.org/en/scripts/395298-general-url-cleaner).

## What it does

The script runs on each supported site and:

- Rewrites the current page URL via `history.replaceState()` to drop tracking
  params (e.g. `utm_*`, click IDs, session tokens).
- Cleans links as the page renders them (a `MutationObserver` watches for
  dynamically-added links) and strips click-tracking attributes like
  `onmousedown` and `jsaction`.
- Resolves redirect wrappers so links point straight at their destination.

It matches sites regardless of top-level domain (`.com`, `.ca`, `.fr`, …) or
subdomain, except where excluded — some Google properties (Docs, Hangouts,
Takeout, etc.) are excluded because cleaning breaks them.

## Supported sites

Dedicated handlers: **Google**, **Bing**, **YouTube**, **Amazon**, **eBay**,
**Newegg**, **Target**, **Facebook**, **IMDB**, **Disqus**, **Audible**,
**LinkedIn**, **Etsy**, **Yahoo**, **Spotify**, **Reddit**, **Twitch**,
**Threads**, **AliExpress**, **Walmart**, **Best Buy**, **TikTok**.

On every other site, the script still strips `utm_*` and common generic
tracking parameters.

### Examples

| Site | Before | After |
|------|--------|-------|
| Google | `…/search?num=100&q=google&oq=google&gs_l=serp.3..&sclient=…` | `…/search?q=google` |
| Bing | `…/search?q=google&qs=n&form=QBLH&pq=google&cvid=97312…` | `…/search?q=google` |
| YouTube | `…/watch?v=ID&feature=…&t=…` | `…/watch?v=ID` |
| Amazon | `…/gp/product/ID/ref=…?th=1` | `…/gp/product/ID/` |
| eBay | `…/itm/ID?hash=…&epid=…` | `…/itm/ID` |
| Facebook | `…/photo/?fbid=ID&set=pcb.…` | `…/photo/?fbid=ID` |
| Target | `…/p/A-ID?preselect=…&afid=…` | `…/p/A-ID` |

## Install

1. Install a userscript manager — [Tampermonkey](https://www.tampermonkey.net/)
   or [Violentmonkey](https://violentmonkey.github.io/).
2. Open the [GreasyFork page](https://greasyfork.org/en/scripts/432387-general-url-cleaner-revived)
   and click **Install**.

To install from this repo, open `URLClean.user.js` raw — Tampermonkey detects
the userscript header and offers to install it.

## Development

The whole script is a single file, `URLClean.user.js`. There is **no
`package.json`, no bundler, and no linter** — it installs directly into
Tampermonkey.

Editing what gets cleaned:

- **`@include` rules** (metadata header) declare which sites the script runs on.
- **Parameter registry** — per-site regexes naming which query params to strip.
- **`clean<Site>()`** functions apply each site's param regex.
- **`parser<Site>()`** functions strip click-tracking attributes from links.

To add a site: add an `@include`, a param regex, a `clean<Site>()`, and (if
needed) a `parser<Site>()`, then wire it into site dispatch. See
[`CLAUDE.md`](./CLAUDE.md) for the architecture map and
[`CONTEXT.md`](./CONTEXT.md) for terminology.

### Tests

The pure cleaner and redirect-decoder functions are unit-tested with Node's
built-in test runner (no dependencies):

```sh
node --test
```

[CI](.github/workflows/test.yml) runs the same on Node 20 for every push and
PR. DOM integration paths (MutationObserver, live link parsing,
click-tracking attributes) are verified manually in-browser — see
[ADR 0001](docs/adr/0001-pure-url-transform-seam.md) for why the test seam is
drawn at the pure transforms.

## License

[GPL v3 or later](./LICENSE).
