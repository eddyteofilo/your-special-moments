import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Calendar, Clock, MapPin, MessageCircle, ArrowLeft, Download, Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Monogram, Divider } from "@/components/wedding/Monogram";
import { toast } from "sonner";

// Declare globals for the CDN scripts
declare global {
  interface Window {
    html2canvas: any;
    jspdf: any;
  }
}

const VENUE_NAME = "Chácara Ilha da Madeira";
const VENUE_ADDRESS = "Av. Professor Hermógenes de Freitas Leitão Filho, 1000";
const VENUE_CITY = "São Paulo, SP";
const MAPS_URL = "https://www.google.com/maps/dir/?api=1&destination=Ch%C3%A1cara+Ilha+da+Madeira+Av.+Professor+Herm%C3%B3genes+de+Freitas+Leit%C3%A3o+Filho+1000+S%C3%A3o+Paulo+SP";
const WHATSAPP_GROUP = "https://chat.whatsapp.com/Gmco2p5wXveBhtfHToc7H9";

const Confirmado = () => {
  const [params] = useSearchParams();
  const inviteRef = useRef<HTMLDivElement>(null);
  const nome = params.get("nome") || "";
  const papel = params.get("papel"); // PADRINHO | MADRINHA

  const handleDownload = async () => {
    if (!inviteRef.current) return;
    
    toast.info("Gerando seu convite premium...");
    
    try {
      const element = inviteRef.current;
      await document.fonts.ready;
      
      element.style.display = "flex";
      element.style.position = "static";
      
      const canvas = await window.html2canvas(element, {
        scale: 4, // Ultra high quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#030712",
        onclone: (clonedDoc: Document) => {
          const el = clonedDoc.getElementById("printable-card");
          if (el) { el.style.display = "flex"; el.style.position = "static"; }
        }
      });
      
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.link(pdfWidth/4, pdfHeight - 50, pdfWidth/2, 20, { url: MAPS_URL });
      
      pdf.save(`Convite_Premium_${nome.replace(/\s+/g, "_")}.pdf`);
      
      element.style.display = "none";
      element.style.position = "fixed";
      
      toast.success("Convite gerado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao gerar o PDF.");
    }
  };

  return (
    <main className="min-h-screen bg-background px-6 py-20 text-foreground selection:bg-gold/30">
      <div className="mx-auto max-w-2xl text-center animate-fade-up">
        <Monogram />
        <p className="mt-10 font-display text-xs tracking-[0.5em] text-gold uppercase">
          Presença Confirmada
        </p>
        <h1 className="mt-6 font-serif text-5xl italic sm:text-6xl text-foreground leading-tight">
          {nome ? `Que alegria, ${nome}!` : "Que alegria ter você conosco!"}
        </h1>
        <p className="mt-6 font-serif text-xl text-muted-foreground max-w-md mx-auto">
          Sua presença tornará esse dia inesquecível. Prepare o coração!
        </p>

        <div className="mt-16 glass-card p-12 luxury-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
          <Divider label="DETALHES DO EVENTO" />
          <h2 className="mt-8 font-serif text-4xl italic text-foreground">Kaio & Débora</h2>

          <ul className="mt-10 space-y-6 text-left font-serif text-xl text-foreground/90 mx-auto max-w-xs">
            <Item icon={<Calendar className="h-6 w-6 text-gold" />} label="06 de Junho de 2026" />
            <Item icon={<Clock className="h-6 w-6 text-gold" />} label="17h30 — Cerimônia" />
            <Item
              icon={<MapPin className="h-6 w-6 text-gold" />}
              label={VENUE_NAME}
            />
          </ul>
        </div>

        <div className="mt-10 glass-card p-10 text-left border-gold/10">
          <p className="font-display text-[11px] tracking-[0.3em] text-gold uppercase mb-6 opacity-60">Sugestão de Traje</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="font-display text-[10px] tracking-[0.4em] text-gold/40 mb-2 uppercase">Feminino</p>
              <p className="font-serif text-2xl italic text-foreground">Vestido Azul Celeste Claro</p>
            </div>
            <div className="pt-8 border-t border-gold/10 sm:pt-0 sm:border-t-0 sm:border-l sm:pl-10">
              <p className="font-display text-[10px] tracking-[0.4em] text-gold/40 mb-2 uppercase">Masculino</p>
              <p className="font-serif text-2xl italic text-foreground">Terno Azul Royal Escuro</p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <Button
            onClick={handleDownload}
            className="h-16 rounded-none bg-gold font-display text-[11px] font-bold tracking-[0.3em] text-navy-deep hover:bg-gold/90 transition-all uppercase sm:col-span-1 shadow-lg"
          >
            <Download className="mr-2 h-5 w-5" /> BAIXAR EM PDF
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-16 rounded-none border-gold/30 bg-transparent font-display text-[11px] font-bold tracking-[0.3em] text-gold hover:bg-gold/5 hover:border-gold transition-all uppercase"
          >
            <a href={MAPS_URL} target="_blank" rel="noreferrer">
              <MapPin className="mr-2 h-5 w-5" /> LOCALIZAÇÃO
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-16 rounded-none border-gold/30 bg-transparent font-display text-[11px] font-bold tracking-[0.3em] text-gold hover:bg-gold/5 hover:border-gold transition-all uppercase"
          >
            <a href={WHATSAPP_GROUP} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" /> WHATSAPP
            </a>
          </Button>
        </div>

        <Link
          to="/"
          className="mt-16 inline-flex items-center gap-3 font-display text-[11px] tracking-[0.4em] text-gold/60 hover:text-gold transition-colors uppercase"
        >
          <ArrowLeft className="h-4 w-4" /> VOLTAR AO INÍCIO
        </Link>
      </div>

      {/* Printable Card - Ultra Luxury Editorial Design */}
      <div 
        ref={inviteRef}
        id="printable-card"
        className="hidden flex-col items-center justify-center bg-[#030712] text-white p-0 relative overflow-hidden" 
        style={{ width: '210mm', height: '297mm', position: 'fixed', top: '-9999px', left: '-9999px' }}
      >
        {/* Border System */}
        <div className="absolute inset-8 border-[1px] border-[#C5A05944] pointer-events-none" />
        <div className="absolute inset-10 border-[3px] border-[#C5A059] pointer-events-none" />
        <div className="absolute inset-14 border-[1px] border-[#C5A05922] pointer-events-none" />
        
        {/* Subtle Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />

        <div className="relative z-10 flex flex-col items-center text-center px-24 w-full h-full justify-between py-32">
          <div className="flex flex-col items-center">
            <p className="font-display text-[14px] tracking-[0.8em] text-[#C5A059] uppercase m-0">
              Convite Especial
            </p>
            <div className="h-px w-24 bg-[#C5A05944] mt-6" />
          </div>

          <div className="flex flex-col items-center gap-4">
            <h3 className="font-serif text-[36px] italic text-white/70 m-0">
              Aceitam ser nossos
            </h3>
            <div className="flex flex-col items-center mt-6">
              <span className="font-script text-[140px] leading-[0.5] text-[#C5A059]">Padrinho</span>
              <span className="font-display text-[18px] tracking-[1em] text-[#C5A059] my-10 uppercase opacity-40">E</span>
              <span className="font-script text-[140px] leading-[0.5] text-[#C5A059]">Madrinha</span>
            </div>
          </div>

          <div className="flex flex-col items-center w-full">
            <div className="flex items-center gap-8 w-full max-w-md">
              <div className="h-px flex-1 bg-[#C5A05933]" />
              <Heart className="h-6 w-6 text-[#C5A059] fill-[#C5A059]" />
              <div className="h-px flex-1 bg-[#C5A05933]" />
            </div>
            <h1 className="mt-8 font-display text-[54px] font-bold tracking-[0.4em] text-[#C5A059] uppercase m-0">
              KAIO E DEBORA
            </h1>
          </div>

          <div className="max-w-2xl">
            <p className="font-serif text-[28px] italic leading-[1.6] text-white/80 m-0">
              "Vocês foram escolhidos com muito amor para caminhar ao nosso lado, 
              guardando, cuidando e torcendo sempre por nós!"
            </p>
            <p className="mt-14 font-script text-[44px] text-[#C5A059] m-0">
              Obrigado por fazerem parte da nossa história!
            </p>
          </div>

          <div className="w-full max-w-2xl border-t border-b border-[#C5A05933] py-12">
             <div className="flex justify-around items-center">
                <div className="text-center">
                  <p className="font-display text-[13px] tracking-[0.5em] text-[#C5A059] mb-4 uppercase opacity-60">Data</p>
                  <p className="font-serif text-[38px] m-0">06 . 06 . 2026</p>
                </div>
                <div className="h-20 w-px bg-[#C5A05933]" />
                <div className="text-center">
                  <p className="font-display text-[13px] tracking-[0.5em] text-[#C5A059] mb-4 uppercase opacity-60">Horário</p>
                  <p className="font-serif text-[38px] m-0">17:30 Horas</p>
                </div>
             </div>
          </div>

          <div className="text-center">
            <p className="font-display text-[13px] tracking-[0.5em] text-[#C5A059] mb-4 uppercase opacity-60 m-0">Local</p>
            <p className="font-serif text-[36px] m-0">Chácara Ilha da Madeira</p>
            <p className="font-serif text-[20px] text-white/50 italic mt-2 m-0">{VENUE_ADDRESS}</p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="border-[1.5px] border-[#C5A059] px-16 py-6 transition-all luxury-shadow">
              <span className="font-display text-[12px] font-bold tracking-[0.4em] text-[#C5A059] uppercase">Toque para Abrir Rota GPS</span>
            </div>
          </div>
          
          {nome && (
            <div className="absolute bottom-24 right-24 text-right opacity-40">
              <p className="font-display text-[11px] tracking-[0.5em] text-[#C5A059] m-0 uppercase mb-2">Exclusivo Para</p>
              <p className="font-serif text-[28px] italic text-white m-0">{nome}</p>
            </div>
          )}
        </div>
      </div>
  );
};

const Item = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <li className="flex items-center gap-3">
    {icon}
    <span>{label}</span>
  </li>
);

export default Confirmado;




