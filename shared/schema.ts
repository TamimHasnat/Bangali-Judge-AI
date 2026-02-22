import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const confessions = pgTable("confessions", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  judgment: text("judgment").notNull(),
  persona: text("persona").notNull(), // e.g., 'khalamma', 'hujur', 'toxic_boro_bhai', 'relationship_expert'
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConfessionSchema = createInsertSchema(confessions).pick({
  content: true,
  persona: true,
});

export type InsertConfession = z.infer<typeof insertConfessionSchema>;
export type Confession = typeof confessions.$inferSelect;

// Request type for creating a confession
export type CreateConfessionRequest = InsertConfession;

// Request type for adding a reaction
export type AddReactionRequest = {
  reactionType: "laugh" | "cry" | "facepalm"; // We can just track generic 'likes' or specific reactions. Let's simplify to 'likes' for trending, but we can have UI buttons that just increment it.
};

// Request type for generating judgment (not stored yet)
export type GenerateJudgmentRequest = {
  content: string;
  persona: string;
};

// Response type
export type ConfessionResponse = Confession;
