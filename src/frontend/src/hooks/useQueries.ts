import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Prediction } from "../backend.d";
import { useActor } from "./useActor";

export function useGetRecentPredictions() {
  const { actor, isFetching } = useActor();
  return useQuery<Prediction[]>({
    queryKey: ["recentPredictions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLast20Records();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useSubmitPrediction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputNumber: number) => {
      if (!actor) throw new Error("No actor");
      await actor.submitPrediction(inputNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentPredictions"] });
    },
  });
}
