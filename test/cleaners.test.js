"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
  cleanGoogle,
  cleanEbayParams,
  cleanAmazonParams,
  cleanAudible,
  cleanYoutube,
  cleanImdb,
  cleanNewegg,
  cleanTargetParams,
  cleanFacebookParams,
  cleanUtm,
  cleanGlobalParams,
  cleanYoutubeRedir,
  cleanAmazonRedir,
  cleanGenericRedir,
  cleanParams,
  bingParams,
  linkedinParams,
  etsyParams,
  yahooParams,
  spotifyParams,
  redditParams,
  twitchParams,
  threadsParams,
  aliexpressParams,
  walmartParams,
  bestbuyParams,
  tiktokParams,
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
      cleanParams("?p=news&guccounter=1&guce_referrer=abc&guce_referrer_sig=xyz", yahooParams),
      "?p=news"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(cleanParams("?p=finance&fr=yfp-t", yahooParams), "?p=finance&fr=yfp-t");
  });

  it("strips lone guccounter", () => {
    assert.equal(cleanParams("?p=news&guccounter=2", yahooParams), "?p=news");
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
      cleanParams("?trk=abc&keywords=engineer", linkedinParams),
      "?keywords=engineer"
    );
  });

  it("strips trk and refId at the end, keeping keywords and location", () => {
    // trk and refId removed; kept params keywords and location stay joined by &
    assert.equal(
      cleanParams("?keywords=engineer&location=Austin&trk=abc&refId=xyz", linkedinParams),
      "?keywords=engineer&location=Austin"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanParams("?keywords=developer&location=Remote", linkedinParams),
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
// cleanBing
// Strips: qs, form, FORM, cvid, pq, go, filt, sc, sp, sk, qpvt, redig,
//         toWww, ghpl, lq, ghc, ghsh, ghacc (matches bingParams regex)
// Keeps:  q, p, and other functional search params
// Also removes a trailing bare ? when all params are stripped.
// ---------------------------------------------------------------------------
describe("cleanBing", () => {
  it("strips qs and form while keeping q", () => {
    assert.equal(
      cleanParams("?q=cats&qs=AS&form=QBRE", bingParams, true),
      "?q=cats"
    );
  });

  it("strips cvid at end while keeping q", () => {
    assert.equal(
      cleanParams("?q=dogs&cvid=abc123", bingParams, true),
      "?q=dogs"
    );
  });

  it("strips pq (previous query tracking) while keeping q", () => {
    assert.equal(
      cleanParams("?q=news&pq=old+query", bingParams, true),
      "?q=news"
    );
  });

  it("removes trailing ? when all params are stripped", () => {
    // bingParams strips form and qs; ?→?& then & stripped; ?$ cleaned up
    assert.equal(
      cleanParams("?form=QBRE&qs=AS", bingParams, true),
      ""
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanParams("?q=javascript&filters=ex1%3A%22ez5%22", bingParams, true),
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
      cleanParams("?q=vintage+lamp&ref=search_bar&ga_order=most_relevant", etsyParams),
      "?q=vintage+lamp"
    );
  });

  it("strips sts (session tracking) while keeping search_query and page", () => {
    assert.equal(
      cleanParams("?search_query=ring&sts=listing_card&page=2", etsyParams),
      "?search_query=ring&page=2"
    );
  });

  it("strips organic_search_click and plkey while keeping q", () => {
    assert.equal(
      cleanParams("?q=candle&organic_search_click=1&plkey=abc", etsyParams),
      "?q=candle"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanParams("?q=earrings&page=3", etsyParams),
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

// ---------------------------------------------------------------------------
// cleanGlobalParams
// Strips: universal click-id and email-tracking params (fbclid, gclid, dclid,
//   gclsrc, gad_source, gad_campaignid, msclkid, twclid, ttclid, fbadid,
//   igshid, igsh, mc_eid, mc_cid, _hsenc, _hsmi, __hstc, __hssc, __hsfp,
//   hsCtaTracking, vero_id, vero_conv, oly_anon_id, oly_enc_id, __s,
//   yclid, ysclid, _openstat, srsltid, irgwc, cjevent, cjdata, awc,
//   wickedid, rb_clickid, tduid, iclid, s_cid, _branch_referrer,
//   _branch_match_id, ml_subscriber, ml_subscriber_hash, bsft_clkid,
//   bsft_eid, bsft_mid, bsft_uid, admitad_uid, mtm_*, pk_*)
// Keeps:  all functional params (id, q, page, ref, etc.)
// Uses the same split/splice idiom as cleanUtm — no separator fixup needed.
// ---------------------------------------------------------------------------
describe("cleanGlobalParams", () => {
  // --- Google Ads click-ids ---
  it("strips gclid while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=123&gclid=abc"),
      "https://example.com/?id=123"
    );
  });

  it("strips dclid while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=search&dclid=xyz"),
      "https://example.com/?q=search"
    );
  });

  it("strips gclsrc while keeping page", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?page=2&gclsrc=aw.ds"),
      "https://example.com/?page=2"
    );
  });

  it("strips gad_source while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=test&gad_source=1"),
      "https://example.com/?q=test"
    );
  });

  it("strips gad_campaignid while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=5&gad_campaignid=99"),
      "https://example.com/?id=5"
    );
  });

  // --- Facebook / Instagram ---
  it("strips fbclid while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=42&fbclid=IwAR123"),
      "https://example.com/?id=42"
    );
  });

  it("strips igshid while keeping ref", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?ref=home&igshid=abc"),
      "https://example.com/?ref=home"
    );
  });

  it("strips igsh while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=test&igsh=def"),
      "https://example.com/?q=test"
    );
  });

  it("strips fbadid while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=1&fbadid=xyz"),
      "https://example.com/?id=1"
    );
  });

  // --- Microsoft / Bing ---
  it("strips msclkid while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=hello&msclkid=abc123"),
      "https://example.com/?q=hello"
    );
  });

  // --- Twitter / TikTok ---
  it("strips twclid while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=7&twclid=tw123"),
      "https://example.com/?id=7"
    );
  });

  it("strips ttclid while keeping page", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?page=1&ttclid=tt456"),
      "https://example.com/?page=1"
    );
  });

  // --- Yandex ---
  it("strips yclid while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=cats&yclid=ya1"),
      "https://example.com/?q=cats"
    );
  });

  it("strips ysclid while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=dogs&ysclid=ya2"),
      "https://example.com/?q=dogs"
    );
  });

  // --- Mailchimp ---
  it("strips mc_eid while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=1&mc_eid=abc"),
      "https://example.com/?id=1"
    );
  });

  it("strips mc_cid while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=2&mc_cid=xyz"),
      "https://example.com/?id=2"
    );
  });

  // --- HubSpot ---
  it("strips _hsenc while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=test&_hsenc=p8AParlPi"),
      "https://example.com/?q=test"
    );
  });

  it("strips _hsmi while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=3&_hsmi=123"),
      "https://example.com/?id=3"
    );
  });

  it("strips __hstc while keeping page", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?page=1&__hstc=abc.def.123"),
      "https://example.com/?page=1"
    );
  });

  it("strips __hssc while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=foo&__hssc=xyz"),
      "https://example.com/?q=foo"
    );
  });

  it("strips __hsfp while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=9&__hsfp=123"),
      "https://example.com/?id=9"
    );
  });

  it("strips hsCtaTracking while keeping ref", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?ref=nav&hsCtaTracking=a|b"),
      "https://example.com/?ref=nav"
    );
  });

  // --- Vero ---
  it("strips vero_id while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=5&vero_id=abc"),
      "https://example.com/?id=5"
    );
  });

  it("strips vero_conv while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=hi&vero_conv=xyz"),
      "https://example.com/?q=hi"
    );
  });

  // --- Omeda/Oly ---
  it("strips oly_anon_id while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=8&oly_anon_id=abc"),
      "https://example.com/?id=8"
    );
  });

  it("strips oly_enc_id while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=test&oly_enc_id=xyz"),
      "https://example.com/?q=test"
    );
  });

  // --- Drip (__s) ---
  it("strips __s while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=4&__s=abc123"),
      "https://example.com/?id=4"
    );
  });

  // --- Openstat / Yandex ---
  it("strips _openstat while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=test&_openstat=abc"),
      "https://example.com/?q=test"
    );
  });

  // --- Google Shopping (srsltid) ---
  it("strips srsltid while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=1&srsltid=abc"),
      "https://example.com/?id=1"
    );
  });

  // --- Affiliate networks ---
  it("strips irgwc while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=test&irgwc=1"),
      "https://example.com/?q=test"
    );
  });

  it("strips cjevent while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=2&cjevent=abc"),
      "https://example.com/?id=2"
    );
  });

  it("strips cjdata while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=foo&cjdata=xyz"),
      "https://example.com/?q=foo"
    );
  });

  it("strips awc while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=3&awc=1234_abc"),
      "https://example.com/?id=3"
    );
  });

  it("strips wickedid while keeping page", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?page=2&wickedid=xyz"),
      "https://example.com/?page=2"
    );
  });

  it("strips rb_clickid while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=test&rb_clickid=abc"),
      "https://example.com/?q=test"
    );
  });

  it("strips tduid while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=9&tduid=abc"),
      "https://example.com/?id=9"
    );
  });

  it("strips iclid while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=hi&iclid=xyz"),
      "https://example.com/?q=hi"
    );
  });

  it("strips s_cid while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=5&s_cid=email-123"),
      "https://example.com/?id=5"
    );
  });

  // --- Branch.io ---
  it("strips _branch_referrer while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=test&_branch_referrer=abc"),
      "https://example.com/?q=test"
    );
  });

  it("strips _branch_match_id while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=1&_branch_match_id=xyz"),
      "https://example.com/?id=1"
    );
  });

  // --- Mailerlite ---
  it("strips ml_subscriber while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=test&ml_subscriber=abc"),
      "https://example.com/?q=test"
    );
  });

  it("strips ml_subscriber_hash while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=2&ml_subscriber_hash=xyz"),
      "https://example.com/?id=2"
    );
  });

  // --- Bsft (BenchmarkEmail / Salesforce MC) ---
  it("strips bsft_clkid while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=test&bsft_clkid=abc"),
      "https://example.com/?q=test"
    );
  });

  it("strips bsft_eid while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=3&bsft_eid=xyz"),
      "https://example.com/?id=3"
    );
  });

  it("strips bsft_mid while keeping page", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?page=1&bsft_mid=abc"),
      "https://example.com/?page=1"
    );
  });

  it("strips bsft_uid while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=foo&bsft_uid=xyz"),
      "https://example.com/?q=foo"
    );
  });

  // --- Admitad ---
  it("strips admitad_uid while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=7&admitad_uid=abc"),
      "https://example.com/?id=7"
    );
  });

  // --- mtm_* prefix (Matomo) ---
  it("strips mtm_source while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=test&mtm_source=newsletter"),
      "https://example.com/?q=test"
    );
  });

  it("strips mtm_campaign while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=1&mtm_campaign=spring"),
      "https://example.com/?id=1"
    );
  });

  // --- pk_* prefix (Matomo legacy) ---
  it("strips pk_source while keeping q", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?q=test&pk_source=email"),
      "https://example.com/?q=test"
    );
  });

  it("strips pk_campaign while keeping id", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=2&pk_campaign=fall"),
      "https://example.com/?id=2"
    );
  });

  // --- Functional params are preserved ---
  it("preserves id, q, and page when no tracking params present", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?id=123&q=search&page=2"),
      "https://example.com/?id=123&q=search&page=2"
    );
  });

  it("preserves ref (functional) — not in global list", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?ref=home&q=test"),
      "https://example.com/?ref=home&q=test"
    );
  });

  // --- Mixed: tracking + functional => only tracking removed, separators well-formed ---
  it("mixed: strips fbclid+gclid, keeps id and q with correct separators", () => {
    assert.equal(
      cleanGlobalParams(
        "https://example.com/?id=42&fbclid=IwAR123&q=search&gclid=abc"
      ),
      "https://example.com/?id=42&q=search"
    );
  });

  it("mixed: strips msclkid from first position, keeps q and page", () => {
    assert.equal(
      cleanGlobalParams(
        "https://example.com/?msclkid=abc&q=shoes&page=3"
      ),
      "https://example.com/?q=shoes&page=3"
    );
  });

  it("mixed: multiple tracking params between two functional ones — no stray separators", () => {
    assert.equal(
      cleanGlobalParams(
        "https://example.com/?id=1&fbclid=x&gclid=y&msclkid=z&page=2"
      ),
      "https://example.com/?id=1&page=2"
    );
  });

  // --- No query string — unchanged ---
  it("leaves URL with no query string unchanged", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/page"),
      "https://example.com/page"
    );
  });

  // --- Idempotent ---
  it("is idempotent: cleaning an already-clean URL is a no-op", () => {
    const url = "https://example.com/?id=42&q=search";
    assert.equal(cleanGlobalParams(url), url);
  });

  // --- utm_ params are NOT stripped by cleanGlobalParams (cleanUtm handles those) ---
  it("does not strip utm_ params (cleanUtm's responsibility)", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?utm_source=email&id=1"),
      "https://example.com/?utm_source=email&id=1"
    );
  });

  // --- Search-string form (mirrors how transformGlobalUrl passes u.search) ---
  it("strips fbclid from a bare search string ?fbclid=x&id=1", () => {
    assert.equal(
      cleanGlobalParams("?fbclid=x&id=1"),
      "?id=1"
    );
  });

  it("strips all tracking, leaves empty string when nothing functional remains", () => {
    assert.equal(
      cleanGlobalParams("https://example.com/?fbclid=x&gclid=y"),
      "https://example.com/"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanSpotify
// Strips: si (Spotify share/session identity token)
// Keeps:  functional params (no known functional params share the name "si")
// ---------------------------------------------------------------------------
describe("cleanSpotify", () => {
  it("strips si while keeping no other params", () => {
    assert.equal(
      cleanParams("?si=abc123", spotifyParams),
      "?"
    );
  });

  it("strips si while keeping a hypothetical functional param", () => {
    // Verify separator fixup: functional param before si survives intact
    assert.equal(
      cleanParams("?go=1&si=abc123", spotifyParams),
      "?go=1"
    );
  });

  it("strips si at start, keeps trailing functional param", () => {
    assert.equal(
      cleanParams("?si=abc123&go=1", spotifyParams),
      "?go=1"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanParams("?go=1", spotifyParams),
      "?go=1"
    );
  });

  it("passes through a URL with no query string unchanged", () => {
    assert.equal(
      cleanParams("https://open.spotify.com/track/123", spotifyParams),
      "https://open.spotify.com/track/123"
    );
  });

  it("is idempotent on an already-clean search string", () => {
    assert.equal(cleanParams("?go=1", spotifyParams), "?go=1");
  });
});

// ---------------------------------------------------------------------------
// cleanReddit
// Strips: correlation_id, ref_campaign, ref_source, share_id
// Keeps:  q, sort, t, after (functional pagination/search/sort params)
// Note: plain `ref` is NOT stripped — it is functional on Reddit (subreddit
// context); only ref_campaign and ref_source (campaign-tracking variants) are.
// ---------------------------------------------------------------------------
describe("cleanReddit", () => {
  it("strips share_id while keeping q and sort", () => {
    assert.equal(
      cleanParams("?q=cats&sort=new&share_id=XYZ", redditParams),
      "?q=cats&sort=new"
    );
  });

  it("strips correlation_id while keeping sort and t", () => {
    assert.equal(
      cleanParams("?sort=top&t=week&correlation_id=abc", redditParams),
      "?sort=top&t=week"
    );
  });

  it("strips ref_campaign and ref_source, keeps q", () => {
    assert.equal(
      cleanParams("?q=dogs&ref_campaign=email&ref_source=newsletter", redditParams),
      "?q=dogs"
    );
  });

  it("preserves functional sort and t params", () => {
    assert.equal(
      cleanParams("?sort=hot&t=all", redditParams),
      "?sort=hot&t=all"
    );
  });

  it("preserves plain ref param (functional, not stripped)", () => {
    assert.equal(
      cleanParams("?ref=sidebar&q=news", redditParams),
      "?ref=sidebar&q=news"
    );
  });

  it("strips all four tracking params, leaves bare ?", () => {
    assert.equal(
      cleanParams("?correlation_id=a&ref_campaign=b&ref_source=c&share_id=d", redditParams),
      "?"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanParams("?q=programming&sort=new&t=week", redditParams),
      "?q=programming&sort=new&t=week"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanTwitch
// Strips: tt_medium, tt_content (Twitch campaign tracking params)
// Keeps:  functional params (channel, quality, volume, etc.)
// ---------------------------------------------------------------------------
describe("cleanTwitch", () => {
  it("strips tt_medium while keeping a functional param", () => {
    assert.equal(
      cleanParams("?channel=streamer&tt_medium=social", twitchParams),
      "?channel=streamer"
    );
  });

  it("strips tt_content while keeping a functional param", () => {
    assert.equal(
      cleanParams("?channel=streamer&tt_content=banner", twitchParams),
      "?channel=streamer"
    );
  });

  it("strips both tt_medium and tt_content, keeps functional params", () => {
    assert.equal(
      cleanParams("?quality=auto&tt_medium=email&tt_content=hero", twitchParams),
      "?quality=auto"
    );
  });

  it("strips both when they are the only params, leaves bare ?", () => {
    assert.equal(
      cleanParams("?tt_medium=social&tt_content=banner", twitchParams),
      "?"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanParams("?channel=streamer&quality=auto", twitchParams),
      "?channel=streamer&quality=auto"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanThreads
// Strips: xmt (Threads share token)
// Keeps:  functional params
// Note: igshid/igsh are handled globally by cleanGlobalParams — not added here
// to avoid redundancy, but this cleaner handles the Threads-specific xmt param.
// ---------------------------------------------------------------------------
describe("cleanThreads", () => {
  it("strips xmt while keeping a functional param", () => {
    assert.equal(
      cleanParams("?igshid=abc&xmt=xyz", threadsParams),
      "?igshid=abc"
    );
  });

  it("strips xmt when it is the only param, leaves bare ?", () => {
    assert.equal(
      cleanParams("?xmt=xyz", threadsParams),
      "?"
    );
  });

  it("strips xmt at start, keeps trailing functional param", () => {
    assert.equal(
      cleanParams("?xmt=xyz&ref=home", threadsParams),
      "?ref=home"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanParams("?igshid=abc", threadsParams),
      "?igshid=abc"
    );
  });

  it("passes through a URL with no query string unchanged", () => {
    assert.equal(
      cleanParams("https://www.threads.net/@user/post/abc", threadsParams),
      "https://www.threads.net/@user/post/abc"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanAliexpress
// Strips: algo_pvid, algo_exp_id, pdp_ext_f, pdp_npi, curPageLogUid,
//         utparam-url (literal hyphen), aem_p4p_detail, search_p4p_id
// Keeps:  _ga (functional — GA cookie, explicitly excluded from strip list)
// ---------------------------------------------------------------------------
describe("cleanAliexpress", () => {
  it("strips algo_pvid and algo_exp_id while keeping id", () => {
    assert.equal(
      cleanParams("?id=12345&algo_pvid=abc&algo_exp_id=xyz", aliexpressParams),
      "?id=12345"
    );
  });

  it("strips pdp_ext_f and pdp_npi while keeping skuId", () => {
    assert.equal(
      cleanParams("?skuId=999&pdp_ext_f=foo&pdp_npi=bar", aliexpressParams),
      "?skuId=999"
    );
  });

  it("strips curPageLogUid while keeping category", () => {
    assert.equal(
      cleanParams("?category=tools&curPageLogUid=abc123", aliexpressParams),
      "?category=tools"
    );
  });

  it("strips utparam-url (param name contains a literal hyphen)", () => {
    assert.equal(
      cleanParams("?id=1&utparam-url=scene%3Asearch", aliexpressParams),
      "?id=1"
    );
  });

  it("strips aem_p4p_detail and search_p4p_id while keeping keyword", () => {
    assert.equal(
      cleanParams("?keyword=shoes&aem_p4p_detail=abc&search_p4p_id=xyz", aliexpressParams),
      "?keyword=shoes"
    );
  });

  it("preserves _ga (functional — must NOT be stripped)", () => {
    assert.equal(
      cleanParams("?id=1&_ga=2.abc.123.456&algo_pvid=xyz", aliexpressParams),
      "?id=1&_ga=2.abc.123.456"
    );
  });

  it("preserves _ga when it is the only remaining param after stripping", () => {
    assert.equal(
      cleanParams("?algo_pvid=abc&_ga=2.abc.1.1", aliexpressParams),
      "?_ga=2.abc.1.1"
    );
  });

  it("strips all eight tracking params together", () => {
    assert.equal(
      cleanParams(
        "?algo_pvid=a&algo_exp_id=b&pdp_ext_f=c&pdp_npi=d&curPageLogUid=e&utparam-url=f&aem_p4p_detail=g&search_p4p_id=h",
        aliexpressParams
      ),
      "?"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanParams("?id=12345&skuId=99", aliexpressParams),
      "?id=12345&skuId=99"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanWalmart
// Strips: u1, from, variantFieldId, and the ath* prefix family
//         (e.g. athbdg, athena_pgtype, athcpid — any param starting with "ath")
// Keeps:  query, page, and other functional params
// The ath* prefix uses ath[^&#=]* mirroring the pf_rd_[^&#]*? idiom in amazonParams.
// ---------------------------------------------------------------------------
describe("cleanWalmart", () => {
  it("strips u1 while keeping query", () => {
    assert.equal(
      cleanParams("?query=shoes&u1=abc", walmartParams),
      "?query=shoes"
    );
  });

  it("strips from while keeping query and page", () => {
    assert.equal(
      cleanParams("?query=tv&page=2&from=searchPage", walmartParams),
      "?query=tv&page=2"
    );
  });

  it("strips variantFieldId while keeping query", () => {
    assert.equal(
      cleanParams("?query=shirt&variantFieldId=actual_color", walmartParams),
      "?query=shirt"
    );
  });

  it("strips multiple ath* family params (athbdg and athena_pgtype) — prefix family", () => {
    assert.equal(
      cleanParams("?query=laptop&athbdg=BTN&athena_pgtype=search", walmartParams),
      "?query=laptop"
    );
  });

  it("strips athcpid (another ath* variant) while keeping query", () => {
    assert.equal(
      cleanParams("?query=monitor&athcpid=abc123", walmartParams),
      "?query=monitor"
    );
  });

  it("strips u1 and multiple ath* params together while keeping functional params", () => {
    assert.equal(
      cleanParams("?query=headphones&page=1&u1=x&athbdg=BTN&athena_pgtype=browse&athcpid=abc", walmartParams),
      "?query=headphones&page=1"
    );
  });

  it("preserves a non-ath param that merely contains 'ath' mid-string (functional)", () => {
    // 'mathematics' starts with 'm', not 'ath', so it is NOT caught by ath[^&#=]*
    assert.equal(
      cleanParams("?category=mathematics&u1=x", walmartParams),
      "?category=mathematics"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanParams("?query=coffee&page=3", walmartParams),
      "?query=coffee&page=3"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanBestbuy
// Strips: irclickid, loc, acampID, mpid, intl
// Keeps:  q, skuId, and other functional params
// NOTE: irgwc is NOT listed here — it is already stripped globally by
// cleanGlobalParams (via globalParams). Adding it here would be double-handling.
// ---------------------------------------------------------------------------
describe("cleanBestbuy", () => {
  it("strips irclickid while keeping q", () => {
    assert.equal(
      cleanParams("?q=laptop&irclickid=abc123", bestbuyParams),
      "?q=laptop"
    );
  });

  it("strips loc while keeping q", () => {
    assert.equal(
      cleanParams("?q=tv&loc=BBYHomePg", bestbuyParams),
      "?q=tv"
    );
  });

  it("strips acampID and mpid while keeping skuId", () => {
    assert.equal(
      cleanParams("?skuId=12345&acampID=affiliate&mpid=partner", bestbuyParams),
      "?skuId=12345"
    );
  });

  it("strips intl while keeping q and skuId", () => {
    assert.equal(
      cleanParams("?q=monitor&skuId=99&intl=nosplash", bestbuyParams),
      "?q=monitor&skuId=99"
    );
  });

  it("strips all five tracked params together", () => {
    assert.equal(
      cleanParams("?irclickid=a&loc=b&acampID=c&mpid=d&intl=e", bestbuyParams),
      "?"
    );
  });

  it("does NOT strip irgwc (handled globally, not here)", () => {
    // irgwc must be absent from bestbuyParams — this test confirms it passes through
    assert.equal(
      cleanParams("?q=tv&irgwc=1", bestbuyParams),
      "?q=tv&irgwc=1"
    );
  });

  it("passes through a URL with no tracked params unchanged", () => {
    assert.equal(
      cleanParams("?q=headphones&skuId=77777", bestbuyParams),
      "?q=headphones&skuId=77777"
    );
  });
});

// ---------------------------------------------------------------------------
// cleanTiktok
// Strips: u_code, _d, _t, _r, timestamp, user_id, share_app_name,
//         share_iid, source
// Keeps:  functional params; short params must NOT eat longer param names
// The short params _d/_t/_r are whole-name anchored via the &...(?=$|&) idiom.
// ---------------------------------------------------------------------------
describe("cleanTiktok", () => {
  it("strips u_code while keeping a functional param", () => {
    assert.equal(
      cleanParams("?item_id=123&u_code=abc", tiktokParams),
      "?item_id=123"
    );
  });

  it("strips share_app_name and share_iid while keeping item_id", () => {
    assert.equal(
      cleanParams("?item_id=456&share_app_name=tiktok&share_iid=xyz", tiktokParams),
      "?item_id=456"
    );
  });

  it("strips user_id and source while keeping item_id", () => {
    assert.equal(
      cleanParams("?item_id=789&user_id=111&source=h5_m", tiktokParams),
      "?item_id=789"
    );
  });

  it("strips timestamp while keeping item_id", () => {
    assert.equal(
      cleanParams("?item_id=1&timestamp=1700000000", tiktokParams),
      "?item_id=1"
    );
  });

  it("strips _t but does NOT eat a hypothetical _type param (whole-name anchor)", () => {
    // _t must match only the param named exactly _t, not a longer param
    // whose name merely starts with _t (e.g. _type is NOT in the strip list).
    assert.equal(
      cleanParams("?item_id=1&_t=abc&_type=video", tiktokParams),
      "?item_id=1&_type=video"
    );
  });

  it("strips both _t and timestamp as separate params (both are in the strip list)", () => {
    assert.equal(
      cleanParams("?item_id=1&_t=abc&timestamp=1700000000", tiktokParams),
      "?item_id=1"
    );
  });

  it("strips _r without eating a longer param name", () => {
    assert.equal(
      cleanParams("?item_id=2&_r=1&referer=home", tiktokParams),
      "?item_id=2&referer=home"
    );
  });

  it("strips _d without eating a longer param name", () => {
    assert.equal(
      cleanParams("?item_id=3&_d=abc&description=fun", tiktokParams),
      "?item_id=3&description=fun"
    );
  });

  it("strips all nine tracked params together", () => {
    assert.equal(
      cleanParams(
        "?u_code=a&_d=b&_t=c&_r=d&timestamp=e&user_id=f&share_app_name=g&share_iid=h&source=i",
        tiktokParams
      ),
      "?"
    );
  });

  it("preserves a functional param when no tracked params present", () => {
    assert.equal(
      cleanParams("?item_id=12345", tiktokParams),
      "?item_id=12345"
    );
  });

  it("preserves item_id (functional) alongside mixed tracked params", () => {
    assert.equal(
      cleanParams("?item_id=9&_t=abc&user_id=111&share_iid=xyz", tiktokParams),
      "?item_id=9"
    );
  });
});
