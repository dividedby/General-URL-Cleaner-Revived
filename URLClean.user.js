// ==UserScript==
// @name        General URL Cleaner Revived
// @namespace   https://greasyfork.org/en/users/594496-divided-by
// @author      dividedby
// @description Cleans URLs from various popular sites and removes tracking parameters
// @version     4.2.7
// @license     GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @contributionURL     https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=dividedbygit@gmail.com&item_name=Greasy+Fork+Donation
// @contributionAmount  $1
// @include     https://www.newegg.com/*
// @include     https://www.newegg.ca/*
// @include     /^https:\/\/[a-z.]*\.?bing(\.[a-z]{2,3})?(\.[a-z]+)?\/.*$/
// @include     https://www.youtube.com/*
// @include     https://www.imdb.com/*
// @include     https://www.facebook.com/*
// @include     https://disqus.com/embed/comments/*
// @include     https://www.target.com/*
// @include     https://www.linkedin.com/*
// @include     https://www.etsy.com/*
// @include     https://www.yahoo.com/*
// @include     /^https:\/\/[a-z0-9.]*\.?amazon(\.[a-z0-9]{2,3})?(\.[a-z]+)?\/.*$/
// @include     /^https:\/\/[a-z0-9.]*\.?audible(\.[a-z0-9]{2,3})?(\.[a-z]+)?\/.*$/
// @include     /^https:\/\/[a-z0-9.]*\.?google(\.[a-z0-9]{2,3})?(\.[a-z]+)?\/.*$/
// @include     /^https:\/\/[a-z0-9.]*\.?ebay(desc)?(\.[a-z0-9]{2,3})?(\.[a-z]+)?\/.*$/
// @include     *
// @exclude     /^https:\/\/[a-z0-9.]*\.?amazon(\.[a-z0-9]{2,3})?(\.[a-z]+)?\/(?:gp\/(?:cart|buy|css|legacy|your-account).*|sspa.*)$/
// @exclude     https://apis.google.com/*
// @exclude     https://accounts.google.com/*
// @exclude     https://support.google.com/*
// @exclude     https://www.google.com/recaptcha/*
// @exclude     https://hangouts.google.com/webchat/*
// @exclude     https://gsuite.google.com/*
// @exclude     https://calendar.google.com/*
// @exclude     https://docs.google.com/spreadsheets/*
// @exclude     https://takeout.google.com/*
// @run-at      document-idle

// ==/UserScript==

(() => {
  /*
   * Vars
   */

  const _domAvailable = typeof location !== "undefined" && typeof document !== "undefined";

  // ponytail: opt-out — set false to skip cleaning on sites without a dedicated handler.
  // Upgrade path: a GM_registerMenuCommand toggle once @grant is added.
  const GLOBAL_STRIP = true;

  const currHost = _domAvailable ? location.host : "";
  const currPath = _domAvailable ? location.pathname : "";
  const currSearch = _domAvailable ? location.search : "";

  const ebay = /^[a-z.]*\.?ebay(desc)?(\.[a-z]{2,3})?(\.[a-z]+)?$/;
  const amazon = /^[a-z.]*\.?amazon(\.[a-z]{2,3})?(\.[a-z]+)?$/;
  const google = /^[a-z.]*\.?google(\.[a-z]{2,3})?(\.[a-z]+)?$/;
  const target = /^[a-z.]*\.?target\.com$/;
  const bing = /^[a-z.]*\.?bing(\.[a-z]{2,3})?(\.[a-z]+)?$/;

  const amazonParams =
    /&?_?(encoding|crid|sprefix|ref|th|url|ie|pf_rd_[^&#]*?|pd_rd_[^&#]*?|bbn|rw_html_to_wsrp|ref_|content-id)(=[^&#]*)?(?=$|&)/g;
  const neweggParams = /&(cm_sp|icid|ignorebbr)(=[^&#]*)?(?=$|&)/g;
  const imdbParams = /&(pf_rd_[a-z]|ref_)(=[^&#]*)?(?=$|&)/g;
  const bingParams =
    /&(redig|toWww|ghpl|lq|ghc|ghsh|ghacc|ghpl|go|qs|form|FORM|filt|pq|s[cpk]|qpvt|cvid)(=[^&#]*)?(?=$|&)/g;
  const youtubeParams =
    /&(feature|src_vid|annotation_id|[gh]l)(=[^&#]*)?(?=$|&)/g;
  const ebayParams = /[?&](_(o?sacat|odkw|from|trksid)|rt)(=[^&#]*)?(?=&|$)/g;
  const targetParams = /&(lnk|tref|searchTermRaw)(=[^&#]*)?(?=$|&)/g;
  const facebookParams = /&(set)(=[^&#]*)?(?=$|&)/g;
  const googleParams =
    /(?:&|^)(uact|iflsig|sxsrf|ved|source(id)?|s?ei|tab|tbo|h[ls]|n?um|ie|aqs|as_qdr|bav|bi[wh]|bs|bvm|cad|channel|complete|cp|s?client|d[pc]r|e(ch|msg|s_sm)|g(fe|ws)_rd|gpsrc|noj|btnG|o[eq]|p(si|bx|f|q)|rct|rlz|site|spell|tbas|usg|xhr|gs_[a-z]+)(=[^&#]*)?(?=$|&)/g;
  const linkedinParams =
    /&(eBP|refId|trackingId|trk|flagship3_search_srp_jobs|lipi|lici)(=[^&#]*)?(?=$|&)/g;
  const etsyParams =
    /&(click_key|click_sum|ref|pro|frs|ga_order|ga_search_type|ga_view_type|ga_search_query|sts|organic_search_click|plkey)(=[^&#]*)?(?=$|&)/g;
  const yahooParams = /&(guccounter|guce_referrer|guce_referrer_sig)(=[^&#]*)?(?=$|&)/g;
  // Universal click-id / email-tracking params safe to strip on every site.
  // Sourced from AdGuard URL Tracking filter, ClearURLs, and Brave's query-string filter.
  // Excludes: _gl (GA4 cross-domain stitching), mkt_tok (Marketo unsubscribe path),
  // clickid (too generic / server-side functional), gbraid/wbraid (aggregate-only, revisit separately).
  const globalParams =
    /^(fbclid|gclid|dclid|gclsrc|gad_source|gad_campaignid|msclkid|twclid|ttclid|fbadid|igshid|igsh|mc_eid|mc_cid|_hsenc|_hsmi|__hstc|__hssc|__hsfp|hsCtaTracking|vero_id|vero_conv|oly_anon_id|oly_enc_id|__s|yclid|ysclid|_openstat|srsltid|irgwc|cjevent|cjdata|awc|wickedid|rb_clickid|tduid|iclid|s_cid|_branch_referrer|_branch_match_id|ml_subscriber|ml_subscriber_hash|bsft_clkid|bsft_eid|bsft_mid|bsft_uid|admitad_uid|mtm_[^=&]*|pk_[^=&]*)(=|$)/;

  /*
   * Main
   */

  if (_domAvailable) {
    if (bing.test(currHost)) {
      setCurrUrl(cleanBing(currSearch));
      cleanLinks(parserAll);
      return;
    }

    if (currHost == "www.linkedin.com") {
      setCurrUrl(cleanLinkedin(currSearch));
      cleanLinks(parserAll);
      return;
    }

    if (currHost == "www.etsy.com") {
      setCurrUrl(cleanEtsy(currSearch));
      cleanLinks(parserAll);
      return;
    }

    if (currHost == "www.yahoo.com") {
      setCurrUrl(cleanYahoo(currSearch));
      cleanLinks(parserAll);
      return;
    }

    if (currHost === "www.youtube.com") {
      if (currPath === "/redirect") {
        location.href = cleanYoutubeRedir(currSearch);
      }

      if (currPath === "/watch") {
        setCurrUrl(cleanYoutube(currSearch));
      }

      cleanLinks(parserYoutube);
      return;
    }

    if (currHost.endsWith(".newegg.com") || currHost.endsWith(".newegg.ca")) {
      if (currSearch) {
        setCurrUrl(cleanNewegg(currSearch));
      }

      cleanLinks(parserNewegg);
      return;
    }

    if (currHost === "www.imdb.com") {
      if (currSearch) {
        setCurrUrl(cleanImdb(currSearch));
      }

      cleanLinks(parserIMDB);
      onhashchange = deleteHash;
      return;
    }

    if (google.test(currHost)) {
      if (currPath === "/url" || currPath === "/imgres") {
        location.href = cleanGenericRedir(currSearch);
      }

      if (!currSearch && !/[&#]q=/.test(location.hash)) {
        return;
      }

      setCurrUrl(cleanGoogle(currPath + currSearch));
      changeState(googleInstant);

      if (currSearch.includes("tbm=isch")) {
        cleanLinksAlways(parserGoogleImages);
      } else {
        cleanLinks(parserGoogle);
      }

      return;
    }

    if (ebay.test(currHost)) {
      if (currPath.includes("/itm/")) {
        setCurrUrl(cleanEbayItem(location));
      } else if (currSearch) {
        setCurrUrl(cleanEbayParams(currSearch));
      }

      cleanLinks(parserEbay);
      onhashchange = deleteHash;
      return;
    }

    if (target.test(currHost)) {
      if (currPath.includes("/p/")) {
        setCurrUrl(cleanTargetItemp(location));
      } else if (currSearch) {
        setCurrUrl(cleanTargetParams(currSearch));
      }

      cleanLinks(parserTarget);
      onhashchange = deleteHash;
      return;
    }

    if (amazon.test(currHost)) {
      if (currPath.includes("/dp/")) {
        setCurrUrl(cleanAmazonItemdp(location));
      } else if (currPath.includes("/gp/product")) {
        setCurrUrl(cleanAmazonItemgp(location));
      } else if (currSearch) {
        setCurrUrl(cleanAmazonParams(currSearch));
      }

      cleanLinks(parserAmazon);
      onhashchange = deleteHash;
      return;
    }

    if (/^[a-z0-9.]*\.?audible(\.[a-z0-9]{2,3})?(\.[a-z]+)?$/.test(currHost)) {
      // ponytail: param-strip only; product-path rewrite deferred pending live Audible URL verification
      if (currSearch) {
        setCurrUrl(cleanAudible(currSearch));
      }

      cleanLinks(parserAll);
      return;
    }

    if (currHost == "www.facebook.com") {
      if (currSearch) {
        setCurrUrl(cleanFacebookParams(currSearch));
      }

      cleanLinks(parserFacebook);
      return;
    }

    if (currHost == "disqus.com") {
      cleanLinks(parserDisqus);
      return;
    }

    // ponytail: no dedicated handler for this host — strip generic trackers
    // everywhere unless the user opted out. Ceiling: one MutationObserver per
    // page; opt out via GLOBAL_STRIP.
    if (GLOBAL_STRIP) {
      if (currSearch) {
        // explicit path so an all-utm query is actually cleared from the bar
        // (replaceState("") would no-op and leave the query in place)
        setCurrUrl(currPath + cleanGlobalParams(cleanUtm(currSearch)) + location.hash);
      }
      cleanLinks(parserGlobal);
    }
  }

  /*
   * Boilerplate functions
   */

  function setCurrUrl(url) {
    history.replaceState(null, null, url);
  }

  function deleteHash() {
    history.replaceState(null, null, " ");
  }

  function observe(func) {
    new MutationObserver(func).observe(document, {
      childList: true,
      subtree: true,
    });
  }

  // Clean links once, mark as cleaned, then ignore them
  function cleanLinks(linkParser) {
    observe(function () {
      for (let a of document.links) {
        if (a.cleaned) {
          continue;
        }

        if (a.protocol && a.protocol.startsWith("http")) {
          linkParser(a);
        }

        a.cleaned = 1;
      }
    });
  }

  // Always clean links
  function cleanLinksAlways(linkParser) {
    observe(function () {
      for (let a of document.links)
        if (a.protocol && a.protocol.startsWith("http")) {
          linkParser(a);
        }
    });
  }

  function googleInstant(url) {
    let parts = url.split("#");
    if (parts.length !== 2) {
      return url;
    }

    let hash = parts[1];
    if (hash === "imgrc=_") {
      return " ";
    }

    if (/(^|&)q=/.test(hash)) {
      return "?" + hash;
    }

    return "#" + hash;
  }

  // Intercept & modify url passed into history.replaceState/pushState
  function changeState(mod) {
    history.realPushState = history.pushState;
    history.realReplaceState = history.replaceState;

    history.pushState = function () {
      history.realPushState(null, null, mod(arguments[2]));
    };

    history.replaceState = function () {
      history.realReplaceState(null, null, mod(arguments[2]));
    };
  }

  /*
   * Link parsing functions
   */

  function parserAll(a) {
    let host = a.host;
    if (a.cleaned) {
      return;
    }

    if (google.test(host)) {
      a.href = transformGoogleUrl(a.href);
      return;
    }

    if (host === "www.youtube.com") {
      a.href = transformYoutubeUrl(a.href);
      a.cleaned = 1;
      return;
    }

    parserAmazon(a);
    parserEbay(a);
    parserNewegg(a);
    parserIMDB(a);

    a.href = transformGlobalUrl(a.href);
    a.cleaned = 1;
  }

  function parserGoogle(a) {
    a.removeAttribute("onmousedown");
    a.removeAttribute("ping");
    parserAll(a);
  }

  function parserGoogleImages(a) {
    let jsaction = a.getAttribute("jsaction");
    if (jsaction && jsaction.includes("down:irc.rl")) {
      console.log(a);
      a.removeAttribute("jsaction");
    }

    a.removeAttribute("onmousedown");
    a.removeAttribute("ping");
    parserAll(a);
  }

  function parserYoutube(a) {
    parserAll(a);
    let text = a.innerText;
    let href = a.getAttribute("href");
    if (
      text === href ||
      (text.endsWith("...") && href.startsWith(text.slice(0, -3)))
    ) {
      a.innerText = href;
    }
  }

  function parserTarget(a) {
    if (!target.test(a.host)) {
      return;
    }

    a.href = transformTargetUrl(a.href);
  }

  function parserAmazon(a) {
    if (!amazon.test(a.host)) {
      return;
    }

    a.href = transformAmazonUrl(a.href);
  }

  function parserEbay(a) {
    if (!ebay.test(a.host)) {
      return;
    }

    a.href = transformEbayUrl(a.href, location.origin);
  }

  function parserNewegg(a) {
    if (!a.host.endsWith(".newegg.com") && !a.host.endsWith(".newegg.ca")) {
      return;
    }

    a.href = transformNeweggUrl(a.href);
  }

  function parserIMDB(a) {
    if (a.host === "www.imdb.com") {
      a.href = transformImdbUrl(a.href);
    }
  }

  function parserGlobal(a) {
    a.href = transformGlobalUrl(a.href);
    a.cleaned = 1;
  }

  function parserFacebook(a) {
    let onclick = a.getAttribute("onclick");
    if (!onclick || !onclick.startsWith("LinkshimAsyncLink")) {
      return;
    }

    a.href = transformFacebookUrl(a.href);
    a.removeAttribute("onclick");
    a.removeAttribute("onmouseover");
  }

  function parserDisqus(a) {
    a.href = transformDisqusUrl(a.href);
    parserAll(a);
  }

  /*
   * URL string functions
   */

  // Shared separator-fixup idiom: prefix every param with &, delete matched
  // params, then restore the leading separator. Pass stripTrailingQ=true for
  // cleaners that should collapse a bare ? to "" when all params are removed.
  function cleanParams(url, regex, stripTrailingQ) {
    var result = url.replace("?", "?&").replace(regex, "").replace("&", "");
    return stripTrailingQ ? result.replace(/\?$/, "") : result;
  }

  function cleanGoogle(url) {
    return cleanParams(url, googleParams);
  }

  function cleanBing(url) {
    return cleanParams(url, bingParams, true);
  }

  function cleanLinkedin(url) {
    return cleanParams(url, linkedinParams);
  }

  function cleanEtsy(url) {
    return cleanParams(url, etsyParams);
  }

  function cleanYahoo(url) {
    return cleanParams(url, yahooParams);
  }

  function cleanYoutube(url) {
    return cleanParams(url, youtubeParams);
  }

  function cleanImdb(url) {
    return cleanParams(url, imdbParams, true);
  }

  function cleanNewegg(url) {
    return cleanParams(url, neweggParams);
  }

  function cleanTargetParams(url) {
    return cleanParams(url, targetParams);
  }

  function cleanFacebookParams(url) {
    return cleanParams(url, facebookParams);
  }

  function cleanAmazonParams(url) {
    return cleanParams(url, amazonParams, true);
  }

  function cleanAudible(url) {
    // Keep-list derived from a live Audible session (issue #39).
    const keep = [
      "keywords", "node", "page", "sort", "publication_date",
      "audible_programs", "searchNarrator", "searchAuthor",
    ];
    const parts = url.split("?");
    if (parts.length < 2) return url;
    const kept = parts[1]
      .split(/[&;]/g)
      .filter((p) => {
        const name = p.split("=")[0];
        return keep.includes(name) || /_browse-bin$/.test(name);
      });
    return parts[0] + (kept.length ? "?" + kept.join("&") : "");
  }

  function cleanEbayParams(url) {
    return cleanParams(url, ebayParams);
  }

  function cleanTargetItemp(a) {
    let item = a.pathname.replace(/(?<=\/p).*(?=\/A)/, "");
    return a.origin + item;
  }

  function cleanAmazonItemgp(a) {
    let item = a.pathname.match(/\/[A-Z0-9]{10}/);
    return a.origin + "/gp/product" + item + a.hash;
  }

  function cleanAmazonItemdp(a) {
    let m = a.pathname.match(/\/([A-Z0-9]{10})(?=[/?]|$)/);
    if (!m) return a.href;
    return a.origin + "/dp/" + m[1] + a.hash;
  }

  function cleanEbayItem(a) {
    let item = a.pathname.match(/\/[0-9]{12}/);
    if (!item) return a.href;
    let origList = a.search.replace(/&/g, "?").match(/\?orig_cvip=[^?]+/) || "";
    return a.origin + "/itm" + item + origList + a.hash;
  }

  function cleanEbayPulsar(url, origin) {
    let item = url.match(/%7B%22mecs%22%3A%22([0-9]{12})/).pop();
    return (origin || location.origin) + "/itm/" + item;
  }

  function cleanRedir(pattern, url) {
    return decodeURIComponent(url.match(pattern).pop());
  }

  function cleanYoutubeRedir(url) {
    return cleanRedir(/[?&]q=([^&]+)/, url);
  }

  function cleanAmazonRedir(url) {
    return cleanRedir(/[?&]redirectUrl=([^&]+)/, url);
  }

  function cleanGenericRedir(url) {
    return cleanRedir(/[?&](new|img)?u(rl)?=([^&]+)/i, url);
  }

  function cleanGenericRedir2(url) {
    return cleanRedir(/[?&]\w*url=([^&]+)/i, url);
  }

  function cleanUtm(url) {
    var urlparts = url.split("?");
    if (urlparts.length >= 2) {
      var pars = urlparts[1].split(/[&;]/g);
      //reverse iteration as may be destructive
      for (var i = pars.length; (i -= 1) >= 0; ) {
        if (/^utm_/.test(pars[i])) {
          pars.splice(i, 1);
        }
      }
      return urlparts[0] + (pars.length > 0 ? "?" + pars.join("&") : "");
    }
    return url;
  }

  function cleanGlobalParams(url) {
    var urlparts = url.split("?");
    if (urlparts.length >= 2) {
      var pars = urlparts[1].split(/[&;]/g);
      //reverse iteration as may be destructive
      for (var i = pars.length; (i -= 1) >= 0; ) {
        if (globalParams.test(pars[i])) {
          pars.splice(i, 1);
        }
      }
      return urlparts[0] + (pars.length > 0 ? "?" + pars.join("&") : "");
    }
    return url;
  }

  function transformGoogleUrl(href) {
    var u = new URL(href);
    if (u.pathname === "/imgres" || u.pathname === "/url") {
      return cleanGenericRedir(u.search);
    } else if (u.search) {
      u.search = cleanGoogle(u.search);
    }
    return u.href;
  }

  function transformAmazonUrl(href) {
    var u = new URL(href);
    var result = href;

    if (u.pathname.includes("black-curtain-redirect.html")) {
      result = cleanAmazonRedir(u.search);
    } else if (u.pathname.includes("/dp/")) {
      result = cleanAmazonItemdp(u);
    } else if (u.pathname.includes("/gp/product")) {
      result = cleanAmazonItemgp(u);
    } else if (u.pathname.includes("/picassoRedirect")) {
      var t = new URL(cleanGenericRedir(u.search));
      t.search = "";
      result = t.href;
    } else if (u.search) {
      result = cleanAmazonParams(href);
    }

    var u2 = new URL(result);
    if (u2.pathname.includes("/ref=")) {
      u2.pathname = cleanAmazonParams(u2.pathname);
      result = u2.href;
    }

    return result;
  }

  function transformEbayUrl(href, pageOrigin) {
    var u = new URL(href);

    if (u.pathname.includes("/itm/")) {
      return cleanEbayItem(u);
    } else if (u.host.startsWith("pulsar.")) {
      return cleanEbayPulsar(u.search, pageOrigin);
    } else if (u.search) {
      u.search = cleanEbayParams(u.search);
      return u.href;
    }

    return href;
  }

  function transformYoutubeUrl(href) {
    var u = new URL(href);
    if (u.pathname === "/watch") {
      u.search = cleanYoutube(u.search);
      return u.href;
    } else if (u.pathname === "/redirect") {
      return cleanYoutubeRedir(u.search);
    }
    return href;
  }

  function transformTargetUrl(href) {
    var u = new URL(href);
    if (u.pathname.includes("/p/")) {
      return cleanTargetItemp(u);
    } else if (u.search) {
      return cleanTargetParams(href);
    }
    return href;
  }

  function transformNeweggUrl(href) {
    var u = new URL(href);
    if (u.search && !u.pathname.includes("/marketplace/")) {
      u.search = cleanNewegg(u.search);
      return u.href;
    }
    return href;
  }

  function transformImdbUrl(href) {
    var u = new URL(href);
    if (u.search) {
      u.search = cleanImdb(u.search);
      return u.href;
    }
    return href;
  }

  function transformFacebookUrl(href) {
    var u = new URL(href);
    if (u.host !== "l.facebook.com") {
      return href;
    }
    return cleanGenericRedir(u.search);
  }

  // For disq.us/url: decode the redirect target via cleanGenericRedir, then strip
  // any trailing `:cid`-style suffix (e.g. ":1234567") added by Disqus — never
  // the protocol colon. Guard when no redirect param is present (return href).
  // Non-disq.us/url links fall straight to cleanGenericRedir(search).
  function transformDisqusUrl(href) {
    var u = new URL(href);
    if (u.host === "disq.us" && u.pathname === "/url") {
      if (!u.searchParams.get("url")) {
        return href;
      }
      var decoded = cleanGenericRedir(u.search);
      return decoded.replace(/:[^/:]+$/, "");
    }
    return cleanGenericRedir(u.search);
  }

  function transformGlobalUrl(href) {
    var u = new URL(href);
    if (u.search) {
      u.search = cleanGlobalParams(cleanUtm(u.search));
    }
    if (u.hash) {
      u.hash = cleanGlobalParams(cleanUtm(u.hash));
    }
    return u.href;
  }

  // ponytail: Node export + load guard exist only so the pure cleaners are unit-testable; Tampermonkey defines window/document so the guard is a no-op in-browser
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      cleanGoogle, cleanBing, cleanLinkedin, cleanEtsy, cleanYahoo,
      cleanYoutube, cleanImdb, cleanNewegg,
      cleanTargetParams, cleanFacebookParams, cleanAmazonParams, cleanAudible,
      cleanEbayParams, cleanUtm, cleanGlobalParams,
      cleanYoutubeRedir, cleanAmazonRedir, cleanGenericRedir, cleanGenericRedir2,
      cleanEbayPulsar, cleanEbayItem, cleanAmazonItemdp, cleanAmazonItemgp,
      cleanTargetItemp,
      transformGoogleUrl, transformAmazonUrl, transformEbayUrl,
      transformYoutubeUrl, transformTargetUrl,
      transformNeweggUrl, transformImdbUrl, transformFacebookUrl,
      transformDisqusUrl, transformGlobalUrl,
      googleParams, ebayParams, amazonParams, neweggParams, imdbParams,
      bingParams, youtubeParams, targetParams,
      facebookParams, linkedinParams, etsyParams, yahooParams, globalParams,
    };
  }
})();
