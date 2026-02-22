import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { openai } from "./replit_integrations/image/client";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.confessions.listTrending.path, async (req, res) => {
    try {
      const trending = await storage.getTrendingConfessions();
      res.json(trending);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.confessions.random.path, async (req, res) => {
    try {
      const confession = await storage.getRandomConfession();
      if (!confession) return res.status(404).json({ message: "No confessions yet" });
      res.json(confession);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.stats.dailyCount.path, async (req, res) => {
    try {
      const count = await storage.getDailyCount();
      res.json({ count });
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.confessions.create.path, async (req, res) => {
    try {
      const input = api.confessions.create.input.parse(req.body);
      const mood = input.judgeMood || "suspicious";
      
      const personaPrompts: Record<string, string> = {
        "khalamma": "Nosy Bangladeshi auntie. Sarcastic, dramatic, loves judging youngsters.",
        "hujur": "Strict but funny mosque elder. Suggests tobah, uses religious phrases humorously.",
        "toxic_boro_bhai": "Arrogant area big brother. Street smart, condescending, funny advice.",
        "relationship_expert": "Absurdly dramatic relationship guru. Over-the-top love advice."
      };

      const moodPrompts: Record<string, string> = {
        "good": "You are in a surprisingly good mood today, maybe you found a lost 500 taka note.",
        "suspicious": "You are very suspicious, looking for any hidden lies in the confession.",
        "angry": "You are absolutely furious, like someone stole your last piece of Hilsha fish."
      };

      const systemPrompt = `
        ${personaPrompts[input.persona] || personaPrompts["khalamma"]}
        Current Mood: ${moodPrompts[mood]}
        Respond in Bengali (3-6 lines). 
        Format your response as a JSON object with:
        {
          "judgment": "The main judgment text",
          "redFlagScore": 0-100,
          "redFlagExplanation": "Funny reason for the score",
          "ammiReaction": "Predict how a typical Bangladeshi mother would react",
          "padoshiComments": ["Comment 1", "Comment 2", "Comment 3"],
          "marriageProbability": 0-100,
          "marriageReason": "Funny reason for the probability"
        }
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.content }
        ],
        response_format: { type: "json_object" }
      });

      const data = JSON.parse(response.choices[0]?.message?.content || "{}");
      const confession = await storage.createConfession(input, data);
      await storage.incrementDailyCount();
      res.status(201).json(confession);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to process judgment" });
    }
  });

  app.post(api.confessions.addReaction.path, async (req, res) => {
    try {
      const updated = await storage.addReaction(Number(req.params.id));
      if (!updated) return res.status(404).json({ message: "Confession not found" });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
