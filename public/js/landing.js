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

  var reveals = document.querySelectorAll(".lp-reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var revealIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealIo.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) {
      revealIo.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
