(function () {
  "use strict";

  function maskWhatsApp(value) {
    var d = String(value || "").replace(/\D/g, "").slice(0, 11);
    if (!d.length) return "";
    if (d.length <= 2) return "(" + d;
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }

  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function resolveOrigemPagina() {
    var body = document.body;
    if (body && body.getAttribute("data-page")) {
      return body.getAttribute("data-page");
    }
    var path = window.location.pathname || "/";
    if (path === "/" || path === "/index.html") return "home";
    return path.replace(/^\//, "").replace(/\.html$/, "") || "home";
  }

  /* Modal lead + IBGE (estado → municípios) */
  function initLeadModal() {
    var root = document.querySelector("[data-lead-modal]");
    if (!root) return;

    var dialog = root.querySelector(".lead-modal__dialog");
    var form = document.getElementById("lead-form");
    var successEl = document.getElementById("lead-success");
    var successMsg = document.getElementById("lead-success-msg");
    var errEl = document.getElementById("lead-form-error");
    var selEstado = document.getElementById("lead-estado");
    var selCidade = document.getElementById("lead-cidade");
    var inputTel = document.getElementById("lead-tel");
    var inputOrigemPagina = document.getElementById("lead-origem-pagina");
    var fonteOutroWrap = root.querySelector("[data-fonte-outro]");
    var fonteOutroInput = document.getElementById("lead-fonte-outro-text");
    var submitBtn = document.getElementById("lead-submit");
    var submitLabel = submitBtn && submitBtn.querySelector(".lead-modal__submit-label");
    var submitWait = submitBtn && submitBtn.querySelector(".lead-modal__submit-wait");

    var estadosLoaded = false;
    var municipiosFull = [];
    var lastFocus = null;
    var DIALOG_SUCCESS = "lead-modal__dialog--success";

    function clearDialogSuccessState() {
      if (dialog) dialog.classList.remove(DIALOG_SUCCESS);
    }

    var N8N_LEAD_WEBHOOK =
      "https://n8n.e-transporte.pro/webhook/eb54332d-b6ee-4922-99af-c4266c73b44c";

    var IBGE_ESTADOS = "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome";
    function ibgeMunicipiosUrl(estadoId) {
      return (
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados/" +
        estadoId +
        "/municipios?orderBy=nome"
      );
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
          return !el.closest("[hidden]") && el.getAttribute("aria-hidden") !== "true";
        });
    }

    function resetCidadeSelect(loading) {
      if (!selCidade) return;
      selCidade.innerHTML = "";
      var opt = document.createElement("option");
      opt.value = "";
      if (loading) {
        opt.textContent = "Carregando cidades…";
        selCidade.disabled = true;
      } else {
        opt.textContent = "Selecione o estado primeiro";
        selCidade.disabled = true;
      }
      selCidade.appendChild(opt);
    }

    function populateCidadeSelect(list) {
      if (!selCidade) return;
      selCidade.innerHTML = "";
      var placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Selecione a cidade";
      selCidade.appendChild(placeholder);
      list.forEach(function (m) {
        var opt = document.createElement("option");
        opt.value = String(m.id);
        opt.textContent = m.nome;
        selCidade.appendChild(opt);
      });
      selCidade.disabled = false;
    }

    function openModal() {
      lastFocus = document.activeElement;
      clearDialogSuccessState();
      root.removeAttribute("hidden");
      root.classList.add("is-open");
      document.documentElement.style.overflow = "hidden";
      clearError();
      if (form) form.hidden = false;
      if (successEl) successEl.hidden = true;
      if (inputOrigemPagina) inputOrigemPagina.value = resolveOrigemPagina();
      if (form) {
        form.reset();
        resetCidadeSelect(false);
        if (fonteOutroWrap) fonteOutroWrap.hidden = true;
        if (fonteOutroInput) fonteOutroInput.value = "";
        if (inputOrigemPagina) inputOrigemPagina.value = resolveOrigemPagina();
      }
      if (!estadosLoaded) loadEstados();
      if (dialog) dialog.scrollTop = 0;
      window.requestAnimationFrame(function () {
        var nome = document.getElementById("lead-nome");
        if (nome) nome.focus();
      });
    }

    function closeModal() {
      clearDialogSuccessState();
      root.classList.remove("is-open");
      root.setAttribute("hidden", "");
      document.documentElement.style.overflow = "";
      if (lastFocus && typeof lastFocus.focus === "function") {
        try {
          lastFocus.focus();
        } catch (e2) {}
      }
    }

    function resetFormView() {
      clearDialogSuccessState();
      if (form) form.hidden = false;
      if (successEl) successEl.hidden = true;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
      }
      if (submitLabel) {
        submitLabel.hidden = false;
        submitLabel.removeAttribute("aria-hidden");
      }
      if (submitWait) {
        submitWait.hidden = true;
        submitWait.setAttribute("aria-hidden", "true");
      }
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

    if (inputTel) {
      inputTel.addEventListener("input", function () {
        var masked = maskWhatsApp(inputTel.value);
        if (inputTel.value !== masked) inputTel.value = masked;
      });
      inputTel.addEventListener("blur", function () {
        inputTel.value = maskWhatsApp(inputTel.value);
      });
    }

    if (selEstado) {
      selEstado.addEventListener("change", function () {
        clearError();
        var id = selEstado.value;
        resetCidadeSelect(false);
        municipiosFull = [];
        if (!id) return;

        resetCidadeSelect(true);
        fetch(ibgeMunicipiosUrl(id))
          .then(function (r) {
            if (!r.ok) throw new Error("ibge");
            return r.json();
          })
          .then(function (data) {
            municipiosFull = data.map(function (m) {
              return { id: m.id, nome: m.nome };
            });
            populateCidadeSelect(municipiosFull);
            selCidade.focus();
          })
          .catch(function () {
            resetCidadeSelect(false);
            showError("Não foi possível carregar as cidades. Tente outro estado ou atualize a página.");
          });
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
        var checked = root.querySelector('input[name="fonte"]:checked');
        var outro = checked && checked.value === "outro";
        if (fonteOutroWrap) fonteOutroWrap.hidden = !outro;
        if (fonteOutroInput && outro) fonteOutroInput.focus();
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
        var telMasked = (inputTel && inputTel.value.trim()) || "";
        var telDigits = digitsOnly(telMasked);
        var empresa = (document.getElementById("lead-empresa") && document.getElementById("lead-empresa").value.trim()) || "";
        var msg = (document.getElementById("lead-msg") && document.getElementById("lead-msg").value.trim()) || "";
        var estadoId = selEstado && selEstado.value;
        var estadoLabel = "";
        if (selEstado && selEstado.selectedIndex >= 0) {
          estadoLabel = selEstado.options[selEstado.selectedIndex].textContent || "";
        }
        var cidadeId = selCidade && selCidade.value ? String(selCidade.value) : "";
        var cidadeNome = "";
        if (selCidade && selCidade.selectedIndex >= 0 && cidadeId) {
          cidadeNome = selCidade.options[selCidade.selectedIndex].textContent || "";
        }
        var fonteEl = root.querySelector('input[name="fonte"]:checked');
        var fonte = fonteEl ? fonteEl.value : "";
        var fonteOutro = (fonteOutroInput && fonteOutroInput.value.trim()) || "";
        var origemPagina = (inputOrigemPagina && inputOrigemPagina.value) || resolveOrigemPagina();

        if (!nome) {
          showError("Informe seu nome completo.");
          return;
        }
        if (telDigits.length < 10) {
          showError("Informe um WhatsApp válido com DDD.");
          return;
        }
        if (!estadoId) {
          showError("Selecione o estado.");
          return;
        }
        if (!cidadeId) {
          showError("Selecione a cidade.");
          return;
        }

        var fonteLabel = "";
        if (fonte === "google") fonteLabel = "Google";
        else if (fonte === "linkedin") fonteLabel = "LinkedIn";
        else if (fonte === "facebook") fonteLabel = "Facebook";
        else if (fonte === "instagram") fonteLabel = "Instagram";
        else if (fonte === "indicacao") fonteLabel = "Indicação";
        else if (fonte === "outro") fonteLabel = fonteOutro ? "Outro: " + fonteOutro : "Outro";

        var estadoOptSel = selEstado && selEstado.options[selEstado.selectedIndex];
        var estadoSigla = estadoOptSel ? estadoOptSel.getAttribute("data-sigla") || "" : "";

        var mensagemFinal = msg;
        if (fonteLabel) {
          mensagemFinal = (mensagemFinal ? mensagemFinal + "\n\n" : "") + "Como nos encontrou: " + fonteLabel;
        }

        var buildPayload =
          window.ETransporteLeadPayload && window.ETransporteLeadPayload.build
            ? window.ETransporteLeadPayload.build
            : null;

        var payload = buildPayload
          ? buildPayload({
              nome: nome,
              whatsapp: telMasked,
              telefone_limpo: telDigits,
              estado: estadoSigla,
              cidade: cidadeId,
              cidade_nome: cidadeNome,
              empresa: empresa,
              mensagem: mensagemFinal,
              lead_source: "Landing Page",
              origem: fonteLabel,
              origem_pagina: origemPagina,
              origem_url: window.location.href,
              origem_host: window.location.hostname || "",
              created_at: new Date().toISOString(),
            })
          : {
              nome: nome,
              whatsapp: telMasked,
              telefone_limpo: telDigits,
              estado: estadoSigla,
              cidade: cidadeId,
              cidade_nome: cidadeNome,
              empresa: empresa,
              mensagem: mensagemFinal,
              lead_source: "Landing Page",
              origem: fonteLabel,
              origem_pagina: origemPagina,
              origem_url: window.location.href,
              origem_host: window.location.hostname || "",
              created_at: new Date().toISOString(),
            };

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.setAttribute("aria-busy", "true");
        }
        if (submitLabel) {
          submitLabel.hidden = true;
          submitLabel.setAttribute("aria-hidden", "true");
        }
        if (submitWait) {
          submitWait.hidden = false;
          submitWait.removeAttribute("aria-hidden");
        }

        function finishSuccess(message) {
          if (form) form.hidden = true;
          if (successEl) successEl.hidden = false;
          if (successMsg) successMsg.textContent = message;
          if (dialog) dialog.classList.add(DIALOG_SUCCESS);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute("aria-busy");
          }
          if (submitLabel) {
            submitLabel.hidden = false;
            submitLabel.removeAttribute("aria-hidden");
          }
          if (submitWait) {
            submitWait.hidden = true;
            submitWait.setAttribute("aria-hidden", "true");
          }
        }

        function releaseSubmitUi() {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute("aria-busy");
          }
          if (submitLabel) {
            submitLabel.hidden = false;
            submitLabel.removeAttribute("aria-hidden");
          }
          if (submitWait) {
            submitWait.hidden = true;
            submitWait.setAttribute("aria-hidden", "true");
          }
        }

        fetch(N8N_LEAD_WEBHOOK, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*",
          },
          body: JSON.stringify(payload),
          credentials: "omit",
          mode: "cors",
        })
          .then(function (r) {
            if (!r.ok) throw new Error("http_" + r.status);
            return r.text();
          })
          .then(function () {
            finishSuccess("Obrigado! Entraremos em contato pelo WhatsApp informado em breve.");
          })
          .catch(function () {
            showError(
              "Não foi possível enviar agora. Verifique a conexão ou tente de novo. Se persistir, escreva para contato@e-transporte.pro."
            );
            releaseSubmitUi();
          });
      });
    }
  }

  if (document.querySelector("[data-lead-modal]")) {
    initLeadModal();
  } else {
    window.addEventListener("lead-modal-ready", initLeadModal, { once: true });
  }
})();
