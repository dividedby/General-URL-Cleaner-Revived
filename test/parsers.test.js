"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
  transformGoogleUrl,
  transformAmazonUrl,
  transformEbayUrl,
  transformYoutubeUrl,
  transformTargetUrl,
  transformNeweggUrl,
  transformImdbUrl,
  transformFacebookUrl,
  transformDisqusUrl,
  transformGlobalUrl,
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

  it("canonicalises a /dp/product/<ASIN> URL (ASIN not immediately after /dp/)", () => {
    assert.equal(
      transformAmazonUrl(
        "https://www.amazon.com/dp/product/B07XYZ1234/ref=sr_1_1?keywords=widget"
      ),
      "https://www.amazon.com/dp/B07XYZ1234"
    );
  });

  it("returns href unchanged when /dp/ path contains no ASIN (no TypeError)", () => {
    assert.doesNotThrow(() =>
      transformAmazonUrl("https://www.amazon.com/dp/product/")
    );
    assert.equal(
      transformAmazonUrl("https://www.amazon.com/dp/product/"),
      "https://www.amazon.com/dp/product/"
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

// ---------------------------------------------------------------------------
// transformYoutubeUrl
// /watch → strip tracking params via cleanYoutube
// /redirect → decode q= param via cleanYoutubeRedir
// other path → returned unchanged
// ---------------------------------------------------------------------------
describe("transformYoutubeUrl", () => {
  it("strips tracking params from a /watch URL", () => {
    assert.equal(
      transformYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share&gl=US"),
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );
  });

  it("decodes a /redirect URL to the target", () => {
    assert.equal(
      transformYoutubeUrl("https://www.youtube.com/redirect?q=https%3A%2F%2Fexample.com%2Fpage&event=video_description"),
      "https://example.com/page"
    );
  });

  it("passes through a /watch URL with no tracked params", () => {
    assert.equal(
      transformYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );
  });

  it("passes through a non-watch/redirect path unchanged", () => {
    assert.equal(
      transformYoutubeUrl("https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw"),
      "https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw"
    );
  });
});

// ---------------------------------------------------------------------------
// transformTargetUrl
// pathname includes /p/ → canonicalise via cleanTargetItemp (strips slug/query)
// else search present → strip tracking params via cleanTargetParams
// clean URL → returned unchanged
// ---------------------------------------------------------------------------
describe("transformTargetUrl", () => {
  it("canonicalises a /p/ product URL by stripping slug and query", () => {
    assert.equal(
      transformTargetUrl("https://www.target.com/p/some-product-name/-/A-12345678?lnk=sametab&preselect=12345678"),
      "https://www.target.com/p/A-12345678"
    );
  });

  it("strips tracked query params from a non-product URL (trailing ? is preserved by cleanTargetParams)", () => {
    assert.equal(
      transformTargetUrl("https://www.target.com/c/toys/-/N-5xtg3?lnk=snav_ta_toys&tref=homepage"),
      "https://www.target.com/c/toys/-/N-5xtg3?"
    );
  });

  it("passes through a clean URL with no tracked params unchanged", () => {
    assert.equal(
      transformTargetUrl("https://www.target.com/c/toys/-/N-5xtg3"),
      "https://www.target.com/c/toys/-/N-5xtg3"
    );
  });
});

// ---------------------------------------------------------------------------
// transformNeweggUrl
// search and no /marketplace/ → strip tracking params via cleanNewegg
// /marketplace/ → passthrough even with search
// no search → passthrough
// ---------------------------------------------------------------------------
describe("transformNeweggUrl", () => {
  it("strips tracking params from a product URL", () => {
    assert.equal(
      transformNeweggUrl("https://www.newegg.com/p/N82E16834234989?Item=N82E16834234989&cm_sp=Top+Sellers-_-2-_-N82E16834234989&icid=LSSA_8B734_0019"),
      "https://www.newegg.com/p/N82E16834234989?Item=N82E16834234989"
    );
  });

  it("passes through a /marketplace/ URL unchanged even with tracked params", () => {
    assert.equal(
      transformNeweggUrl("https://www.newegg.com/marketplace/seller/profile/abc?cm_sp=track&icid=xyz"),
      "https://www.newegg.com/marketplace/seller/profile/abc?cm_sp=track&icid=xyz"
    );
  });

  it("passes through a URL with no search params unchanged", () => {
    assert.equal(
      transformNeweggUrl("https://www.newegg.com/p/N82E16834234989"),
      "https://www.newegg.com/p/N82E16834234989"
    );
  });
});

// ---------------------------------------------------------------------------
// transformImdbUrl
// search present → strip tracking params via cleanImdb
// no search → passthrough
// ---------------------------------------------------------------------------
describe("transformImdbUrl", () => {
  it("strips tracking params from an IMDB URL", () => {
    assert.equal(
      transformImdbUrl("https://www.imdb.com/title/tt0111161/?pf_rd_m=A2FGELUUNOQJNL&ref_=nv_sr_srsg_0"),
      "https://www.imdb.com/title/tt0111161/"
    );
  });

  it("passes through a clean IMDB URL unchanged", () => {
    assert.equal(
      transformImdbUrl("https://www.imdb.com/title/tt0111161/"),
      "https://www.imdb.com/title/tt0111161/"
    );
  });
});

// ---------------------------------------------------------------------------
// transformFacebookUrl
// l.facebook.com host → decode via cleanGenericRedir
// other host → passthrough
// ---------------------------------------------------------------------------
describe("transformFacebookUrl", () => {
  it("decodes an l.facebook.com redirect to the target URL", () => {
    assert.equal(
      transformFacebookUrl("https://l.facebook.com/l.php?u=https%3A%2F%2Fexample.com%2Fpage&h=AT0abc"),
      "https://example.com/page"
    );
  });

  it("passes through a non-l.facebook.com URL unchanged", () => {
    assert.equal(
      transformFacebookUrl("https://www.facebook.com/someprofile?ref=bookmark"),
      "https://www.facebook.com/someprofile?ref=bookmark"
    );
  });
});

// ---------------------------------------------------------------------------
// transformDisqusUrl
// disq.us /url: decode redirect param then strip trailing :cid suffix
// disq.us /url with no redirect param: passthrough (no throw)
// other disqus links: cleanGenericRedir(search) runs on original search
// ---------------------------------------------------------------------------
describe("transformDisqusUrl", () => {
  it("decodes disq.us/url and strips trailing :key suffix", () => {
    // ?url=https%3A%2F%2Fexample.com%2Fpage%3A1234567 decodes to
    // https://example.com/page:1234567 → strip :1234567 → https://example.com/page
    assert.equal(
      transformDisqusUrl("https://disq.us/url?url=https%3A%2F%2Fexample.com%2Fpage%3A1234567"),
      "https://example.com/page"
    );
  });

  it("passes through disq.us/url with no redirect param unchanged", () => {
    assert.equal(
      transformDisqusUrl("https://disq.us/url?foo=bar"),
      "https://disq.us/url?foo=bar"
    );
  });

  it("decodes a non-/url disqus link via cleanGenericRedir", () => {
    assert.equal(
      transformDisqusUrl("https://disq.us/somepath?url=https%3A%2F%2Fexample.com%2Fpage"),
      "https://example.com/page"
    );
  });
});

// ---------------------------------------------------------------------------
// transformGlobalUrl
// utm_ params in search → stripped
// utm_ params in hash → stripped
// non-utm params → preserved
// clean URL → passthrough
// ---------------------------------------------------------------------------
describe("transformGlobalUrl", () => {
  it("strips utm_ params from search while preserving non-utm params", () => {
    assert.equal(
      transformGlobalUrl("https://example.com/page?ref=newsletter&utm_source=email&utm_medium=cpc&q=test"),
      "https://example.com/page?ref=newsletter&q=test"
    );
  });

  it("strips utm_ params from a hash", () => {
    assert.equal(
      transformGlobalUrl("https://example.com/page#section?utm_source=twitter&utm_campaign=launch"),
      "https://example.com/page#section"
    );
  });

  it("passes through a URL with no utm_ params unchanged", () => {
    assert.equal(
      transformGlobalUrl("https://example.com/page?q=hello&page=2"),
      "https://example.com/page?q=hello&page=2"
    );
  });

  it("passes through a URL with no search or hash unchanged", () => {
    assert.equal(
      transformGlobalUrl("https://example.com/page"),
      "https://example.com/page"
    );
  });
});
