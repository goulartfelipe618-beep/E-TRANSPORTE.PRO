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

  /* Modal lead + IBGE (estado → municípios) */
  (function initLeadModal() {
    var root = document.querySelector("[data-lead-modal]");
    if (!root) return;

    var dialog = root.querySelector(".lead-modal__dialog");
    var form = document.getElementById("lead-form");
    var successEl = document.getElementById("lead-success");
    var successMsg = document.getElementById("lead-success-msg");
    var errEl = document.getElementById("lead-form-error");
    var selEstado = document.getElementById("lead-estado");
    var selCidade = document.getElementById("lead-cidade");
    var filterCidade = document.getElementById("lead-cidade-filter");
    var cityField = root.querySelector("[data-city-field]");
    var fonteOutroWrap = root.querySelector("[data-fonte-outro]");
    var fonteOutroInput = document.getElementById("lead-fonte-outro-text");
    var submitBtn = document.getElementById("lead-submit");
    var submitLabel = submitBtn && submitBtn.querySelector(".lead-modal__submit-label");
    var submitWait = submitBtn && submitBtn.querySelector(".lead-modal__submit-wait");

    var estadosLoaded = false;
    var municipiosCache = [];
    var municipiosFull = [];
    var lastFocus = null;

    var IBGE_ESTADOS = "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome";
    function ibgeMunicipiosUrl(estadoId) {
      return "https://servicodados.ibge.gov.br/api/v1/localidades/estados/" + estadoId + "/municipios?orderBy=nome";
    }

    function showError(msg) {
      if (!errEl) return;
      errEl.textContent = msg;
      errEl.hidden = false;
    }

    function clearError() {
      if (!errEl) return;
      errEl.textContent = "";
      errEl.hidden = true;
    }

    function getFocusables() {
      if (!dialog) return [];
      return Array.prototype.slice
        .call(
          dialog.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        )
        .filter(function (el) {
          return el.offsetParent !== null || el === dialog;
        });
    }

    function openModal() {
      lastFocus = document.activeElement;
      root.removeAttribute("hidden");
      root.classList.add("is-open");
      document.body.style.overflow = "hidden";
      clearError();
      if (form) form.hidden = false;
      if (successEl) successEl.hidden = true;
      if (form) {
        form.reset();
        setCityEnabled(false);
        if (fonteOutroWrap) fonteOutroWrap.hidden = true;
        if (fonteOutroInput) {
          fonteOutroInput.removeAttribute("required");
          fonteOutroInput.value = "";
        }
      }
      if (!estadosLoaded) loadEstados();
      window.requestAnimationFrame(function () {
        var nome = document.getElementById("lead-nome");
        if (nome) nome.focus();
      });
    }

    function closeModal() {
      root.classList.remove("is-open");
      root.setAttribute("hidden", "");
      document.body.style.overflow = "";
      if (lastFocus && typeof lastFocus.focus === "function") {
        try {
          lastFocus.focus();
        } catch (e2) {}
      }
    }

    function resetFormView() {
      if (form) form.hidden = false;
      if (successEl) successEl.hidden = true;
      if (submitBtn) submitBtn.disabled = false;
      if (submitLabel) submitLabel.hidden = false;
      if (submitWait) submitWait.hidden = true;
    }

    function loadEstados() {
      if (!selEstado) return;
      selEstado.innerHTML = '<option value="">Carregando estados…</option>';
      selEstado.disabled = true;
      fetch(IBGE_ESTADOS)
        .then(function (r) {
          if (!r.ok) throw new Error("ibge");
          return r.json();
        })
        .then(function (data) {
          estadosLoaded = true;
          selEstado.innerHTML = '<option value="">Selecione o estado</option>';
          data.forEach(function (uf) {
            var opt = document.createElement("option");
            opt.value = String(uf.id);
            opt.textContent = uf.nome + " (" + uf.sigla + ")";
            opt.setAttribute("data-sigla", uf.sigla);
            selEstado.appendChild(opt);
          });
          selEstado.disabled = false;
        })
        .catch(function () {
          selEstado.innerHTML = '<option value="">Erro ao carregar</option>';
          showError("Não foi possível carregar os estados (IBGE). Verifique a conexão e tente de novo.");
        });
    }

    function setCityEnabled(on) {
      if (!cityField || !selCidade || !filterCidade) return;
      if (!on) {
        cityField.hidden = true;
        selCidade.innerHTML = "";
        selCidade.disabled = true;
        selCidade.removeAttribute("required");
        filterCidade.value = "";
        filterCidade.disabled = true;
        municipiosFull = [];
        municipiosCache = [];
        return;
      }
      cityField.hidden = false;
      filterCidade.disabled = false;
      selCidade.disabled = false;
      selCidade.setAttribute("required", "");
    }

    function fillCidades(list) {
      if (!selCidade) return;
      selCidade.innerHTML = "";
      list.forEach(function (m) {
        var opt = document.createElement("option");
        opt.value = String(m.id);
        opt.textContent = m.nome;
        selCidade.appendChild(opt);
      });
    }

    function applyCidadeFilter() {
      var q = (filterCidade && filterCidade.value.trim().toLowerCase()) || "";
      if (!municipiosFull.length) return;
      if (!q) {
        municipiosCache = municipiosFull.slice();
      } else {
        municipiosCache = municipiosFull.filter(function (m) {
          return m.nome.toLowerCase().indexOf(q) !== -1;
        });
      }
      fillCidades(municipiosCache);
    }

    if (selEstado) {
      selEstado.addEventListener("change", function () {
        clearError();
        var id = selEstado.value;
        setCityEnabled(false);
        if (!id) return;

        selCidade.innerHTML = '<option value="">Carregando cidades…</option>';
        cityField.hidden = false;
        filterCidade.disabled = true;
        selCidade.disabled = true;

        fetch(ibgeMunicipiosUrl(id))
          .then(function (r) {
            if (!r.ok) throw new Error("ibge");
            return r.json();
          })
          .then(function (data) {
            municipiosFull = data.map(function (m) {
              return { id: m.id, nome: m.nome };
            });
            municipiosCache = municipiosFull.slice();
            filterCidade.value = "";
            filterCidade.disabled = false;
            setCityEnabled(true);
            fillCidades(municipiosCache);
            if (filterCidade) filterCidade.focus();
          })
          .catch(function () {
            showError("Não foi possível carregar as cidades deste estado. Tente outro estado ou atualize a página.");
            setCityEnabled(false);
          });
      });
    }

    if (filterCidade) {
      filterCidade.addEventListener("input", function () {
        applyCidadeFilter();
      });
    }

    document.querySelectorAll("[data-open-lead-modal]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        resetFormView();
        openModal();
      });
    });

    root.querySelectorAll("[data-lead-modal-close]").forEach(function (el) {
      el.addEventListener("click", function () {
        closeModal();
      });
    });

    root.addEventListener("click", function (e) {
      if (e.target === root.querySelector(".lead-modal__backdrop")) closeModal();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("is-open")) {
        e.preventDefault();
        closeModal();
      }
      if (e.key === "Tab" && root.classList.contains("is-open") && dialog) {
        var focusables = getFocusables();
        if (focusables.length === 0) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    root.querySelectorAll('input[name="fonte"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        var outro = root.querySelector('input[name="fonte"]:checked') && root.querySelector('input[name="fonte"]:checked').value === "outro";
        if (fonteOutroWrap) {
          fonteOutroWrap.hidden = !outro;
        }
        if (fonteOutroInput) {
          if (outro) {
            fonteOutroInput.setAttribute("required", "");
            fonteOutroInput.focus();
          } else {
            fonteOutroInput.removeAttribute("required");
            fonteOutroInput.value = "";
          }
        }
      });
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        clearError();

        var hp = document.getElementById("lead-website");
        if (hp && hp.value) {
          closeModal();
          return;
        }

        var nome = (document.getElementById("lead-nome") && document.getElementById("lead-nome").value.trim()) || "";
        var email = (document.getElementById("lead-email") && document.getElementById("lead-email").value.trim()) || "";
        var tel = (document.getElementById("lead-tel") && document.getElementById("lead-tel").value.trim()) || "";
        var empresa = (document.getElementById("lead-empresa") && document.getElementById("lead-empresa").value.trim()) || "";
        var msg = (document.getElementById("lead-msg") && document.getElementById("lead-msg").value.trim()) || "";
        var estadoId = selEstado && selEstado.value;
        var estadoLabel = "";
        if (selEstado && selEstado.selectedIndex >= 0) {
          estadoLabel = selEstado.options[selEstado.selectedIndex].textContent || "";
        }
        var cidadeOpt = selCidade && selCidade.options[selCidade.selectedIndex];
        var cidadeNome = cidadeOpt ? cidadeOpt.textContent : "";
        var fonteEl = root.querySelector('input[name="fonte"]:checked');
        var fonte = fonteEl ? fonteEl.value : "";
        var fonteOutro = (fonteOutroInput && fonteOutroInput.value.trim()) || "";

        if (!nome || !email || !tel) {
          showError("Preencha nome, e-mail e telefone.");
          return;
        }
        if (!estadoId) {
          showError("Selecione o estado.");
          return;
        }
        if (!selCidade || !selCidade.value) {
          showError("Selecione a cidade na lista.");
          return;
        }
        if (!fonte) {
          showError("Indique como nos encontrou.");
          return;
        }
        if (fonte === "outro" && !fonteOutro) {
          showError("Especifique a origem em “Outro”.");
          return;
        }

        var fonteLabel = fonte;
        if (fonte === "google") fonteLabel = "Google";
        else if (fonte === "linkedin") fonteLabel = "LinkedIn";
        else if (fonte === "facebook") fonteLabel = "Facebook";
        else if (fonte === "instagram") fonteLabel = "Instagram";
        else if (fonte === "indicacao") fonteLabel = "Indicação";
        else if (fonte === "outro") fonteLabel = "Outro: " + fonteOutro;

        var bodyLines = [
          "Nome: " + nome,
          "E-mail: " + email,
          "Telefone: " + tel,
          "Estado: " + estadoLabel,
          "Cidade: " + cidadeNome,
          "Empresa: " + (empresa || "—"),
          "Como nos encontrou: " + fonteLabel,
          "",
          "Mensagem:",
          msg || "—",
        ];
        var body = bodyLines.join("\n");
        var subject = "Contato — Conhecer plataforma E-Transporte.pro";
        var mail = "contato@e-transporte.pro";
        var maxBody = 1750;
        var tipPaste =
          "O texto completo do formulário foi copiado para a área de transferência. Cole (Ctrl+V) no corpo do e-mail se ele vier vazio.";

        if (submitBtn) submitBtn.disabled = true;
        if (submitLabel) submitLabel.hidden = true;
        if (submitWait) submitWait.hidden = false;

        function finishSuccess(message) {
          if (form) form.hidden = true;
          if (successEl) successEl.hidden = false;
          if (successMsg) successMsg.textContent = message;
          if (submitBtn) submitBtn.disabled = false;
          if (submitLabel) submitLabel.hidden = false;
          if (submitWait) submitWait.hidden = true;
        }

        function tryMailto(b, preferClipboard) {
          if (b.length <= maxBody) {
            window.location.href =
              "mailto:" + mail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(b);
            finishSuccess(
              "Se o e-mail não abrir, envie manualmente para contato@e-transporte.pro."
            );
            return;
          }
          if (preferClipboard && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
              .writeText(b)
              .then(function () {
                window.location.href =
                  "mailto:" +
                  mail +
                  "?subject=" +
                  encodeURIComponent(subject) +
                  "&body=" +
                  encodeURIComponent(tipPaste);
                finishSuccess(
                  "Seu cliente de e-mail deve abrir. O texto completo foi copiado — cole (Ctrl+V) no corpo se vier vazio."
                );
              })
              .catch(function () {
                window.location.href =
                  "mailto:" +
                  mail +
                  "?subject=" +
                  encodeURIComponent(subject) +
                  "&body=" +
                  encodeURIComponent(b.slice(0, maxBody) + "\n\n[Texto truncado — reduza a mensagem opcional.]");
                finishSuccess(
                  "Se o texto estiver incompleto, envie outro e-mail ou ligue para o suporte."
                );
              });
            return;
          }
          window.location.href =
            "mailto:" +
            mail +
            "?subject=" +
            encodeURIComponent(subject) +
            "&body=" +
            encodeURIComponent(b.slice(0, maxBody) + "\n\n[Texto truncado — reduza a mensagem opcional.]");
          finishSuccess(
            "Se o texto estiver incompleto, envie outro e-mail ou ligue para o suporte."
          );
        }

        window.setTimeout(function () {
          tryMailto(body, body.length > maxBody);
        }, 120);
      });
    }
  })();
})();
