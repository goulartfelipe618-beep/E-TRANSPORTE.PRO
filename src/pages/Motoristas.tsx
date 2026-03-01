import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal, Phone, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Motorista {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  cnh: string;
  categoria: string;
  status: "Ativo" | "Inativo" | "Férias";
  veiculo: string;
}

const initialMotoristas: Motorista[] = [
  { id: "M-001", nome: "Carlos Silva", cpf: "123.456.789-00", telefone: "(11) 99999-1234", email: "carlos@email.com", cnh: "12345678900", categoria: "D", status: "Ativo", veiculo: "Mercedes S500" },
  { id: "M-002", nome: "Ana Oliveira", cpf: "234.567.890-11", telefone: "(11) 99999-5678", email: "ana@email.com", cnh: "23456789011", categoria: "D", status: "Ativo", veiculo: "BMW 540i" },
  { id: "M-003", nome: "Roberto Santos", cpf: "345.678.901-22", telefone: "(11) 99999-9012", email: "roberto@email.com", cnh: "34567890122", categoria: "D", status: "Férias", veiculo: "Audi A6" },
  { id: "M-004", nome: "Maria Costa", cpf: "456.789.012-33", telefone: "(11) 99999-3456", email: "maria@email.com", cnh: "45678901233", categoria: "D", status: "Ativo", veiculo: "Volvo S90" },
  { id: "M-005", nome: "Pedro Almeida", cpf: "567.890.123-44", telefone: "(11) 99999-7890", email: "pedro@email.com", cnh: "56789012344", categoria: "D", status: "Inativo", veiculo: "-" },
];

const statusColor: Record<string, string> = {
  Ativo: "bg-emerald-100 text-emerald-700",
  Inativo: "bg-red-100 text-red-700",
  Férias: "bg-amber-100 text-amber-700",
};

export default function Motoristas() {
  const [motoristas, setMotoristas] = useState<Motorista[]>(initialMotoristas);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", cpf: "", telefone: "", email: "", cnh: "", categoria: "D", veiculo: "" });

  const filtered = motoristas.filter(
    (m) =>
      m.nome.toLowerCase().includes(search.toLowerCase()) ||
      m.cpf.includes(search) ||
      m.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    const newId = `M-${String(motoristas.length + 1).padStart(3, "0")}`;
    setMotoristas([...motoristas, { ...form, id: newId, status: "Ativo" } as Motorista]);
    setForm({ nome: "", cpf: "", telefone: "", email: "", cnh: "", categoria: "D", veiculo: "" });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Motoristas</h1>
          <p className="text-muted-foreground">Gerenciamento de cadastro de motoristas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novo Motorista</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Cadastrar Motorista</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome Completo</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>CPF</Label>
                  <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
                </div>
                <div className="grid gap-2">
                  <Label>CNH</Label>
                  <Input value={form.cnh} onChange={(e) => setForm({ ...form, cnh: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Telefone</Label>
                  <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-0000" />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Veículo Atribuído</Label>
                <Input value={form.veiculo} onChange={(e) => setForm({ ...form, veiculo: e.target.value })} />
              </div>
              <Button onClick={handleAdd} className="w-full mt-2">Cadastrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CPF ou ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m) => (
          <Card key={m.id} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div>
                <CardTitle className="text-base">{m.nome}</CardTitle>
                <p className="text-xs text-muted-foreground font-mono">{m.id} · CNH {m.categoria}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[m.status]}`}>
                {m.status}
              </span>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> {m.telefone}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {m.email}
              </div>
              <div className="pt-2 border-t text-xs text-muted-foreground">
                Veículo: <span className="text-foreground font-medium">{m.veiculo}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
