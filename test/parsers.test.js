"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
  transformGoogleUrl,
  transformAmazonUrl,
  transformEbayUrl,
} = require("../URLClean.user.js");

// ---------------------------------------------------------------------------
// transformGoogleUrl
// /imgres and /url pathnames → decode via cleanGenericRedir (strips all params)
// other paths with search → strip tracking params via cleanGoogle
// clean URL (no tracked params) → returned unchanged
// ---------------------------------------------------------------------------
describe("transformGoogleUrl", () => {
  it("decodes a /url redirect to the target URL", () => {
    assert.equal(
      transformGoogleUrl("https://www.google.com/url?url=https%3A%2F%2Fexample.com%2Fpage&sa=t&ved=abc"),
      "https://example.com/page"
    );
  });

  it("decodes a /imgres redirect to the image URL", () => {
    assert.equal(
      transformGoogleUrl("https://www.google.com/imgres?imgurl=https%3A%2F%2Fimages.example.com%2Fphoto.jpg&tbnid=xyz"),
      "https://images.example.com/photo.jpg"
    );
  });

  it("strips tracking params from a search URL while keeping q", () => {
    assert.equal(
      transformGoogleUrl("https://www.google.com/search?q=hello&ved=abc&sxsrf=xyz"),
      "https://www.google.com/search?q=hello"
    );
  });

  it("passes through a clean search URL unchanged", () => {
    assert.equal(
      transformGoogleUrl("https://www.google.com/search?q=cats"),
      "https://www.google.com/search?q=cats"
    );
  });

  it("returns href unchanged when no search params present", () => {
    assert.equal(
      transformGoogleUrl("https://www.google.com/"),
      "https://www.google.com/"
    );
  });
});

// ---------------------------------------------------------------------------
// transformAmazonUrl
// /dp/ → strip extra path segments and query, keep ASIN and hash
// /gp/product → strip extra path, keep ASIN and hash
// black-curtain-redirect.html → decode redirectUrl from link's own search
//   (bug fix: original code passed `location` global; now reads from href)
// /picassoRedirect → decode generic redirect, then blank decoded target's search
// /ref= in pathname → strip via cleanAmazonParams after chain
// search params → strip via cleanAmazonParams
// passthrough → clean URL returned unchanged
// ---------------------------------------------------------------------------
describe("transformAmazonUrl", () => {
  it("canonicalises a /dp/ product URL", () => {
    assert.equal(
      transformAmazonUrl(
        "https://www.amazon.com/dp/B07XYZ1234/ref=sr_1_1?keywords=widget&ref=nb_sb_noss"
      ),
      "https://www.amazon.com/dp/B07XYZ1234"
    );
  });

  it("canonicalises a /dp/ product URL with a hash", () => {
    assert.equal(
      transformAmazonUrl(
        "https://www.amazon.com/Product-Name/dp/B00ABCDEFG/ref=sr_1_2?pf_rd_r=XYZ#reviews"
      ),
      "https://www.amazon.com/dp/B00ABCDEFG#reviews"
    );
  });

  it("canonicalises a /gp/product URL", () => {
    assert.equal(
      transformAmazonUrl(
        "https://www.amazon.com/gp/product/B07XYZ1234/ref=ppx_yo_dt_b?ie=UTF8&psc=1"
      ),
      "https://www.amazon.com/gp/product/B07XYZ1234"
    );
  });

  it("decodes a black-curtain redirect using the link's own search (not page location)", () => {
    // Bug fix: original parserAmazon passed `location` (page-global) which has
    // no .match method; correct source is the link's own URL search string.
    assert.equal(
      transformAmazonUrl(
        "https://www.amazon.com/black-curtain-redirect.html?redirectUrl=https%3A%2F%2Fwww.amazon.com%2Fdp%2FB07XYZ1234"
      ),
      "https://www.amazon.com/dp/B07XYZ1234"
    );
  });

  it("decodes a picassoRedirect and blanks the decoded target's search", () => {
    // The decoded target URL has its own query string which must be blanked.
    assert.equal(
      transformAmazonUrl(
        "https://www.amazon.com/picassoRedirect?url=https%3A%2F%2Fwww.amazon.com%2Fdp%2FB07XYZ1234%3Fref%3Dabc%26pf_rd_r%3DXYZ"
      ),
      "https://www.amazon.com/dp/B07XYZ1234"
    );
  });

  it("strips /ref= from the pathname (ref= path check runs after the main chain)", () => {
    assert.equal(
      transformAmazonUrl(
        "https://www.amazon.com/SomeProduct/ref=sr_1_1"
      ),
      "https://www.amazon.com/SomeProduct/"
    );
  });

  it("strips tracked query params from a search URL", () => {
    assert.equal(
      transformAmazonUrl(
        "https://www.amazon.com/s?k=headphones&ref=nb_sb_noss_2&crid=ABC"
      ),
      "https://www.amazon.com/s?k=headphones"
    );
  });

  it("passes through a clean URL unchanged", () => {
    assert.equal(
      transformAmazonUrl("https://www.amazon.com/s?k=headphones"),
      "https://www.amazon.com/s?k=headphones"
    );
  });
});

// ---------------------------------------------------------------------------
// transformEbayUrl
// /itm/ → canonicalise via cleanEbayItem (strips extra path/query, keeps orig_cvip)
// pulsar. host → decode item ID from JSON-encoded search, return canonical /itm/ URL
//   (bug fix: original cleanEbayPulsar read page-global location.origin; now
//    accepts explicit pageOrigin arg so it is testable offline)
// search params → strip via cleanEbayParams
// clean URL (no /itm/, no pulsar, no tracked params) → returned unchanged
// ---------------------------------------------------------------------------
describe("transformEbayUrl", () => {
  it("canonicalises a /itm/ product URL, stripping extra path segments and query", () => {
    assert.equal(
      transformEbayUrl(
        "https://www.ebay.com/itm/123456789012/s/a?_trksid=p4375.c101&_sacat=0",
        "https://www.ebay.com"
      ),
      "https://www.ebay.com/itm/123456789012"
    );
  });

  it("retains orig_cvip param when present in /itm/ URL", () => {
    // cleanEbayItem preserves orig_cvip (cross-variant item param)
    assert.equal(
      transformEbayUrl(
        "https://www.ebay.com/itm/123456789012?orig_cvip=true&_trksid=abc",
        "https://www.ebay.com"
      ),
      "https://www.ebay.com/itm/123456789012?orig_cvip=true"
    );
  });

  it("decodes a pulsar redirect to a canonical /itm/ URL using explicit pageOrigin", () => {
    // Bug fix: cleanEbayPulsar now accepts origin param instead of using
    // page-global location.origin, making it testable in Node.
    assert.equal(
      transformEbayUrl(
        "https://pulsar.ebay.com/pulsar?data=%7B%22mecs%22%3A%22123456789012%22%7D",
        "https://www.ebay.com"
      ),
      "https://www.ebay.com/itm/123456789012"
    );
  });

  it("strips tracked query params from a search URL", () => {
    assert.equal(
      transformEbayUrl(
        "https://www.ebay.com/sch/i.html?_nkw=shoes&_sacat=0&_from=R40&rt=nc",
        "https://www.ebay.com"
      ),
      "https://www.ebay.com/sch/i.html?_nkw=shoes"
    );
  });

  it("passes through a clean URL unchanged", () => {
    assert.equal(
      transformEbayUrl(
        "https://www.ebay.com/sch/i.html?_nkw=keyboard",
        "https://www.ebay.com"
      ),
      "https://www.ebay.com/sch/i.html?_nkw=keyboard"
    );
  });
});
