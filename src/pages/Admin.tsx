import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, LogOut, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Monogram } from "@/components/wedding/Monogram";

type Confirmacao = {
  id: string;
  nome: string;
  telefone: string;
  acompanhante: string | null;
  papel: "PADRINHO" | "MADRINHA";
  lado: "KAIO" | "DEBORA";
  status: "aceito" | "recusado";
  motivo: string | null;
  criado_em: string;
};

type Filter = "todos" | "aceito" | "recusado" | "PADRINHO" | "MADRINHA";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<Confirmacao[]>([]);
  const [filter, setFilter] = useState<Filter>("todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    const init = async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate("/admin/login", { replace: true });
        return;
      }
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!active) return;
      if (!roleData) {
        toast.error("Sua conta ainda não tem permissão de administrador.");
        await supabase.auth.signOut();
        navigate("/admin/login", { replace: true });
        return;
      }
      setIsAdmin(true);

      const { data, error } = await supabase
        .from("confirmacoes")
        .select("*")
        .order("criado_em", { ascending: false });
      if (error) toast.error("Erro ao carregar confirmações.");
      setRows((data as Confirmacao[]) || []);
      setLoading(false);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/admin/login", { replace: true });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const metrics = useMemo(() => {
    const aceitos = rows.filter((r) => r.status === "aceito");
    return {
      total: aceitos.length,
      padrinhos: aceitos.filter((r) => r.papel === "PADRINHO").length,
      madrinhas: aceitos.filter((r) => r.papel === "MADRINHA").length,
      recusas: rows.filter((r) => r.status === "recusado").length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (filter === "aceito" || filter === "recusado") list = list.filter((r) => r.status === filter);
    if (filter === "PADRINHO" || filter === "MADRINHA") list = list.filter((r) => r.papel === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.nome.toLowerCase().includes(q) || r.telefone.includes(q));
    }
    return list;
  }, [rows, filter, search]);

  const exportCsv = () => {
    const header = ["nome", "telefone", "acompanhante", "papel", "lado", "status", "motivo", "criado_em"];
    const lines = [header.join(",")].concat(
      filtered.map((r) =>
        header
          .map((k) => {
            const v = (r as any)[k] ?? "";
            const s = String(v).replace(/"/g, '""');
            return /[",\n]/.test(s) ? `"${s}"` : s;
          })
          .join(","),
      ),
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `confirmacoes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </main>
    );
  }
  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gold/20 pb-6">
          <div className="flex items-center gap-4">
            <Monogram />
            <div>
              <p className="font-display text-xs tracking-widest-2 text-gold">PAINEL DOS NOIVOS</p>
              <h1 className="font-serif text-2xl italic">Confirmações</h1>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="rounded-none border-gold/60 bg-transparent font-display text-xs tracking-widest-2 text-gold hover:bg-gold/10 hover:text-gold"
          >
            <LogOut className="mr-2 h-4 w-4" /> SAIR
          </Button>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Confirmados" value={metrics.total} />
          <Metric label="Padrinhos" value={metrics.padrinhos} />
          <Metric label="Madrinhas" value={metrics.madrinhas} />
          <Metric label="Recusas" value={metrics.recusas} />
        </section>

        <section className="mt-8 flex flex-wrap items-center gap-3">
          {(["todos", "aceito", "recusado", "PADRINHO", "MADRINHA"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`border px-4 py-2 font-display text-[10px] tracking-widest-2 transition ${
                filter === f
                  ? "border-gold bg-gold text-primary-foreground"
                  : "border-gold/40 text-foreground/80 hover:border-gold hover:text-gold"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
          <div className="relative ml-auto flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nome ou telefone"
              className="w-64 rounded-none border-gold/40 bg-transparent pl-9 focus-visible:ring-0 focus-visible:border-gold"
            />
          </div>
          <Button
            onClick={exportCsv}
            className="rounded-none bg-gold font-display text-xs tracking-widest-2 text-primary-foreground hover:bg-gold/90"
          >
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
        </section>

        <section className="mt-6 overflow-x-auto border border-gold/20">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 font-display text-[10px] tracking-widest-2 text-gold">
              <tr>
                <Th>Nome</Th>
                <Th>WhatsApp</Th>
                <Th>Papel</Th>
                <Th>Lado</Th>
                <Th>Acompanhante</Th>
                <Th>Status</Th>
                <Th>Data</Th>
              </tr>
            </thead>
            <tbody className="font-serif">
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-gold/10">
                  <Td>{r.nome}</Td>
                  <Td>{r.telefone}</Td>
                  <Td>{r.papel}</Td>
                  <Td>{r.lado}</Td>
                  <Td>{r.acompanhante || "—"}</Td>
                  <Td>
                    <span
                      className={`font-display text-[10px] tracking-widest-2 ${
                        r.status === "aceito" ? "text-gold" : "text-muted-foreground"
                      }`}
                    >
                      {r.status.toUpperCase()}
                    </span>
                  </Td>
                  <Td>{new Date(r.criado_em).toLocaleString("pt-BR")}</Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center font-serif italic text-muted-foreground">
                    Nenhuma confirmação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
};

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="border border-gold/30 bg-card/40 p-6">
    <p className="font-display text-[10px] tracking-widest-2 text-gold">{label.toUpperCase()}</p>
    <p className="mt-2 font-serif text-4xl italic">{value}</p>
  </div>
);

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 font-normal">{children}</th>
);
const Td = ({ children }: { children: React.ReactNode }) => (
  <td className="px-4 py-3 text-foreground/90">{children}</td>
);

export default Admin;
