/**
 * Payload canônico — lead E-Transporte.pro
 * Não altere chaves sem versionar integrações (n8n, EspoCRM, Evolution, BI).
 *
 * @typedef {Object} LeadPayload
 * @property {string} nome
 * @property {string} whatsapp
 * @property {string} telefone_limpo
 * @property {string} estado
 * @property {string} cidade
 * @property {string} cidade_nome
 * @property {string} empresa
 * @property {string} mensagem
 * @property {string} lead_source
 * @property {string} origem
 * @property {string} origem_pagina
 * @property {string} origem_url
 * @property {string} origem_host
 * @property {string} created_at
 */

(function (global) {
  "use strict";

  var LEAD_SOURCE_DEFAULT = "Landing Page";

  /** Webhook n8n — produção (formulário Solicitar Demonstração) */
  var N8N_LEAD_WEBHOOK =
    "https://n8n.e-transporte.pro/webhook/eb54332d-b6ee-4922-99af-c4266c73b44c";

  function buildLeadPayload(input) {
    var data = input || {};
    return {
      nome: String(data.nome || ""),
      whatsapp: String(data.whatsapp || ""),
      telefone_limpo: String(data.telefone_limpo || ""),
      estado: String(data.estado || ""),
      cidade: String(data.cidade || ""),
      cidade_nome: String(data.cidade_nome || ""),
      empresa: String(data.empresa || ""),
      mensagem: String(data.mensagem || ""),
      lead_source: String(data.lead_source || LEAD_SOURCE_DEFAULT),
      origem: String(data.origem || ""),
      origem_pagina: String(data.origem_pagina || ""),
      origem_url: String(data.origem_url || ""),
      origem_host: String(data.origem_host || ""),
      created_at: String(data.created_at || new Date().toISOString()),
    };
  }

  global.ETransporteLeadPayload = {
    VERSION: "1",
    LEAD_SOURCE_DEFAULT: LEAD_SOURCE_DEFAULT,
    N8N_LEAD_WEBHOOK: N8N_LEAD_WEBHOOK,
    build: buildLeadPayload,
  };
})(typeof window !== "undefined" ? window : globalThis);
