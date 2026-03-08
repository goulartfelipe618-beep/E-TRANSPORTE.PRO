import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Plus, Trash2, Eye, Edit, Search, Bold, Italic, Link, ImageIcon, Upload, FileText, Download, File } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Anotacao {
  id: string;
  titulo: string;
  conteudo: string;
  cor: string;
  created_at: string;
  updated_at: string;
}

interface MasterFile {
  id: string;
  nome: string;
  tamanho: number;
  tipo: string;
  storage_path: string;
  created_at: string;
}

const CORES = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6", "#f97316", "#ec4899", "#06b6d4", "#64748b", "#84cc16"];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function getFileIcon(tipo: string) {
  if (tipo.startsWith("image/")) return "🖼️";
  if (tipo.includes("pdf")) return "📄";
  if (tipo.includes("spreadsheet") || tipo.includes("excel") || tipo.includes("csv")) return "📊";
  if (tipo.includes("word") || tipo.includes("document")) return "📝";
  if (tipo.includes("zip") || tipo.includes("rar") || tipo.includes("7z")) return "📦";
  return "📎";
}

export default function MasterAnotacoes() {
  const { toast } = useToast();
  const [tab, setTab] = useState("anotacoes");

  // Anotações state
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<Anotacao | null>(null);
  const [viewOpen, setViewOpen] = useState<Anotacao | null>(null);
  const [saving, setSaving] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [cor, setCor] = useState(CORES[0]);
  const editorRef = useRef<HTMLDivElement>(null);

  // Files state
  const [files, setFiles] = useState<MasterFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [fileSearch, setFileSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAnotacoes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("anotacoes")
      .select("*")
      .is("tenant_id", null)
      .order("updated_at", { ascending: false });
    if (data) setAnotacoes(data as Anotacao[]);
    setLoading(false);
  };

  const fetchFiles = async () => {
    setFilesLoading(true);
    const { data } = await supabase
      .from("master_files")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setFiles(data as MasterFile[]);
    setFilesLoading(false);
  };

  useEffect(() => { fetchAnotacoes(); fetchFiles(); }, []);

  const filtered = anotacoes.filter((a) =>
    a.titulo.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFiles = files.filter((f) =>
    f.nome.toLowerCase().includes(fileSearch.toLowerCase())
  );

  const resetForm = () => { setTitulo(""); setConteudo(""); setCor(CORES[0]); };

  const execCommand = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const handleInsertImage = () => {
    const url = prompt("URL da imagem:");
    if (url) execCommand("insertImage", url);
  };

  const handleInsertLink = () => {
    const url = prompt("URL do link:");
    if (url) execCommand("createLink", url);
  };

  const sanitizeHtml = (html: string) => DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img', 'div', 'span'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'style'],
    ALLOW_DATA_ATTR: false,
  });

  const getEditorContent = () => sanitizeHtml(editorRef.current?.innerHTML || "");

  const handleCreate = async () => {
    if (!titulo.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("anotacoes").insert({
      titulo: titulo.trim(),
      conteudo: getEditorContent(),
      cor,
      tenant_id: null,
    });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Anotação criada!" }); resetForm(); setCreateOpen(false); fetchAnotacoes(); }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editOpen) return;
    setSaving(true);
    const { error } = await supabase.from("anotacoes").update({
      titulo: titulo.trim(),
      conteudo: getEditorContent(),
      cor,
    }).eq("id", editOpen.id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Anotação atualizada!" }); setEditOpen(null); resetForm(); fetchAnotacoes(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("anotacoes").delete().eq("id", id);
    toast({ title: "Anotação excluída" });
    fetchAnotacoes();
  };

  const openEdit = (a: Anotacao) => {
    setTitulo(a.titulo); setConteudo(a.conteudo); setCor(a.cor);
    setEditOpen(a);
  };

  useEffect(() => {
    if ((createOpen || editOpen) && editorRef.current) {
      editorRef.current.innerHTML = conteudo;
    }
  }, [createOpen, editOpen]);

  // File upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (const file of Array.from(selectedFiles)) {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("master-files")
        .upload(path, file);

      if (uploadError) {
        toast({ title: "Erro ao enviar", description: `${file.name}: ${uploadError.message}`, variant: "destructive" });
        continue;
      }

      const { error: dbError } = await supabase.from("master_files").insert({
        nome: file.name,
        tamanho: file.size,
        tipo: file.type || "application/octet-stream",
        storage_path: path,
      });

      if (dbError) {
        toast({ title: "Erro ao registrar", description: dbError.message, variant: "destructive" });
      } else {
        successCount++;
      }
    }

    if (successCount > 0) {
      toast({ title: `${successCount} arquivo(s) enviado(s)!` });
      fetchFiles();
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileDownload = async (file: MasterFile) => {
    const { data, error } = await supabase.storage
      .from("master-files")
      .createSignedUrl(file.storage_path, 60);

    if (error || !data?.signedUrl) {
      toast({ title: "Erro ao baixar", description: error?.message || "URL não gerada", variant: "destructive" });
      return;
    }

    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = file.nome;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileDelete = async (file: MasterFile) => {
    await supabase.storage.from("master-files").remove([file.storage_path]);
    await supabase.from("master_files").delete().eq("id", file.id);
    toast({ title: "Arquivo excluído" });
    fetchFiles();
  };

  const renderEditor = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Título</label>
        <Input placeholder="Digite o título da anotação" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Cor</label>
        <div className="flex gap-2 flex-wrap">
          {CORES.map((c) => (
            <button key={c} type="button" onClick={() => setCor(c)} className={`h-7 w-7 rounded-full border-2 transition-all ${cor === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Conteúdo</label>
        <div className="border rounded-md overflow-hidden">
          <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand("bold")} title="Negrito"><Bold className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand("italic")} title="Itálico"><Italic className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleInsertLink} title="Inserir Link"><Link className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleInsertImage} title="Inserir Imagem"><ImageIcon className="h-4 w-4" /></Button>
          </div>
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[250px] p-4 bg-background text-foreground focus:outline-none prose prose-sm max-w-none [&_img]:max-w-full [&_img]:rounded [&_a]:text-primary"
            style={{ wordBreak: "break-word" }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Anotações & Arquivos</h1>
          <p className="text-muted-foreground">Suas anotações e arquivos do painel Master</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="anotacoes" className="gap-2">
            <FileText className="h-4 w-4" />
            Anotações
          </TabsTrigger>
          <TabsTrigger value="arquivos" className="gap-2">
            <File className="h-4 w-4" />
            Arquivos
          </TabsTrigger>
        </TabsList>

        {/* === ANOTAÇÕES TAB === */}
        <TabsContent value="anotacoes" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar anotação..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={fetchAnotacoes} title="Recarregar">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button onClick={() => { resetForm(); setCreateOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Anotação
              </Button>
            </div>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              {loading ? (
                <p className="p-6 text-muted-foreground text-sm">Carregando...</p>
              ) : filtered.length === 0 ? (
                <p className="p-6 text-muted-foreground text-sm text-center">Nenhuma anotação encontrada.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead>Última Atualização</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: a.cor }} />
                            {a.titulo}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(a.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(a.updated_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setViewOpen(a)} title="Visualizar"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(a)} title="Editar"><Edit className="h-4 w-4" /></Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir anotação?</AlertDialogTitle>
                                  <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(a.id)}>Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === ARQUIVOS TAB === */}
        <TabsContent value="arquivos" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar arquivo..." value={fileSearch} onChange={(e) => setFileSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={fetchFiles} title="Recarregar">
                <RefreshCw className={`h-4 w-4 ${filesLoading ? "animate-spin" : ""}`} />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Enviando..." : "Enviar Arquivo"}
              </Button>
            </div>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              {filesLoading ? (
                <p className="p-6 text-muted-foreground text-sm">Carregando...</p>
              ) : filteredFiles.length === 0 ? (
                <p className="p-6 text-muted-foreground text-sm text-center">Nenhum arquivo encontrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Arquivo</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Data de Upload</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFiles.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getFileIcon(f.tipo)}</span>
                            <span className="truncate max-w-[300px]">{f.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatFileSize(f.tamanho)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(f.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleFileDownload(f)} title="Baixar">
                              <Download className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir arquivo?</AlertDialogTitle>
                                  <AlertDialogDescription>O arquivo "{f.nome}" será removido permanentemente.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleFileDelete(f)}>Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Anotação</DialogTitle>
            <DialogDescription>Crie uma nova anotação com texto formatado e imagens.</DialogDescription>
          </DialogHeader>
          {renderEditor()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving || !titulo.trim()}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editOpen} onOpenChange={(o) => { if (!o) { setEditOpen(null); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Anotação</DialogTitle>
            <DialogDescription>Edite o conteúdo da anotação.</DialogDescription>
          </DialogHeader>
          {renderEditor()}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(null); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={saving || !titulo.trim()}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewOpen} onOpenChange={(o) => { if (!o) setViewOpen(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: viewOpen?.cor }} />
              {viewOpen?.titulo}
            </DialogTitle>
            <DialogDescription>
              Criada em {viewOpen && new Date(viewOpen.created_at).toLocaleString("pt-BR")}
            </DialogDescription>
          </DialogHeader>
          <div
            className="prose prose-sm max-w-none text-foreground [&_img]:max-w-full [&_img]:rounded [&_a]:text-primary min-h-[100px]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(viewOpen?.conteudo || "") }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
