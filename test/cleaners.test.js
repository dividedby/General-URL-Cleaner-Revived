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
  cleanBing,
  cleanEtsy,
  cleanYoutube,
  cleanImdb,
  cleanNewegg,
  cleanTargetParams,
  cleanFacebookParams,
  cleanUtm,
  cleanYoutubeRedir,
  cleanAmazonRedir,
  cleanGenericRedir,
  cleanGenericRedir2,
  cleanPocketRedir,
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
// amazonParams uses a non-consuming lookahead (?=$|&), so stripping a param in
// the middle of the string leaves the following param's & separator intact.
// ---------------------------------------------------------------------------
describe("cleanAmazonParams", () => {
  it("strips ref while keeping k", () => {
    assert.equal(
      cleanAmazonParams("?k=headphones&ref=nb_sb_noss_2"),
      "?k=headphones"
    );
  });

  it("strips ref/crid/sprefix while keeping the separator before i", () => {
    // ref, crid, sprefix stripped; kept params keywords and i stay joined by &
    assert.equal(
      cleanAmazonParams(
        "?keywords=laptop&ref=sr_1_1&crid=ABC123&sprefix=lap%2Caps%2C100&i=electronics"
      ),
      "?keywords=laptop&i=electronics"
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
// Allowlist: keeps functional nav params (keywords, node, page, sort,
// publication_date, audible_programs, searchNarrator, searchAuthor) and any
// param whose name ends with _browse-bin; strips everything else.
// Returns "" when no allowlisted params remain.
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

  it("keeps keywords from a real search URL, strips all tracking params", () => {
    assert.equal(
      cleanAudible(
        "?keywords=project+hail+mary&k=project+hail+mary&crid=c28ae76dfa3945afb5a79f90119b52bf&sprefix=project+hail+mar%2Cna-audible-us%2C225&i=na-audible-us&url=search-alias%3Dna-audible-us&ref=nb_sb_noss_1"
      ),
      "?keywords=project+hail+mary"
    );
  });

  it("keeps keywords and strips ref", () => {
    assert.equal(cleanAudible("?keywords=foo&ref=bar"), "?keywords=foo");
  });

  it("returns empty string when only non-allowlisted params present", () => {
    assert.equal(cleanAudible("?ref=bar"), "");
  });

  it("keeps all functional nav params intact (multi-param search/pagination URL)", () => {
    assert.equal(
      cleanAudible(
        "?keywords=mystery&node=18573211011&sort=pubdate-desc-rank&page=2"
      ),
      "?keywords=mystery&node=18573211011&sort=pubdate-desc-rank&page=2"
    );
  });

  it("keeps a _browse-bin suffixed param and strips tracking params", () => {
    assert.equal(
      cleanAudible("?keywords=x&feature_six_browse-bin=123&ref=trackme"),
      "?keywords=x&feature_six_browse-bin=123"
    );
  });

  it("keeps publication_date, audible_programs, searchNarrator, searchAuthor; strips qid and sr", () => {
    assert.equal(
      cleanAudible(
        "?publication_date=last30days&audible_programs=10004&searchNarrator=Weir&searchAuthor=Sanderson&qid=123&sr=1-1"
      ),
      "?publication_date=last30days&audible_programs=10004&searchNarrator=Weir&searchAuthor=Sanderson"
    );
  });

  it("keeps searchAuthor and strips qid and sr", () => {
    assert.equal(
      cleanAudible("?searchAuthor=Sanderson&qid=123&sr=1-1"),
      "?searchAuthor=Sanderson"
    );
  });

  it("keeps multiple _browse-bin variants and strips tracking", () => {
    assert.equal(
      cleanAudible(
        "?feature_ten_browse-bin=1&feature_twenty-two_browse-bin=2&plink=abc"
      ),
      "?feature_ten_browse-bin=1&feature_twenty-two_browse-bin=2"
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
  it("strips guccounter/guce_referrer/guce_referrer_sig, keeping p", () => {
    // all three guce* params are tracking and removed; kept param p survives
    assert.equal(
      cleanYahoo("?p=news&guccounter=1&guce_referrer=abc&guce_referrer_sig=xyz"),
      "?p=news"
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

  it("strips trk and refId at the end, keeping keywords and location", () => {
    // trk and refId removed; kept params keywords and location stay joined by &
    assert.equal(
      cleanLinkedin("?keywords=engineer&location=Austin&trk=abc&refId=xyz"),
      "?keywords=engineer&location=Austin"
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

  it("strips utm_ in position [0] (first param)", () => {
    assert.equal(
      cleanUtm("https://example.com/?utm_source=email&id=1"),
      "https://example.com/?id=1"
    );
  });

  it("collapses to no query string when all params are utm_", () => {
    assert.equal(
      cleanUtm("https://example.com/?utm_source=email"),
      "https://example.com/"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanYoutubeRedir
// Input: the search string of a /redirect page (e.g. "?q=<encoded-target>&redir_token=…").
// Extracts the q param value and returns decodeURIComponent of it.
// No pass-through: a missing q param throws (null.pop()).
// Double-encoded target: only one layer of decoding is applied.
// ---------------------------------------------------------------------------
describe("cleanYoutubeRedir", () => {
  it("decodes a real YouTube redirect search string to the target URL", () => {
    assert.equal(
      cleanYoutubeRedir("?q=https%3A%2F%2Fwww.example.com%2Fvideo%3Ft%3D42&redir_token=QUFyy5"),
      "https://www.example.com/video?t=42"
    );
  });

  it("decodes q when it is the only param", () => {
    assert.equal(
      cleanYoutubeRedir("?q=https%3A%2F%2Fexample.com%2Fvideo"),
      "https://example.com/video"
    );
  });

  it("decodes q when preceded by another param", () => {
    assert.equal(
      cleanYoutubeRedir("?v=abc&q=https%3A%2F%2Fyoutube.com%2Fwatch%3Fv%3Dtest"),
      "https://youtube.com/watch?v=test"
    );
  });

  it("only decodes one layer — double-encoded target is not fully decoded", () => {
    // CURRENT BEHAVIOR: decodeURIComponent('https%253A%252F%252Fexample.com')
    // = 'https%3A%2F%2Fexample.com'  (still encoded after one pass)
    assert.equal(
      cleanYoutubeRedir("?q=https%253A%252F%252Fexample.com"),
      "https%3A%2F%2Fexample.com"
    );
  });

  it("throws when q param is absent (no passthrough for non-redirect URLs)", () => {
    assert.throws(() => cleanYoutubeRedir("?v=dQw4w9WgXcQ"), TypeError);
  });
});

// ---------------------------------------------------------------------------
// cleanAmazonRedir
// Input: a string with redirectUrl= param (in practice the search string of
// a black-curtain page).
// Extracts redirectUrl param value and returns decodeURIComponent of it.
// No pass-through: missing redirectUrl param throws (null.pop()).
// ---------------------------------------------------------------------------
describe("cleanAmazonRedir", () => {
  it("decodes a redirectUrl search string to the Amazon product URL", () => {
    assert.equal(
      cleanAmazonRedir("?redirectUrl=https%3A%2F%2Fwww.amazon.com%2Fdp%2FB07XYZ"),
      "https://www.amazon.com/dp/B07XYZ"
    );
  });

  it("decodes redirectUrl when followed by additional params", () => {
    assert.equal(
      cleanAmazonRedir("?redirectUrl=https%3A%2F%2Famazon.com%2Fdp%2FABC&ref=123"),
      "https://amazon.com/dp/ABC"
    );
  });

  it("only decodes one layer — double-encoded target remains partially encoded", () => {
    assert.equal(
      cleanAmazonRedir("?redirectUrl=https%253A%252F%252Famazon.com%252Fdp%252FTEST"),
      "https%3A%2F%2Famazon.com%2Fdp%2FTEST"
    );
  });

  it("throws when redirectUrl param is absent (no passthrough)", () => {
    assert.throws(() => cleanAmazonRedir("?ref=nav_logo"), TypeError);
  });
});

// ---------------------------------------------------------------------------
// cleanGenericRedir
// Input: a search string. Matches [?&](new|img)?u(rl)?= (case-insensitive).
// Captures: u=, url=, newu=, newurl=, imgu=, imgurl= — returns the value decoded.
// No pass-through: throws when no matching param exists.
// ---------------------------------------------------------------------------
describe("cleanGenericRedir", () => {
  it("decodes url= (Google /url redirect)", () => {
    assert.equal(
      cleanGenericRedir("?url=https%3A%2F%2Fexample.com"),
      "https://example.com"
    );
  });

  it("decodes u= (Facebook l.facebook.com short form)", () => {
    assert.equal(
      cleanGenericRedir("?u=https%3A%2F%2Fexample.com%2Fpage"),
      "https://example.com/page"
    );
  });

  it("decodes imgurl= (Google Images)", () => {
    assert.equal(
      cleanGenericRedir("?imgurl=https%3A%2F%2Fimages.example.com%2Fphoto.jpg"),
      "https://images.example.com/photo.jpg"
    );
  });

  it("decodes newurl= (Google /url alternate form)", () => {
    assert.equal(
      cleanGenericRedir("?q=foo&newurl=https%3A%2F%2Fnew.example.com"),
      "https://new.example.com"
    );
  });

  it("stops at & — trailing params do not leak into the decoded target", () => {
    assert.equal(
      cleanGenericRedir("?url=https%3A%2F%2Fexample.com&extra=123"),
      "https://example.com"
    );
  });

  it("throws when no matching param is present (no passthrough)", () => {
    assert.throws(() => cleanGenericRedir("?q=hello&ref=123"), TypeError);
  });
});

// ---------------------------------------------------------------------------
// cleanGenericRedir2
// Input: a search string. Matches [?&]\w*url= (case-insensitive) — any
// word-character prefix before "url=", including empty (plain url=).
// Returns decodeURIComponent of the captured value.
// No pass-through: throws when no matching param exists.
// ---------------------------------------------------------------------------
describe("cleanGenericRedir2", () => {
  it("decodes redirecturl= (Disqus / generic redirect form)", () => {
    assert.equal(
      cleanGenericRedir2("?redirecturl=https%3A%2F%2Fexample.com%2Fpath"),
      "https://example.com/path"
    );
  });

  it("decodes plain url= (\\w* matches empty prefix)", () => {
    assert.equal(
      cleanGenericRedir2("?url=https%3A%2F%2Fother.com"),
      "https://other.com"
    );
  });

  it("decodes a numeric-prefixed param — \\w includes digits", () => {
    // CURRENT BEHAVIOR: \w* matches '123', so '123url=X' is a valid redirect param
    assert.equal(
      cleanGenericRedir2("?123url=https%3A%2F%2Fexample.com"),
      "https://example.com"
    );
  });

  it("throws when no *url= param is present (no passthrough)", () => {
    assert.throws(() => cleanGenericRedir2("?q=hello"), TypeError);
  });
});

// ---------------------------------------------------------------------------
// cleanPocketRedir
// Input: the FULL href of the anchor (not just the search string).
// Strips the literal prefix "https://getpocket.com/redirect?url=" via
// String.replace(), then calls decodeURIComponent on the remainder.
//
// SURPRISING BEHAVIORS encoded here:
// 1. Already-clean URL (no pocket prefix): prefix replace is a no-op, then
//    decodeURIComponent is called on the original URL — returns it unchanged
//    for plain ASCII URLs (no actual passthrough guard).
// 2. Trailing params after url=: the literal-replace leaves them in the
//    decoded string as "target-url&param=val" (not split on &).
// 3. Double-encoded target: only one layer of decoding applied.
// ---------------------------------------------------------------------------
describe("cleanPocketRedir", () => {
  it("decodes a real Pocket redirect href to the target URL", () => {
    assert.equal(
      cleanPocketRedir("https://getpocket.com/redirect?url=https%3A%2F%2Fexample.com%2Farticle"),
      "https://example.com/article"
    );
  });

  it("passes through an already-clean URL (prefix absent, decodeURIComponent is no-op on ASCII)", () => {
    // CURRENT BEHAVIOR: prefix not found → replace no-op → decodeURIComponent('https://example.com/article')
    // = 'https://example.com/article'
    assert.equal(
      cleanPocketRedir("https://example.com/article"),
      "https://example.com/article"
    );
  });

  it("trailing params after url= leak into the decoded target (known behavior)", () => {
    // CURRENT BEHAVIOR: literal replace strips only the prefix, leaving the rest
    // of the query string attached to the decoded target via a literal '&'.
    assert.equal(
      cleanPocketRedir("https://getpocket.com/redirect?url=https%3A%2F%2Fexample.com%2Farticle&form_check=abc"),
      "https://example.com/article&form_check=abc"
    );
  });

  it("only decodes one layer — double-encoded target remains partially encoded", () => {
    assert.equal(
      cleanPocketRedir("https://getpocket.com/redirect?url=https%253A%252F%252Fexample.com%252Farticle"),
      "https%3A%2F%2Fexample.com%2Farticle"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanBing
// Strips: qs, form, FORM, cvid, pq, go, filt, sc, sp, sk, qpvt, redig,
//         toWww, ghpl, lq, ghc, ghsh, ghacc (matches bingParams regex)
// Keeps:  q, p, and other functional search params
// Also removes a trailing bare ? when all params are stripped.
// ---------------------------------------------------------------------------
describe("cleanBing", () => {
  it("strips qs and form while keeping q", () => {
    assert.equal(
      cleanBing("?q=cats&qs=AS&form=QBRE"),
      "?q=cats"
    );
  });

  it("strips cvid at end while keeping q", () => {
    assert.equal(
      cleanBing("?q=dogs&cvid=abc123"),
      "?q=dogs"
    );
  });

  it("strips pq (previous query tracking) while keeping q", () => {
    assert.equal(
      cleanBing("?q=news&pq=old+query"),
      "?q=news"
    );
  });

  it("removes trailing ? when all params are stripped", () => {
    // bingParams strips form and qs; ?→?& then & stripped; ?$ cleaned up
    assert.equal(
      cleanBing("?form=QBRE&qs=AS"),
      ""
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanBing("?q=javascript&filters=ex1%3A%22ez5%22"),
      "?q=javascript&filters=ex1%3A%22ez5%22"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanEtsy
// Strips: click_key, click_sum, ref, pro, frs, ga_order, ga_search_type,
//         ga_view_type, ga_search_query, sts, organic_search_click, plkey
// Keeps:  q, search_query, page, and other functional params
// ---------------------------------------------------------------------------
describe("cleanEtsy", () => {
  it("strips ref and ga_order while keeping q", () => {
    assert.equal(
      cleanEtsy("?q=vintage+lamp&ref=search_bar&ga_order=most_relevant"),
      "?q=vintage+lamp"
    );
  });

  it("strips sts (session tracking) while keeping search_query and page", () => {
    assert.equal(
      cleanEtsy("?search_query=ring&sts=listing_card&page=2"),
      "?search_query=ring&page=2"
    );
  });

  it("strips organic_search_click and plkey while keeping q", () => {
    assert.equal(
      cleanEtsy("?q=candle&organic_search_click=1&plkey=abc"),
      "?q=candle"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanEtsy("?q=earrings&page=3"),
      "?q=earrings&page=3"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanYoutube
// Strips: feature, src_vid, annotation_id, hl (host language), gl (geo)
// Keeps:  v (video id), t (timestamp), and other functional params
// ---------------------------------------------------------------------------
describe("cleanYoutube", () => {
  it("strips feature while keeping v", () => {
    assert.equal(
      cleanYoutube("?v=dQw4w9WgXcQ&feature=youtu.be"),
      "?v=dQw4w9WgXcQ"
    );
  });

  it("strips hl and gl while keeping v and t", () => {
    assert.equal(
      cleanYoutube("?v=abc123&t=42&hl=en&gl=US"),
      "?v=abc123&t=42"
    );
  });

  it("strips annotation_id while keeping v", () => {
    assert.equal(
      cleanYoutube("?v=abc123&annotation_id=annotation_123456"),
      "?v=abc123"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanYoutube("?v=dQw4w9WgXcQ&t=30"),
      "?v=dQw4w9WgXcQ&t=30"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanImdb
// Strips: pf_rd_[a-z] (pf_rd_r, pf_rd_p, etc.), ref_
// Keeps:  ref (without underscore), q, and other functional params
// Also removes trailing bare ? when all params are stripped.
// Note: ref_ (with trailing underscore) IS matched; plain ref is NOT.
// ---------------------------------------------------------------------------
describe("cleanImdb", () => {
  it("strips pf_rd_r and pf_rd_p while keeping q", () => {
    assert.equal(
      cleanImdb("?q=inception&pf_rd_r=ABC123&pf_rd_p=XYZ789"),
      "?q=inception"
    );
  });

  it("strips ref_ (with underscore) while keeping q", () => {
    assert.equal(
      cleanImdb("?q=godfather&ref_=fn_al_tt_1"),
      "?q=godfather"
    );
  });

  it("removes trailing ? when only tracking params were present", () => {
    assert.equal(
      cleanImdb("?pf_rd_r=ABC&ref_=fn_al_tt_1"),
      ""
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanImdb("?q=pulp+fiction&s=tt"),
      "?q=pulp+fiction&s=tt"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanNewegg
// Strips: cm_sp, icid, ignorebbr
// Keeps:  Item, Description, and other functional product/search params
// ---------------------------------------------------------------------------
describe("cleanNewegg", () => {
  it("strips cm_sp while keeping Item", () => {
    assert.equal(
      cleanNewegg("?Item=9SIABC1234&cm_sp=Homepage-_-TopSeller-_-NA"),
      "?Item=9SIABC1234"
    );
  });

  it("strips icid while keeping Description", () => {
    assert.equal(
      cleanNewegg("?Description=gpu&icid=HOM-LUC-082123001"),
      "?Description=gpu"
    );
  });

  it("strips ignorebbr while keeping Item", () => {
    assert.equal(
      cleanNewegg("?Item=12345&ignorebbr=1"),
      "?Item=12345"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanNewegg("?Item=9SIABC1234&Tpk=my+item"),
      "?Item=9SIABC1234&Tpk=my+item"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanTargetParams
// Strips: lnk, tref, searchTermRaw
// Keeps:  searchTerm, category, and other functional params
// Note: cleanTargetParams receives the full URL string (origin + path + query),
// not just the search string — matching cleanTargetItemp vs cleanTargetParams
// dispatch in the source. The regex only touches the query portion.
// ---------------------------------------------------------------------------
describe("cleanTargetParams", () => {
  it("strips lnk and tref while keeping searchTerm", () => {
    assert.equal(
      cleanTargetParams("?searchTerm=laptop&lnk=snav_slinks_6&tref=typeAheadTerm"),
      "?searchTerm=laptop"
    );
  });

  it("strips searchTermRaw while keeping searchTerm", () => {
    assert.equal(
      cleanTargetParams("?searchTerm=shoes&searchTermRaw=shoes"),
      "?searchTerm=shoes"
    );
  });

  it("strips tref at end while keeping searchTerm and category", () => {
    assert.equal(
      cleanTargetParams("?searchTerm=tv&category=Electronics&tref=typeAheadTerm"),
      "?searchTerm=tv&category=Electronics"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanTargetParams("?searchTerm=headphones&sortBy=priceAsc"),
      "?searchTerm=headphones&sortBy=priceAsc"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanFacebookParams
// Strips: set (the only param in facebookParams)
// Keeps:  id, type, and other functional params
// Note: only `set` is in the regex — other Facebook params (e.g. __xts__) are
// NOT stripped by this cleaner.
// ---------------------------------------------------------------------------
describe("cleanFacebookParams", () => {
  it("strips set while keeping id", () => {
    assert.equal(
      cleanFacebookParams("?id=123456789&set=a.987654321"),
      "?id=123456789"
    );
  });

  it("strips set at start while keeping id and type", () => {
    // set is first param: ?→?& makes it ?&set=…&id=…&type=…
    // &set=… matched; after stripping and .replace("&","") → ?id=…&type=…
    assert.equal(
      cleanFacebookParams("?set=a.100&id=999&type=3"),
      "?id=999&type=3"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanFacebookParams("?id=123456789&type=3"),
      "?id=123456789&type=3"
    );
  });

  it("passes through a URL with no query string unchanged", () => {
    // No ? → ?→?& replace is no-op → nothing matches → unchanged
    assert.equal(
      cleanFacebookParams("https://www.facebook.com/photo"),
      "https://www.facebook.com/photo"
    );
  });
});
