(function () {
  "use strict";

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
    var cityListEl = document.getElementById("lead-cidade-list");
    var filterCidade = document.getElementById("lead-cidade-filter");
    var cityField = root.querySelector("[data-city-field]");
    var selectedCidadeNome = "";
    var syncingCityFilter = false;
    var cityFilterTimer = null;
    var fonteOutroWrap = root.querySelector("[data-fonte-outro]");
    var fonteOutroInput = document.getElementById("lead-fonte-outro-text");
    var submitBtn = document.getElementById("lead-submit");
    var submitLabel = submitBtn && submitBtn.querySelector(".lead-modal__submit-label");
    var submitWait = submitBtn && submitBtn.querySelector(".lead-modal__submit-wait");

    var estadosLoaded = false;
    var municipiosCache = [];
    var municipiosFull = [];
    var lastFocus = null;
    var DIALOG_SUCCESS = "lead-modal__dialog--success";

    function clearDialogSuccessState() {
      if (dialog) dialog.classList.remove(DIALOG_SUCCESS);
    }

    /** n8n: formulário «Solicitar acesso» — sempre este webhook de produção */
    var N8N_LEAD_WEBHOOK =
      "https://n8n.e-transporte.pro/webhook/eb54332d-b6ee-4922-99af-c4266c73b44c";

    function resolveN8nWebhookUrl() {
      return N8N_LEAD_WEBHOOK;
    }

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
          return !el.closest("[hidden]") && el.getAttribute("aria-hidden") !== "true";
        });
    }

    function openModal() {
      lastFocus = document.activeElement;
      clearDialogSuccessState();
      root.removeAttribute("hidden");
      root.classList.add("is-open");
      /* overflow no documentElement evita cortar widgets fixed ligados ao body em WebKit */
      document.documentElement.style.overflow = "hidden";
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

    function setCityEnabled(on) {
      if (!cityField || !selCidade || !filterCidade) return;
      if (!on) {
        cityField.hidden = true;
        selCidade.value = "";
        selCidade.removeAttribute("required");
        selectedCidadeNome = "";
        filterCidade.value = "";
        filterCidade.disabled = true;
        if (cityListEl) {
          cityListEl.innerHTML = "";
          cityListEl.hidden = true;
        }
        municipiosFull = [];
        municipiosCache = [];
        return;
      }
      cityField.hidden = false;
      filterCidade.disabled = false;
      selCidade.setAttribute("required", "");
    }

    function selectCity(id, nome) {
      if (!selCidade || !filterCidade) return;
      selCidade.value = String(id);
      selectedCidadeNome = nome || "";
      syncingCityFilter = true;
      filterCidade.value = nome || "";
      syncingCityFilter = false;
      clearError();
      if (cityListEl) {
        cityListEl.hidden = true;
      }
    }

    function renderCityList(list) {
      if (!cityListEl) return;
      cityListEl.innerHTML = "";
      if (!list.length) {
        var empty = document.createElement("p");
        empty.className = "city-combo__empty";
        empty.setAttribute("role", "status");
        empty.textContent = "Nenhuma cidade encontrada para esta busca.";
        cityListEl.appendChild(empty);
        cityListEl.hidden = false;
        return;
      }
      list.forEach(function (m) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "city-combo__option";
        btn.setAttribute("role", "option");
        btn.setAttribute("data-id", String(m.id));
        btn.textContent = m.nome;
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          selectCity(m.id, m.nome);
        });
        cityListEl.appendChild(btn);
      });
      cityListEl.hidden = false;
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
      renderCityList(municipiosCache);
    }

    if (selEstado) {
      selEstado.addEventListener("change", function () {
        clearError();
        var id = selEstado.value;
        setCityEnabled(false);
        if (!id) return;

        selCidade.value = "";
        selectedCidadeNome = "";
        if (cityListEl) {
          cityListEl.innerHTML = "";
          cityListEl.hidden = true;
        }
        cityField.hidden = false;
        filterCidade.disabled = true;

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
            renderCityList(municipiosCache);
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
        if (syncingCityFilter) return;
        selCidade.value = "";
        selectedCidadeNome = "";
        window.clearTimeout(cityFilterTimer);
        cityFilterTimer = window.setTimeout(function () {
          applyCidadeFilter();
        }, 180);
      });
      filterCidade.addEventListener("focus", function () {
        if (!municipiosFull.length || !cityListEl) return;
        applyCidadeFilter();
      });
    }

    root.addEventListener("click", function (e) {
      if (!cityField || !cityListEl || cityListEl.hidden) return;
      if (cityField.contains(e.target)) return;
      cityListEl.hidden = true;
    });

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
        var cidadeNome = "";
        if (selCidade && selCidade.value) {
          cidadeNome = selectedCidadeNome;
          if (!cidadeNome && municipiosFull.length) {
            var cid = String(selCidade.value);
            for (var ci = 0; ci < municipiosFull.length; ci++) {
              if (String(municipiosFull[ci].id) === cid) {
                cidadeNome = municipiosFull[ci].nome;
                break;
              }
            }
          }
        }
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

        var estadoOptSel = selEstado && selEstado.options[selEstado.selectedIndex];
        var estadoSigla = estadoOptSel ? estadoOptSel.getAttribute("data-sigla") || "" : "";
        var cidadeId = selCidade && selCidade.value ? String(selCidade.value) : "";

        var webhookUrl = resolveN8nWebhookUrl();
        var ambienteN8n = webhookUrl.indexOf("webhook-test") !== -1 ? "teste" : "producao";

        var payload = {
          nome: nome,
          email: email,
          telefone: tel,
          estado_id: estadoId,
          estado_texto: estadoLabel,
          estado_sigla: estadoSigla,
          cidade_id: cidadeId,
          cidade_nome: cidadeNome,
          empresa: empresa,
          fonte: fonte,
          fonte_label: fonteLabel,
          fonte_outro: fonte === "outro" ? fonteOutro : "",
          mensagem: msg,
          origem_url: window.location.href,
          origem_host: window.location.hostname || "",
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
          idioma_navegador: typeof navigator !== "undefined" ? navigator.language || "" : "",
          enviado_em_iso: new Date().toISOString(),
          ambiente_n8n: ambienteN8n,
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

        fetch(webhookUrl, {
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
            finishSuccess(
              "Obrigado! Entraremos em contato pelo e-mail ou telefone informados em breve."
            );
          })
          .catch(function () {
            showError(
              "Não foi possível enviar agora. Verifique a conexão ou tente de novo em instantes. Se persistir, escreva para contato@e-transporte.pro."
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
