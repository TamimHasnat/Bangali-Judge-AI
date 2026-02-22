import { motion } from "framer-motion";

export type Persona = {
  id: string;
  name: string;
  icon: string;
  desc: string;
  color: string;
};

export const PERSONAS: Persona[] = [
  {
    id: "khalamma",
    name: "Nosy Khalamma",
    icon: "🥻",
    desc: "Judging your life choices",
    color: "bg-primary text-primary-foreground",
  },
  {
    id: "hujur",
    name: "Strict Hujur",
    icon: "🕌",
    desc: "Everything is haram",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    id: "toxic_boro_bhai",
    name: "Toxic Boro Bhai",
    icon: "🕶️",
    desc: "Pera nai chill",
    color: "bg-accent text-accent-foreground",
  },
  {
    id: "relationship_expert",
    name: "Love Guru",
    icon: "💔",
    desc: "Single since birth",
    color: "bg-purple-500 text-white",
  },
];

interface PersonaSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function PersonaSelector({ selected, onSelect }: PersonaSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {PERSONAS.map((persona) => {
        const isSelected = selected === persona.id;
        return (
          <motion.button
            key={persona.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(persona.id)}
            className={`
              relative p-4 rounded-2xl border-4 text-left transition-all duration-200 flex flex-col
              ${
                isSelected
                  ? `${persona.color} border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] translate-x-[-2px] translate-y-[-2px]`
                  : "bg-card border-border hover:border-foreground/50 hover:bg-muted/50"
              }
            `}
          >
            <div className="text-4xl mb-2">{persona.icon}</div>
            <h3
              className="text-lg font-bold font-display leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {persona.name}
            </h3>
            <p className="text-sm opacity-80 mt-1 font-sans">{persona.desc}</p>
            
            {isSelected && (
              <motion.div
                layoutId="persona-active-indicator"
                className="absolute -top-3 -right-3 w-8 h-8 bg-foreground rounded-full flex items-center justify-center neo-shadow-sm"
              >
                <span className="text-background text-sm">✓</span>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
