import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileSetupDialogProps {
  userId: string;
  onComplete: () => void;
}

export function ProfileSetupDialog({ userId, onComplete }: ProfileSetupDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    checkProfile();
  }, [userId]);

  const checkProfile = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!data) {
      // No profile exists yet, create one
      await supabase.from("profiles").insert({
        user_id: userId,
        email: "",
        setup_complete: false,
      });
      setOpen(true);
    } else if (!data.setup_complete) {
      setNomeCompleto((data as any).nome_completo || "");
      setTelefone((data as any).telefone || "");
      setEmail((data as any).email || "");
      setOpen(true);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!nomeCompleto.trim() || !telefone.trim() || !email.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        nome_completo: nomeCompleto.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        setup_complete: true,
      })
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Erro ao salvar perfil", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil configurado com sucesso!" });
      setOpen(false);
      onComplete();
    }
    setSaving(false);
  };

  if (loading) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Configuração Obrigatória
          </DialogTitle>
          <DialogDescription>
            Preencha seus dados antes de utilizar o sistema. Todos os campos são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome Completo *</Label>
            <Input
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>
          <div className="space-y-2">
            <Label>Telefone *</Label>
            <Input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="space-y-2">
            <Label>E-mail *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !nomeCompleto.trim() || !telefone.trim() || !email.trim()}
          className="w-full mt-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Salvar e Continuar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
