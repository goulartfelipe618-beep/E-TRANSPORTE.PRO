(function () {
  "use strict";

  var sticky = document.querySelector("[data-lp-sticky-cta]");
  var hero = document.querySelector("[data-lp-hero]");

  function setStickyVisible(visible) {
    if (!sticky) return;
    sticky.classList.toggle("is-visible", visible);
    if (visible) sticky.removeAttribute("hidden");
    else sticky.setAttribute("hidden", "");
  }

  if (sticky && hero && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          setStickyVisible(!entry.isIntersecting);
        });
      },
      { root: null, threshold: 0, rootMargin: "0px 0px -20% 0px" }
    );
    io.observe(hero);
  } else if (sticky) {
    setStickyVisible(true);
  }

  function initReveals() {
    var reveals = document.querySelectorAll(".lp-reveal");
    if (!reveals.length) return;
    if (!("IntersectionObserver" in window)) {
      reveals.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var revealIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealIo.unobserve(entry.target);
        });
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) {
      revealIo.observe(el);
    });
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    initReveals();
  } else if ("requestIdleCallback" in window) {
    requestIdleCallback(initReveals, { timeout: 3000 });
  } else {
    window.requestAnimationFrame(initReveals);
  }
})();
