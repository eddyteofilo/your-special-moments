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
const VENUE_CITY = "São Paulo - SP";
const VENUE_QUERY = encodeURIComponent(`${VENUE_NAME}, ${VENUE_CITY}`);
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${VENUE_QUERY}`;
const WHATSAPP_GROUP = "https://chat.whatsapp.com/Gmco2p5wXveBhtfHToc7H9";

const Confirmado = () => {
  const [params] = useSearchParams();
  const inviteRef = useRef<HTMLDivElement>(null);
  const nome = params.get("nome") || "";
  const papel = params.get("papel"); // PADRINHO | MADRINHA

  const traje =
    papel === "MADRINHA"
      ? "Vestido Azul Celeste Claro"
      : papel === "PADRINHO"
      ? "Terno Azul Royal Escuro"
      : null;

  const handleDownload = async () => {
    if (!inviteRef.current) return;
    
    toast.info("Gerando seu convite em PDF...");
    
    try {
      const element = inviteRef.current;
      
      // Force fonts to load and apply
      await document.fonts.ready;
      
      // Temporarily show it for capture with a better strategy
      element.style.display = "flex";
      element.style.position = "static";
      element.style.top = "0";
      element.style.left = "0";
      
      const canvas = await window.html2canvas(element, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        backgroundColor: "#001529",
        onclone: (clonedDoc: Document) => {
          const el = clonedDoc.getElementById("printable-card");
          if (el) {
            el.style.display = "flex";
            el.style.position = "static";
          }
        }
      });
      
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      
      // Clickable area for the map
      pdf.link(pdfWidth/4, pdfHeight - 60, pdfWidth/2, 20, { url: MAPS_URL });
      
      pdf.save(`Convite_Especial_${nome.replace(/\s+/g, "_")}.pdf`);
      
      // Restore state
      element.style.display = "none";
      element.style.position = "fixed";
      element.style.top = "-9999px";
      element.style.left = "-9999px";
      
      toast.success("Convite baixado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0B] px-6 py-16 text-white print:bg-white print:p-0">
      <div className="mx-auto max-w-2xl text-center animate-fade-up print:hidden">
        <Monogram />
        <p className="mt-8 font-display text-xs tracking-widest-2 text-[#D4AF37]">
          PRESENÇA CONFIRMADA
        </p>
        <h1 className="mt-4 font-serif text-4xl italic sm:text-5xl text-white">
          {nome ? `Que alegria, ${nome}!` : "Que alegria ter você conosco!"}
        </h1>
        <p className="mt-4 font-serif text-lg text-white/60">
          Sua presença tornará esse dia ainda mais especial.
        </p>

        <div className="mt-12 border border-[#D4AF37]/40 bg-[#FFFFFF08] p-10 backdrop-blur-sm shadow-[0_10px_40px_-10px_#D4AF3740]">
          <Divider label="NOSSO CASAMENTO" />
          <h2 className="mt-6 font-serif text-3xl italic text-white">Kaio & Débora</h2>

          <ul className="mt-8 space-y-4 text-left font-serif text-lg text-white/90">
            <Item icon={<Calendar className="h-5 w-5 text-[#D4AF37]" />} label="06 de Junho de 2026" />
            <Item icon={<Clock className="h-5 w-5 text-[#D4AF37]" />} label="17h30" />
            <Item
              icon={<MapPin className="h-5 w-5 text-[#D4AF37]" />}
              label={`${VENUE_NAME} — ${VENUE_CITY}`}
            />
          </ul>
        </div>

        <div className="mt-8 border border-[#D4AF37]/30 bg-[#FFFFFF05] p-8 text-left backdrop-blur-sm">
          <p className="font-display text-xs tracking-widest-2 text-[#D4AF37] mb-4">SUGESTÃO DE TRAJE</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="font-display text-[10px] tracking-widest text-[#D4AF37]/60 mb-1">FEMININO</p>
              <p className="font-serif text-xl italic text-white/90">Vestido Azul Celeste Claro</p>
            </div>
            <div className="border-t border-[#D4AF37]/20 pt-4 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-6">
              <p className="font-display text-[10px] tracking-widest text-[#D4AF37]/60 mb-1">MASCULINO</p>
              <p className="font-serif text-xl italic text-white/90">Terno Azul Royal Escuro</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <Button
            onClick={handleDownload}
            className="h-12 rounded-none bg-[#D4AF37] font-display text-xs tracking-widest-2 text-primary-foreground hover:bg-[#D4AF37EE] sm:col-span-1"
          >
            <Download className="mr-2 h-4 w-4" /> BAIXAR EM PDF
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-none border-[#D4AF37]/60 bg-transparent font-display text-xs tracking-widest-2 text-[#D4AF37] hover:bg-[#D4AF3710] hover:text-[#D4AF37]"
          >
            <a href={MAPS_URL} target="_blank" rel="noreferrer">
              <MapPin className="mr-2 h-4 w-4" /> LOCALIZAÇÃO
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-none border-[#D4AF37]/60 bg-transparent font-display text-xs tracking-widest-2 text-[#D4AF37] hover:bg-[#D4AF3710] hover:text-[#D4AF37]"
          >
            <a href={WHATSAPP_GROUP} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" /> WHATSAPP
            </a>
          </Button>
        </div>

        <Link
          to="/"
          className="mt-12 inline-flex items-center gap-2 font-display text-xs tracking-widest-2 text-[#D4AF37]/80 hover:text-[#D4AF37]"
        >
          <ArrowLeft className="h-4 w-4" /> VOLTAR AO INÍCIO
        </Link>
      </div>

      {/* Printable Card - Perfect Frame for A4 */}
      <div 
        ref={inviteRef}
        id="printable-card"
        className="hidden flex-col items-center justify-center bg-[#001529] text-white p-0 relative overflow-hidden" 
        style={{ width: '210mm', height: '297mm', position: 'fixed', top: '-9999px', left: '-9999px' }}
      >
        {/* Decorative Floral Frame */}
        <div className="absolute inset-10 border-[1px] border-[#D4AF37]/40 pointer-events-none" />
        <div className="absolute inset-12 border-[3px] border-[#D4AF37] pointer-events-none" />
        
        {/* Background Glitters */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 10% 10%, #D4AF37 1px, transparent 0), radial-gradient(circle at 90% 5%, #D4AF37 1.5px, transparent 0)', backgroundSize: '100px 100px' }} />

        <div className="relative z-10 flex flex-col items-center text-center px-24 w-full h-full justify-center">
          <p className="font-serif text-[28px] tracking-wide text-white/90 m-0">
            Temos um convite muito especial
          </p>
          <p className="font-serif text-[28px] tracking-wide text-white/90 mt-2">
            para vocês!
          </p>

          <h3 className="mt-14 font-serif text-[32px] text-white/80">
            Aceitam ser nossos
          </h3>

          <div className="mt-10 flex flex-col items-center gap-2">
            <span className="font-script text-[120px] leading-[0.6] text-[#D4AF37]">Padrinho</span>
            <span className="font-serif text-[28px] text-[#D4AF37] my-4">E</span>
            <span className="font-script text-[120px] leading-[0.6] text-[#D4AF37]">Madrinha</span>
          </div>

          <div className="mt-16 flex items-center gap-6 w-full max-w-sm">
            <div className="h-px flex-1 bg-[#D4AF37]/40" />
            <div className="flex gap-3">
              <Heart className="h-5 w-5 text-[#D4AF37] fill-[#D4AF37]" />
              <Heart className="h-8 w-8 text-[#D4AF37] fill-[#D4AF37] -mt-2" />
              <Heart className="h-5 w-5 text-[#D4AF37] fill-[#D4AF37]" />
            </div>
            <div className="h-px flex-1 bg-[#D4AF37]/40" />
          </div>

          <div className="mt-12 flex items-center gap-8">
            <Heart className="h-8 w-8 text-[#D4AF37] fill-[#D4AF37]" />
            <h1 className="font-display text-[52px] font-bold tracking-[0.2em] text-[#D4AF37]">
              KAIO E DEBORA
            </h1>
            <Heart className="h-8 w-8 text-[#D4AF37] fill-[#D4AF37]" />
          </div>

          <div className="mt-14 max-w-2xl font-serif text-[24px] leading-[1.5] text-white/95">
            <p className="m-0">Vocês foram escolhidos com muito amor</p>
            <p className="mt-2">para caminhar ao nosso lado,</p>
            <p className="mt-2">guardando, cuidando e torcendo</p>
            <p className="mt-2">sempre por nós!</p>
            
            <p className="mt-12 font-script text-[40px] text-[#D4AF37] leading-tight">
              Obrigado por aceitarem esse convite<br/>
              e por fazerem parte da nossa história!
            </p>
          </div>

          <div className="mt-16 w-full max-w-2xl">
             <div className="h-px w-full bg-[#D4AF37]/40 mb-10" />
             <div className="flex justify-between items-center px-16">
                <div className="text-center">
                  <p className="font-display text-[14px] tracking-widest text-[#D4AF37] mb-3 uppercase">Dia</p>
                  <p className="font-serif text-[34px] font-medium">06/06/2026</p>
                </div>
                <div className="h-20 w-px bg-[#D4AF37]/40 mx-12" />
                <div className="text-center">
                  <p className="font-display text-[14px] tracking-widest text-[#D4AF37] mb-3 uppercase">Horário</p>
                  <p className="font-serif text-[34px] font-medium">17:30hrs</p>
                </div>
             </div>
             <div className="h-px w-full bg-[#D4AF37]/40 mt-10" />
          </div>

          <div className="mt-12 text-center">
            <p className="font-display text-[14px] tracking-widest text-[#D4AF37] mb-3 uppercase m-0">Local</p>
            <p className="font-serif text-[30px] mb-1 m-0">Chacara Ilha da Madeira</p>
            <p className="font-serif text-[22px] text-white/70 italic m-0">São Paulo - SP</p>
          </div>

          <div className="mt-12 border-2 border-[#D4AF37] px-12 py-5 flex items-center gap-3">
            <span className="font-display text-[14px] tracking-widest-2 text-[#D4AF37]">CLIQUE PARA ABRIR ROTA</span>
            <ExternalLink className="h-5 w-5 text-[#D4AF37]" />
          </div>
          
          {nome && (
            <div className="absolute bottom-20 right-20 border-l-4 border-[#D4AF37]/20 pl-6 text-left">
              <p className="font-display text-[12px] tracking-[0.3em] text-[#D4AF37]/40 m-0">EXCLUSIVO PARA:</p>
              <p className="font-serif text-[26px] italic text-white/80 m-0">{nome}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

const Item = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <li className="flex items-center gap-3">
    {icon}
    <span>{label}</span>
  </li>
);

export default Confirmado;




