(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Hero: reveal imediato (animação só nas dobras abaixo) */
  document.querySelectorAll(".hero.section [data-reveal]").forEach(function (el) {
    el.classList.add("is-visible");
  });

  /* Mock do painel: skeleton → conteúdo */
  var panelWrap = document.querySelector("[data-panel-mock]");
  if (panelWrap) {
    if (reduceMotion) {
      panelWrap.classList.add("is-loaded");
    } else {
      window.setTimeout(function () {
        panelWrap.classList.add("is-loaded");
      }, 680);
    }
  }

  /* Header: compactar, blur e sombra ao rolar */
  var header = document.querySelector("[data-header]");
  function onScrollHeader() {
    if (!header) return;
    var y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle("is-scrolled", y > 12);
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* Menu mobile */
  var toggle = document.querySelector("[data-nav-toggle]");
  var panel = document.querySelector("[data-nav-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        panel.classList.remove("is-open");
        panel.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Accordion FAQ (um painel aberto por vez no mesmo grupo) */
  document.querySelectorAll("[data-accordion-trigger]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var root = btn.closest("[data-accordion]");
      if (!root) return;
      var expanded = btn.getAttribute("aria-expanded") === "true";
      root.querySelectorAll("[data-accordion-trigger]").forEach(function (other) {
        if (other === btn) return;
        other.setAttribute("aria-expanded", "false");
        var oid = other.getAttribute("aria-controls");
        var op = oid ? document.getElementById(oid) : null;
        if (op) op.hidden = true;
      });
      var next = !expanded;
      btn.setAttribute("aria-expanded", next ? "true" : "false");
      var id = btn.getAttribute("aria-controls");
      var panelEl = id ? document.getElementById(id) : null;
      if (panelEl) panelEl.hidden = !next;
    });
  });

  /* Reveal por seção (exceto hero) + stagger 60ms */
  function initReveals() {
    var sections = document.querySelectorAll("main > section:not(.hero)");
    sections.forEach(function (section) {
      var items = section.querySelectorAll("[data-reveal]");
      if (!items.length) return;

      if (reduceMotion) {
        items.forEach(function (el) {
          el.classList.add("is-visible");
        });
        return;
      }

      var io = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            items.forEach(function (el, i) {
              window.setTimeout(function () {
                el.classList.add("is-visible");
              }, i * 60);
            });
            obs.unobserve(section);
          });
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
      );
      io.observe(section);
    });
  }
  initReveals();

  function setButtonLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.dataset.loading = "true";
      btn.setAttribute("disabled", "disabled");
      var sp = document.createElement("span");
      sp.className = "btn__spinner";
      sp.setAttribute("aria-hidden", "true");
      btn.insertBefore(sp, btn.firstChild);
    } else {
      delete btn.dataset.loading;
      btn.removeAttribute("disabled");
      var old = btn.querySelector(".btn__spinner");
      if (old) old.remove();
    }
  }

  /* Formulário: honeypot, mensagem de sucesso na seção, redirect GET sem spam field */
  var leadForm = document.querySelector(".lead-form");
  if (leadForm) {
    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!leadForm.action) return;

      var hp = leadForm.querySelector('[name="company_site"]');
      if (hp && hp.value.replace(/\s/g, "") !== "") {
        return;
      }

      var submitBtn = leadForm.querySelector("[data-cta-submit]");
      var successEl = document.getElementById("lead-success");

      setButtonLoading(submitBtn, true);

      var fd = new FormData(leadForm);
      fd.delete("company_site");
      var q = new URLSearchParams(fd).toString();
      var url = leadForm.action + (leadForm.action.indexOf("?") >= 0 ? "&" : "?") + q;

      if (successEl) {
        successEl.hidden = false;
        successEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
      }

      window.setTimeout(function () {
        window.location.href = url;
      }, 2200);
    });
  }

  /* Carrossel de planos: scroll horizontal no viewport + setas (sem transform; evita cliques bloqueados) */
  var plansRoot = document.querySelector("[data-plans-carousel]");
  if (plansRoot) {
    var plansViewport = plansRoot.querySelector("[data-carousel-viewport]") || plansRoot.querySelector(".plans-carousel__viewport");
    var plansTrack = plansRoot.querySelector("[data-carousel-track]");
    var plansPrev = plansRoot.querySelector("[data-carousel-prev]");
    var plansNext = plansRoot.querySelector("[data-carousel-next]");
    var planSlides = plansTrack ? plansTrack.querySelectorAll(".plan") : [];

    var plansIndex = 0;
    var plansStepPx = 0;
    var plansScrolling = false;

    function plansVisibleCount() {
      var w = window.innerWidth;
      var want = w <= 560 ? 1 : w <= 900 ? 2 : 3;
      return Math.max(1, Math.min(want, planSlides.length));
    }

    function plansGapPx() {
      if (!plansTrack) return 24;
      var cs = window.getComputedStyle(plansTrack);
      var g = cs.columnGap || cs.gap || cs.rowGap;
      var px = parseFloat(g);
      if (!isNaN(px) && px > 0) return px;
      return window.innerWidth <= 640 ? 16 : 24;
    }

    function plansMaxIdx() {
      var vis = plansVisibleCount();
      return Math.max(0, planSlides.length - vis);
    }

    function clampPlansIndex() {
      var m = plansMaxIdx();
      if (plansIndex > m) plansIndex = m;
      if (plansIndex < 0) plansIndex = 0;
    }

    function updatePlansButtons() {
      clampPlansIndex();
      var max = plansMaxIdx();
      if (plansPrev) plansPrev.disabled = plansIndex <= 0;
      if (plansNext) plansNext.disabled = plansIndex >= max;
    }

    function scrollPlansToIndex() {
      if (!plansViewport || !plansStepPx) return;
      var maxScroll = Math.max(0, plansViewport.scrollWidth - plansViewport.clientWidth);
      var target = Math.min(plansIndex * plansStepPx, maxScroll);
      plansScrolling = true;
      plansViewport.scrollLeft = target;
      window.requestAnimationFrame(function () {
        plansScrolling = false;
      });
    }

    function updatePlansCarousel() {
      if (!plansTrack || !planSlides.length) return;
      updatePlansButtons();

      if (!plansViewport) return;
      var vw = plansViewport.getBoundingClientRect().width;
      if (vw < 8) return;

      var vis = plansVisibleCount();
      var gap = plansGapPx();
      var slideW = (vw - gap * (vis - 1)) / vis;
      slideW = Math.floor(slideW * 100) / 100;
      plansRoot.style.setProperty("--carousel-slide-w", slideW + "px");
      planSlides.forEach(function (slide) {
        slide.style.flexBasis = slideW + "px";
        slide.style.width = slideW + "px";
        slide.style.maxWidth = slideW + "px";
      });

      void plansTrack.offsetHeight;
      plansStepPx = slideW + gap;
      if (planSlides.length >= 2) {
        var d = planSlides[1].offsetLeft - planSlides[0].offsetLeft;
        if (d > 1) plansStepPx = d;
      }

      clampPlansIndex();
      var maxScroll = Math.max(0, plansViewport.scrollWidth - plansViewport.clientWidth);
      var target = Math.min(plansIndex * plansStepPx, maxScroll);
      plansScrolling = true;
      plansViewport.scrollLeft = target;
      window.requestAnimationFrame(function () {
        plansScrolling = false;
      });
      updatePlansButtons();
    }

    function goPlansPrev() {
      if (!plansStepPx) updatePlansCarousel();
      if (plansIndex > 0) {
        plansIndex -= 1;
        updatePlansButtons();
        scrollPlansToIndex();
      }
    }

    function goPlansNext() {
      if (!plansStepPx) updatePlansCarousel();
      var m = plansMaxIdx();
      if (plansIndex < m) {
        plansIndex += 1;
        updatePlansButtons();
        scrollPlansToIndex();
      }
    }

    /* Captura: corre antes de overlays/extensões; pointerdown é mais fiável que click em alguns browsers */
    plansRoot.addEventListener(
      "pointerdown",
      function (e) {
        if (e.button !== 0) return;
        var nextBtn = e.target.closest("[data-carousel-next]");
        var prevBtn = e.target.closest("[data-carousel-prev]");
        if (nextBtn && plansRoot.contains(nextBtn) && !nextBtn.disabled) {
          e.preventDefault();
          nextBtn.focus();
          goPlansNext();
          return;
        }
        if (prevBtn && plansRoot.contains(prevBtn) && !prevBtn.disabled) {
          e.preventDefault();
          prevBtn.focus();
          goPlansPrev();
        }
      },
      true
    );

    if (plansViewport) {
      plansViewport.addEventListener("scroll", function () {
        if (plansScrolling || !plansStepPx || plansStepPx < 4) return;
        var idx = Math.round(plansViewport.scrollLeft / plansStepPx);
        var m = plansMaxIdx();
        if (idx < 0) idx = 0;
        if (idx > m) idx = m;
        if (idx !== plansIndex) {
          plansIndex = idx;
          updatePlansButtons();
        }
      });
    }

    function schedulePlansCarousel() {
      window.requestAnimationFrame(function () {
        updatePlansCarousel();
      });
    }

    window.addEventListener("resize", schedulePlansCarousel);
    schedulePlansCarousel();
    window.addEventListener("load", schedulePlansCarousel);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedulePlansCarousel);
    }
    if (typeof ResizeObserver !== "undefined" && plansViewport) {
      var plansRo = new ResizeObserver(function () {
        schedulePlansCarousel();
      });
      plansRo.observe(plansViewport);
    }

    plansRoot.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft" && plansPrev && !plansPrev.disabled) {
        e.preventDefault();
        goPlansPrev();
      }
      if (e.key === "ArrowRight" && plansNext && !plansNext.disabled) {
        e.preventDefault();
        goPlansNext();
      }
    });
  }

  /* Benefícios dos planos: ocultar após 4 linhas + Ver mais / Ver menos */
  (function initPlanBenefitsCollapse() {
    var car = document.querySelector("[data-plans-carousel]");
    if (!car) return;
    var maxVisible = 4;
    var idN = 0;
    car.querySelectorAll(".plan__list").forEach(function (ul) {
      var items = ul.querySelectorAll(":scope > li");
      if (items.length <= maxVisible) return;
      ul.classList.add("plan__list--collapsible");
      items.forEach(function (li, i) {
        if (i >= maxVisible) li.classList.add("plan__list__extra");
      });
      if (!ul.id) ul.id = "plan-benefits-" + idN++;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "plan__list__more";
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", ul.id);
      btn.textContent = "Ver mais";
      ul.insertAdjacentElement("afterend", btn);
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        ul.classList.toggle("plan__list--expanded", !expanded);
        btn.textContent = expanded ? "Ver mais" : "Ver menos";
      });
    });
  })();

  /* CTA primário para URL externa: spinner discreto antes da navegação */
  document.querySelectorAll('a.btn--primary[href*="solicitar-acesso"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (reduceMotion) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.getAttribute("href").charAt(0) === "#") return;
      e.preventDefault();
      a.style.pointerEvents = "none";
      var sp = document.createElement("span");
      sp.className = "btn__spinner";
      sp.setAttribute("aria-hidden", "true");
      a.insertBefore(sp, a.firstChild);
      window.setTimeout(function () {
        window.location.href = a.href;
      }, 400);
    });
  });
})();
