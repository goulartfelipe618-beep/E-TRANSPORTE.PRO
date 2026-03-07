import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/hooks/useTenantId";
import { Plus, Trash2, Upload, Loader2, Save, GripVertical, Image as ImageIcon } from "lucide-react";

interface Slide {
  id?: string;
  posicao: number;
  titulo: string;
  subtitulo: string;
  imagem_url: string;
  ativo: boolean;
}

export default function HomeSlidesManager() {
  const { toast } = useToast();
  const tenantId = useTenantId();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const fetchSlides = async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("home_slides")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("posicao", { ascending: true });
    if (!error && data) {
      setSlides(data.map((s: any) => ({
        id: s.id,
        posicao: s.posicao,
        titulo: s.titulo,
        subtitulo: s.subtitulo,
        imagem_url: s.imagem_url,
        ativo: s.ativo,
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSlides();
  }, [tenantId]);

  const handleAdd = () => {
    setSlides((prev) => [
      ...prev,
      { posicao: prev.length, titulo: "", subtitulo: "", imagem_url: "", ativo: true },
    ]);
  };

  const handleRemove = async (index: number) => {
    const slide = slides[index];
    if (slide.id) {
      await supabase.from("home_slides").delete().eq("id", slide.id);
    }
    setSlides((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, posicao: i })));
    toast({ title: "Slide removido" });
  };

  const handleChange = (index: number, field: keyof Slide, value: string) => {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleImageUpload = async (index: number, file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${tenantId}/slide-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("home-slides").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Erro ao enviar imagem", variant: "destructive" });
      return;
    }
    const { data: urlData } = supabase.storage.from("home-slides").getPublicUrl(path);
    handleChange(index, "imagem_url", urlData.publicUrl);
    toast({ title: "Imagem enviada!" });
  };

  const handleSaveAll = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        const s = slides[i];
        const payload = {
          posicao: i,
          titulo: s.titulo,
          subtitulo: s.subtitulo,
          imagem_url: s.imagem_url,
          ativo: s.ativo,
          tenant_id: tenantId,
        };
        if (s.id) {
          const { error } = await supabase.from("home_slides").update(payload).eq("id", s.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("home_slides").insert(payload);
          if (error) throw error;
        }
      }
      toast({ title: "Slides salvos com sucesso!" });
      await fetchSlides();
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5" /> Slides da Home
        </CardTitle>
        <CardDescription>
          Configure os slides do carrossel da página inicial. Adicione imagens, títulos e subtítulos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {slides.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum slide configurado. Os slides padrão serão exibidos.
          </p>
        )}

        {slides.map((slide, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Slide {index + 1}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleRemove(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            {/* Image preview & upload */}
            <div className="space-y-2">
              <Label>Imagem</Label>
              {slide.imagem_url && (
                <img src={slide.imagem_url} alt={`Slide ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={(el) => { fileRefs.current[index] = el; }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(index, file);
                }}
              />
              <Button variant="outline" size="sm" onClick={() => fileRefs.current[index]?.click()}>
                <Upload className="h-4 w-4 mr-2" /> Enviar Imagem
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Título (H1)</Label>
              <Input
                value={slide.titulo}
                onChange={(e) => handleChange(index, "titulo", e.target.value)}
                placeholder="Título principal do slide"
              />
            </div>

            <div className="space-y-2">
              <Label>Subtítulo (H2)</Label>
              <Input
                value={slide.subtitulo}
                onChange={(e) => handleChange(index, "subtitulo", e.target.value)}
                placeholder="Texto descritivo do slide"
              />
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Slide
          </Button>
          {slides.length > 0 && (
            <Button onClick={handleSaveAll} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar Slides
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
