import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const confessions = pgTable("confessions", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  judgment: text("judgment").notNull(),
  persona: text("persona").notNull(),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // New fields for enhanced humor
  redFlagScore: integer("red_flag_score"),
  redFlagExplanation: text("red_flag_explanation"),
  ammiReaction: text("ammi_reaction"),
  padoshiComments: jsonb("padoshi_comments").$type<string[]>(),
  marriageProbability: integer("marriage_probability"),
  marriageReason: text("marriage_reason"),
});

export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(), // YYYY-MM-DD
  count: integer("count").default(0).notNull(),
});

export const insertConfessionSchema = createInsertSchema(confessions).pick({
  content: true,
  persona: true,
});

export type InsertConfession = z.infer<typeof insertConfessionSchema>;
export type Confession = typeof confessions.$inferSelect;
export type Stat = typeof stats.$inferSelect;

export type CreateConfessionRequest = InsertConfession;

export type AddReactionRequest = {
  type: "laugh" | "cry" | "facepalm";
};

export type GenerateJudgmentRequest = {
  content: string;
  persona: string;
  judgeMood: "good" | "suspicious" | "angry";
};
