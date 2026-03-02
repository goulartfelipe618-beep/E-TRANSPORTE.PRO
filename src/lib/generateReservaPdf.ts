import jsPDF from "jspdf";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type ReservaRow = Tables<"reservas_transfer">;

const tipoMap: Record<string, string> = {
  somente_ida: "Somente Ida",
  ida_e_volta: "Ida e Volta",
  por_hora: "Por Hora",
};

const statusMap: Record<string, string> = {
  confirmada: "Confirmada",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

function formatCurrency(val: number | null) {
  if (val == null) return "—";
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(d: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return d; }
}

function loadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("no ctx");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

async function geocodeAddress(address: string, provider: string, apiKey: string): Promise<[number, number] | null> {
  if (!address || !apiKey) return null;
  try {
    if (provider === "mapbox") {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${apiKey}&limit=1`);
      const data = await res.json();
      if (data.features?.[0]?.center) return [data.features[0].center[0], data.features[0].center[1]];
    } else if (provider === "google") {
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
      const data = await res.json();
      if (data.results?.[0]?.geometry?.location) {
        const loc = data.results[0].geometry.location;
        return [loc.lng, loc.lat];
      }
    }
  } catch { /* ignore */ }
  return null;
}

function buildStaticMapUrl(provider: string, apiKey: string, points: [number, number][]): string {
  if (provider === "mapbox") {
    const markers = points.map((p, i) => `pin-l-${i === 0 ? "a" : "b"}+000000(${p[0]},${p[1]})`).join(",");
    return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${markers}/auto/560x200@2x?padding=60&access_token=${apiKey}`;
  } else {
    const markers = points.map((p, i) => `markers=color:black|label:${i === 0 ? "A" : "B"}|${p[1]},${p[0]}`).join("&");
    return `https://maps.googleapis.com/maps/api/staticmap?size=560x200&scale=2&${markers}&key=${apiKey}`;
  }
}

async function fetchContractSettings(): Promise<Record<string, string>> {
  const { data } = await supabase.from("system_settings").select("key, value").like("key", "contrato_%");
  const map: Record<string, string> = {};
  data?.forEach((r) => { if (r.value) map[r.key] = r.value; });
  return map;
}

// ── Colors (black theme) ──
const brand: [number, number, number] = [15, 15, 15];
const dark: [number, number, number] = [15, 23, 42];
const text: [number, number, number] = [51, 65, 85];
const muted: [number, number, number] = [120, 120, 120];
const lightBg: [number, number, number] = [245, 245, 245];
const white: [number, number, number] = [255, 255, 255];
const divider: [number, number, number] = [210, 210, 210];

export async function generateReservaPdf(
  reserva: ReservaRow,
  config: { projectName: string; logoUrl: string; mapProvider?: string; mapApiKey?: string }
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ── Helpers ──
  function sectionHeader(title: string) {
    doc.setFillColor(...brand);
    doc.rect(margin, y, contentW, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...white);
    doc.text(title, margin + 3, y + 5);
    y += 10;
  }

  function infoRow(label: string, value: string, col2Label?: string, col2Value?: string) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(label, margin + 2, y);
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text(value || "—", margin + 2, y + 5);
    if (col2Label) {
      doc.setFontSize(7);
      doc.setTextColor(...muted);
      doc.text(col2Label, margin + contentW / 2, y);
      doc.setFontSize(9);
      doc.setTextColor(...dark);
      doc.text(col2Value || "—", margin + contentW / 2, y + 5);
    }
    y += 10;
  }

  function checkNewPage(needed: number) {
    if (y + needed > pageH - 20) {
      addFooter();
      doc.addPage();
      y = 14;
    }
  }

  function addFooter() {
    const footerY = pageH - 10;
    doc.setDrawColor(...divider);
    doc.setLineWidth(0.2);
    doc.line(margin, footerY - 4, margin + contentW, footerY - 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...muted);
    doc.text(
      `${config.projectName} • Gerado em ${new Date().toLocaleString("pt-BR")} • Confirmação de reserva`,
      pageW / 2, footerY, { align: "center" }
    );
  }

  // ════════════════════════════════════════════
  // PAGE 1 — CONFIRMAÇÃO DE RESERVA
  // ════════════════════════════════════════════

  // Header bar
  doc.setFillColor(...brand);
  doc.rect(0, 0, pageW, 28, "F");

  let logoLoaded = false;
  if (config.logoUrl) {
    try {
      const img = await loadImage(config.logoUrl);
      doc.addImage(img, "PNG", margin, 4, 20, 20);
      logoLoaded = true;
    } catch { /* skip */ }
  }

  const textX = logoLoaded ? margin + 24 : margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...white);
  doc.text(config.projectName || "TransExec", textX, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  doc.text("CONFIRMAÇÃO DE RESERVA", textX, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...white);
  doc.text(`Nº ${reserva.id.substring(0, 8).toUpperCase()}`, pageW - margin, 14, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(new Date(reserva.created_at).toLocaleDateString("pt-BR"), pageW - margin, 20, { align: "right" });

  y = 34;

  // Status badge
  const statusLabel = (statusMap[reserva.status] || reserva.status).toUpperCase();
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentW, 12, 2, 2, "F");
  doc.setDrawColor(...brand);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentW, 12, 2, 2, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...brand);
  doc.text(statusLabel, margin + 4, y + 7.5);
  const tipoLabel = tipoMap[reserva.tipo_viagem] || reserva.tipo_viagem;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...muted);
  doc.setFontSize(8);
  doc.text(tipoLabel, pageW - margin - 4, y + 7.5, { align: "right" });
  y += 18;

  // Dados do Cliente
  sectionHeader("DADOS DO CLIENTE");
  infoRow("NOME", reserva.cliente_nome || "—", "TELEFONE", reserva.cliente_telefone || "—");
  infoRow("E-MAIL", reserva.cliente_email || "—", "CPF / CNPJ", reserva.cliente_cpf_cnpj || "—");
  if (reserva.cliente_origem) infoRow("COMO NOS ENCONTROU", reserva.cliente_origem);

  // Map
  if (config.mapProvider && config.mapApiKey) {
    checkNewPage(55);
    const addresses: string[] = [];
    if (reserva.tipo_viagem === "por_hora") {
      if (reserva.por_hora_endereco_inicio) addresses.push(reserva.por_hora_endereco_inicio);
    } else {
      if (reserva.ida_embarque) addresses.push(reserva.ida_embarque);
      if (reserva.ida_destino) addresses.push(reserva.ida_destino);
    }
    if (addresses.length > 0) {
      const coords: [number, number][] = [];
      for (const addr of addresses) {
        const c = await geocodeAddress(addr, config.mapProvider, config.mapApiKey);
        if (c) coords.push(c);
      }
      if (coords.length > 0) {
        const mapUrl = buildStaticMapUrl(config.mapProvider, config.mapApiKey, coords);
        try {
          const mapImg = await loadImage(mapUrl);
          doc.addImage(mapImg, "PNG", margin, y, contentW, 40);
          doc.setDrawColor(...divider);
          doc.setLineWidth(0.3);
          doc.rect(margin, y, contentW, 40, "S");
          y += 44;
        } catch { /* skip map */ }
      }
    }
  }

  // Detalhes da Viagem
  checkNewPage(40);
  sectionHeader("DETALHES DA VIAGEM");

  if (reserva.tipo_viagem === "somente_ida" || reserva.tipo_viagem === "ida_e_volta") {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...brand);
    doc.text("→ IDA", margin + 2, y); y += 6;
    infoRow("EMBARQUE", reserva.ida_embarque || "—", "DESTINO", reserva.ida_destino || "—");
    infoRow("DATA", formatDate(reserva.ida_data), "HORA", reserva.ida_hora || "—");
    infoRow("PASSAGEIROS", String(reserva.ida_passageiros ?? "—"), "CUPOM", reserva.ida_cupom || "—");
    if (reserva.ida_mensagem) infoRow("MENSAGEM", reserva.ida_mensagem);
  }

  if (reserva.tipo_viagem === "ida_e_volta") {
    checkNewPage(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...brand);
    doc.text("← VOLTA", margin + 2, y); y += 6;
    infoRow("EMBARQUE", reserva.volta_embarque || "—", "DESTINO", reserva.volta_destino || "—");
    infoRow("DATA", formatDate(reserva.volta_data), "HORA", reserva.volta_hora || "—");
    infoRow("PASSAGEIROS", String(reserva.volta_passageiros ?? "—"), "CUPOM", reserva.volta_cupom || "—");
    if (reserva.volta_mensagem) infoRow("MENSAGEM", reserva.volta_mensagem);
  }

  if (reserva.tipo_viagem === "por_hora") {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...brand);
    doc.text("⏱ POR HORA", margin + 2, y); y += 6;
    infoRow("ENDEREÇO INÍCIO", reserva.por_hora_endereco_inicio || "—", "ENCERRAMENTO", reserva.por_hora_ponto_encerramento || "—");
    infoRow("DATA", formatDate(reserva.por_hora_data), "HORA", reserva.por_hora_hora || "—");
    infoRow("PASSAGEIROS", String(reserva.por_hora_passageiros ?? "—"), "QTD. HORAS", String(reserva.por_hora_qtd_horas ?? "—"));
    if (reserva.por_hora_itinerario) infoRow("ITINERÁRIO", reserva.por_hora_itinerario);
    if (reserva.por_hora_cupom) infoRow("CUPOM", reserva.por_hora_cupom);
  }

  // Veículo & Motorista
  if (reserva.veiculo || reserva.motorista_nome) {
    checkNewPage(20);
    sectionHeader("VEÍCULO & MOTORISTA");
    infoRow("VEÍCULO", reserva.veiculo || "—", "MOTORISTA", reserva.motorista_nome || "—");
    if (reserva.motorista_telefone) infoRow("TEL. MOTORISTA", reserva.motorista_telefone);
  }

  // Pagamento
  checkNewPage(35);
  sectionHeader("PAGAMENTO");
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentW, 28, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text("Valor Base", margin + 4, y + 6);
  doc.setTextColor(...dark);
  doc.setFontSize(9);
  doc.text(formatCurrency(reserva.valor_base), margin + 40, y + 6);

  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text("Desconto", margin + 4, y + 13);
  doc.setTextColor(...dark);
  doc.setFontSize(9);
  doc.text(reserva.desconto_percentual ? `${reserva.desconto_percentual}%` : "—", margin + 40, y + 13);

  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text("Pagamento", margin + 4, y + 20);
  doc.setTextColor(...dark);
  doc.setFontSize(9);
  doc.text(reserva.metodo_pagamento || "—", margin + 40, y + 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text("TOTAL", pageW - margin - 4, y + 8, { align: "right" });
  doc.setFontSize(18);
  doc.setTextColor(...brand);
  doc.text(formatCurrency(reserva.valor_total), pageW - margin - 4, y + 20, { align: "right" });
  y += 34;

  // Observações
  if (reserva.observacoes) {
    checkNewPage(20);
    sectionHeader("OBSERVAÇÕES");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...text);
    const lines = doc.splitTextToSize(reserva.observacoes, contentW - 8);
    doc.text(lines, margin + 2, y);
    y += lines.length * 4 + 4;
  }

  addFooter();

  // ════════════════════════════════════════════
  // PAGES 2+ — CONTRATO
  // ════════════════════════════════════════════
  const contract = await fetchContractSettings();
  const hasContract = contract["contrato_termos"] || contract["contrato_cancelamento"] || contract["contrato_clausulas"];

  if (hasContract) {
    doc.addPage();
    y = 0;

    // Contract header bar
    doc.setFillColor(...brand);
    doc.rect(0, 0, pageW, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...white);
    doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇO", pageW / 2, 13, { align: "center" });
    y = 28;

    // Company data
    const companyName = contract["contrato_empresa_nome"];
    const companyCnpj = contract["contrato_empresa_cnpj"];
    const companyAddr = contract["contrato_empresa_endereco"];

    if (companyName || companyCnpj || companyAddr) {
      doc.setFillColor(...lightBg);
      doc.roundedRect(margin, y, contentW, companyCnpj ? 22 : 14, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...dark);
      doc.text(companyName || "", margin + 4, y + 7);

      if (companyCnpj) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...muted);
        doc.text(`CNPJ: ${companyCnpj}`, pageW - margin - 4, y + 7, { align: "right" });
      }

      if (companyAddr) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...text);
        doc.text(companyAddr, margin + 4, y + 15);
      }

      y += companyCnpj ? 28 : 20;
    }

    // Client reference
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...brand);
    doc.text("CONTRATANTE", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text(`${reserva.cliente_nome || "—"} • ${reserva.cliente_cpf_cnpj || "—"}`, margin, y);
    y += 4;
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(`Reserva Nº ${reserva.id.substring(0, 8).toUpperCase()} • ${formatDate(reserva.created_at)}`, margin, y);
    y += 10;

    // Render long text sections
    function renderContractSection(title: string, content: string) {
      checkNewPage(20);
      // Section title
      doc.setFillColor(...brand);
      doc.rect(margin, y, contentW, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...white);
      doc.text(title, margin + 3, y + 5);
      y += 11;

      // Content
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...text);
      const lines = doc.splitTextToSize(content, contentW - 6);
      const lineHeight = 3.8;

      for (let i = 0; i < lines.length; i++) {
        if (y + lineHeight > pageH - 20) {
          addFooter();
          doc.addPage();
          y = 14;
        }
        doc.text(lines[i], margin + 3, y);
        y += lineHeight;
      }
      y += 6;
    }

    if (contract["contrato_termos"]) {
      renderContractSection("TERMOS GERAIS", contract["contrato_termos"]);
    }

    if (contract["contrato_cancelamento"]) {
      renderContractSection("POLÍTICA DE CANCELAMENTO", contract["contrato_cancelamento"]);
    }

    if (contract["contrato_clausulas"]) {
      renderContractSection("CLÁUSULAS ADICIONAIS", contract["contrato_clausulas"]);
    }

    // Signature area
    checkNewPage(40);
    y += 8;
    doc.setDrawColor(...divider);
    doc.setLineWidth(0.3);

    // Two signature lines
    const sigW = (contentW - 10) / 2;
    doc.line(margin, y, margin + sigW, y);
    doc.line(margin + sigW + 10, y, margin + contentW, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text("CONTRATANTE", margin + sigW / 2, y + 5, { align: "center" });
    doc.text("CONTRATADO", margin + sigW + 10 + sigW / 2, y + 5, { align: "center" });

    y += 12;
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(`Data: ____/____/________`, margin, y);
    doc.text(`Local: _______________________________`, margin + contentW / 2, y);

    addFooter();
  }

  // Save
  const clientName = (reserva.cliente_nome || "reserva").replace(/\s+/g, "_").toLowerCase();
  doc.save(`confirmacao_${clientName}_${reserva.id.substring(0, 8)}.pdf`);
}
