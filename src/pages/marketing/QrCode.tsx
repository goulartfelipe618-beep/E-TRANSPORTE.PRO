import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QrCode, Download, Trash2, Plus, Copy } from "lucide-react";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";

interface QrRecord {
  id: string;
  label: string;
  url: string;
  createdAt: string;
}

const SIZES = [
  { label: "Pequeno (200px)", value: "200" },
  { label: "Médio (400px)", value: "400" },
  { label: "Grande (600px)", value: "600" },
  { label: "Extra Grande (800px)", value: "800" },
];

export default function MarketingQrCode() {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [size, setSize] = useState("400");
  const [qrCodes, setQrCodes] = useState<QrRecord[]>([]);
  const [currentPreview, setCurrentPreview] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!url.trim()) {
      toast.error("Preencha a URL ou texto para o QR Code.");
      return;
    }
    setCurrentPreview(url.trim());
    const record: QrRecord = {
      id: crypto.randomUUID(),
      label: label.trim() || url.trim().substring(0, 40),
      url: url.trim(),
      createdAt: new Date().toLocaleString("pt-BR"),
    };
    setQrCodes((prev) => [record, ...prev]);
    toast.success("QR Code gerado com sucesso!");
  };

  const downloadQr = useCallback((canvasParentId: string, name: string) => {
    const container = document.getElementById(canvasParentId);
    const canvas = container?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qrcode_${name.replace(/\s+/g, "_").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("URL copiada!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gerador de QR Code</h1>
        <p className="text-muted-foreground">Crie QR Codes ilimitados para campanhas, links e muito mais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" /> Novo QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome / Identificação (Opcional)</Label>
              <Input placeholder="Ex: Campanha Verão 2026" value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>URL ou Texto *</Label>
              <Input placeholder="Ex: https://meusite.com.br/promo" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tamanho</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} className="gap-2">
              <QrCode className="h-4 w-4" /> Gerar QR Code
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Pré-visualização</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[200px]">
            {currentPreview ? (
              <>
                <div id="qr-preview">
                  <QRCodeCanvas value={currentPreview} size={parseInt(size)} level="M" />
                </div>
                <Button variant="outline" size="sm" className="mt-4 gap-1" onClick={() => downloadQr("qr-preview", label || "qrcode")}>
                  <Download className="h-4 w-4" /> Baixar PNG
                </Button>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <QrCode className="h-16 w-16 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Gere um QR Code para visualizar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* History */}
      {qrCodes.length > 0 && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">QR Codes Gerados</CardTitle>
            <p className="text-muted-foreground text-sm">{qrCodes.length} QR Code(s) gerados nesta sessão</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>QR</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>URL / Texto</TableHead>
                  <TableHead>Gerado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qrCodes.map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell>
                      <div id={`qr-${qr.id}`} className="inline-block">
                        <QRCodeCanvas value={qr.url} size={40} level="M" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{qr.label}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">{qr.url}</TableCell>
                    <TableCell className="text-sm">{qr.createdAt}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => handleCopy(qr.url)} title="Copiar URL">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => downloadQr(`qr-${qr.id}`, qr.label)} title="Baixar">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setQrCodes((prev) => prev.filter((r) => r.id !== qr.id))} title="Remover">
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
