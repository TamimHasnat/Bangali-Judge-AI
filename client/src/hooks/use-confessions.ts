import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ConfessionInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// ============================================
// Data Fetching Hooks
// ============================================

export function useTrendingConfessions() {
  return useQuery({
    queryKey: [api.confessions.listTrending.path],
    queryFn: async () => {
      const res = await fetch(api.confessions.listTrending.path, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch trending confessions");
      return api.confessions.listTrending.responses[200].parse(await res.json());
    },
  });
}

// ============================================
// Mutation Hooks
// ============================================

export function useCreateConfession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ConfessionInput) => {
      const validated = api.confessions.create.input.parse(data);
      const res = await fetch(api.confessions.create.path, {
        method: api.confessions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.confessions.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to submit your crime!");
      }

      return api.confessions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate trending list to show the new (or eventually trending) confession
      queryClient.invalidateQueries({ queryKey: [api.confessions.listTrending.path] });
    },
    onError: (error) => {
      toast({
        title: "Oh no!",
        description: error.message || "The judge refused to hear your case.",
        variant: "destructive",
      });
    },
  });
}

export function useReactConfession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      type,
    }: {
      id: number;
      type: "laugh" | "cry" | "facepalm";
    }) => {
      const url = buildUrl(api.confessions.addReaction.path, { id });
      const validated = api.confessions.addReaction.input.parse({ type });

      const res = await fetch(url, {
        method: api.confessions.addReaction.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to add reaction");
      }

      return api.confessions.addReaction.responses[200].parse(await res.json());
    },
    // Optimistic UI updates could be added here, but for simplicity we invalidate
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.confessions.listTrending.path] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Couldn't send your reaction. The judge is ignoring you.",
        variant: "destructive",
      });
    },
  });
}
