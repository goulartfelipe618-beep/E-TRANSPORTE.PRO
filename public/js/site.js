(function () {
  "use strict";

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
      '<p class="lead-modal__lede">Preencha os dados abaixo. Entraremos em contato para avaliar o cenário da sua operação e o fluxo de implantação.</p>',
      "</div>",
      '<p id="lead-form-error" class="lead-modal__error" role="alert" hidden></p>',
      '<form id="lead-form" class="lead-modal__form" novalidate>',
      '<div class="field field--honeypot">',
      '<label for="lead-website">Website</label>',
      '<input type="text" id="lead-website" name="website" autocomplete="off" tabindex="-1" />',
      "</div>",
      '<div class="lead-modal__grid">',
      '<div class="field">',
      '<label class="field__label" for="lead-nome">Nome completo *</label>',
      '<input class="field__input" type="text" id="lead-nome" name="nome" required autocomplete="name" />',
      "</div>",
      '<div class="field">',
      '<label class="field__label" for="lead-email">E-mail *</label>',
      '<input class="field__input" type="email" id="lead-email" name="email" required autocomplete="email" />',
      "</div>",
      '<div class="field">',
      '<label class="field__label" for="lead-tel">Telefone / WhatsApp *</label>',
      '<input class="field__input" type="tel" id="lead-tel" name="telefone" required autocomplete="tel" />',
      "</div>",
      '<div class="field">',
      '<label class="field__label" for="lead-empresa">Empresa <span class="field__optional">(opcional)</span></label>',
      '<input class="field__input" type="text" id="lead-empresa" name="empresa" autocomplete="organization" />',
      "</div>",
      '<div class="field field--full">',
      '<label class="field__label" for="lead-estado">Estado *</label>',
      '<select id="lead-estado" class="field__input" name="estado" required>',
      '<option value="">Selecione o estado</option>',
      "</select>",
      "</div>",
      '<div class="field field--full city-field" data-city-field hidden>',
      '<label class="field__label" for="lead-cidade-filter">Cidade *</label>',
      '<p class="field__hint field__hint--above">Digite para filtrar e escolha na lista.</p>',
      '<input type="text" class="field__input city-combo__filter" id="lead-cidade-filter" autocomplete="off" disabled aria-autocomplete="list" aria-controls="lead-cidade-list" />',
      '<input type="hidden" id="lead-cidade" name="cidade_id" value="" />',
      '<div id="lead-cidade-list" class="city-combo__list" role="listbox" hidden></div>',
      "</div>",
      '<div class="field field--full">',
      '<label class="field__label" for="lead-msg">Mensagem <span class="field__optional">(opcional)</span></label>',
      '<textarea class="field__input field__textarea" id="lead-msg" name="mensagem" rows="4"></textarea>',
      "</div>",
      "</div>",
      '<fieldset class="lead-modal__fieldset">',
      '<legend class="field__label">Como nos encontrou? *</legend>',
      '<div class="lead-modal__radios">',
      '<label class="lead-modal__radio"><input type="radio" name="fonte" value="google" /> Google</label>',
      '<label class="lead-modal__radio"><input type="radio" name="fonte" value="linkedin" /> LinkedIn</label>',
      '<label class="lead-modal__radio"><input type="radio" name="fonte" value="facebook" /> Facebook</label>',
      '<label class="lead-modal__radio"><input type="radio" name="fonte" value="instagram" /> Instagram</label>',
      '<label class="lead-modal__radio"><input type="radio" name="fonte" value="indicacao" /> Indicação</label>',
      '<label class="lead-modal__radio"><input type="radio" name="fonte" value="outro" /> Outro</label>',
      "</div>",
      '<div class="lead-modal__fonte-outro" data-fonte-outro hidden>',
      '<label class="field__label" for="lead-fonte-outro-text">Qual? *</label>',
      '<input class="field__input" type="text" id="lead-fonte-outro-text" name="fonte_outro" autocomplete="off" />',
      "</div>",
      "</fieldset>",
      '<div class="lead-modal__actions">',
      '<button type="button" class="btn btn--secondary" data-lead-modal-close>Cancelar</button>',
      '<button type="submit" class="btn btn--primary" id="lead-submit">',
      '<span class="lead-modal__submit-label">Enviar solicitação</span>',
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

  document.addEventListener(
    "click",
    function (e) {
      if (!e.target.closest("[data-open-lead-modal]")) return;
      var nav = document.querySelector("[data-nav]");
      var nt = document.querySelector("[data-nav-toggle]");
      if (nav) nav.classList.remove("is-open");
      if (nt) nt.setAttribute("aria-expanded", "false");
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
