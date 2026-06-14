// Standalone regression test for issue #30.
// Does NOT import URLClean.user.js (browser globals). Copies fixed regex
// literals and the clean idiom directly.

import assert from "node:assert/strict";

// --- Fixed regex copies (trailing lookahead, not consuming group) ---

const amazonParams =
  /&?_?(encoding|crid|sprefix|ref|th|url|ie|pf_rd_[^&#]*?|pd_rd_[^&#]*?|bbn|rw_html_to_wsrp|ref_|content-id)(=[^&#]*)?(?=$|&)/g;

const twitterParams =
  /&(src|ref_src|ref_url|vertical|s)(=[^&#]*)?(?=$|&)/g;

// --- Cleaning idiom ---

function clean(regex, url) {
  return url.replace("?", "?&").replace(regex, "").replace("&", "");
}

// helpers that reset regex lastIndex each call (g flag stateful)
function cleanAmazon(url) {
  amazonParams.lastIndex = 0;
  return clean(amazonParams, url);
}

function cleanTwitter(url) {
  twitterParams.lastIndex = 0;
  return clean(twitterParams, url);
}

// --- Amazon tests ---

// Tracking param between two kept params: separator must survive.
assert.equal(
  cleanAmazon("?k=laptop&ref=nb_sb_noss&node=123"),
  "?k=laptop&node=123",
  "Amazon: ref between k and node"
);

// Tracking param at end: trailing ampersand cleaned.
assert.equal(
  cleanAmazon("?k=laptop&ref=nb_sb_noss"),
  "?k=laptop",
  "Amazon: ref at end"
);

// No tracking params: string unchanged.
assert.equal(
  cleanAmazon("?k=laptop&node=123"),
  "?k=laptop&node=123",
  "Amazon: no tracking params"
);

// Single tracking param only.
assert.equal(
  cleanAmazon("?ref=nb_sb_noss"),
  "?",
  "Amazon: only tracking param"
);

// Multiple consecutive tracking params between kept params.
assert.equal(
  cleanAmazon("?k=laptop&ref=nb_sb_noss&crid=ABC&node=123"),
  "?k=laptop&node=123",
  "Amazon: two consecutive tracking params between kept params"
);

// --- Twitter tests ---

// Tracking param (s) removed, other params survive intact — t is not in the
// regex so it passes through. Core check: no value-gluing from eaten separator.
assert.equal(
  cleanTwitter("?s=20&t=abc&foo=bar"),
  "?t=abc&foo=bar",
  "Twitter: s removed, t and foo=bar survive without gluing"
);

// Kept param first, then tracking (s), then another kept.
assert.equal(
  cleanTwitter("?foo=bar&s=20&baz=qux"),
  "?foo=bar&baz=qux",
  "Twitter: s between two kept params"
);

// No tracking params.
assert.equal(
  cleanTwitter("?foo=bar&baz=qux"),
  "?foo=bar&baz=qux",
  "Twitter: no tracking params"
);

// Single tracking param.
assert.equal(
  cleanTwitter("?s=20"),
  "?",
  "Twitter: only tracking param"
);

console.log("All assertions passed.");
