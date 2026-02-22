import { db } from "./db";
import { confessions, type Confession, type InsertConfession } from "@shared/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface IStorage {
  createConfession(confession: InsertConfession, judgment: string): Promise<Confession>;
  getTrendingConfessions(): Promise<Confession[]>;
  addReaction(id: number): Promise<Confession | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createConfession(insertConfession: InsertConfession, judgment: string): Promise<Confession> {
    const [confession] = await db
      .insert(confessions)
      .values({ ...insertConfession, judgment })
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
}

export const storage = new DatabaseStorage();
