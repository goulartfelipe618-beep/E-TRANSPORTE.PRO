import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Download, Trash2, CalendarIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import jsPDF from "jspdf";

type LayoutType = "simples" | "destaque" | "moldura";

interface ReceptivoRecord {
  id: string;
  cliente: string;
  layout: LayoutType;
  voo: string;
  destino: string;
  data: string;
  hora: string;
  createdAt: string;
}

const LAYOUTS: { key: LayoutType; title: string; desc: string }[] = [
  { key: "simples", title: "Simples / Profissional", desc: "Nome em destaque, logo no rodapé" },
  { key: "destaque", title: "Destaque da Marca", desc: "Logo grande, visual marcante" },
  { key: "moldura", title: "Moldura Elegante", desc: "Logo centralizada, borda fina" },
];

const HORAS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

function loadImageAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function generateReceptivoPdf(
  layout: LayoutType,
  nome: string,
  voo: string,
  destino: string,
  data: string,
  hora: string,
  logoBase64: string | null,
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();  // 297
  const H = doc.internal.pageSize.getHeight(); // 210

  const black: [number, number, number] = [15, 15, 15];
  const white: [number, number, number] = [255, 255, 255];
  const gold: [number, number, number] = [200, 165, 70];
  const muted: [number, number, number] = [140, 140, 140];

  if (layout === "simples") {
    // Clean white background with strong name
    doc.setFillColor(...white);
    doc.rect(0, 0, W, H, "F");

    // Subtle top line
    doc.setFillColor(...black);
    doc.rect(0, 0, W, 3, "F");

    // Name centered big
    doc.setFont("helvetica", "bold");
    doc.setFontSize(52);
    doc.setTextColor(...black);
    doc.text(nome.toUpperCase(), W / 2, H * 0.42, { align: "center" });

    // Subtitle line
    const subParts: string[] = [];
    if (voo) subParts.push(`Voo: ${voo}`);
    if (destino) subParts.push(destino);
    if (data) subParts.push(data);
    if (hora) subParts.push(hora);
    if (subParts.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(...muted);
      doc.text(subParts.join("  •  "), W / 2, H * 0.52, { align: "center" });
    }

    // Bottom bar with logo
    doc.setFillColor(...black);
    doc.rect(0, H - 22, W, 22, "F");
    if (logoBase64) {
      try { doc.addImage(logoBase64, "PNG", W / 2 - 15, H - 19, 30, 16); } catch { /* skip */ }
    }

  } else if (layout === "destaque") {
    // Dark background, brand-focused
    doc.setFillColor(...black);
    doc.rect(0, 0, W, H, "F");

    // Gold accent lines
    doc.setDrawColor(...gold);
    doc.setLineWidth(1.5);
    doc.line(20, 20, W - 20, 20);
    doc.line(20, H - 20, W - 20, H - 20);

    // Logo large centered top
    if (logoBase64) {
      try { doc.addImage(logoBase64, "PNG", W / 2 - 25, 30, 50, 30); } catch { /* skip */ }
    }

    // Welcome text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(...gold);
    const logoOffset = logoBase64 ? 72 : 40;
    doc.text("BEM-VINDO(A)", W / 2, logoOffset, { align: "center" });

    // Client name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(48);
    doc.setTextColor(...white);
    doc.text(nome.toUpperCase(), W / 2, logoOffset + 25, { align: "center" });

    // Details
    const detParts: string[] = [];
    if (voo) detParts.push(`Voo: ${voo}`);
    if (destino) detParts.push(destino);
    if (detParts.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.setTextColor(...muted);
      doc.text(detParts.join("  •  "), W / 2, logoOffset + 40, { align: "center" });
    }
    if (data || hora) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      const timeParts: string[] = [];
      if (data) timeParts.push(data);
      if (hora) timeParts.push(hora);
      doc.text(timeParts.join(" às "), W / 2, logoOffset + 50, { align: "center" });
    }

  } else if (layout === "moldura") {
    // White bg with elegant border
    doc.setFillColor(...white);
    doc.rect(0, 0, W, H, "F");

    // Double border
    doc.setDrawColor(...black);
    doc.setLineWidth(2);
    doc.rect(10, 10, W - 20, H - 20, "S");
    doc.setLineWidth(0.5);
    doc.rect(14, 14, W - 28, H - 28, "S");

    // Logo centered top
    if (logoBase64) {
      try { doc.addImage(logoBase64, "PNG", W / 2 - 20, 24, 40, 24); } catch { /* skip */ }
    }

    const contentY = logoBase64 ? 60 : 45;

    // Decorative line
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.8);
    doc.line(W / 2 - 40, contentY, W / 2 + 40, contentY);

    // Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(46);
    doc.setTextColor(...black);
    doc.text(nome.toUpperCase(), W / 2, contentY + 28, { align: "center" });

    // Bottom decorative line
    doc.setDrawColor(...gold);
    doc.line(W / 2 - 40, contentY + 36, W / 2 + 40, contentY + 36);

    // Details
    const infoParts: string[] = [];
    if (voo) infoParts.push(`Voo: ${voo}`);
    if (destino) infoParts.push(destino);
    if (data) infoParts.push(data);
    if (hora) infoParts.push(hora);
    if (infoParts.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(...muted);
      doc.text(infoParts.join("  •  "), W / 2, contentY + 48, { align: "center" });
    }
  }

  doc.save(`receptivo_${nome.replace(/\s+/g, "_").toLowerCase()}.pdf`);
}

export default function MarketingReceptivos() {
  const [layout, setLayout] = useState<LayoutType>("simples");
  const [nome, setNome] = useState("");
  const [voo, setVoo] = useState("");
  const [destino, setDestino] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [hora, setHora] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [historico, setHistorico] = useState<ReceptivoRecord[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const b64 = await loadImageAsBase64(file);
    setLogoPreview(b64);
  };

  const handleGenerate = async () => {
    if (!nome.trim()) {
      toast.error("Preencha o nome do cliente.");
      return;
    }
    const logoB64 = logoFile ? await loadImageAsBase64(logoFile) : null;
    const dataStr = date ? format(date, "dd/MM/yyyy") : "";

    generateReceptivoPdf(layout, nome.trim(), voo, destino, dataStr, hora, logoB64);

    const record: ReceptivoRecord = {
      id: crypto.randomUUID(),
      cliente: nome.trim(),
      layout,
      voo,
      destino,
      data: dataStr,
      hora,
      createdAt: new Date().toLocaleString("pt-BR"),
    };
    setHistorico((prev) => [record, ...prev]);
    toast.success("PDF gerado com sucesso!");
  };

  const handleRedownload = async (rec: ReceptivoRecord) => {
    const logoB64 = logoFile ? await loadImageAsBase64(logoFile) : null;
    generateReceptivoPdf(rec.layout, rec.cliente, rec.voo, rec.destino, rec.data, rec.hora, logoB64);
  };

  const layoutLabels: Record<LayoutType, string> = { simples: "Simples", destaque: "Destaque", moldura: "Moldura" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gerador de Placas de Receptivo</h1>
        <p className="text-muted-foreground">Crie placas personalizadas para recepção de clientes</p>
      </div>

      {/* Step 1: Layout */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-accent text-accent-foreground text-xs font-bold">1</span>
            Escolha o Layout
          </CardTitle>
          <p className="text-muted-foreground text-sm">Selecione o modelo de placa que deseja gerar</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LAYOUTS.map((l) => (
              <button
                key={l.key}
                onClick={() => setLayout(l.key)}
                className={`rounded-lg border-2 p-4 text-left transition-all hover:shadow-md ${
                  layout === l.key
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                {/* Mini preview */}
                <div className={`rounded-md mb-3 h-32 flex items-center justify-center ${
                  l.key === "destaque" ? "bg-foreground text-background" : "bg-muted"
                }`}>
                  {l.key === "simples" && (
                    <div className="text-center">
                      <div className="border-t-2 border-foreground w-24 mx-auto mb-2" />
                      <p className="font-bold text-sm text-foreground">NOME DO CLIENTE</p>
                      <div className="border-t border-muted-foreground/30 w-16 mx-auto mt-2" />
                    </div>
                  )}
                  {l.key === "destaque" && (
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground border border-muted-foreground/30 px-2 py-0.5 rounded mb-1">[ LOGO ]</div>
                      <p className="text-[10px] text-yellow-500">BEM-VINDO(A)</p>
                      <p className="font-bold text-sm text-background">NOME DO CLIENTE</p>
                    </div>
                  )}
                  {l.key === "moldura" && (
                    <div className="text-center border-2 border-foreground rounded-md p-3 mx-4 w-full">
                      <div className="w-8 h-5 bg-muted-foreground/30 rounded mx-auto mb-1" />
                      <p className="font-bold text-xs text-foreground">NOME DO CLIENTE</p>
                    </div>
                  )}
                </div>
                <p className="font-semibold text-sm text-foreground">{l.title}</p>
                <p className="text-xs text-muted-foreground">{l.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Form */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-accent text-accent-foreground text-xs font-bold">2</span>
            Personalize
          </CardTitle>
          <p className="text-muted-foreground text-sm">Preencha os dados para a placa de receptivo</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Cliente *</Label>
              <Input placeholder="Ex: Sr. João Silva ou Família Costa" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Logo (Opcional)</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1">
                  <Upload className="h-4 w-4" /> {logoFile ? logoFile.name : "Selecionar logo"}
                </Button>
                {logoPreview && (
                  <img src={logoPreview} alt="Logo" className="h-8 w-auto rounded" />
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Número do Voo (Opcional)</Label>
              <Input placeholder="Ex: LA1234" value={voo} onChange={(e) => setVoo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Destino (Opcional)</Label>
              <Input placeholder="Ex: Balneário Camboriú" value={destino} onChange={(e) => setDestino(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data de Chegada (Opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} locale={ptBR} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Hora de Chegada (Opcional)</Label>
              <Select value={hora} onValueChange={setHora}>
                <SelectTrigger><SelectValue placeholder="Selecione o horário" /></SelectTrigger>
                <SelectContent>
                  {HORAS.map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} className="mt-6 gap-2">
            <Download className="h-4 w-4" /> Gerar PDF
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      {historico.length > 0 && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Receptivos</CardTitle>
            <p className="text-muted-foreground text-sm">Receptivos gerados anteriormente</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Layout</TableHead>
                  <TableHead>Voo</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Data/Hora Chegada</TableHead>
                  <TableHead>Gerado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historico.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">{rec.cliente}</TableCell>
                    <TableCell>{layoutLabels[rec.layout]}</TableCell>
                    <TableCell>{rec.voo || "—"}</TableCell>
                    <TableCell>{rec.destino || "—"}</TableCell>
                    <TableCell>{rec.data ? `${rec.data}${rec.hora ? ` às ${rec.hora}` : ""}` : "—"}</TableCell>
                    <TableCell>{rec.createdAt}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => handleRedownload(rec)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setHistorico((prev) => prev.filter((r) => r.id !== rec.id))}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
