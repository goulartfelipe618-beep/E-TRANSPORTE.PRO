import jsPDF from "jspdf";
import type { Tables } from "@/integrations/supabase/types";

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
  try {
    return new Date(d).toLocaleDateString("pt-BR");
  } catch {
    return d;
  }
}

export async function generateReservaPdf(
  reserva: ReservaRow,
  config: { projectName: string; logoUrl: string }
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 20;

  // Colors
  const brandColor: [number, number, number] = [30, 41, 59]; // slate-800
  const accentColor: [number, number, number] = [14, 165, 233]; // sky-500
  const lightGray: [number, number, number] = [241, 245, 249]; // slate-100
  const textColor: [number, number, number] = [51, 65, 85]; // slate-700
  const mutedColor: [number, number, number] = [148, 163, 184]; // slate-400

  // ---- Header bar ----
  doc.setFillColor(...brandColor);
  doc.rect(0, 0, pageW, 38, "F");

  // Try to load logo
  let logoLoaded = false;
  if (config.logoUrl) {
    try {
      const img = await loadImage(config.logoUrl);
      doc.addImage(img, "PNG", margin, 6, 26, 26);
      logoLoaded = true;
    } catch {
      // skip logo
    }
  }

  const textX = logoLoaded ? margin + 30 : margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(config.projectName || "TransExec", textX, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 220, 240);
  doc.text("CONFIRMAÇÃO DE RESERVA", textX, 26);

  y = 48;

  // ---- Reservation ID & Status ----
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, y, contentW, 16, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text("Nº RESERVA", margin + 4, y + 5);
  doc.setTextColor(...brandColor);
  doc.setFontSize(10);
  doc.text(reserva.id.substring(0, 8).toUpperCase(), margin + 4, y + 12);

  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text("STATUS", margin + contentW / 2, y + 5);
  doc.setTextColor(...accentColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text((statusMap[reserva.status] || reserva.status).toUpperCase(), margin + contentW / 2, y + 12);

  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text("DATA EMISSÃO", margin + contentW * 0.75, y + 5);
  doc.setTextColor(...brandColor);
  doc.setFontSize(10);
  doc.text(new Date(reserva.created_at).toLocaleDateString("pt-BR"), margin + contentW * 0.75, y + 12);

  y += 24;

  // ---- Section helper ----
  function sectionTitle(title: string) {
    doc.setFillColor(...accentColor);
    doc.rect(margin, y, 3, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...brandColor);
    doc.text(title, margin + 6, y + 6);
    y += 12;
  }

  function row(label: string, value: string) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.text(label, margin + 4, y);
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(value || "—", margin + 52, y);
    y += 7;
  }

  function divider() {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentW, y);
    y += 5;
  }

  // ---- Client Info ----
  sectionTitle("DADOS DO CLIENTE");
  row("Nome", reserva.cliente_nome || "—");
  row("Telefone", reserva.cliente_telefone || "—");
  row("E-mail", reserva.cliente_email || "—");
  row("CPF / CNPJ", reserva.cliente_cpf_cnpj || "—");
  row("Origem", reserva.cliente_origem || "—");
  y += 3;
  divider();

  // ---- Trip Info ----
  sectionTitle("DADOS DA VIAGEM");
  row("Tipo", tipoMap[reserva.tipo_viagem] || reserva.tipo_viagem);

  if (reserva.tipo_viagem === "somente_ida" || reserva.tipo_viagem === "ida_e_volta") {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...accentColor);
    doc.text("→ IDA", margin + 4, y);
    y += 7;
    row("Passageiros", String(reserva.ida_passageiros ?? "—"));
    row("Embarque", reserva.ida_embarque || "—");
    row("Destino", reserva.ida_destino || "—");
    row("Data", formatDate(reserva.ida_data));
    row("Hora", reserva.ida_hora || "—");
    if (reserva.ida_mensagem) row("Mensagem", reserva.ida_mensagem);
    if (reserva.ida_cupom) row("Cupom", reserva.ida_cupom);
  }

  if (reserva.tipo_viagem === "ida_e_volta") {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...accentColor);
    doc.text("← VOLTA", margin + 4, y);
    y += 7;
    row("Passageiros", String(reserva.volta_passageiros ?? "—"));
    row("Embarque", reserva.volta_embarque || "—");
    row("Destino", reserva.volta_destino || "—");
    row("Data", formatDate(reserva.volta_data));
    row("Hora", reserva.volta_hora || "—");
    if (reserva.volta_mensagem) row("Mensagem", reserva.volta_mensagem);
    if (reserva.volta_cupom) row("Cupom", reserva.volta_cupom);
  }

  if (reserva.tipo_viagem === "por_hora") {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...accentColor);
    doc.text("⏱ POR HORA", margin + 4, y);
    y += 7;
    row("Passageiros", String(reserva.por_hora_passageiros ?? "—"));
    row("Endereço Início", reserva.por_hora_endereco_inicio || "—");
    row("Data", formatDate(reserva.por_hora_data));
    row("Hora", reserva.por_hora_hora || "—");
    row("Qtd. Horas", String(reserva.por_hora_qtd_horas ?? "—"));
    row("Encerramento", reserva.por_hora_ponto_encerramento || "—");
    if (reserva.por_hora_itinerario) row("Itinerário", reserva.por_hora_itinerario);
    if (reserva.por_hora_cupom) row("Cupom", reserva.por_hora_cupom);
  }

  y += 3;
  divider();

  // ---- Vehicle & Driver ----
  if (reserva.veiculo || reserva.motorista_nome) {
    sectionTitle("VEÍCULO & MOTORISTA");
    row("Veículo", reserva.veiculo || "—");
    row("Motorista", reserva.motorista_nome || "—");
    row("Tel. Motorista", reserva.motorista_telefone || "—");
    y += 3;
    divider();
  }

  // ---- Payment ----
  sectionTitle("PAGAMENTO");
  row("Valor Base", formatCurrency(reserva.valor_base));
  row("Desconto", reserva.desconto_percentual ? `${reserva.desconto_percentual}%` : "—");
  row("Pagamento", reserva.metodo_pagamento || "—");

  // Total box
  y += 3;
  doc.setFillColor(...brandColor);
  doc.roundedRect(margin, y, contentW, 14, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("VALOR TOTAL", margin + 4, y + 9);
  doc.setFontSize(14);
  doc.text(formatCurrency(reserva.valor_total), margin + contentW - 4, y + 9, { align: "right" });

  y += 22;

  // ---- Observations ----
  if (reserva.observacoes) {
    sectionTitle("OBSERVAÇÕES");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    const lines = doc.splitTextToSize(reserva.observacoes, contentW - 8);
    doc.text(lines, margin + 4, y);
    y += lines.length * 5 + 5;
  }

  // ---- Footer ----
  const footerY = doc.internal.pageSize.getHeight() - 14;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, margin + contentW, footerY - 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...mutedColor);
  doc.text(
    `${config.projectName} • Documento gerado em ${new Date().toLocaleString("pt-BR")} • Este documento é uma confirmação de reserva.`,
    pageW / 2,
    footerY,
    { align: "center" }
  );

  // Save
  const clientName = (reserva.cliente_nome || "reserva").replace(/\s+/g, "_").toLowerCase();
  doc.save(`confirmacao_${clientName}_${reserva.id.substring(0, 8)}.pdf`);
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
