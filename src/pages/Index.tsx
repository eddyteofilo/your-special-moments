import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Heart, Loader2, MapPin, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { maskPhone, onlyDigits } from "@/lib/phone";
import { supabase } from "@/integrations/supabase/client";
import { Monogram, Divider } from "@/components/wedding/Monogram";
import Countdown from "@/components/wedding/Countdown";

type Role = "PADRINHO" | "MADRINHA" | null;
type Side = "KAIO" | "DEBORA" | null;

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  telefone: z.string().refine((v) => onlyDigits(v).length >= 10, "Telefone inválido"),
  acompanhante: z.string().trim().max(120).optional(),
});



const Index = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [companion, setCompanion] = useState("");
  const [role, setRole] = useState<Role>(null);
  const [side, setSide] = useState<Side>(null);
  const [loading, setLoading] = useState<"accepted" | "declined" | null>(null);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleSubmit = async (response: "accepted" | "declined") => {
    const parsed = schema.safeParse({ nome: name, telefone: phone, acompanhante: companion });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!role || !side) {
      toast.error("Selecione padrinho/madrinha e de quem.");
      return;
    }

    setLoading(response);
    const payload = {
      nome: parsed.data.nome,
      telefone: parsed.data.telefone,
      acompanhante: parsed.data.acompanhante || null,
      papel: role,
      lado: side,
      status: response === "accepted" ? "aceito" : "recusado",
    } as const;

    const { error } = await supabase.from("confirmacoes").insert(payload);
    setLoading(null);

    if (error) {
      console.error(error);
      toast.error("Não foi possível registrar sua resposta. Tente novamente.");
      return;
    }

    const guestName = parsed.data.nome.split(" ")[0];
    if (response === "accepted") {
      navigate(`/confirmado?nome=${encodeURIComponent(guestName)}&papel=${role}`);
    } else {
      navigate(`/recusar?nome=${encodeURIComponent(guestName)}`);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-deep px-6 py-20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--gold)) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center animate-fade-up">
          <p className="font-display text-xs tracking-widest-2 text-gold/80">
            Temos um convite muito especial para vocês!
          </p>
          
          <h2 className="mt-8 font-script text-5xl text-gold sm:text-7xl">
            Aceitam ser nossos
          </h2>
          
          <div className="mt-4 flex flex-col items-center">
            <span className="font-script text-6xl text-gold sm:text-8xl">Padrinho</span>
            <span className="font-display text-sm tracking-widest-2 text-gold/60">E</span>
            <span className="font-script text-6xl text-gold sm:text-8xl">Madrinha</span>
          </div>

          <div className="mt-12 flex items-center gap-4">
            <Heart className="h-4 w-4 text-gold fill-gold" />
            <h1 className="font-display text-3xl font-medium tracking-widest-2 text-gold sm:text-4xl">
              KAIO E DEBORA
            </h1>
            <Heart className="h-4 w-4 text-gold fill-gold" />
          </div>

          <p className="mt-10 max-w-lg font-serif text-lg leading-relaxed text-foreground/80 sm:text-xl">
            Vocês foram escolhidos com muito amor para caminhar ao nosso lado, 
            guardando, cuidando e torcendo sempre por nós!
          </p>
          
          <p className="mt-6 font-serif text-base italic text-gold/90">
            Obrigado por aceitarem esse convite e por fazerem parte da nossa história!
          </p>

          <div className="mt-12 w-full max-w-md border-y border-gold/20 py-8">
            <Countdown targetDate="2026-06-06T17:30:00" />
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 items-center">
            <div className="flex flex-col items-center gap-2">
              <Calendar className="h-5 w-5 text-gold" />
              <span className="font-display text-[10px] tracking-widest text-gold/60">DIA</span>
              <span className="font-serif text-lg">06/06/2026</span>
            </div>
            <div className="flex flex-col items-center gap-2 border-gold/20 sm:border-x sm:px-8">
              <Clock className="h-5 w-5 text-gold" />
              <span className="font-display text-[10px] tracking-widest text-gold/60">HORÁRIO</span>
              <span className="font-serif text-lg">17:30hrs</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MapPin className="h-5 w-5 text-gold" />
              <span className="font-display text-[10px] tracking-widest text-gold/60">LOCAL</span>
              <span className="font-serif text-lg leading-tight text-center">Chacara Ilha da Madeira<br/><span className="text-sm text-muted-foreground">São Paulo - SP</span></span>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="p-3 bg-white shadow-xl">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent("https://maps.app.goo.gl/YyR9pZ7Y1N1XJk4J8")}`} 
                alt="QR Code Localização"
                className="h-32 w-32"
              />
            </div>
            <span className="font-display text-[10px] tracking-widest text-gold/60">ESCANEIE PARA ABRIR NO GPS</span>
          </div>

          <button
            onClick={scrollToForm}
            className="group mt-16 border border-gold px-12 py-4 font-display text-xs tracking-widest-2 text-gold transition-all hover:bg-gold hover:text-primary-foreground shadow-gold"
          >
            CONFIRMAR PRESENÇA
          </button>
        </div>
      </section>

      <section className="relative bg-background px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Heart className="mx-auto h-6 w-6 text-gold" />
          <p className="mt-8 font-serif text-2xl italic leading-relaxed text-foreground/90 sm:text-3xl">
            "Entre caminhos que se cruzaram e promessas que floresceram, Deus
            escreveu uma história onde dois se tornaram um. E nenhuma jornada é
            completa sem aqueles que caminham ao lado."
          </p>
          <p className="mt-8 font-display text-xs tracking-widest-2 text-gold">
            MATEUS 19:6
          </p>
        </div>
      </section>

      <section className="relative bg-navy-deep/40 px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Divider label="COMO CHEGAR" />
          <h2 className="mt-8 font-serif text-4xl italic text-foreground sm:text-5xl">
            Localização
          </h2>
          <p className="mt-4 font-serif text-lg text-muted-foreground">
            Chácara Ilha da Madeira — São Paulo, SP
          </p>
          
          <div className="mt-12 flex justify-center">
            <Button
              className="h-14 w-full max-w-xs rounded-none bg-gold font-display text-xs tracking-widest-2 text-primary-foreground hover:bg-gold/90 shadow-gold"
              onClick={() => window.open("https://maps.app.goo.gl/YyR9pZ7Y1N1XJk4J8", "_blank")}
            >
              VER LOCALIZAÇÃO NO MAPA
            </Button>
          </div>
        </div>
      </section>



      <section ref={formRef} className="relative bg-secondary/40 px-6 py-24">
        <div className="mx-auto max-w-xl">
          <div className="text-center">
            <Divider label="SUA RESPOSTA" />
            <h2 className="mt-6 font-serif text-4xl italic text-foreground sm:text-5xl">
              Confirme sua presença
            </h2>
            <p className="mt-4 font-serif text-lg text-muted-foreground">
              Preencha os dados abaixo e nos diga se poderá nos acompanhar.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-12 space-y-7 border border-gold/30 bg-card/40 p-8 backdrop-blur-sm sm:p-10"
          >
            <Field label="Nome completo *">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                maxLength={120}
                className="border-x-0 border-b border-t-0 border-gold/40 bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:border-gold"
              />
            </Field>

            <Field label="WhatsApp *">
              <Input
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                inputMode="numeric"
                className="border-x-0 border-b border-t-0 border-gold/40 bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:border-gold"
              />
            </Field>

            <Field label="Nome do acompanhante (opcional)">
              <Input
                value={companion}
                onChange={(e) => setCompanion(e.target.value)}
                placeholder="Nome do acompanhante"
                maxLength={120}
                className="border-x-0 border-b border-t-0 border-gold/40 bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:border-gold"
              />
            </Field>

            <div className="space-y-3">
              <Label className="font-display text-xs tracking-widest-2 text-gold">
                Você foi convidado(a) como *
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <ChoiceButton active={role === "PADRINHO"} onClick={() => setRole("PADRINHO")}>
                  PADRINHO
                </ChoiceButton>
                <ChoiceButton active={role === "MADRINHA"} onClick={() => setRole("MADRINHA")}>
                  MADRINHA
                </ChoiceButton>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-display text-xs tracking-widest-2 text-gold">
                De quem você será padrinho/madrinha? *
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <ChoiceButton active={side === "KAIO"} onClick={() => setSide("KAIO")}>
                  DO KAIO
                </ChoiceButton>
                <ChoiceButton active={side === "DEBORA"} onClick={() => setSide("DEBORA")}>
                  DA DÉBORA
                </ChoiceButton>
              </div>
            </div>

            <div className="grid gap-3 pt-4 sm:grid-cols-2">
              <Button
                type="button"
                disabled={loading !== null}
                onClick={() => handleSubmit("accepted")}
                className="h-12 rounded-none bg-gold font-display text-xs tracking-widest-2 text-primary-foreground hover:bg-gold/90"
              >
                {loading === "accepted" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                ACEITAR CONVITE
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading !== null}
                onClick={() => handleSubmit("declined")}
                className="h-12 rounded-none border-gold/60 bg-transparent font-display text-xs tracking-widest-2 text-gold hover:bg-gold/10 hover:text-gold"
              >
                {loading === "declined" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                RECUSAR
              </Button>
            </div>
          </form>
        </div>
      </section>

      <footer className="border-t border-gold/20 bg-background px-6 py-16 text-center">
        <Monogram />
        <p className="mt-6 font-serif text-3xl italic text-foreground">Kaio & Débora</p>
        <p className="mt-3 font-display text-xs tracking-widest-2 text-gold">
          06 DE JUNHO DE 2026
        </p>
        <p className="mt-6 font-serif text-base italic text-muted-foreground">
          Feito com amor para celebrar nosso grande dia.
        </p>
      </footer>
    </main>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="font-display text-xs tracking-widest-2 text-gold">{label}</Label>
    {children}
  </div>
);

const ChoiceButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "border py-3 font-display text-xs tracking-widest-2 transition-all",
      active
        ? "border-gold bg-gold text-primary-foreground"
        : "border-gold/40 text-foreground/80 hover:border-gold hover:text-gold",
    )}
  >
    {children}
  </button>
);

export default Index;
