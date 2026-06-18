<!--
GreasyFork listing description. Paste into the script's "Description" field.
GreasyFork renders Markdown. Keep links absolute — relative links won't resolve here.
The full README (with dev/test/contributing info) lives on GitHub.
-->

Strips tracking and redirect parameters from URLs on shopping, search, and
social sites — both the address in your browser bar and the links on the page.

**New in 5.0.1**

- Scoped back to the supported sites only — 5.0 ran on *every* website, which
  could interfere with unrelated pages.
- Fixed Amazon "View Order" / order-details links so the `orderID` query
  stays intact.

**New in 5.0**

- Added support for Bing, Audible, LinkedIn, Etsy, Yahoo, Spotify, Reddit,
  Twitch, Threads, AliExpress, Walmart, Best Buy, and TikTok.
- Cleaning fixes for Google, eBay, Amazon, Disqus, and Facebook, plus a
  trailing-ampersand bug.
- Link cleaning now follows in-page (single-page-app) navigation.
- Removed Twitter and Pocket handling.

**What it does**

- Cleans the current page URL, dropping tracking params (`utm_*`, click IDs,
  session tokens).
- Cleans links as the page adds them, and strips click-tracking attributes.
- Resolves redirect wrappers so links point straight at their destination.

Sites are matched on any top-level domain (`.com`, `.ca`, `.fr`, …) or
subdomain, except a few excluded Google properties (Docs, Hangouts, Takeout,
etc.) that break when cleaned.

**Supported sites**

Dedicated handlers for Google, Bing, YouTube, Amazon, eBay, Newegg, Target,
Facebook, IMDB, Disqus, Audible, LinkedIn, Etsy, Yahoo, Spotify, Reddit,
Twitch, Threads, AliExpress, Walmart, Best Buy, and TikTok. The script does
not run on any other site.

**Examples**

| Site | Before | After |
|------|--------|-------|
| Google | `…/search?num=100&q=google&gs_l=serp…&sclient=…` | `…/search?q=google` |
| Bing | `…/search?q=google&qs=n&form=QBLH&cvid=97312…` | `…/search?q=google` |
| YouTube | `…/watch?v=ID&feature=…&t=…` | `…/watch?v=ID` |
| Amazon | `…/gp/product/ID/ref=…?th=1` | `…/gp/product/ID/` |
| eBay | `…/itm/ID?hash=…&epid=…` | `…/itm/ID` |
| Facebook | `…/photo/?fbid=ID&set=pcb.…` | `…/photo/?fbid=ID` |
| Target | `…/p/A-ID?preselect=…&afid=…` | `…/p/A-ID` |

**Install:** use [Tampermonkey](https://www.tampermonkey.net/) or
[Violentmonkey](https://violentmonkey.github.io/), then click **Install** above.

Report issues or send pull requests on
[GitHub](https://github.com/dividedby/General-URL-Cleaner-Revived). Forked from
[beck's General URL Cleaner](https://greasyfork.org/en/scripts/395298-general-url-cleaner).
Licensed GPL v3 or later.
