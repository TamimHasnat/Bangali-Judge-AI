import { db } from "./db";
import { confessions, stats, type Confession, type InsertConfession } from "@shared/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface IStorage {
  createConfession(confession: InsertConfession, judgmentData: any): Promise<Confession>;
  getTrendingConfessions(): Promise<Confession[]>;
  addReaction(id: number): Promise<Confession | undefined>;
  getDailyCount(): Promise<number>;
  incrementDailyCount(): Promise<void>;
  getRandomConfession(): Promise<Confession | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createConfession(insertConfession: InsertConfession, data: any): Promise<Confession> {
    const [confession] = await db
      .insert(confessions)
      .values({
        ...insertConfession,
        judgment: data.judgment,
        redFlagScore: data.redFlagScore,
        redFlagExplanation: data.redFlagExplanation,
        ammiReaction: data.ammiReaction,
        padoshiComments: data.padoshiComments,
        marriageProbability: data.marriageProbability,
        marriageReason: data.marriageReason,
      })
      .returning();
    return confession;
  }

  async getTrendingConfessions(): Promise<Confession[]> {
    return await db
      .select()
      .from(confessions)
      .orderBy(desc(confessions.likes), desc(confessions.createdAt))
      .limit(20);
  }

  async addReaction(id: number): Promise<Confession | undefined> {
    const [updated] = await db
      .update(confessions)
      .set({ likes: sql`${confessions.likes} + 1` })
      .where(eq(confessions.id, id))
      .returning();
    return updated;
  }

  async getDailyCount(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const [stat] = await db.select().from(stats).where(eq(stats.date, today));
    return stat?.count || 0;
  }

  async incrementDailyCount(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await db
      .insert(stats)
      .values({ date: today, count: 1 })
      .onConflictDoUpdate({
        target: stats.date,
        set: { count: sql`${stats.count} + 1` },
      });
  }

  async getRandomConfession(): Promise<Confession | undefined> {
    const [confession] = await db
      .select()
      .from(confessions)
      .orderBy(sql`RANDOM()`)
      .limit(1);
    return confession;
  }
}

export const storage = new DatabaseStorage();
