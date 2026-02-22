import { motion } from "framer-motion";
import { useTrendingConfessions, useReactConfession } from "@/hooks/use-confessions";
import { PERSONAS } from "./persona-selector";
import { Skeleton } from "@/components/ui/skeleton";

export function TrendingFeed() {
  const { data: confessions, isLoading } = useTrendingConfessions();
  const reactMutation = useReactConfession();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto mt-12">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-64 rounded-3xl border-4 border-foreground" />
        ))}
      </div>
    );
  }

  if (!confessions || confessions.length === 0) {
    return (
      <div className="text-center mt-12 p-12 bg-card rounded-3xl border-4 border-foreground neo-shadow max-w-3xl mx-auto">
        <div className="text-6xl mb-4">🏜️</div>
        <h3 className="text-2xl font-display font-bold">No crimes committed yet!</h3>
        <p className="text-muted-foreground mt-2">Be the first to confess your sins.</p>
      </div>
    );
  }

  return (
    <div className="mt-16 w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight">
          🔥 Trending Crimes
        </h2>
        <div className="h-2 flex-grow bg-foreground rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {confessions.map((item, index) => {
          const persona = PERSONAS.find((p) => p.id === item.persona) || PERSONAS[0];
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={item.id}
              className="bg-card flex flex-col border-4 border-foreground rounded-3xl neo-shadow overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className={`px-6 py-3 border-b-4 border-foreground flex items-center justify-between ${persona.color}`}>
                <div className="flex items-center gap-2 font-display font-bold">
                  <span className="text-2xl">{persona.icon}</span>
                  <span>{persona.name}</span>
                </div>
                <div className="bg-background text-foreground px-3 py-1 rounded-full text-xs font-bold neo-shadow-sm">
                  #{item.id}
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col gap-4">
                <div className="bg-muted/50 p-4 rounded-2xl border-2 border-border">
                  <p className="font-display text-lg text-muted-foreground italic">
                    "{item.content}"
                  </p>
                </div>
                
                <div className="flex-grow">
                  <p className="font-display text-xl font-bold leading-snug">
                    {item.judgment}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-muted/30 border-t-4 border-foreground flex items-center justify-between">
                <span className="font-bold text-sm text-muted-foreground flex items-center gap-2">
                  <span className="text-red-500">❤️</span> {item.likes} Judges Agree
                </span>
                
                <div className="flex gap-2">
                  {(["laugh", "cry", "facepalm"] as const).map((type) => {
                    const emoji = type === "laugh" ? "😂" : type === "cry" ? "😭" : "🤦‍♂️";
                    return (
                      <button
                        key={type}
                        onClick={() => reactMutation.mutate({ id: item.id, type })}
                        disabled={reactMutation.isPending}
                        className="w-10 h-10 flex items-center justify-center text-xl bg-background border-2 border-foreground rounded-full neo-shadow-sm hover:bg-muted active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                        title={`React with ${type}`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
