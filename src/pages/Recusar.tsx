import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Monogram, Divider } from "@/components/wedding/Monogram";
import { supabase } from "@/integrations/supabase/client";

const Recusar = () => {
  const [params] = useSearchParams();
  const nome = params.get("nome") || "";
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!motivo.trim()) {
      toast.message("Você pode enviar sem motivo, sem problemas.");
    }
    setSaving(true);
    // Atualiza o motivo da última recusa deste convidado, se houver nome
    // Como não temos id, registramos um insert leve apenas se não havia.
    // Estratégia simples: gravar uma observação opcional como nova linha "recusado" só se houver nome.
    if (nome.trim()) {
      const { error } = await supabase.from("confirmacoes").insert({
        nome,
        telefone: "—",
        papel: "PADRINHO",
        lado: "KAIO",
        status: "recusado",
        motivo: motivo.trim() || null,
      });
      if (error) {
        console.error(error);
      }
    }
    setSaving(false);
    setSent(true);
    toast.success("Resposta registrada. Obrigado por nos avisar.");
  };

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-xl text-center animate-fade-up">
        <Monogram />
        <p className="mt-8 font-display text-xs tracking-widest-2 text-gold">RESPOSTA RECEBIDA</p>
        <h1 className="mt-4 font-serif text-4xl italic sm:text-5xl">
          Sentiremos sua falta...
        </h1>
        <p className="mt-4 font-serif text-lg text-muted-foreground">
          Entendemos que nem sempre é possível estar presente. Agradecemos imensamente o seu carinho.
        </p>

        <div className="mt-12 border border-gold/30 bg-card/40 p-8 text-left backdrop-blur-sm">
          <Divider label="UMA ÚLTIMA NOTA" />
          <div className="mt-6 space-y-3">
            <Label className="font-display text-xs tracking-widest-2 text-gold">
              Motivo (opcional)
            </Label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value.slice(0, 500))}
              disabled={sent}
              placeholder="Se quiser, compartilhe o motivo..."
              className="min-h-[120px] rounded-none border-gold/40 bg-transparent focus-visible:ring-0 focus-visible:border-gold"
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={saving || sent}
            className="mt-6 h-12 w-full rounded-none bg-gold font-display text-xs tracking-widest-2 text-primary-foreground hover:bg-gold/90"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {sent ? "RESPOSTA ENVIADA" : "ENVIAR RESPOSTA"}
          </Button>
        </div>

        <Link
          to="/"
          className="mt-12 inline-flex items-center gap-2 font-display text-xs tracking-widest-2 text-gold/80 hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" /> VOLTAR AO INÍCIO
        </Link>
      </div>
    </main>
  );
};

export default Recusar;
