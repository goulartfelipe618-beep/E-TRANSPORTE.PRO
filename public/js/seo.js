(function () {
  "use strict";

  var origin = window.location.origin;

  document.querySelectorAll('a[href^="/"]').forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href || href.indexOf("#") === 0) return;
    if (a.getAttribute("data-prefetched")) return;
    if (href.indexOf(".html") === -1 && href.indexOf("/") !== 0) return;
    a.addEventListener("mouseenter", function prefetch() {
      var link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      link.as = "document";
      document.head.appendChild(link);
      a.setAttribute("data-prefetched", "1");
      a.removeEventListener("mouseenter", prefetch);
    });
  });

  if ("PerformanceObserver" in window) {
    try {
      var po = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (entry.duration > 2500 && entry.entryType === "largest-contentful-paint") {
            document.documentElement.classList.add("lcp-logged");
          }
        });
      });
      po.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {
      /* ignore */
    }
  }
})();
