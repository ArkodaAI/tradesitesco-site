/* TradeSites Co. hit beacon.
 *
 * Records that a page was viewed, so a post to a local sale page becomes a
 * number instead of a feeling.
 *
 * What it sends: the path, the referrer, and the screen width. That is all.
 * No cookie, no localStorage, no fingerprint, no identifier of any kind, and
 * no third party -- it posts to our own n8n endpoint, which writes to our own
 * database. There is deliberately no IP stored at the other end either.
 *
 * Because it stores nothing on the visitor's device and collects nothing
 * personal, it needs no consent banner. That is the point: the cheapest way
 * to stay out of cookie-law trouble is to not be interesting to it.
 *
 * It is also entirely fire-and-forget. If the endpoint is down, slow, or
 * blocked by an ad blocker, nothing on the page changes and no error reaches
 * the visitor. Analytics must never be able to break the thing being measured.
 */
(function () {
  try {
    // THE CAMPAIGN TAG, and why the referrer alone was never going to work.
    //
    // The first real question asked of this data was "did my Facebook post
    // bring anyone?" and it could not be answered -- not because nobody came,
    // but because Facebook's in-app browser strips the referrer. Traffic from
    // a phone app arrives looking exactly like somebody typing the address
    // from memory. So "0 from facebook.com" is not evidence of nothing; it is
    // the measurement failing silently, which is worse than no measurement,
    // because it reads as an answer.
    //
    // A tag we put in the link ourselves survives all of that. Post
    // /?s=fb-marketplace and the visit is attributable no matter what the
    // browser does or does not send.
    //
    // Still nothing personal: it is a word WE chose, attached to a link WE
    // published. It says which poster worked, never who the reader is.
    var tag = "";
    try {
      var m = (location.search || "").match(/[?&]s=([A-Za-z0-9_-]{1,40})/);
      if (m) { tag = m[1]; }
    } catch (e2) { tag = ""; }

    var payload = JSON.stringify({
      p: location.pathname || "/",
      r: document.referrer || "",
      s: tag,
      w: window.screen ? window.screen.width : 0
    });
    var url = "https://logic.arkoda.app/webhook/ts-hit";

    // sendBeacon survives the page being closed mid-request, which a plain
    // fetch does not -- a visitor who bounces immediately is exactly the
    // visitor we most need to have counted.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], {type: "application/json"}));
    } else {
      fetch(url, {method: "POST", body: payload, keepalive: true,
                  headers: {"Content-Type": "application/json"}})
        .catch(function () {});
    }
  } catch (e) { /* never let counting a visit break a visit */ }
})();
