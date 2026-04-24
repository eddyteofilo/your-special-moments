import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Monogram, Divider } from "@/components/wedding/Monogram";

const AdminAuth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Conta criada. Peça ao desenvolvedor para conceder o papel de admin.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error("Credenciais inválidas.");
    navigate("/admin", { replace: true });
  };

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <Monogram />
          <p className="mt-6 font-display text-xs tracking-widest-2 text-gold">ADMINISTRAÇÃO</p>
          <h1 className="mt-2 font-serif text-3xl italic">Painel dos noivos</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 border border-gold/30 bg-card/40 p-8 backdrop-blur-sm"
        >
          <Divider label={mode === "signin" ? "ENTRAR" : "CRIAR CONTA"} />
          <div className="space-y-2">
            <Label className="font-display text-xs tracking-widest-2 text-gold">E-mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-none border-gold/40 bg-transparent focus-visible:ring-0 focus-visible:border-gold"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-display text-xs tracking-widest-2 text-gold">Senha</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="rounded-none border-gold/40 bg-transparent focus-visible:ring-0 focus-visible:border-gold"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-none bg-gold font-display text-xs tracking-widest-2 text-primary-foreground hover:bg-gold/90"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            {mode === "signin" ? "ENTRAR" : "CRIAR CONTA"}
          </Button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="block w-full text-center font-display text-xs tracking-widest-2 text-gold/80 hover:text-gold"
          >
            {mode === "signin" ? "CRIAR NOVA CONTA" : "JÁ TENHO CONTA"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default AdminAuth;
