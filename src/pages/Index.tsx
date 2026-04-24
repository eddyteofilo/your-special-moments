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



const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Ch%C3%A1cara%20Ilha%20da%20Madeira%2C%20S%C3%A3o%20Paulo%20-%20SP";

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
    <main className="min-h-screen bg-background text-foreground selection:bg-gold/30">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-deep px-6 py-20">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--gold) 1px, transparent 0)', backgroundSize: '48px 48px' }} />
        
        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center animate-fade-up">
          <p className="font-display text-xs tracking-[0.4em] text-gold/80 uppercase">
            Temos um convite especial para vocês
          </p>
          
          <h2 className="mt-10 font-script text-6xl text-gold sm:text-8xl drop-shadow-2xl">
            Aceitam ser nossos
          </h2>
          
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="font-script text-7xl text-gold sm:text-9xl">Padrinho</span>
            <span className="font-display text-base tracking-[0.5em] text-gold/40 my-2">E</span>
            <span className="font-script text-7xl text-gold sm:text-9xl">Madrinha</span>
          </div>

          <div className="mt-16 flex items-center gap-6 w-full max-w-xs">
            <div className="h-px flex-1 bg-gold/30" />
            <Heart className="h-5 w-5 text-gold fill-gold animate-pulse" />
            <div className="h-px flex-1 bg-gold/30" />
          </div>

          <h1 className="mt-8 font-display text-4xl font-bold tracking-[0.3em] text-gold sm:text-5xl">
            KAIO E DEBORA
          </h1>

          <p className="mt-12 max-w-lg font-serif text-xl leading-relaxed text-foreground/90 sm:text-2xl">
            Vocês foram escolhidos com muito amor para caminhar ao nosso lado, 
            guardando, cuidando e torcendo sempre por nós!
          </p>
          
          <p className="mt-8 font-serif text-lg italic text-gold/90 border-b border-gold/20 pb-4">
            Obrigado por aceitarem esse convite e por fazerem parte da nossa história!
          </p>

          <div className="mt-16 w-full max-w-md">
            <Countdown targetDate="2026-06-06T17:30:00" />
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-3 items-start w-full border-t border-gold/20 pt-12">
            <div className="flex flex-col items-center gap-3">
              <Calendar className="h-6 w-6 text-gold" />
              <span className="font-display text-[11px] tracking-widest text-gold/60 uppercase">Data</span>
              <span className="font-serif text-xl">06 de Junho, 2026</span>
            </div>
            <div className="flex flex-col items-center gap-3 border-gold/20 sm:border-x sm:px-8">
              <Clock className="h-6 w-6 text-gold" />
              <span className="font-display text-[11px] tracking-widest text-gold/60 uppercase">Horário</span>
              <span className="font-serif text-xl">17:30 Horas</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <MapPin className="h-6 w-6 text-gold" />
              <span className="font-display text-[11px] tracking-widest text-gold/60 uppercase">Local</span>
              <span className="font-serif text-xl leading-tight text-center">Chacara Ilha da Madeira<br/><span className="text-sm text-muted-foreground italic">São Paulo, SP</span></span>
            </div>
          </div>

          <button
            onClick={scrollToForm}
            className="group mt-20 border-2 border-gold px-16 py-5 font-display text-[11px] font-bold tracking-[0.3em] text-gold transition-all hover:bg-gold hover:text-navy-deep luxury-shadow uppercase"
          >
            CONFIRMAR PRESENÇA
          </button>
        </div>
      </section>

      <section className="relative bg-background px-6 py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-gold/0 to-gold/40" />
        <div className="mx-auto max-w-3xl text-center relative z-10">
          <Heart className="mx-auto h-8 w-8 text-gold fill-gold/10" />
          <p className="mt-12 font-serif text-3xl italic leading-[1.8] text-foreground/95 sm:text-4xl">
            "Entre caminhos que se cruzaram e promessas que floresceram, Deus
            escreveu uma história onde dois se tornaram um. E nenhuma jornada é
            completa sem aqueles que caminham ao lado."
          </p>
          <p className="mt-10 font-display text-xs tracking-[0.5em] text-gold uppercase opacity-80">
            MATEUS 19:6
          </p>
        </div>
      </section>

      <section className="relative bg-[#0F172A] px-6 py-32 border-y border-gold/10">
        <div className="mx-auto max-w-2xl text-center">
          <Divider label="COMO CHEGAR" />
          <h2 className="mt-10 font-serif text-5xl italic text-foreground sm:text-6xl">
            Localização
          </h2>
          <p className="mt-6 font-serif text-xl text-muted-foreground leading-relaxed">
            Chácara Ilha da Madeira<br/>
            Av. Professor Hermógenes de Freitas Leitão Filho, 1000<br/>
            São Paulo, SP
          </p>
          
          <div className="mt-16 flex justify-center">
            <Button
              asChild
              className="h-16 w-full max-w-sm rounded-none bg-gold font-display text-xs font-bold tracking-[0.3em] text-navy-deep hover:bg-gold/90 luxury-shadow uppercase"
            >
              <a href={MAPS_URL} target="_blank" rel="noreferrer">
                VER LOCALIZAÇÃO NO MAPA
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section ref={formRef} className="relative bg-background px-6 py-32">
        <div className="mx-auto max-w-xl">
          <div className="text-center">
            <Divider label="RSVP" />
            <h2 className="mt-8 font-serif text-5xl italic text-foreground sm:text-6xl">
              Confirme sua presença
            </h2>
            <p className="mt-6 font-serif text-xl text-muted-foreground">
              Sua resposta é essencial para organizarmos tudo com carinho.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-16 space-y-10 glass-card p-10 sm:p-14 luxury-shadow"
          >
            <div className="space-y-8">
              <Field label="Nome completo *">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  maxLength={120}
                  className="h-12 border-x-0 border-b-2 border-t-0 border-gold/20 bg-transparent rounded-none px-0 text-xl font-serif focus-visible:ring-0 focus-visible:border-gold transition-colors placeholder:text-muted-foreground/30"
                />
              </Field>

              <Field label="WhatsApp *">
                <Input
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  inputMode="numeric"
                  className="h-12 border-x-0 border-b-2 border-t-0 border-gold/20 bg-transparent rounded-none px-0 text-xl font-serif focus-visible:ring-0 focus-visible:border-gold transition-colors placeholder:text-muted-foreground/30"
                />
              </Field>

              <Field label="Nome do acompanhante (opcional)">
                <Input
                  value={companion}
                  onChange={(e) => setCompanion(e.target.value)}
                  placeholder="Nome do acompanhante"
                  maxLength={120}
                  className="h-12 border-x-0 border-b-2 border-t-0 border-gold/20 bg-transparent rounded-none px-0 text-xl font-serif focus-visible:ring-0 focus-visible:border-gold transition-colors placeholder:text-muted-foreground/30"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <ChoiceButton active={role === "PADRINHO"} onClick={() => setRole("PADRINHO")}>
                PADRINHO
              </ChoiceButton>
              <ChoiceButton active={role === "MADRINHA"} onClick={() => setRole("MADRINHA")}>
                MADRINHA
              </ChoiceButton>
            </div>

            <div className="space-y-4">
              <Label className="font-display text-[11px] tracking-[0.2em] text-gold/60 uppercase">
                De quem você será padrinho/madrinha? *
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <ChoiceButton active={side === "KAIO"} onClick={() => setSide("KAIO")}>
                  DO KAIO
                </ChoiceButton>
                <ChoiceButton active={side === "DEBORA"} onClick={() => setSide("DEBORA")}>
                  DA DÉBORA
                </ChoiceButton>
              </div>
            </div>

            <div className="grid gap-4 pt-10 sm:grid-cols-2">
              <Button
                type="button"
                disabled={loading !== null}
                onClick={() => handleSubmit("accepted")}
                className="h-16 rounded-none bg-gold font-display text-[11px] font-bold tracking-[0.3em] text-navy-deep hover:bg-gold/90 transition-all uppercase"
              >
                {loading === "accepted" ? (
                  <Loader2 className="mr-2 h-5 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-5 w-4" />
                )}
                ACEITAR CONVITE
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading !== null}
                onClick={() => handleSubmit("declined")}
                className="h-16 rounded-none border-gold/30 bg-transparent font-display text-[11px] font-bold tracking-[0.3em] text-gold hover:bg-gold/5 hover:text-gold hover:border-gold transition-all uppercase"
              >
                {loading === "declined" ? (
                  <Loader2 className="mr-2 h-5 w-4 animate-spin" />
                ) : (
                  <X className="mr-2 h-5 w-4" />
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
