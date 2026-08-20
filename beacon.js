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
    var payload = JSON.stringify({
      p: location.pathname || "/",
      r: document.referrer || "",
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
