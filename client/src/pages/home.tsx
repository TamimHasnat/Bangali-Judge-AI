import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateConfession } from "@/hooks/use-confessions";
import { PersonaSelector, PERSONAS } from "@/components/persona-selector";
import { JudgmentCard } from "@/components/judgment-card";
import { TrendingFeed } from "@/components/trending-feed";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const [content, setContent] = useState("");
  const [persona, setPersona] = useState(PERSONAS[0].id);
  const createMutation = useCreateConfession();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate({ content, persona });
  };

  const handleReset = () => {
    setContent("");
    createMutation.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen w-full pb-24 overflow-x-hidden">
      {/* Decorative Header Banner */}
      <div className="w-full bg-primary border-b-4 border-foreground py-3 overflow-hidden whitespace-nowrap flex items-center">
        <div className="animate-[marquee_20s_linear_infinite] inline-block font-display font-black text-xl text-primary-foreground uppercase tracking-widest">
          ⚠️ WARNING: EXTREME JUDGMENT AHEAD ⚠️ NO MERCY ⚠️ PAARA'S BEST SALISH ⚠️ 
          ⚠️ WARNING: EXTREME JUDGMENT AHEAD ⚠️ NO MERCY ⚠️ PAARA'S BEST SALISH ⚠️
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-20">
        
        {/* Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <motion.div
            initial={{ rotate: -5, scale: 0.8, opacity: 0 }}
            animate={{ rotate: -2, scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="absolute -top-8 -left-4 md:-left-12 bg-accent text-accent-foreground px-4 py-2 rounded-xl border-4 border-foreground font-black text-xl neo-shadow z-10 rotate-[-5deg]"
          >
            100% ACCURATE 🎯
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black uppercase tracking-tighter leading-none mb-6 text-foreground drop-shadow-[4px_4px_0_hsl(var(--primary))]">
            Bangali Judge AI
          </h1>
          <p className="text-xl md:text-2xl font-sans font-medium text-muted-foreground">
            পাড়ার সর্বজনীন সালিশ। Confess your sins and let the AI aunty judge you.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!createMutation.isSuccess ? (
            <motion.div
              key="input-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
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
                    placeholder="I ate my roommate's biryani and blamed it on the cat..."
                    className="min-h-[150px] text-xl p-6 rounded-2xl border-4 border-foreground neo-shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary resize-y font-sans placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <label className="font-display font-bold text-3xl">
                    ২. Choose Your Judge 👨‍⚖️
                  </label>
                  <PersonaSelector selected={persona} onSelect={setPersona} />
                </div>

                <Button
                  type="submit"
                  disabled={!content.trim() || createMutation.isPending}
                  className="w-full text-2xl h-20 md:h-24 rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground border-4 border-foreground neo-shadow font-display font-black uppercase tracking-wider transition-all"
                >
                  {createMutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="text-4xl"
                    >
                      ⚖️
                    </motion.div>
                  ) : (
                    "বিচার চাই! (JUDGE ME)"
                  )}
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
                  The Verdict is In 🔨
                </h2>
                <Button 
                  onClick={handleReset}
                  variant="outline" 
                  className="rounded-full border-2 border-foreground neo-shadow-sm font-bold"
                >
                  Confess Another Crime
                </Button>
              </div>

              {createMutation.data && (
                <JudgmentCard
                  confession={createMutation.data.content}
                  judgment={createMutation.data.judgment}
                  personaId={createMutation.data.persona}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="w-full h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIi8+Cjwvc3ZnPg==')] opacity-20 mb-16"></div>

        <TrendingFeed />

      </main>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
