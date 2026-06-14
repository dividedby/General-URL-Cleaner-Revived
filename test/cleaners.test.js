"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
  cleanGoogle,
  cleanEbayParams,
  cleanAmazonParams,
  cleanAudible,
  cleanYahoo,
  cleanLinkedin,
  cleanUtm,
} = require("../URLClean.user.js");

// ---------------------------------------------------------------------------
// cleanGoogle
// Strips: ved, sxsrf, ei, uact, source, iflsig, rlz, etc.
// Keeps:  q, tbm, and other functional params
// Pattern uses (?:&|^) lookahead logic so the leading ? is preserved via the
// ?→?& trick and the first & is stripped by the trailing .replace("&","").
// ---------------------------------------------------------------------------
describe("cleanGoogle", () => {
  it("strips ved, sxsrf, ei while keeping q", () => {
    assert.equal(
      cleanGoogle("?q=hello&ved=abc&sxsrf=xyz&ei=123"),
      "?q=hello"
    );
  });

  it("strips source and uact while keeping q", () => {
    assert.equal(
      cleanGoogle("?q=test&source=hp&uact=5"),
      "?q=test"
    );
  });

  it("passes through a bare q with no tracking params", () => {
    assert.equal(cleanGoogle("?q=cats"), "?q=cats");
  });

  it("strips multiple tracking params, keeps q and tbm", () => {
    assert.equal(
      cleanGoogle("?q=shoes&tbm=shop&ved=2ahUK&sxsrf=AB1cd&ei=xyz"),
      "?q=shoes&tbm=shop"
    );
  });

  it("retains authuser (functional) while stripping ved (tracking)", () => {
    // authuser selects the signed-in Google account and must not be stripped.
    // Input:  ?q=hello&authuser=1&ved=abc
    // After ?→?&:  ?&q=hello&authuser=1&ved=abc
    // &ved=abc matched at end (lookahead $) → stripped
    // After .replace("&","") removes first &: ?q=hello&authuser=1
    assert.equal(
      cleanGoogle("?q=hello&authuser=1&ved=abc"),
      "?q=hello&authuser=1"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanEbayParams
// Strips: _sacat, _odkw, _from, _trksid, rt  (matched by ebayParams regex)
// Keeps:  _nkw, LH_BIN, and other search/filter params
// The regex uses a lookahead (?=&|$) so it does NOT consume the trailing &;
// adjacent functional params therefore keep their & separator.
// ---------------------------------------------------------------------------
describe("cleanEbayParams", () => {
  it("strips _sacat, _from, rt while keeping _nkw and LH_BIN", () => {
    assert.equal(
      cleanEbayParams("?_nkw=shoes&_sacat=0&_from=R40&rt=nc&LH_BIN=1"),
      "?_nkw=shoes&LH_BIN=1"
    );
  });

  it("strips _sacat while keeping _nkw and LH_BIN", () => {
    assert.equal(
      cleanEbayParams("?_nkw=laptop&_sacat=177&LH_BIN=1"),
      "?_nkw=laptop&LH_BIN=1"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanEbayParams("?_nkw=keyboard&LH_Auction=1"),
      "?_nkw=keyboard&LH_Auction=1"
    );
  });

  it("returns ? when only tracking params are present", () => {
    assert.equal(cleanEbayParams("?_sacat=0&_from=R40"), "?");
  });

  it("retains _sop (sort-order) while stripping _trksid (tracking)", () => {
    // _sop is eBay's functional sort param and must never be stripped.
    // _trksid matches _(trksid) in ebayParams and is removed.
    // Input:  ?_nkw=foo&_sop=15&_trksid=abc
    // _trksid matched at end (lookahead $) → stripped via lookahead, leaving no trailing &
    // Result: ?_nkw=foo&_sop=15
    assert.equal(
      cleanEbayParams("?_nkw=foo&_sop=15&_trksid=abc"),
      "?_nkw=foo&_sop=15"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanAmazonParams
// Strips: ref, crid, sprefix, encoding, th, pf_rd_*, pd_rd_*, etc.
// Keeps:  keywords, k, i, s, and other functional search params
//
// KNOWN BEHAVIOR: the ($|&) group in amazonParams CONSUMES the trailing &
// when a stripped param is not at the end of the string, causing the
// following param to lose its & separator (they are joined without &).
// These tests encode that actual current behavior.
// ---------------------------------------------------------------------------
describe("cleanAmazonParams", () => {
  it("strips ref while keeping k", () => {
    assert.equal(
      cleanAmazonParams("?k=headphones&ref=nb_sb_noss_2"),
      "?k=headphones"
    );
  });

  it("strips ref and crid; trailing & consumed merges i into keywords", () => {
    // "keywords=laptop" + "ref=..." stripped (consumes &) + "crid=..." stripped (consumes &) + "i=electronics"
    // After first strip: ?&keywords=laptopi=electronics (& between crid and i was consumed)
    assert.equal(
      cleanAmazonParams(
        "?keywords=laptop&ref=sr_1_1&crid=ABC123&sprefix=lap%2Caps%2C100&i=electronics"
      ),
      "?keywords=laptopi=electronics"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanAmazonParams("?k=monitor&s=electronics"),
      "?k=monitor&s=electronics"
    );
  });

  it("removes trailing ? when all params are stripped", () => {
    assert.equal(cleanAmazonParams("?ref=sr_1_1"), "");
  });
});

// ---------------------------------------------------------------------------
// cleanAudible
// Strips: ref, ref_pageloadid, pf_rd_*, plink, pageLoadId, creativeId
// Keeps:  node and other functional params
// Uses lookahead (?=&|$|#) so it does NOT consume the trailing separator;
// adjacent functional params therefore retain their & correctly.
// ---------------------------------------------------------------------------
describe("cleanAudible", () => {
  it("strips all Audible trackers from a full homepage query string", () => {
    assert.equal(
      cleanAudible(
        "?ref=a_hp_c0_zing_B0F14RVHWN&ref_pageloadid=not_applicable&pf_rd_p=287daf1c-0b0d-49e1-8d76-d8e828f6ef63&pf_rd_r=GDMYEX6CJ7XCCA521D96&plink=aLuFSCw36GOGy8v8&pageLoadId=0hoe3mvrqCMKxOml&creativeId=4c415279-88c9-4438-9f46-1b70cf84c022"
      ),
      ""
    );
  });

  it("strips a bare ref param", () => {
    assert.equal(
      cleanAudible("?ref=a_pd_Harry-_nhe_library"),
      ""
    );
  });

  it("strips all trackers from a library-item query string (ref last)", () => {
    assert.equal(
      cleanAudible(
        "?ref_pageloadid=not_applicable&pf_rd_p=80765e81-b10a-4f33-b1d3-ffb87793d047&pf_rd_r=14VXXGHM402RW1HXH1ES&plink=v5ktpok5PKtOmx4M&pageLoadId=jkpV3ITvGrGr2FJG&creativeId=4ee810cf-ac8e-4eeb-8b79-40e176d0a225&ref=a_library_t_c5_libItem_B0FVYGBRPJ_0"
      ),
      ""
    );
  });

  it("strips all trackers from a pd-page query string (ref last)", () => {
    assert.equal(
      cleanAudible(
        "?ref_pageloadid=jkpV3ITvGrGr2FJG&pf_rd_p=694d5b3e-7636-4b98-94db-f39c6800419b&pf_rd_r=MSMHNQNPMH66AFKVQZZT&plink=lVnTwjqIJ1wYsGQa&pageLoadId=C8S919ItBJuGCazG&creativeId=0e5797a6-2dec-4ca4-a423-727d8382d5c3&ref=a_pd_Merry-_psu_bc"
      ),
      ""
    );
  });

  it("strips all trackers from a category-row query string (ref last)", () => {
    assert.equal(
      cleanAudible(
        "?ref_pageloadid=C8S919ItBJuGCazG&pf_rd_p=a42cf646-f122-4591-b559-3ccb83a8451d&pf_rd_r=41ASJVCP9STB85AYRJD2&plink=RAEPGrQhExdwwImI&pageLoadId=BAuDOAey3W9t9QSt&creativeId=71e736a2-f5af-4055-8e42-08cd0ea9e642&ref=a_cat_Roman_n1_rowitem"
      ),
      ""
    );
  });

  it("keeps functional node param while stripping ref", () => {
    assert.equal(
      cleanAudible("?node=18580518011&ref=a_x"),
      "?node=18580518011"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanYahoo
// Strips: guccounter, guce_referrer, guce_referrer_sig
// Keeps:  p, fr, and other functional params
//
// KNOWN BEHAVIOR: same ($|&)-consuming issue as Amazon — the & before the
// param following a stripped one is eaten, merging param names together.
// ---------------------------------------------------------------------------
describe("cleanYahoo", () => {
  it("strips guccounter; following guce_referrer param loses & separator", () => {
    // ?p=news&guccounter=1&guce_referrer=abc&guce_referrer_sig=xyz
    // After ?→?&:  ?&p=news&guccounter=1&guce_referrer=abc&guce_referrer_sig=xyz
    // Strip &guccounter=1& -> consumes trailing & -> guce_referrer joins p=news directly
    // Strip &guce_referrer_sig=xyz (end) -> gone
    // Result after .replace("&",""): ?p=newsguce_referrer=abc
    assert.equal(
      cleanYahoo("?p=news&guccounter=1&guce_referrer=abc&guce_referrer_sig=xyz"),
      "?p=newsguce_referrer=abc"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(cleanYahoo("?p=finance&fr=yfp-t"), "?p=finance&fr=yfp-t");
  });

  it("strips lone guccounter", () => {
    assert.equal(cleanYahoo("?p=news&guccounter=2"), "?p=news");
  });
});

// ---------------------------------------------------------------------------
// cleanLinkedin
// Strips: eBP, refId, trackingId, trk, flagship3_search_srp_jobs, lipi, lici
// Keeps:  keywords, location, and other functional params
//
// KNOWN BEHAVIOR: same ($|&)-consuming issue — stripped mid-string params
// eat the & before the next param.
// ---------------------------------------------------------------------------
describe("cleanLinkedin", () => {
  it("strips trk at the start of the query, keeps keywords", () => {
    // trk at first position: ?trk=abc&keywords=engineer
    // After ?→?&: ?&trk=abc&keywords=engineer
    // &trk=abc& matched, & consumed -> ?keywords=engineer after .replace("&","")
    assert.equal(
      cleanLinkedin("?trk=abc&keywords=engineer"),
      "?keywords=engineer"
    );
  });

  it("strips trk and refId at the end; adjacent param loses & separator", () => {
    // ?keywords=engineer&location=Austin&trk=abc&refId=xyz
    // &trk=abc& consumed -> ?&keywords=engineer&location=AustinrefId=xyz (& before refId eaten)
    // &refId=xyz at end stripped
    // After .replace("&",""): ?keywords=engineer&location=AustinrefId=xyz
    assert.equal(
      cleanLinkedin("?keywords=engineer&location=Austin&trk=abc&refId=xyz"),
      "?keywords=engineer&location=AustinrefId=xyz"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanLinkedin("?keywords=developer&location=Remote"),
      "?keywords=developer&location=Remote"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanUtm
// Strips: params starting with utm_  (utm_source, utm_medium, utm_campaign…)
// Keeps:  all other params
//
// NOTE: the loop starts at index 1 (i -= 1 before first check), so the FIRST
// param is never inspected — a utm_ param in position [0] survives. This is a
// known behavior quirk encoded here for regression coverage.
// ---------------------------------------------------------------------------
describe("cleanUtm", () => {
  it("strips utm_source and utm_medium from the middle/end", () => {
    assert.equal(
      cleanUtm("https://example.com/page?ref=home&utm_source=email&utm_medium=cpc"),
      "https://example.com/page?ref=home"
    );
  });

  it("strips utm_campaign and utm_content while keeping non-utm params", () => {
    assert.equal(
      cleanUtm("https://example.com/page?id=456&utm_campaign=summer&name=test"),
      "https://example.com/page?id=456&name=test"
    );
  });

  it("leaves URLs with no query string unchanged", () => {
    assert.equal(
      cleanUtm("https://example.com/page"),
      "https://example.com/page"
    );
  });

  it("leaves URLs with only non-utm params unchanged", () => {
    assert.equal(
      cleanUtm("https://example.com/?id=1&name=foo"),
      "https://example.com/?id=1&name=foo"
    );
  });

  it("utm_ in position [0] (first param) survives due to loop-start-at-1 behavior", () => {
    // Known quirk: loop does i-=1 before first test, so pars[0] is never checked
    assert.equal(
      cleanUtm("https://example.com/?utm_source=email&id=1"),
      "https://example.com/?utm_source=email&id=1"
    );
  });
});
