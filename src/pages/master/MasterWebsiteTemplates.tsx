import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, RefreshCw, Loader2, ExternalLink, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WebsiteTemplate {
  id: string;
  nome: string;
  preview_url: string;
  thumbnail_url: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
}

const emptyForm = { nome: "", preview_url: "", ativo: true, ordem: 0 };

export default function MasterWebsiteTemplates() {
  const [templates, setTemplates] = useState<WebsiteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("website_templates")
      .select("*")
      .order("ordem", { ascending: true });
    setTemplates((data as WebsiteTemplate[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setThumbnailFile(null);
    setThumbnailPreview("");
    setDialogOpen(true);
  };

  const openEdit = (t: WebsiteTemplate) => {
    setEditingId(t.id);
    setForm({
      nome: t.nome,
      preview_url: t.preview_url,
      ativo: t.ativo,
      ordem: t.ordem,
    });
    setThumbnailFile(null);
    setThumbnailPreview(t.thumbnail_url || "");
    setDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Selecione uma imagem válida", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Imagem muito grande (máx 10MB)", variant: "destructive" });
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const uploadThumbnail = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop() || "png";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("website-templates")
      .upload(fileName, file, { contentType: file.type, upsert: true });
    if (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
      return null;
    }
    const { data: urlData } = supabase.storage.from("website-templates").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!form.nome.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);

    let thumbnailUrl = thumbnailPreview;

    // Upload new file if selected
    if (thumbnailFile) {
      setUploading(true);
      const url = await uploadThumbnail(thumbnailFile);
      setUploading(false);
      if (!url) { setSaving(false); return; }
      thumbnailUrl = url;
    }

    if (editingId) {
      const { error } = await supabase
        .from("website_templates")
        .update({
          nome: form.nome,
          preview_url: form.preview_url,
          thumbnail_url: thumbnailUrl,
          ativo: form.ativo,
          ordem: form.ordem,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", editingId);
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Template atualizado!" });
        setDialogOpen(false);
        fetchTemplates();
      }
    } else {
      const { error } = await supabase
        .from("website_templates")
        .insert({
          nome: form.nome,
          preview_url: form.preview_url,
          thumbnail_url: thumbnailUrl,
          ativo: form.ativo,
          ordem: form.ordem,
        } as any);
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Template criado!" });
        setDialogOpen(false);
        fetchTemplates();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir este template?")) return;
    const { error } = await supabase.from("website_templates").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Template excluído!" });
      fetchTemplates();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Modelos de Website</h1>
          <p className="text-muted-foreground">Gerencie os templates disponíveis para os clientes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTemplates}>
            <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Novo Template
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : templates.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum template cadastrado. Crie o primeiro!
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {t.thumbnail_url ? (
                        <div
                          className="w-16 h-24 rounded bg-muted bg-cover bg-top cursor-pointer hover:ring-2 ring-primary transition-all"
                          style={{ backgroundImage: `url(${t.thumbnail_url})` }}
                          onClick={() => { setPreviewUrl(t.thumbnail_url); setPreviewOpen(true); }}
                        />
                      ) : (
                        <div className="w-16 h-24 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          Sem img
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{t.nome}</TableCell>
                    <TableCell>
                      {t.preview_url ? (
                        <Button size="sm" variant="link" className="p-0 h-auto" onClick={() => window.open(t.preview_url, "_blank")}>
                          <ExternalLink className="h-3 w-3 mr-1" /> Ver
                        </Button>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{t.ordem}</TableCell>
                    <TableCell>
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${t.ativo ? "bg-green-500" : "bg-muted-foreground"}`} />
                      {t.ativo ? "Ativo" : "Inativo"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Template" : "Novo Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Template <span className="text-destructive">*</span></Label>
              <Input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} placeholder="Ex: Executive Dark" />
            </div>
            <div>
              <Label>Link do Modelo (preview URL)</Label>
              <Input value={form.preview_url} onChange={(e) => setForm((p) => ({ ...p, preview_url: e.target.value }))} placeholder="https://seusite.com/demo" />
            </div>
            <div>
              <Label>Imagem de Capa (scroll da página toda)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              {thumbnailPreview ? (
                <div className="mt-2 relative">
                  <div className="rounded overflow-hidden border max-h-48 overflow-y-auto">
                    <img src={thumbnailPreview} alt="Preview" className="w-full" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-3 w-3 mr-1" /> Trocar imagem
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => { setThumbnailFile(null); setThumbnailPreview(""); }}
                    >
                      <X className="h-3 w-3 mr-1" /> Remover
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clique para enviar a imagem</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou WEBP (máx 10MB)</p>
                </div>
              )}
            </div>
            <div>
              <Label>Ordem de exibição</Label>
              <Input type="number" value={form.ordem} onChange={(e) => setForm((p) => ({ ...p, ordem: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.ativo} onCheckedChange={(v) => setForm((p) => ({ ...p, ativo: v }))} />
              <Label>Template ativo (visível para clientes)</Label>
            </div>
            <Button onClick={handleSave} disabled={saving || uploading} className="w-full">
              {(saving || uploading) ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {uploading ? "Enviando imagem..." : editingId ? "Salvar Alterações" : "Criar Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview da Imagem</DialogTitle>
          </DialogHeader>
          <img src={previewUrl} alt="Template preview" className="w-full rounded" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
