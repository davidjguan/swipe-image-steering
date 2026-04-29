const API_BASE_URL = "http://localhost:8000";

export interface ImageRecord {
  id: string;
  base64_data: string;
  prompt_used: string;
  direction?: "left" | "right";
  liked_feedback?: string;
  disliked_feedback?: string;
}

export interface Round {
  round_number: number;
  images: ImageRecord[];
  gpt_summary?: string;
  liked_attributes: string[];
  disliked_attributes: string[];
  next_prompt_modifier?: string;
}

export interface Session {
  id: string;
  brief: string;
  aspect_ratio?: string;
  output_mime_type?: string;
  output_compression_quality?: number;
  seed?: number;
  rounds: Round[];
  preference_profile: Record<string, any>;
}

export interface StartSessionRequest {
  brief: string;
  aspect_ratio?: string;
  output_mime_type?: string;
  output_compression_quality?: number;
  seed?: number;
}

export interface StartSessionResponse {
  session_id: string;
  round: Round;
}

export interface SwipeResponse {
  success: boolean;
  swipes_recorded: number;
}

export interface NextRoundResponse {
  round: Round;
  preference_profile: Record<string, any>;
  summary_card: {
    summary: string;
    liked_attributes: string[];
    disliked_attributes: string[];
  };
}

export interface HistoryResponse {
  session_id: string;
  brief: string;
  rounds: Round[];
}

export async function startSession(request: StartSessionRequest): Promise<StartSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/session/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(`Failed to start session: ${response.statusText}`);
  }
  return response.json();
}

export async function recordSwipe(
  sessionId: string,
  imageId: string,
  direction: "left" | "right",
  likedFeedback?: string,
  dislikedFeedback?: string
): Promise<SwipeResponse> {
  const response = await fetch(`${API_BASE_URL}/session/swipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      session_id: sessionId, 
      image_id: imageId, 
      direction,
      liked_feedback: likedFeedback,
      disliked_feedback: dislikedFeedback
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to record swipe: ${response.statusText}`);
  }
  return response.json();
}

export async function nextBatch(sessionId: string): Promise<NextRoundResponse> {
  const response = await fetch(`${API_BASE_URL}/session/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to get next batch: ${response.statusText}`);
  }
  return response.json();
}

export async function getHistory(sessionId: string): Promise<HistoryResponse> {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}/history`);
  if (!response.ok) {
    throw new Error(`Failed to get history: ${response.statusText}`);
  }
  return response.json();
}
