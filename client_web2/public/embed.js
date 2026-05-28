/* Liveblog responsive embed helper (parent page script).
 * Supports cross-origin embeds via postMessage and same-origin via direct measurement.
 */
(function () {
  var IFRAME_ID = 'liveblog-iframe';
  var MIN_HEIGHT = 320;
  var MAX_HEIGHT = 200000;
  var POLL_MS = 600;
  var RESPONSIVE_SELECTOR = 'iframe#liveblog-iframe, iframe[data-liveblog-embed]';
  var lastHeights = new WeakMap();
  var pollTimer = null;

  function clampHeight(value) {
    var n = Number(value) || 0;
    if (n < MIN_HEIGHT) return MIN_HEIGHT;
    if (n > MAX_HEIGHT) return MAX_HEIGHT;
    return Math.ceil(n);
  }

  function getResponsiveIframes() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll(RESPONSIVE_SELECTOR));
    return nodes.filter(isResponsive);
  }

  function isResponsive(iframe) {
    return (
      iframe &&
      String(iframe.getAttribute('data-responsive') || '').toLowerCase() === 'yes'
    );
  }

  function setIframeHeight(iframe, height) {
    var next = clampHeight(height);
    if (next === lastHeights.get(iframe)) return;
    lastHeights.set(iframe, next);
    iframe.style.height = next + 'px';
  }

  function measureIframeContentHeight(iframe) {
    try {
      var doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
      if (!doc) return null;
      var html = doc.documentElement;
      var body = doc.body;
      if (!html && !body) return null;
      var h1 = html ? html.scrollHeight : 0;
      var h2 = html ? html.offsetHeight : 0;
      var h3 = body ? body.scrollHeight : 0;
      var h4 = body ? body.offsetHeight : 0;
      return Math.max(h1, h2, h3, h4);
    } catch (_err) {
      // Cross-origin frame; cannot read directly.
      return null;
    }
  }

  function tick() {
    getResponsiveIframes().forEach(function (iframe) {
      var measured = measureIframeContentHeight(iframe);
      if (measured != null) {
        // small buffer prevents cut-off due to margins/layout jitter
        setIframeHeight(iframe, measured + 8);
      }
    });
  }

  function startPolling() {
    if (pollTimer) window.clearInterval(pollTimer);
    pollTimer = window.setInterval(tick, POLL_MS);
  }

  // Optional postMessage support for cross-origin embeds where child posts height.
  function findIframeByWindow(sourceWin) {
    var frames = getResponsiveIframes();
    for (var i = 0; i < frames.length; i += 1) {
      if (frames[i].contentWindow === sourceWin) return frames[i];
    }
    return null;
  }

  function onMessage(event) {
    var data = event && event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type !== 'liveblog:height') return;
    if (typeof data.height !== 'number' && typeof data.height !== 'string') return;
    var iframe = findIframeByWindow(event.source);
    if (!iframe) {
      var fallback = document.getElementById(IFRAME_ID);
      if (isResponsive(fallback)) iframe = fallback;
    }
    if (!iframe) return;
    setIframeHeight(iframe, data.height);
  }

  function init() {
    var iframes = getResponsiveIframes();
    if (!iframes.length) return;
    iframes.forEach(function (iframe) {
      iframe.setAttribute('scrolling', 'no');
      iframe.style.width = iframe.style.width || '100%';
      iframe.addEventListener('load', tick);
    });
    tick();
    startPolling();
    window.addEventListener('resize', tick);
    window.addEventListener('message', onMessage);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
