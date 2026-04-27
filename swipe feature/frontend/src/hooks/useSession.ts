import { useState, useCallback } from "react";
import * as api from "../api/client";

export type Phase = "brief" | "swiping" | "summary" | "loading";

export interface SummaryCard {
  summary: string;
  liked_attributes: string[];
  disliked_attributes: string[];
}

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<api.Round | null>(null);
  const [allRounds, setAllRounds] = useState<api.Round[]>([]);
  const [phase, setPhase] = useState<Phase>("brief");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferenceProfile, setPreferenceProfile] = useState<Record<string, any>>({});
  const [summaryCard, setSummaryCard] = useState<SummaryCard | null>(null);

  const startSession = useCallback(async (brief: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.startSession(brief);
      setSessionId(response.session_id);
      setCurrentRound(response.round);
      setAllRounds([response.round]);
      setPhase("swiping");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Error starting session:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const swipe = useCallback(
    async (imageId: string, direction: "left" | "right") => {
      if (!sessionId || !currentRound) return;
      try {
        setError(null);
        await api.recordSwipe(sessionId, imageId, direction);

        // Update current round locally
        const updatedRound = {
          ...currentRound,
          images: currentRound.images.map((img) =>
            img.id === imageId ? { ...img, direction } : img
          ),
        };
        setCurrentRound(updatedRound);

        // Check if all images are swiped
        const allSwiped = updatedRound.images.every((img) => img.direction);
        if (allSwiped) {
          setPhase("summary");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        console.error("Error recording swipe:", err);
      }
    },
    [sessionId, currentRound]
  );

  const requestNextBatch = useCallback(async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      setError(null);
      setPhase("loading");

      const response = await api.nextBatch(sessionId);
      setCurrentRound(response.round);
      setAllRounds((prev) => [...prev, response.round]);
      setPreferenceProfile(response.preference_profile);
      setSummaryCard(response.summary_card);
      setPhase("swiping");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Error requesting next batch:", err);
      setPhase("summary");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  return {
    sessionId,
    currentRound,
    allRounds,
    isLoading,
    error,
    phase,
    preferenceProfile,
    summaryCard,
    startSession,
    swipe,
    requestNextBatch,
  };
}
