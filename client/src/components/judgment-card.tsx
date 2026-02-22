import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PERSONAS } from "./persona-selector";

interface JudgmentCardProps {
  confession: string;
  judgment: string;
  personaId: string;
}

export function JudgmentCard({ confession, judgment, personaId }: JudgmentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const persona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High resolution
        backgroundColor: null,
        useCORS: true,
        logging: false,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
      className="w-full max-w-2xl mx-auto flex flex-col gap-4"
    >
      {/* The actual meme card that will be exported */}
      <div
        ref={cardRef}
        className={`p-6 md:p-8 rounded-3xl border-4 border-foreground shadow-[8px_8px_0_0_hsl(var(--foreground))] relative overflow-hidden ${persona.color}`}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 opacity-10 text-[12rem] -translate-y-1/4 translate-x-1/4 pointer-events-none select-none">
          {persona.icon}
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 bg-background/20 w-fit px-4 py-2 rounded-full border-2 border-foreground backdrop-blur-sm">
            <span className="text-2xl">{persona.icon}</span>
            <span className="font-display font-bold text-lg tracking-wide">
              {persona.name} says...
            </span>
          </div>

          <div className="bg-background text-foreground p-6 rounded-2xl border-4 border-foreground neo-shadow-sm mb-6">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
              The Crime
            </p>
            <p className="text-xl md:text-2xl font-display leading-relaxed">
              "{confession}"
            </p>
          </div>

          <div className="pl-4 border-l-4 border-foreground/30">
            <p className="text-sm font-bold uppercase tracking-widest text-foreground/70 mb-2">
              The Verdict
            </p>
            <p className="text-2xl md:text-3xl font-display font-bold leading-tight">
              {judgment}
            </p>
          </div>
          
          <div className="mt-8 flex justify-between items-end border-t-2 border-foreground/20 pt-4">
            <p className="font-display font-black text-xl tracking-tight">
              Bangali Judge AI ⚖️
            </p>
            <p className="text-sm font-bold opacity-70">
              Made with ☕ by someone judging you
            </p>
          </div>
        </div>
      </div>

      {/* Actions (Not exported in image) */}
      <div className="flex gap-4 justify-end">
        <Button
          onClick={handleDownload}
          disabled={isExporting}
          className="neo-shadow rounded-xl bg-background text-foreground border-2 border-foreground hover:bg-muted"
          size="lg"
        >
          {isExporting ? (
            "Generating Meme..."
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Download Meme
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
