import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Share2, MessageCircle, Flag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PERSONAS } from "./persona-selector";
import { Progress } from "@/components/ui/progress";
import { Confession } from "@shared/schema";

interface JudgmentCardProps {
  confession: string;
  judgment: string;
  personaId: string;
  data?: Partial<Confession>;
}

export function JudgmentCard({ confession, judgment, personaId, data }: JudgmentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const persona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        width: 1080,
        height: 1080,
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector("[data-meme-container]") as HTMLElement;
          if (el) {
            el.style.width = "1080px";
            el.style.height = "1080px";
            el.style.display = "flex";
            el.style.flexDirection = "column";
            el.style.justifyContent = "center";
            el.style.padding = "60px";
          }
        }
      });

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `bangali-judge-${Date.now()}.png`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error("Failed to generate meme:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `বিচারক বলছেন: ${judgment}\n\nআমার অপরাধ: ${confession}\n\nনিজের বিচার পেতে ক্লিক করুন: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(`${confession}\n\nবিচার: ${judgment}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
      className="w-full max-w-2xl mx-auto flex flex-col gap-6"
    >
      <div
        ref={cardRef}
        data-meme-container
        className={`p-6 md:p-8 rounded-3xl border-4 border-foreground shadow-[8px_8px_0_0_hsl(var(--foreground))] relative overflow-hidden ${persona.color}`}
      >
        <div className="absolute top-0 right-0 opacity-10 text-[12rem] -translate-y-1/4 translate-x-1/4 pointer-events-none select-none">
          {persona.icon}
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 bg-background/20 w-fit px-4 py-2 rounded-full border-2 border-foreground backdrop-blur-sm">
            <span className="text-2xl">{persona.icon}</span>
            <span className="font-display font-bold text-lg tracking-wide">
              {persona.name} বলছে...
            </span>
          </div>

          <div className="bg-background text-foreground p-6 rounded-2xl border-4 border-foreground neo-shadow-sm mb-6">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
              তোমার অপরাধ
            </p>
            <p className="text-xl md:text-2xl font-display leading-relaxed">
              "{confession}"
            </p>
          </div>

          <div className="pl-4 border-l-4 border-foreground/30 mb-8">
            <p className="text-sm font-bold uppercase tracking-widest text-foreground/70 mb-2">
              রায়
            </p>
            <p className="text-2xl md:text-3xl font-display font-bold leading-tight">
              {judgment}
            </p>
          </div>

          {data?.redFlagScore !== undefined && (
            <div className="mb-8 bg-background/30 p-4 rounded-2xl border-2 border-foreground">
              <div className="flex justify-between mb-2">
                <span className="font-bold flex items-center gap-2">
                  <Flag className="w-4 h-4 text-red-600" /> রেড ফ্ল্যাগ মিটার
                </span>
                <span className="font-black">{data.redFlagScore}%</span>
              </div>
              <Progress value={data.redFlagScore} className="h-4 border-2 border-foreground bg-background" />
              <p className="mt-2 text-sm font-medium italic">{data.redFlagExplanation}</p>
            </div>
          )}

          {data?.padoshiComments && data.padoshiComments.length > 0 && (
            <div className="mb-8">
              <h3 className="font-display font-black text-lg mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> পাড়া প্রতিবেশীর মন্তব্য
              </h3>
              <div className="flex flex-col gap-3">
                {data.padoshiComments.map((comment, i) => (
                  <div key={i} className="bg-background p-3 rounded-xl border-2 border-foreground text-sm neo-shadow-xs italic">
                    "{comment}"
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-between items-end border-t-2 border-foreground/20 pt-4">
            <p className="font-display font-black text-xl tracking-tight">
              Bangali Judge AI – পাড়ার সালিশ ⚖️
            </p>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-tighter">
              www.bangalijudgeai.replit.app
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Button
          onClick={handleDownload}
          disabled={isExporting}
          className="neo-shadow rounded-xl bg-primary text-primary-foreground border-2 border-foreground"
        >
          {isExporting ? "জেনারেট হচ্ছে..." : <><Download className="w-4 h-4 mr-2" /> ডাউনলোড মিমি</>}
        </Button>
        <Button
          onClick={handleWhatsAppShare}
          className="neo-shadow rounded-xl bg-green-500 text-white border-2 border-foreground hover:bg-green-600"
        >
          <Share2 className="w-4 h-4 mr-2" /> হোয়াটসঅ্যাপে শেয়ার
        </Button>
        <Button
          onClick={handleCopyText}
          variant="outline"
          className="neo-shadow rounded-xl bg-background border-2 border-foreground"
        >
          টেক্সট কপি করুন
        </Button>
      </div>
    </motion.div>
  );
}
