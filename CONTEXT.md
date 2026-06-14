# Context — General URL Cleaner Revived

Domain glossary for the userscript that strips tracking from URLs. This file is a
glossary only — no implementation details, no specs. When a term here conflicts
with how code or an issue uses a word, the glossary wins (or the glossary is
wrong and gets fixed here).

## Glossary

### Tracking parameter
A URL query parameter that identifies, attributes, or follows a user (e.g. a
referrer tag, click id, campaign tag) and carries no meaning the destination page
needs to render correctly. The thing the script exists to remove.

### Functional parameter
A query parameter the destination page genuinely needs (e.g. a search term, a
category, a sort order, a page number). Must survive cleaning. The Tracking vs
Functional distinction is the script's core judgment; an over-broad strip that
eats a Functional parameter is a defect.

### Cleaning
Removing Tracking parameters from a URL while preserving its Functional
parameters and producing a well-formed result (no stray `?`/`&` separators).

### Site
A web destination the script has dedicated handling for (Google, Amazon, eBay,
…), selected by a metadata match rule and routed by Site dispatch.

### Parameter registry
The per-Site collection of patterns naming which query parameters are Tracking
(to strip) — the data that defines *what* gets removed for each Site.

### Cleaner
A pure function that takes a URL string and returns the cleaned URL string for
one Site (or for a cross-cutting concern). Cleaners do not touch the DOM. The
global `utm_*` strip is a Cleaner. The shared engine behind the per-Site Cleaners
is `cleanParams(url, registry-pattern)`.

### Redirect decoder
A pure function that unwraps a redirect/interstitial URL (a link that wraps the
real destination as an encoded parameter) and returns the real destination, or
returns the input unchanged when there is nothing to unwrap. Pure, like a
Cleaner.

### URL transform
The pure, string-to-string core of link handling for a Site: given a link's URL
(and any needed siblings), it returns the cleaned URL. Knows nothing about the
DOM. Exported and unit-tested in Node. This is the testable heart extracted out
of a Link adapter.

### Link adapter
The thin DOM-facing half of link handling for a Site. It reads a link's
attributes (href and click-tracking attributes such as `onmousedown`,
`jsaction`, `data-expanded-url`), delegates the decision to a URL transform or
Cleaner, and writes the result back. Holds no URL/parsing logic of its own —
only attribute I/O. Verified against real pages, not unit-mocked.

### Link cleaning
Cleaning links *as the page mutates*: a DOM observer watches for added links and
runs the appropriate Link adapter over them. Distinct from Current-page rewrite,
which cleans the address bar URL.

### Current-page rewrite
Replacing the current page's own URL in the address bar with its cleaned form,
without reloading the page.

### Global strip
The default-on behavior that applies the `utm_*` Cleaner (and generic Link
cleaning) on every site, independent of any dedicated Site handler.

### Site dispatch
The routing step that detects the current Site from the host and selects which
Cleaners and Link adapters apply.
