/* Liveblog responsive embed helper (parent page script)
 * Targets: <iframe id="liveblog-iframe" data-responsive="yes" ...>
 */
(function () {
  var IFRAME_ID = 'liveblog-iframe';
  var MIN_HEIGHT = 320;
  var MAX_HEIGHT = 200000;
  var POLL_MS = 600;
  var lastHeight = 0;
  var pollTimer = null;

  function clampHeight(value) {
    var n = Number(value) || 0;
    if (n < MIN_HEIGHT) return MIN_HEIGHT;
    if (n > MAX_HEIGHT) return MAX_HEIGHT;
    return Math.ceil(n);
  }

  function getIframe() {
    return document.getElementById(IFRAME_ID);
  }

  function isResponsive(iframe) {
    return (
      iframe &&
      String(iframe.getAttribute('data-responsive') || '').toLowerCase() === 'yes'
    );
  }

  function setIframeHeight(iframe, height) {
    var next = clampHeight(height);
    if (next === lastHeight) return;
    lastHeight = next;
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
    var iframe = getIframe();
    if (!isResponsive(iframe)) return;
    var measured = measureIframeContentHeight(iframe);
    if (measured != null) {
      // small buffer prevents cut-off due to margins/layout jitter
      setIframeHeight(iframe, measured + 8);
    }
  }

  function startPolling() {
    if (pollTimer) window.clearInterval(pollTimer);
    pollTimer = window.setInterval(tick, POLL_MS);
  }

  // Optional postMessage support for cross-origin embeds where child posts height.
  function onMessage(event) {
    var iframe = getIframe();
    if (!isResponsive(iframe)) return;
    var data = event && event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type !== 'liveblog:height') return;
    if (typeof data.height !== 'number' && typeof data.height !== 'string') return;
    setIframeHeight(iframe, data.height);
  }

  function init() {
    var iframe = getIframe();
    if (!isResponsive(iframe)) return;
    iframe.setAttribute('scrolling', 'no');
    iframe.style.width = iframe.style.width || '100%';
    tick();
    startPolling();
    iframe.addEventListener('load', tick);
    window.addEventListener('resize', tick);
    window.addEventListener('message', onMessage);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
