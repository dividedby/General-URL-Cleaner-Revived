// ==UserScript==
// @name        General URL Cleaner Revived
// @namespace   https://greasyfork.org/en/users/594496-divided-by
// @author      dividedby
// @description Cleans URLs from various popular sites and removes tracking parameters
// @version     5.2.0
// @license     GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @homepageURL https://github.com/dividedby/General-URL-Cleaner-Revived
// @supportURL  https://github.com/dividedby/General-URL-Cleaner-Revived/issues
// @contributionURL     https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=dividedbygit@gmail.com&item_name=Greasy+Fork+Donation
// @contributionAmount  $1
// @include     https://www.newegg.com/*
// @include     https://www.newegg.ca/*
// @include     /^https:\/\/([a-z0-9-]+\.)*bing\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})\/.*$/
// @include     https://www.youtube.com/*
// @include     https://www.imdb.com/*
// @include     https://www.facebook.com/*
// @include     https://disqus.com/embed/comments/*
// @include     https://www.target.com/*
// @include     https://www.linkedin.com/*
// @include     https://www.etsy.com/*
// @include     https://www.yahoo.com/*
// @include     /^https:\/\/([a-z0-9-]+\.)*amazon\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})\/.*$/
// @include     /^https:\/\/([a-z0-9-]+\.)*audible\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})\/.*$/
// @include     /^https:\/\/([a-z0-9-]+\.)*google\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})\/.*$/
// @include     /^https:\/\/([a-z0-9-]+\.)*ebay(desc)?\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})\/.*$/
// @include     https://open.spotify.com/*
// @include     https://www.reddit.com/*
// @include     https://reddit.com/*
// @include     https://www.twitch.tv/*
// @include     https://twitch.tv/*
// @include     https://www.threads.net/*
// @include     https://threads.net/*
// @include     https://www.threads.com/*
// @include     https://threads.com/*
// @include     https://www.aliexpress.com/*
// @include     https://*.aliexpress.com/*
// @include     https://www.walmart.com/*
// @include     https://walmart.com/*
// @include     https://www.bestbuy.com/*
// @include     https://bestbuy.com/*
// @include     https://www.tiktok.com/*
// @include     https://tiktok.com/*
// @include     https://vm.tiktok.com/*
// @exclude     /^https:\/\/([a-z0-9-]+\.)*amazon\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})\/(?:gp\/(?:cart|buy|css|legacy|your-account).*|sspa.*)$/
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
// @grant       none
// ==/UserScript==

(() => {
  /*
   * Vars
   */

  const _domAvailable = typeof location !== "undefined" && typeof document !== "undefined";

  // shortcut: opt-out — set false to skip cleaning on sites without a dedicated handler.
  // Upgrade path: a GM_registerMenuCommand toggle once @grant is added.
  const GLOBAL_STRIP = true;

  const currHost = _domAvailable ? location.host : "";
  const currPath = _domAvailable ? location.pathname : "";
  const currSearch = _domAvailable ? location.search : "";

  // Host patterns: the bare domain or any subdomain of it, on .com, a two-letter
  // ccTLD, or co./com. + ccTLD (google.co.uk, amazon.com.au). Anchored so
  // look-alikes such as notgoogle.com or google.example.net don't match.
  const ebay = /^([a-z0-9-]+\.)*ebay(desc)?\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/;
  const amazon = /^([a-z0-9-]+\.)*amazon\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/;
  const audible = /^([a-z0-9-]+\.)*audible\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/;
  const google = /^([a-z0-9-]+\.)*google\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/;
  const target = /^([a-z0-9-]+\.)*target\.com$/;
  const bing = /^([a-z0-9-]+\.)*bing\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/;

  const LOG_PREFIX = "[URL Cleaner]";

  const amazonParams =
    /&?_?(encoding|crid|sprefix|ref|th|url|ie|pf_rd_[^&#]*?|pd_rd_[^&#]*?|bbn|rw_html_to_wsrp|ref_|content-id)(=[^&#]*)?(?=$|&)/g;
  const neweggParams = /&(cm_sp|icid|ignorebbr)(=[^&#]*)?(?=$|&)/g;
  const imdbParams = /&(pf_rd_[a-z]|ref_)(=[^&#]*)?(?=$|&)/g;
  const bingParams =
    /&(redig|toWww|ghpl|lq|ghc|ghsh|ghacc|ghpl|go|qs|form|FORM|filt|pq|s[cpk]|qpvt|cvid)(=[^&#]*)?(?=$|&)/g;
  const youtubeParams =
    /&(feature|src_vid|annotation_id|pp|[gh]l)(=[^&#]*)?(?=$|&)/g;
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
  const spotifyParams = /&(si)(=[^&#]*)?(?=$|&)/g;
  const redditParams = /&(correlation_id|ref_campaign|ref_source|share_id)(=[^&#]*)?(?=$|&)/g;
  const twitchParams = /&(tt_medium|tt_content)(=[^&#]*)?(?=$|&)/g;
  const threadsParams = /&(xmt)(=[^&#]*)?(?=$|&)/g;
  const aliexpressParams =
    /&(algo_pvid|algo_exp_id|pdp_ext_f|pdp_npi|curPageLogUid|utparam-url|aem_p4p_detail|search_p4p_id)(=[^&#]*)?(?=$|&)/g;
  const walmartParams =
    /&(u1|from|variantFieldId|ath[^&#=]*)(=[^&#]*)?(?=$|&)/g;
  const bestbuyParams =
    /&(irclickid|loc|acampID|mpid|intl)(=[^&#]*)?(?=$|&)/g;
  const tiktokParams =
    /&(u_code|_d|_t|_r|timestamp|user_id|share_app_name|share_iid|source)(=[^&#]*)?(?=$|&)/g;
  // Universal click-id / email-tracking params safe to strip on every site.
  // Sourced from AdGuard URL Tracking filter, ClearURLs, and Brave's query-string filter.
  // Excludes: _gl (GA4 cross-domain stitching), mkt_tok (Marketo unsubscribe path),
  // clickid (too generic / server-side functional), gbraid/wbraid (aggregate-only, revisit separately).
  const globalParams =
    /^(fbclid|gclid|dclid|gclsrc|gad_source|gad_campaignid|msclkid|twclid|ttclid|fbadid|igshid|igsh|mc_eid|mc_cid|_hsenc|_hsmi|__hstc|__hssc|__hsfp|hsCtaTracking|vero_id|vero_conv|oly_anon_id|oly_enc_id|__s|yclid|ysclid|_openstat|srsltid|irgwc|cjevent|cjdata|awc|wickedid|rb_clickid|tduid|iclid|s_cid|_branch_referrer|_branch_match_id|ml_subscriber|ml_subscriber_hash|bsft_clkid|bsft_eid|bsft_mid|bsft_uid|admitad_uid|mtm_[^=&]*|pk_[^=&]*)(=|$)/;

  // Data-driven table for uniform param-strip sites (all use parserAll).
  // Row shapes:
  //   { hosts: [...],  params }            — exact-host match
  //   { match: /re/,   params, stripQ? }   — regex match
  //   { match: /re/,   clean }             — regex match with custom cleaner
  const SITES = [
    { match: bing,       params: bingParams, stripQ: true },
    { hosts: ["www.linkedin.com"],                               params: linkedinParams },
    { hosts: ["www.etsy.com"],                                   params: etsyParams },
    { hosts: ["www.yahoo.com"],                                  params: yahooParams },
    // shortcut: param-strip only; product-path rewrite deferred pending live Audible URL verification
    { match: audible, clean: cleanAudible },
    { hosts: ["open.spotify.com"],                               params: spotifyParams },
    { hosts: ["www.reddit.com", "reddit.com"],                   params: redditParams },
    { hosts: ["www.twitch.tv", "twitch.tv"],                     params: twitchParams },
    { hosts: ["www.threads.net", "threads.net", "www.threads.com", "threads.com"], params: threadsParams },
    // www.aliexpress.com ends with .aliexpress.com, so /\.aliexpress\.com$/ covers both cases
    { match: /\.aliexpress\.com$/,                               params: aliexpressParams },
    { hosts: ["www.walmart.com", "walmart.com"],                 params: walmartParams },
    { hosts: ["www.bestbuy.com", "bestbuy.com"],                 params: bestbuyParams },
    { hosts: ["www.tiktok.com", "tiktok.com", "vm.tiktok.com"], params: tiktokParams },
  ];

  /*
   * Main
   */

  if (_domAvailable) {
    // shortcut: cheap @noframes equivalent — skip injection in subframes so
    // embed-heavy pages don't get a MutationObserver per ad/tracking iframe.
    // Exception: the Disqus comment widget only ever loads inside an iframe
    // (@include disqus.com/embed/comments/*), so it must keep running there.
    if (window.self !== window.top && currHost !== "disqus.com") {
      return;
    }

    if (currHost === "www.youtube.com") {
      if (currPath === "/redirect") {
        const destination = cleanYoutubeRedir(currSearch);
        if (destination) {
          location.replace(destination);
        }
      }

      watchAddress(() => {
        if (location.pathname === "/watch") {
          setCurrUrl(cleanYoutube(location.search));
        }
      });

      cleanLinks(parserYoutube);
      return;
    }

    if (currHost.endsWith(".newegg.com") || currHost.endsWith(".newegg.ca")) {
      watchAddress(() => {
        if (location.search) {
          setCurrUrl(cleanNewegg(location.search));
        }
      });

      cleanLinks(parserAll);
      return;
    }

    if (currHost === "www.imdb.com") {
      watchAddress(() => {
        if (location.search) {
          setCurrUrl(cleanImdb(location.search));
        }
      });

      cleanLinks(parserAll);
      addEventListener("hashchange", deleteHash);
      return;
    }

    if (google.test(currHost)) {
      if (currPath === "/url" || currPath === "/imgres") {
        const destination = cleanGoogleRedir(currPath, currSearch);
        if (destination) {
          location.replace(destination);
        }
      }

      if (!currSearch && !/[&#]q=/.test(location.hash)) {
        return;
      }

      // No watchAddress here: Google's in-page navigation goes through the
      // patched pushState/replaceState below, which cleans every URL it sets.
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
      watchAddress(() => {
        if (location.pathname.includes("/itm/")) {
          setCurrUrl(cleanEbayItem(location));
        } else if (location.search) {
          setCurrUrl(cleanEbayParams(location.search));
        }
      });

      cleanLinks(parserAll);
      addEventListener("hashchange", deleteHash);
      return;
    }

    if (target.test(currHost)) {
      watchAddress(() => {
        if (location.pathname.includes("/p/")) {
          setCurrUrl(cleanTargetItemp(location));
        } else if (location.search) {
          setCurrUrl(cleanTargetParams(location.search));
        }
      });

      cleanLinks(parserTarget);
      addEventListener("hashchange", deleteHash);
      return;
    }

    if (amazon.test(currHost)) {
      watchAddress(() => {
        if (location.pathname.includes("/dp/")) {
          setCurrUrl(cleanAmazonItemdp(location));
        } else if (location.pathname.includes("/gp/product")) {
          setCurrUrl(cleanAmazonItemgp(location));
        } else if (location.search) {
          setCurrUrl(cleanAmazonParams(location.search));
        }
      });

      cleanLinks(parserAll);
      addEventListener("hashchange", deleteHash);
      return;
    }

    if (currHost === "www.facebook.com") {
      watchAddress(() => {
        if (location.search) {
          setCurrUrl(cleanFacebookParams(location.search));
        }
      });

      cleanLinks(parserFacebook);
      return;
    }

    if (currHost === "disqus.com") {
      cleanLinks(parserDisqus);
      return;
    }

    for (const r of SITES) {
      if (r.hosts ? !r.hosts.includes(currHost) : !r.match.test(currHost)) continue;
      watchAddress(() => {
        if (location.search) {
          setCurrUrl(r.clean ? r.clean(location.search) : cleanParams(location.search, r.params, r.stripQ));
        }
      });
      cleanLinks(parserAll);
      return;
    }

    // shortcut: no dedicated handler for this host — strip generic trackers
    // everywhere unless the user opted out. Ceiling: one MutationObserver per
    // page; opt out via GLOBAL_STRIP.
    if (GLOBAL_STRIP) {
      watchAddress(() => {
        if (location.search) {
          // explicit path so an all-utm query is actually cleared from the bar
          // (replaceState("") would no-op and leave the query in place)
          setCurrUrl(location.pathname + cleanGlobalParams(cleanUtm(location.search)) + location.hash);
        }
      });
      cleanLinks(parserGlobal);
    }
  }

  /*
   * Boilerplate functions
   */

  function setCurrUrl(url) {
    let next = cleanGlobalParams(cleanUtm(url));
    // A query-only URL ("?a=b") would drop the page's #fragment; keep it.
    if (next.startsWith("?") && !next.includes("#")) {
      next += location.hash;
    }
    // Skip when nothing changes (an empty URL would only re-set the current
    // one), so re-running on SPA navigation can't loop.
    if (!next || new URL(next, location.href).href === location.href) {
      return;
    }
    history.replaceState(history.state, "", next);
  }

  function deleteHash() {
    history.replaceState(history.state, "", " ");
  }

  // Clean the address bar now, and again after each in-page (SPA) navigation:
  // YouTube's own yt-navigate-finish event, plus the Navigation API's
  // navigatesuccess where the browser has it. Event-driven, no polling.
  function watchAddress(cleanAddress) {
    let running = false;
    const run = () => {
      if (running) return; // our own replaceState can fire navigation events
      running = true;
      try {
        cleanAddress();
      } catch (err) {
        console.error(LOG_PREFIX, "address cleaning failed", err);
      } finally {
        running = false;
      }
    };

    run();
    if (currHost === "www.youtube.com") {
      document.addEventListener("yt-navigate-finish", run);
    }
    if (window.navigation && typeof window.navigation.addEventListener === "function") {
      window.navigation.addEventListener("navigatesuccess", run);
    }
  }

  function observe(func) {
    new MutationObserver(func).observe(document, {
      childList: true,
      subtree: true,
    });
  }

  // Collect anchor elements from a MutationRecord list (added nodes only).
  function addedAnchors(records) {
    const anchors = [];
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType !== 1) continue; // Element nodes only
        if (node.tagName === "A") {
          anchors.push(node);
        }
        for (const a of node.querySelectorAll("a")) {
          anchors.push(a);
        }
      }
    }
    return anchors;
  }

  // Process an iterable of anchors: skip cleaned ones, call linkParser for http links.
  // mark=true sets a.cleaned=1 after processing (used by cleanLinks, not cleanLinksAlways).
  function processAnchors(anchors, linkParser, mark) {
    for (const a of anchors) {
      if (a.cleaned) {
        continue;
      }

      if (a.protocol && a.protocol.startsWith("http")) {
        // One bad link must not abort the sweep (and with it the observer setup).
        try {
          linkParser(a);
        } catch (err) {
          console.error(LOG_PREFIX, "could not clean link", a.href, err);
        }
      }

      if (mark) {
        a.cleaned = 1;
      }
    }
  }

  // Clean links once, mark as cleaned, then ignore them.
  // Runs an initial sweep over document.links (already in DOM at document-idle),
  // then processes only added nodes for subsequent mutations.
  function cleanLinks(linkParser) {
    processAnchors(document.links, linkParser, true);
    observe(function (records) {
      processAnchors(addedAnchors(records), linkParser, true);
    });
  }

  // Clean newly-added links; skip already-cleaned nodes.
  // Runs an initial sweep over document.links, then handles mutations via added nodes.
  function cleanLinksAlways(linkParser) {
    processAnchors(document.links, linkParser, false);
    observe(function (records) {
      processAnchors(addedAnchors(records), linkParser, false);
    });
  }

  function googleInstant(rawUrl) {
    const url = String(rawUrl);
    const parts = url.split("#");
    if (parts.length !== 2) {
      return url;
    }

    const hash = parts[1];
    if (hash === "imgrc=_") {
      return " ";
    }

    if (/(^|&)q=/.test(hash)) {
      return "?" + hash;
    }

    return "#" + hash;
  }

  // Intercept & modify the url passed into history.pushState/replaceState,
  // keeping the caller's this, state, title and return value. An omitted or
  // null url is passed through untouched; URL objects are stringified first.
  function changeState(mod, hist = history) {
    for (const name of ["pushState", "replaceState"]) {
      const orig = hist[name];
      hist[name] = function (state, title, url) {
        return orig.call(this, state, title, url == null ? url : mod(String(url)));
      };
    }
  }

  // Preserve the original href attribute form (empty, hash-only, relative)
  // instead of normalizing every link to an absolute URL. origAttr is the raw
  // getAttribute("href") string; cleanedHref is the resolved+cleaned absolute
  // URL to assign; origin is location.origin. Returns null to skip assignment.
  function relHref(origAttr, cleanedHref, origin) {
    if (origAttr === "" || origAttr[0] === "#") return null;
    if (
      origAttr[0] === "/" &&
      origAttr[1] !== "/" &&
      cleanedHref.startsWith(origin)
    ) {
      return cleanedHref.slice(origin.length);
    }
    return cleanedHref;
  }

  function setHref(a, href) {
    const next = relHref(a.getAttribute("href"), href, location.origin);
    if (next !== null) a.href = next;
  }

  /*
   * Link parsing functions
   */

  function parserAll(a) {
    const host = a.host;
    if (a.cleaned) {
      return;
    }

    if (google.test(host)) {
      setHref(a, transformGoogleUrl(a.href));
      return;
    }

    if (host === "www.youtube.com") {
      setHref(a, transformYoutubeUrl(a.href));
      a.cleaned = 1;
      return;
    }

    parserAmazon(a);
    parserEbay(a);
    parserNewegg(a);
    parserIMDB(a);

    setHref(a, transformGlobalUrl(a.href));
    a.cleaned = 1;
  }

  function parserGoogle(a) {
    a.removeAttribute("onmousedown");
    a.removeAttribute("ping");
    parserAll(a);
  }

  function parserGoogleImages(a) {
    const jsaction = a.getAttribute("jsaction");
    if (jsaction && jsaction.includes("down:irc.rl")) {
      a.removeAttribute("jsaction");
    }

    a.removeAttribute("onmousedown");
    a.removeAttribute("ping");
    parserAll(a);
  }

  function parserYoutube(a) {
    parserAll(a);
    const text = a.textContent.trim();
    const href = a.getAttribute("href");
    if (
      text === href ||
      (href && text.endsWith("...") && href.startsWith(text.slice(0, -3)))
    ) {
      a.textContent = href;
    }
  }

  function parserTarget(a) {
    if (target.test(a.host)) {
      setHref(a, transformTargetUrl(a.href));
    }

    setHref(a, transformGlobalUrl(a.href));
  }

  function parserAmazon(a) {
    if (!amazon.test(a.host)) {
      return;
    }

    setHref(a, transformAmazonUrl(a.href));
  }

  function parserEbay(a) {
    if (!ebay.test(a.host)) {
      return;
    }

    setHref(a, transformEbayUrl(a.href, location.origin));
  }

  function parserNewegg(a) {
    if (!a.host.endsWith(".newegg.com") && !a.host.endsWith(".newegg.ca")) {
      return;
    }

    setHref(a, transformNeweggUrl(a.href));
  }

  function parserIMDB(a) {
    if (a.host === "www.imdb.com") {
      setHref(a, transformImdbUrl(a.href));
    }
  }

  function parserGlobal(a) {
    setHref(a, transformGlobalUrl(a.href));
    a.cleaned = 1;
  }

  function parserFacebook(a) {
    if (a.host === "l.facebook.com" && a.pathname === "/l.php") {
      setHref(a, transformFacebookUrl(a.href));
      a.removeAttribute("onclick");
      a.removeAttribute("onmouseover");
    }

    setHref(a, transformGlobalUrl(a.href));
  }

  function parserDisqus(a) {
    setHref(a, transformDisqusUrl(a.href));
    parserAll(a);
  }

  /*
   * URL string functions
   */

  // Shared separator-fixup idiom: prefix every param with &, delete matched
  // params, then restore the leading separator. Pass stripTrailingQ=true for
  // cleaners that should collapse a bare ? to "" when all params are removed.
  function cleanParams(url, regex, stripTrailingQ) {
    const result = url.replace("?", "?&").replace(regex, "").replace("&", "");
    return stripTrailingQ ? result.replace(/\?$/, "") : result;
  }

  function cleanGoogle(url) {
    return cleanParams(url, googleParams);
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
    const item = a.pathname.replace(/(?<=\/p).*(?=\/A)/, "");
    return a.origin + item;
  }

  function cleanAmazonItemgp(a) {
    const item = a.pathname.match(/\/[A-Z0-9]{10}/);
    if (!item) return a.href;
    return a.origin + "/gp/product" + item[0] + a.hash;
  }

  function cleanAmazonItemdp(a) {
    const m = a.pathname.match(/\/([A-Z0-9]{10})(?=[/?]|$)/);
    if (!m) return a.href;
    return a.origin + "/dp/" + m[1] + a.hash;
  }

  function cleanEbayItem(a) {
    const item = a.pathname.match(/\/[0-9]{12}/);
    if (!item) return a.href;
    const origList = a.search.replace(/&/g, "?").match(/\?orig_cvip=[^?]+/) || "";
    return a.origin + "/itm" + item + origList + a.hash;
  }

  // Returns null when the pulsar link carries no item id.
  function cleanEbayPulsar(url, origin) {
    const item = url.match(/%7B%22mecs%22%3A%22([0-9]{12})/);
    if (!item) return null;
    return (origin || location.origin) + "/itm/" + item[1];
  }

  // Decode a redirect target from the pattern's last capture group. Returns
  // null when the pattern doesn't match, the value isn't valid percent-encoding,
  // or the target isn't an http(s) URL (e.g. javascript:), so callers keep the
  // original link instead.
  function cleanRedir(pattern, url) {
    const match = url.match(pattern);
    if (!match) return null;
    let target;
    try {
      target = decodeURIComponent(match.pop());
      const base = _domAvailable ? location.href : undefined;
      const protocol = new URL(target, base).protocol;
      if (protocol !== "http:" && protocol !== "https:") return null;
    } catch (err) {
      return null; // malformed encoding or unparseable URL: not a usable target
    }
    return target;
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

  // Google /url redirects carry the target in url= or (more often now) q=.
  function cleanGoogleRedir(path, search) {
    const target = cleanGenericRedir(search);
    if (target || path !== "/url") return target;
    return cleanRedir(/[?&]q=([^&]+)/, search);
  }

  function cleanUtm(url) {
    const urlparts = url.split("?");
    if (urlparts.length >= 2) {
      const pars = urlparts[1].split(/[&;]/g);
      //reverse iteration as may be destructive
      for (let i = pars.length; (i -= 1) >= 0; ) {
        if (/^utm_/.test(pars[i])) {
          pars.splice(i, 1);
        }
      }
      return urlparts[0] + (pars.length > 0 ? "?" + pars.join("&") : "");
    }
    return url;
  }

  function cleanGlobalParams(url) {
    const urlparts = url.split("?");
    if (urlparts.length >= 2) {
      const pars = urlparts[1].split(/[&;]/g);
      //reverse iteration as may be destructive
      for (let i = pars.length; (i -= 1) >= 0; ) {
        if (globalParams.test(pars[i])) {
          pars.splice(i, 1);
        }
      }
      return urlparts[0] + (pars.length > 0 ? "?" + pars.join("&") : "");
    }
    return url;
  }

  function transformGoogleUrl(href) {
    const u = new URL(href);
    if (u.pathname === "/imgres" || u.pathname === "/url") {
      return cleanGoogleRedir(u.pathname, u.search) || href;
    } else if (u.search) {
      u.search = cleanGoogle(u.search);
    }
    return u.href;
  }

  function transformAmazonUrl(href) {
    const u = new URL(href);
    let result = href;

    if (u.pathname.includes("black-curtain-redirect.html")) {
      result = cleanAmazonRedir(u.search) || href;
    } else if (u.pathname.includes("/dp/")) {
      result = cleanAmazonItemdp(u);
    } else if (u.pathname.includes("/gp/product")) {
      result = cleanAmazonItemgp(u);
    } else if (u.pathname.includes("/picassoRedirect")) {
      const decoded = cleanGenericRedir(u.search);
      if (decoded) {
        const t = new URL(decoded, href);
        t.search = "";
        result = t.href;
      }
    } else if (u.search) {
      // clean only the query, not the whole href: amazonParams' [^&#]* value
      // would otherwise swallow the ? separator when the path contains a ref=
      // segment, collapsing the query into the path (breaks order-details).
      u.search = cleanAmazonParams(u.search);
      result = u.href;
    }

    const u2 = new URL(result, href);
    if (u2.pathname.includes("/ref=")) {
      u2.pathname = cleanAmazonParams(u2.pathname);
      result = u2.href;
    }

    return result;
  }

  function transformEbayUrl(href, pageOrigin) {
    const u = new URL(href);

    if (u.pathname.includes("/itm/")) {
      return cleanEbayItem(u);
    } else if (u.host.startsWith("pulsar.")) {
      return cleanEbayPulsar(u.search, pageOrigin) || href;
    } else if (u.search) {
      u.search = cleanEbayParams(u.search);
      return u.href;
    }

    return href;
  }

  function transformYoutubeUrl(href) {
    const u = new URL(href);
    if (u.pathname === "/watch") {
      u.search = cleanYoutube(u.search);
      return u.href;
    } else if (u.pathname === "/redirect") {
      return cleanYoutubeRedir(u.search) || href;
    }
    return href;
  }

  function transformTargetUrl(href) {
    const u = new URL(href);
    if (u.pathname.includes("/p/")) {
      return cleanTargetItemp(u);
    } else if (u.search) {
      return cleanTargetParams(href);
    }
    return href;
  }

  function transformNeweggUrl(href) {
    const u = new URL(href);
    if (u.search && !u.pathname.includes("/marketplace/")) {
      u.search = cleanNewegg(u.search);
      return u.href;
    }
    return href;
  }

  function transformImdbUrl(href) {
    const u = new URL(href);
    if (u.search) {
      u.search = cleanImdb(u.search);
      return u.href;
    }
    return href;
  }

  function transformFacebookUrl(href) {
    const u = new URL(href);
    if (u.host !== "l.facebook.com") {
      return href;
    }
    return cleanGenericRedir(u.search) || href;
  }

  // For disq.us/url: decode the redirect target via cleanGenericRedir, then strip
  // any trailing `:cid`-style suffix (e.g. ":1234567") added by Disqus — never
  // the protocol colon. Other disqus links are decoded the same way. Any link
  // without a usable redirect target is returned unchanged.
  function transformDisqusUrl(href) {
    const u = new URL(href);
    if (u.host === "disq.us" && u.pathname === "/url") {
      if (!u.searchParams.get("url")) {
        return href;
      }
      const decoded = cleanGenericRedir(u.search);
      return decoded ? decoded.replace(/:[^/:]+$/, "") : href;
    }
    return cleanGenericRedir(u.search) || href;
  }

  function transformGlobalUrl(href) {
    const u = new URL(href);
    if (u.search) {
      u.search = cleanGlobalParams(cleanUtm(u.search));
    }
    if (u.hash) {
      u.hash = cleanGlobalParams(cleanUtm(u.hash));
    }
    return u.href;
  }

  // shortcut: Node export + load guard exist only so the pure cleaners are unit-testable; Tampermonkey defines window/document so the guard is a no-op in-browser
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      cleanGoogle, cleanYoutube, cleanImdb, cleanNewegg,
      cleanTargetParams, cleanFacebookParams, cleanAmazonParams, cleanAudible,
      cleanEbayParams, cleanUtm, cleanGlobalParams, cleanParams,
      cleanYoutubeRedir, cleanAmazonRedir, cleanGenericRedir,
      cleanEbayPulsar, cleanEbayItem, cleanAmazonItemdp, cleanAmazonItemgp,
      cleanTargetItemp, relHref, cleanGoogleRedir, googleInstant, changeState,
      google, amazon, audible, ebay, bing, target,
      transformGoogleUrl, transformAmazonUrl, transformEbayUrl,
      transformYoutubeUrl, transformTargetUrl,
      transformNeweggUrl, transformImdbUrl, transformFacebookUrl,
      transformDisqusUrl, transformGlobalUrl,
      googleParams, ebayParams, amazonParams, neweggParams, imdbParams,
      bingParams, youtubeParams, targetParams,
      facebookParams, linkedinParams, etsyParams, yahooParams, globalParams,
      spotifyParams, redditParams, twitchParams, threadsParams,
      aliexpressParams, walmartParams, bestbuyParams, tiktokParams,
    };
  }
})();
