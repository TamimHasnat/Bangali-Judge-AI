import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { openai } from "./replit_integrations/image/client"; // Use configured openai instance

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed data function
  async function seedDatabase() {
    try {
      const existing = await storage.getTrendingConfessions();
      if (existing.length === 0) {
        await storage.createConfession(
          { content: "আমি রোজ রাতে ৩ টায় ঘুমাই কিন্তু সকালে বলি আমি এশার নামায পড়েই ঘুমিয়ে গেছি।", persona: "khalamma" },
          "ওমা! তোমার মতো মিথ্যাবাদী ছেলে আমি জীবনেও দেখিনি। ৩টা পর্যন্ত জেগে তুমি কী করো? প্রেম করো নাকি? তোমার আম্মাকে আজই বলছি!"
        );
        await storage.createConfession(
          { content: "I accidentally liked my ex's photo from 2 years ago.", persona: "toxic_boro_bhai" },
          "ভাইয়া, এই ভুল কিভাবে করলি? তোর তো মান সম্মান বলতে কিছুই নেই। এখন তো সে ভাববে তুই এখনো তার পিছনে ঘুরছিস। যা, গিয়ে ব্লক মার তাড়াতাড়ি।"
        );
        await storage.createConfession(
          { content: "বিরিয়ানি খাওয়ার সময় আমি সব আলুগুলো আগে খেয়ে ফেলি।", persona: "hujur" },
          "নাউজুবিল্লাহ! এটা কেমন কথা? বিরিয়ানির আসল মজা তো মাংসে, আর তুমি আলু খাচ্ছো? তোমার রুচির পরিবর্তন দরকার, বাবা। বেশি করে তওবা করো।"
        );
      }
    } catch (e) {
      console.error("Error seeding DB:", e);
    }
  }

  // Seed on startup
  seedDatabase();

  app.get(api.confessions.listTrending.path, async (req, res) => {
    try {
      const trending = await storage.getTrendingConfessions();
      res.json(trending);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.confessions.create.path, async (req, res) => {
    try {
      const input = api.confessions.create.input.parse(req.body);
      
      // Get AI judgment based on persona
      const promptMap: Record<string, string> = {
        "khalamma": "You are a typical nosy Bangladeshi auntie (Khalamma). React to this confession with sarcasm, drama, and typical auntie judgment. Keep it humorous, in Bengali, 3-6 lines. Don't be hateful.",
        "hujur": "You are a strict but funny Bangladeshi mosque elder (Hujur). React to this confession. Tell them to do tobah, be funny and meme-like. Use some common Islamic phrases colloquially. Keep it in Bengali, 3-6 lines.",
        "toxic_boro_bhai": "You are a toxic 'boro bhai' (big brother) from the area. React to this confession with slight condescension, street smart attitude, and funny advice. Keep it in Bengali, 3-6 lines.",
        "relationship_expert": "You are a dramatic, fake 'relationship expert'. React to this confession with absurd, funny advice regarding love or life. Keep it in Bengali, 3-6 lines."
      };
      
      const systemPrompt = promptMap[input.persona] || promptMap["khalamma"];
      
      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.content }
        ]
      });

      const judgment = response.choices[0]?.message?.content || "আমি নির্বাক।";

      const confession = await storage.createConfession(input, judgment);
      res.status(201).json(confession);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create confession" });
    }
  });

  app.post(api.confessions.addReaction.path, async (req, res) => {
    try {
      const updated = await storage.addReaction(Number(req.params.id));
      if (!updated) {
        return res.status(404).json({ message: "Confession not found" });
      }
      res.json(updated);
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.confessions.generateJudgment.path, async (req, res) => {
    try {
      const input = api.confessions.generateJudgment.input.parse(req.body);
      
      const promptMap: Record<string, string> = {
        "khalamma": "You are a typical nosy Bangladeshi auntie (Khalamma). React to this confession with sarcasm, drama, and typical auntie judgment. Keep it humorous, in Bengali, 3-6 lines. Don't be hateful.",
        "hujur": "You are a strict but funny Bangladeshi mosque elder (Hujur). React to this confession. Tell them to do tobah, be funny and meme-like. Use some common Islamic phrases colloquially. Keep it in Bengali, 3-6 lines.",
        "toxic_boro_bhai": "You are a toxic 'boro bhai' (big brother) from the area. React to this confession with slight condescension, street smart attitude, and funny advice. Keep it in Bengali, 3-6 lines.",
        "relationship_expert": "You are a dramatic, fake 'relationship expert'. React to this confession with absurd, funny advice regarding love or life. Keep it in Bengali, 3-6 lines."
      };
      
      const systemPrompt = promptMap[input.persona] || promptMap["khalamma"];
      
      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.content }
        ]
      });

      const judgment = response.choices[0]?.message?.content || "আমি নির্বাক।";
      res.json({ judgment });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to generate judgment" });
    }
  });

  return httpServer;
}
