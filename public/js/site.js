(function () {
  "use strict";

  var leadModalInjected = false;

  function injectLeadModalAssets() {
    if (leadModalInjected) return;
    leadModalInjected = true;

    if (!document.querySelector("link[data-lead-modal-css]")) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/css/lead-modal.css";
      link.setAttribute("data-lead-modal-css", "");
      document.head.appendChild(link);
    }

    if (!document.querySelector("[data-lead-modal]")) {
      var wrap = document.createElement("div");
      wrap.innerHTML = [
        '<div class="lead-modal" data-lead-modal hidden>',
        '<div class="lead-modal__backdrop" data-lead-modal-close></div>',
        '<div class="lead-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title">',
        '<button type="button" class="lead-modal__close" data-lead-modal-close aria-label="Fechar">&times;</button>',
        '<div class="lead-modal__header">',
        '<p class="lead-modal__eyebrow">Solicitar acesso</p>',
        '<h2 id="lead-modal-title">Fale com a equipe E-Transporte.pro</h2>',
        '<p class="lead-modal__lede">Leva menos de 1 minuto. Nossa equipe retorna pelo WhatsApp com o próximo passo.</p>',
        "</div>",
        '<p id="lead-form-error" class="lead-modal__error" role="alert" hidden></p>',
        '<form id="lead-form" class="lead-modal__form" novalidate>',
        '<input type="hidden" name="origem" id="lead-origem" value="Landing Page" />',
        '<input type="hidden" name="origem_pagina" id="lead-origem-pagina" value="" />',
        '<div class="field field--honeypot" aria-hidden="true">',
        '<label for="lead-website">Website</label>',
        '<input type="text" id="lead-website" name="website" autocomplete="off" tabindex="-1" />',
        "</div>",
        '<div class="lead-modal__grid">',
        '<div class="field">',
        '<label class="field__label" for="lead-nome">Nome completo *</label>',
        '<input class="field__input" type="text" id="lead-nome" name="nome" required autocomplete="name" />',
        "</div>",
        '<div class="field">',
        '<label class="field__label" for="lead-tel">WhatsApp *</label>',
        '<input class="field__input" type="tel" id="lead-tel" name="telefone" required autocomplete="tel" inputmode="numeric" maxlength="16" placeholder="(99) 99999-9999" aria-describedby="lead-tel-hint" />',
        '<p id="lead-tel-hint" class="field__hint">Com DDD — usamos só para retorno da solicitação.</p>',
        "</div>",
        '<div class="field field--full">',
        '<label class="field__label" for="lead-estado">Estado *</label>',
        '<select id="lead-estado" class="field__input" name="estado" required>',
        '<option value="">Selecione o estado</option>',
        "</select>",
        "</div>",
        '<div class="field field--full city-field" data-city-field>',
        '<label class="field__label" for="lead-cidade">Cidade *</label>',
        '<select id="lead-cidade" class="field__input" name="cidade_id" required disabled>',
        '<option value="">Selecione o estado primeiro</option>',
        "</select>",
        "</div>",
        '<div class="field field--full">',
        '<label class="field__label" for="lead-empresa">Empresa <span class="field__optional">(opcional)</span></label>',
        '<input class="field__input" type="text" id="lead-empresa" name="empresa" autocomplete="organization" />',
        "</div>",
        '<div class="field field--full">',
        '<label class="field__label" for="lead-msg">Mensagem <span class="field__optional">(opcional)</span></label>',
        '<textarea class="field__input field__textarea" id="lead-msg" name="mensagem" rows="3"></textarea>',
        "</div>",
        "</div>",
        '<fieldset class="lead-modal__fieldset">',
        '<legend class="field__label">Como nos encontrou? <span class="field__optional">(opcional)</span></legend>',
        '<div class="lead-modal__radios">',
        '<label class="lead-modal__radio"><input type="radio" name="fonte" value="google" /> Google</label>',
        '<label class="lead-modal__radio"><input type="radio" name="fonte" value="linkedin" /> LinkedIn</label>',
        '<label class="lead-modal__radio"><input type="radio" name="fonte" value="facebook" /> Facebook</label>',
        '<label class="lead-modal__radio"><input type="radio" name="fonte" value="instagram" /> Instagram</label>',
        '<label class="lead-modal__radio"><input type="radio" name="fonte" value="indicacao" /> Indicação</label>',
        '<label class="lead-modal__radio"><input type="radio" name="fonte" value="outro" /> Outro</label>',
        "</div>",
        '<div class="lead-modal__fonte-outro" data-fonte-outro hidden>',
        '<label class="field__label" for="lead-fonte-outro-text">Qual? <span class="field__optional">(opcional)</span></label>',
        '<input class="field__input" type="text" id="lead-fonte-outro-text" name="fonte_outro" autocomplete="off" />',
        "</div>",
        "</fieldset>",
        '<div class="lead-modal__actions">',
        '<button type="button" class="btn btn--secondary" data-lead-modal-close>Cancelar</button>',
        '<button type="submit" class="btn btn--primary" id="lead-submit">',
        '<span class="lead-modal__submit-label">Solicitar Demonstração</span>',
        '<span class="lead-modal__submit-wait" hidden aria-hidden="true">Enviando…</span>',
        "</button>",
        "</div>",
        "</form>",
        '<div id="lead-success" class="lead-modal__success" hidden>',
        '<p class="lead-modal__success-title">Recebemos sua solicitação</p>',
        '<p class="lead-modal__success-text" id="lead-success-msg"></p>',
        '<button type="button" class="btn btn--primary" data-lead-modal-close>Fechar</button>',
        "</div>",
        "</div>",
        "</div>",
      ].join("");
      var first = wrap.firstElementChild;
      if (first) document.body.appendChild(first);
    }

    window.dispatchEvent(new CustomEvent("lead-modal-ready"));
  }

  function closeMobileMenu() {
    var menu = document.querySelector("[data-nav]");
    var toggle = document.querySelector("[data-nav-toggle]");
    if (menu) menu.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  document.addEventListener(
    "click",
    function (e) {
      if (e.target.closest("[data-open-lead-modal]")) {
        injectLeadModalAssets();
        closeMobileMenu();
        return;
      }
      if (e.target.closest("[data-nav-toggle]")) return;
      var menu = document.querySelector("[data-nav]");
      if (menu && menu.classList.contains("is-open") && !e.target.closest("[data-nav]")) {
        closeMobileMenu();
      }
    },
    true
  );

  var yearNodes = document.querySelectorAll("[data-year]");
  yearNodes.forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.querySelector("[data-nav]");
  if (toggle && menu) {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMobileMenu();
      });
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMobileMenu();
  });
})();
