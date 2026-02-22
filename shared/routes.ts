import { z } from "zod";
import { insertConfessionSchema, confessions } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  confessions: {
    listTrending: {
      method: "GET" as const,
      path: "/api/confessions/trending" as const,
      responses: {
        200: z.array(z.custom<typeof confessions.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/confessions" as const,
      input: insertConfessionSchema,
      responses: {
        201: z.custom<typeof confessions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    addReaction: {
      method: "POST" as const,
      path: "/api/confessions/:id/reaction" as const,
      input: z.object({ type: z.enum(["laugh", "cry", "facepalm"]) }), // In reality we'll just increment likes, but UI can send type
      responses: {
        200: z.custom<typeof confessions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    generateJudgment: {
      method: "POST" as const,
      path: "/api/generate-judgment" as const,
      input: z.object({
        content: z.string().min(1, "Confession cannot be empty"),
        persona: z.string(),
      }),
      responses: {
        200: z.object({ judgment: z.string() }),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ConfessionInput = z.infer<typeof api.confessions.create.input>;
export type ConfessionResponse = z.infer<
  typeof api.confessions.create.responses[201]
>;
export type TrendingConfessionsResponse = z.infer<
  typeof api.confessions.listTrending.responses[200]
>;
