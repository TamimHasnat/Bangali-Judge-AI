import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useCreateConfession } from "@/hooks/use-confessions";
import { PersonaSelector, PERSONAS } from "@/components/persona-selector";
import { JudgmentCard } from "@/components/judgment-card";
import { TrendingFeed } from "@/components/trending-feed";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Frown, Search, AlertTriangle } from "lucide-react";

const MOODS = [
  { id: "good", name: "ভালো মুড", icon: <Smile className="text-green-500" />, prompt: "good" },
  { id: "suspicious", name: "সন্দেহ মুড", icon: <Search className="text-yellow-500" />, prompt: "suspicious" },
  { id: "angry", name: "রাগান্বিত খালা", icon: <Frown className="text-red-500" />, prompt: "angry" },
] as const;

const NOTICES = [
  "আজ প্রেম সংক্রান্ত মামলা গ্রহণযোগ্য নয়",
  "বিচারক আজ খারাপ মুডে আছেন",
  "ওয়াইফাই স্লো থাকলে বিচার বিলম্বিত হবে",
  "অযথা বিচার চেয়ে বিরক্ত করবেন না",
  "সব বিচার ডিজিটাল পদ্ধতিতে হচ্ছে",
];

export default function Home() {
  const [content, setContent] = useState("");
  const [persona, setPersona] = useState(PERSONAS[0].id);
  const [mood, setMood] = useState<"good" | "suspicious" | "angry">("suspicious");
  const [notice, setNotice] = useState(NOTICES[0]);
  const createMutation = useCreateConfession();

  useEffect(() => {
    const interval = setInterval(() => {
      setNotice(NOTICES[Math.floor(Math.random() * NOTICES.length)]);
    }, 5000);
    setMood(MOODS[Math.floor(Math.random() * MOODS.length)].id as any);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate({ content, persona, judgeMood: mood });
  };

  const handleReset = () => {
    setContent("");
    createMutation.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentMood = MOODS.find(m => m.id === mood) || MOODS[1];
  const { data: dailyStats } = useQuery({ 
    queryKey: [api.stats.dailyCount.path],
    queryFn: async () => {
      const res = await fetch(api.stats.dailyCount.path);
      return res.json() as Promise<{ count: number }>;
    },
    refetchInterval: 10000
  });

  const { data: randomSinner } = useQuery({
    queryKey: [api.confessions.random.path],
    queryFn: async () => {
      const res = await fetch(api.confessions.random.path);
      if (!res.ok) return null;
      return res.json();
    }
  });

  return (
    <div className="min-h-screen w-full pb-24 overflow-x-hidden">
      {/* Notice Banner */}
      <div className="w-full bg-yellow-400 border-b-4 border-foreground py-2 overflow-hidden whitespace-nowrap flex items-center relative z-50">
        <motion.div 
          animate={{ x: ["100%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="inline-block font-display font-black text-lg text-foreground uppercase tracking-wider"
        >
          🚨 {notice} 🚨 {notice} 🚨 {notice}
        </motion.div>
      </div>

      <header className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 bg-card border-2 border-foreground p-2 rounded-xl neo-shadow-xs">
          <span className="font-bold text-sm">মুড:</span>
          {currentMood.icon}
          <span className="font-black text-xs uppercase">{currentMood.name}</span>
        </div>
        
        <div className="flex items-center gap-2 bg-primary text-primary-foreground border-2 border-foreground p-2 rounded-xl neo-shadow-xs">
          <span className="font-bold text-xs uppercase">আজকের মোট বিচার:</span>
          <span className="font-black text-lg">{dailyStats?.count || 0}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="text-center max-w-3xl mx-auto mb-12 relative">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black uppercase tracking-tighter leading-none mb-4 text-foreground drop-shadow-[4px_4px_0_hsl(var(--primary))]">
            Bangali Judge AI
          </h1>
          <p className="text-xl md:text-2xl font-sans font-medium text-muted-foreground">
            পাড়ার সর্বজনীন সালিশ। অপরাধ স্বীকার করো আর রায় শোনো।
          </p>
        </div>

        {randomSinner && (
          <motion.div
            initial={{ rotate: -1 }}
            animate={{ rotate: [1, -1, 1] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="max-w-md mx-auto mb-12 bg-red-500 text-white p-4 rounded-2xl border-4 border-foreground neo-shadow text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:10px_10px]"></div>
            <h3 className="font-display font-black text-2xl mb-2">🔥 আজকের বড় পাপী 🔥</h3>
            <p className="italic text-lg">"{randomSinner.content}"</p>
            <div className="mt-2 text-sm font-bold opacity-80">— {randomSinner.judgment.slice(0, 50)}...</div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!createMutation.isSuccess ? (
            <motion.div
              key="input-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl mx-auto bg-card rounded-3xl border-4 border-foreground p-6 md:p-10 neo-shadow mb-20"
            >
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <label htmlFor="confession" className="font-display font-bold text-3xl">
                    ১. তোমার অপরাধ লিখো ✍️
                  </label>
                  <Textarea
                    id="confession"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="রুমমেটের বিরিয়ানি খেয়ে বিড়ালের দোষ দিছি..."
                    className="min-h-[150px] text-xl p-6 rounded-2xl border-4 border-foreground neo-shadow-sm focus-visible:ring-0 resize-y font-sans"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <label className="font-display font-bold text-3xl">
                    ২. বিচারক বেছে নাও 👨‍⚖️
                  </label>
                  <PersonaSelector selected={persona} onSelect={setPersona} />
                </div>

                <Button
                  type="submit"
                  disabled={!content.trim() || createMutation.isPending}
                  className="w-full text-2xl h-20 md:h-24 rounded-2xl bg-primary text-primary-foreground border-4 border-foreground neo-shadow font-display font-black uppercase tracking-wider transition-all"
                >
                  {createMutation.isPending ? "বিচার চলছে..." : "বিচার চাই!"}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="result-section"
              className="mb-20"
            >
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-display font-black mb-4">
                  রায় ঘোষণা করা হলো 🔨
                </h2>
                <Button 
                  onClick={handleReset}
                  variant="outline" 
                  className="rounded-full border-2 border-foreground neo-shadow-sm font-bold"
                >
                  আবার অপরাধ করো
                </Button>
              </div>

              {createMutation.data && (
                <JudgmentCard
                  confession={createMutation.data.content}
                  judgment={createMutation.data.judgment}
                  personaId={createMutation.data.persona}
                  data={createMutation.data}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full h-4 bg-foreground/5 mb-16 rounded-full"></div>
        <TrendingFeed />
      </main>
    </div>
  );
}
