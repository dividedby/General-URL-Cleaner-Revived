"use strict";

// Characterization tests for the 5.2.0 hardening: redirect decoders that find
// no (or no safe) target keep the original link, the history patch keeps the
// caller's arguments, and host patterns match only the real domains.

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  cleanGoogleRedir,
  cleanEbayPulsar,
  cleanAmazonItemgp,
  googleInstant,
  changeState,
  transformGoogleUrl,
  transformDisqusUrl,
  transformYoutubeUrl,
  transformFacebookUrl,
  transformEbayUrl,
  transformAmazonUrl,
  google,
  amazon,
  audible,
  ebay,
  bing,
  target,
} = require("../URLClean.user.js");

describe("redirect decoders keep the original link when there is no target", () => {
  it("Disqus profile link without a redirect param is unchanged", () => {
    const href = "https://disqus.com/by/someone/";
    assert.equal(transformDisqusUrl(href), href);
  });

  it("YouTube /redirect without q is unchanged", () => {
    const href = "https://www.youtube.com/redirect?event=x";
    assert.equal(transformYoutubeUrl(href), href);
  });

  it("l.facebook.com link without u= is unchanged", () => {
    const href = "https://l.facebook.com/l.php?h=AT0abc";
    assert.equal(transformFacebookUrl(href), href);
  });

  it("eBay pulsar link without an item id is unchanged", () => {
    const href = "https://pulsar.ebay.com/plsr/clk/0?foo=bar";
    assert.equal(cleanEbayPulsar("?foo=bar", "https://www.ebay.com"), null);
    assert.equal(transformEbayUrl(href, "https://www.ebay.com"), href);
  });

  it("Amazon black-curtain and picassoRedirect without a target are unchanged", () => {
    const curtain = "https://www.amazon.com/black-curtain-redirect.html?ref=x";
    assert.equal(transformAmazonUrl(curtain), curtain);
    const picasso = "https://www.amazon.com/picassoRedirect.html/ref=abc?foo=1";
    assert.equal(transformAmazonUrl(picasso), "https://www.amazon.com/picassoRedirect.html/?foo=1");
  });
});

describe("Google /url redirects", () => {
  it("decodes the q= form", () => {
    assert.equal(
      transformGoogleUrl("https://www.google.com/url?q=https://example.com&sa=D"),
      "https://example.com"
    );
    assert.equal(
      transformGoogleUrl("https://www.google.com/url?sa=t&q=https%3A%2F%2Fexample.com%2Fa%3Fb%3D1&ved=x"),
      "https://example.com/a?b=1"
    );
  });

  it("prefers url= over q= when both are present", () => {
    assert.equal(
      cleanGoogleRedir("/url", "?q=search+words&url=https%3A%2F%2Fexample.com%2F"),
      "https://example.com/"
    );
  });

  it("does not read q= on /imgres", () => {
    assert.equal(cleanGoogleRedir("/imgres", "?q=https%3A%2F%2Fexample.com"), null);
  });

  it("keeps the link when the target is javascript:", () => {
    const href = "https://www.google.com/url?q=javascript%3Aalert(1)";
    assert.equal(transformGoogleUrl(href), href);
  });
});

describe("cleanAmazonItemgp", () => {
  it("rewrites a /gp/product link to the bare ASIN", () => {
    const u = new URL("https://www.amazon.com/gp/product/B07XYZ1234/ref=abc?psc=1#top");
    assert.equal(cleanAmazonItemgp(u), "https://www.amazon.com/gp/product/B07XYZ1234#top");
  });

  it("returns the URL unchanged when there is no ASIN (no /gp/productnull)", () => {
    const u = new URL("https://www.amazon.com/gp/product/handle-buy-box?x=1");
    assert.equal(cleanAmazonItemgp(u), u.href);
    assert.equal(transformAmazonUrl("https://www.amazon.com/gp/product/abc"), "https://www.amazon.com/gp/product/abc");
  });
});

describe("history patch (changeState)", () => {
  function fakeHistory() {
    const calls = [];
    const hist = {
      pushState(state, title, url) {
        calls.push({ name: "push", self: this, args: [...arguments] });
        return "push-ret";
      },
      replaceState(state, title, url) {
        calls.push({ name: "replace", self: this, args: [...arguments] });
        return "replace-ret";
      },
    };
    return { hist, calls };
  }

  it("keeps this, state, title and return value; rewrites only the url", () => {
    const { hist, calls } = fakeHistory();
    changeState((url) => url + "!", hist);
    const state = { page: 2 };
    assert.equal(hist.pushState(state, "t", "/search?q=a"), "push-ret");
    assert.equal(hist.replaceState(state, "t", "/x"), "replace-ret");
    assert.equal(calls[0].self, hist);
    assert.equal(calls[0].args[0], state);
    assert.equal(calls[0].args[1], "t");
    assert.equal(calls[0].args[2], "/search?q=a!");
    assert.equal(calls[1].args[2], "/x!");
  });

  it("passes an omitted or null url through without calling mod", () => {
    const { hist, calls } = fakeHistory();
    let modCalls = 0;
    changeState((url) => { modCalls++; return url; }, hist);
    hist.pushState({ a: 1 }, "");
    hist.replaceState(null, "", null);
    assert.equal(modCalls, 0);
    assert.equal(calls[0].args[2], undefined);
    assert.equal(calls[1].args[2], null);
  });

  it("stringifies URL objects before mod", () => {
    const { hist, calls } = fakeHistory();
    changeState(googleInstant, hist);
    hist.pushState(null, "", new URL("https://www.google.com/search#q=cats"));
    assert.equal(calls[0].args[2], "?q=cats");
  });
});

describe("googleInstant", () => {
  it("accepts non-string input", () => {
    assert.equal(googleInstant(new URL("https://www.google.com/search?q=a")), "https://www.google.com/search?q=a");
    assert.equal(googleInstant("/search#imgrc=_"), " ");
    assert.equal(googleInstant("/search#tbm=isch"), "#tbm=isch");
  });
});

// The @include/@exclude regexes are read straight from the metadata header.
const header = fs
  .readFileSync(path.join(__dirname, "..", "URLClean.user.js"), "utf8")
  .split("// ==/UserScript==")[0];
const includeRegexes = [...header.matchAll(/^\/\/ @include\s+\/(.+)\/$/gm)].map((m) => new RegExp(m[1]));
const excludeRegexes = [...header.matchAll(/^\/\/ @exclude\s+\/(.+)\/$/gm)].map((m) => new RegExp(m[1]));
const included = (url) => includeRegexes.some((re) => re.test(url));

describe("metadata header", () => {
  it("declares @grant none", () => {
    assert.match(header, /^\/\/ @grant\s+none$/m);
  });

  it("has the expected regex @includes", () => {
    assert.equal(includeRegexes.length, 5);
    assert.equal(excludeRegexes.length, 1);
  });

  for (const url of [
    "https://www.google.com/search?q=a",
    "https://google.com/",
    "https://www.google.co.uk/search?q=a",
    "https://www.google.com.au/",
    "https://www.google.de/",
    "https://www.amazon.com/dp/B07XYZ1234",
    "https://smile.amazon.co.uk/",
    "https://www.amazon.com.br/",
    "https://www.audible.com/pd/x",
    "https://www.audible.co.jp/",
    "https://www.ebay.com/itm/123456789012",
    "https://vi.vipr.ebaydesc.com/x",
    "https://www.bing.com/search?q=a",
    "https://cn.bing.com/",
  ]) {
    it(`includes ${url}`, () => assert.ok(included(url)));
  }

  for (const url of [
    "https://notgoogle.com/",
    "https://mygoogle.xyz/",
    "https://google.example.net/",
    "https://www.google.com.evil.example/",
    "https://amazonaws.com/",
    "https://myamazon.com/",
    "https://fakeebay.com/",
    "https://bingo.com/",
    "https://notaudible.com/",
  ]) {
    it(`does not include ${url}`, () => assert.ok(!included(url)));
  }

  it("still excludes Amazon cart pages", () => {
    assert.ok(excludeRegexes[0].test("https://www.amazon.com/gp/cart/view.html"));
    assert.ok(excludeRegexes[0].test("https://www.amazon.co.uk/gp/buy/spc"));
    assert.ok(!excludeRegexes[0].test("https://www.amazon.com/dp/B07XYZ1234"));
  });
});

describe("host patterns used for dispatch and link parsing", () => {
  const cases = [
    [google, ["www.google.com", "google.co.uk", "images.google.com.au"], ["notgoogle.com", "google.example.net", "www.google"]],
    [amazon, ["www.amazon.com", "www.amazon.co.jp", "amazon.de"], ["myamazon.com", "amazon.com.evil.example"]],
    [audible, ["www.audible.com", "www.audible.co.uk"], ["notaudible.com"]],
    [ebay, ["www.ebay.com", "pulsar.ebay.com", "www.ebay.co.uk", "vi.vipr.ebaydesc.com"], ["fakeebay.com"]],
    [bing, ["www.bing.com", "cn.bing.com"], ["bingo.com", "notbing.com"]],
    [target, ["www.target.com", "target.com"], ["notarget.com", "target.com.example"]],
  ];
  for (const [re, good, bad] of cases) {
    for (const host of good) it(`${re.source.slice(0, 30)}… matches ${host}`, () => assert.ok(re.test(host)));
    for (const host of bad) it(`${re.source.slice(0, 30)}… rejects ${host}`, () => assert.ok(!re.test(host)));
  }
});
