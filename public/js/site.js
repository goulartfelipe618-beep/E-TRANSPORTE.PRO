(function () {
  "use strict";

  var yearNodes = document.querySelectorAll("[data-year]");
  yearNodes.forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.querySelector("[data-nav]");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  window.chatwootSettings = { position: "right", type: "standard", launcherTitle: "" };
  (function (d, t) {
    var BASE_URL = "https://chatwoot.e-transporte.pro";
    var g = d.createElement(t);
    var s = d.getElementsByTagName(t)[0];
    if (!s || d.querySelector('script[src="' + BASE_URL + '/packs/js/sdk.js"]')) return;
    g.src = BASE_URL + "/packs/js/sdk.js";
    g.async = true;
    s.parentNode.insertBefore(g, s);
    g.onload = function () {
      if (!window.chatwootSDK || typeof window.chatwootSDK.run !== "function") return;
      window.chatwootSDK.run({
        websiteToken: "dvGfRaS9f9KKx3XkVjQreZwU",
        baseUrl: BASE_URL,
      });
    };
  })(document, "script");
})();
