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
      // Temporarily show it for capture
      element.classList.remove("hidden");
      element.classList.add("flex");
      
      const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#001529",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      // Add a clickable invisible link on top of the map area
      // Position calculated based on the design
      pdf.link(pdfWidth/4, pdfHeight - 60, pdfWidth/2, 20, { url: MAPS_URL });
      
      pdf.save(`Convite_${nome.replace(/\s+/g, "_")}.pdf`);
      
      element.classList.add("hidden");
      element.classList.remove("flex");
      
      toast.success("Download concluído!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    }
  };

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground print:bg-white print:p-0">
      <div className="mx-auto max-w-2xl text-center animate-fade-up print:hidden">
        <Monogram />
        <p className="mt-8 font-display text-xs tracking-widest-2 text-gold">
          PRESENÇA CONFIRMADA
        </p>
        <h1 className="mt-4 font-serif text-4xl italic sm:text-5xl">
          {nome ? `Que alegria, ${nome}!` : "Que alegria ter você conosco!"}
        </h1>
        <p className="mt-4 font-serif text-lg text-muted-foreground">
          Sua presença tornará esse dia ainda mais especial.
        </p>

        <div className="mt-12 border border-gold/40 bg-card/40 p-10 backdrop-blur-sm shadow-gold/10">
          <Divider label="NOSSO CASAMENTO" />
          <h2 className="mt-6 font-serif text-3xl italic">Kaio & Débora</h2>

          <ul className="mt-8 space-y-4 text-left font-serif text-lg">
            <Item icon={<Calendar className="h-5 w-5 text-gold" />} label="06 de Junho de 2026" />
            <Item icon={<Clock className="h-5 w-5 text-gold" />} label="17h30" />
            <Item
              icon={<MapPin className="h-5 w-5 text-gold" />}
              label={`${VENUE_NAME} — ${VENUE_CITY}`}
            />
          </ul>
        </div>

        {traje && (
          <div className="mt-8 border border-gold/30 bg-secondary/40 p-6 text-left">
            <p className="font-display text-xs tracking-widest-2 text-gold">SUGESTÃO DE TRAJE</p>
            <p className="mt-2 font-serif text-xl italic">{traje}</p>
          </div>
        )}

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <Button
            onClick={handleDownload}
            className="h-12 rounded-none bg-gold font-display text-xs tracking-widest-2 text-primary-foreground hover:bg-gold/90 sm:col-span-1"
          >
            <Download className="mr-2 h-4 w-4" /> BAIXAR EM PDF
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-none border-gold/60 bg-transparent font-display text-xs tracking-widest-2 text-gold hover:bg-gold/10 hover:text-gold"
          >
            <a href={MAPS_URL} target="_blank" rel="noreferrer">
              <MapPin className="mr-2 h-4 w-4" /> LOCALIZAÇÃO
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-none border-gold/60 bg-transparent font-display text-xs tracking-widest-2 text-gold hover:bg-gold/10 hover:text-gold"
          >
            <a href={WHATSAPP_GROUP} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" /> WHATSAPP
            </a>
          </Button>
        </div>

        <Link
          to="/"
          className="mt-12 inline-flex items-center gap-2 font-display text-xs tracking-widest-2 text-gold/80 hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" /> VOLTAR AO INÍCIO
        </Link>
      </div>

      {/* Printable Card - Perfect Frame for A4 */}
      <div 
        ref={inviteRef}
        className="hidden flex-col items-center justify-center bg-[#001529] text-white p-0 relative overflow-hidden" 
        style={{ width: '210mm', height: '297mm', position: 'fixed', top: '-9999px', left: '-9999px' }}
      >
        {/* Decorative Floral Frame */}
        <div className="absolute inset-10 border-[1px] border-gold/40 pointer-events-none" />
        <div className="absolute inset-12 border-[3px] border-gold pointer-events-none" />
        
        {/* Background Glitters */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 10% 10%, #D4AF37 1px, transparent 0), radial-gradient(circle at 90% 5%, #D4AF37 1.5px, transparent 0)', backgroundSize: '100px 100px' }} />

        <div className="relative z-10 flex flex-col items-center text-center px-24 w-full h-full justify-center">
          <p className="font-serif text-[28px] tracking-wide text-white/90">
            Temos um convite muito especial<br/>para vocês!
          </p>

          <h3 className="mt-14 font-serif text-[32px] text-white/80">
            Aceitam ser nossos
          </h3>

          <div className="mt-10 flex flex-col items-center gap-4">
            <span className="font-script text-[130px] leading-[0.7] text-gold">Padrinho</span>
            <span className="font-serif text-[28px] text-gold">E</span>
            <span className="font-script text-[130px] leading-[0.7] text-gold">Madrinha</span>
          </div>

          <div className="mt-14 flex items-center gap-6 w-full max-w-sm">
            <div className="h-px flex-1 bg-gold/40" />
            <div className="flex gap-3">
              <Heart className="h-5 w-5 text-gold fill-gold" />
              <Heart className="h-8 w-8 text-gold fill-gold -mt-2" />
              <Heart className="h-5 w-5 text-gold fill-gold" />
            </div>
            <div className="h-px flex-1 bg-gold/40" />
          </div>

          <div className="mt-12 flex items-center gap-8">
            <Heart className="h-8 w-8 text-gold fill-gold" />
            <h1 className="font-display text-[56px] font-bold tracking-[0.25em] text-gold">
              KAIO E DEBORA
            </h1>
            <Heart className="h-8 w-8 text-gold fill-gold" />
          </div>

          <div className="mt-14 max-w-2xl font-serif text-[26px] leading-[1.6] text-white/95">
            <p>
              Vocês foram escolhidos com muito amor<br/>
              para caminhar ao nosso lado,<br/>
              guardando, cuidando e torcendo<br/>
              sempre por nós!
            </p>
            
            <p className="mt-10 font-script text-[42px] text-gold leading-tight">
              Obrigado por aceitarem esse convite<br/>
              e por fazerem parte da nossa história!
            </p>
          </div>

          <div className="mt-20 w-full max-w-2xl">
             <div className="h-px w-full bg-gold/40 mb-10" />
             <div className="flex justify-between items-center px-16">
                <div className="text-center">
                  <p className="font-display text-[16px] tracking-widest text-gold mb-3 uppercase">Dia</p>
                  <p className="font-serif text-[38px] font-medium">06/06/2026</p>
                </div>
                <div className="h-20 w-px bg-gold/40 mx-12" />
                <div className="text-center">
                  <p className="font-display text-[16px] tracking-widest text-gold mb-3 uppercase">Horário</p>
                  <p className="font-serif text-[38px] font-medium">17:30hrs</p>
                </div>
             </div>
             <div className="h-px w-full bg-gold/40 mt-10" />
          </div>

          <div className="mt-16 text-center">
            <p className="font-display text-[16px] tracking-widest text-gold mb-3 uppercase">Local</p>
            <p className="font-serif text-[32px] mb-1">Chacara Ilha da Madeira</p>
            <p className="font-serif text-[24px] text-white/70 italic">São Paulo - SP</p>
          </div>

          {/* Clickable Button in PDF (The pdf.link will cover this area) */}
          <div className="mt-14 border-2 border-gold px-12 py-5 flex items-center gap-3">
            <span className="font-display text-[14px] tracking-widest-2 text-gold">CLIQUE PARA ABRIR ROTA</span>
            <ExternalLink className="h-5 w-5 text-gold" />
          </div>

          <div className="mt-12">
             <Heart className="h-8 w-8 text-gold fill-gold" />
          </div>
          
          {nome && (
            <div className="absolute bottom-24 right-24 border-l-4 border-gold/20 pl-6 text-left">
              <p className="font-display text-[12px] tracking-[0.3em] text-gold/40">EXCLUSIVO PARA:</p>
              <p className="font-serif text-[28px] italic text-white/80">{nome}</p>
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




