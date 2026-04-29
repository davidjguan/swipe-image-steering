import { useEffect, useState } from "react";
import { imageDataUrl, type ImageRecord } from "../api/client";

interface SwipeCardProps {
  round: {
    round_number: number;
    images: ImageRecord[];
  };
  onSwipe: (imageId: string, direction: "left" | "right", likedFeedback?: string, dislikedFeedback?: string) => void;
  currentImageIndex: number;
}

export function SwipeCard({ round, onSwipe, currentImageIndex }: SwipeCardProps) {
  const currentImage = round.images[currentImageIndex];
  const [likedFeedback, setLikedFeedback] = useState(currentImage.liked_feedback || "");
  const [dislikedFeedback, setDislikedFeedback] = useState(currentImage.disliked_feedback || "");

  useEffect(() => {
    // Reset feedback when image changes
    setLikedFeedback(currentImage.liked_feedback || "");
    setDislikedFeedback(currentImage.disliked_feedback || "");
  }, [currentImage.id, currentImage.liked_feedback, currentImage.disliked_feedback]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow keys move the cursor while typing feedback; don't treat them as swipes.
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.isContentEditable)) {
        return;
      }
      if (e.key === "ArrowLeft") {
        onSwipe(currentImage.id, "left", likedFeedback || undefined, dislikedFeedback || undefined);
      } else if (e.key === "ArrowRight") {
        onSwipe(currentImage.id, "right", likedFeedback || undefined, dislikedFeedback || undefined);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentImage.id, onSwipe, likedFeedback, dislikedFeedback]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.roundLabel}>Round {round.round_number}</span>
        <span style={styles.progress}>
          Image {currentImageIndex + 1} of {round.images.length}
        </span>
      </div>

      <div style={styles.imageWrapper}>
        <img
          src={imageDataUrl(currentImage.base64_data)}
          alt="Generated"
          style={styles.image}
        />
      </div>

      <div style={styles.controls}>
        <button
          onClick={() => onSwipe(currentImage.id, "left", likedFeedback || undefined, dislikedFeedback || undefined)}
          style={{ ...styles.button, ...styles.dislikeButton }}
        >
          ← Dislike
        </button>
        <button
          onClick={() => onSwipe(currentImage.id, "right", likedFeedback || undefined, dislikedFeedback || undefined)}
          style={{ ...styles.button, ...styles.likeButton }}
        >
          Like →
        </button>
      </div>

      <div style={styles.feedbackSection}>
        <div style={styles.feedbackInputs}>
          <div style={styles.feedbackGroup}>
            <label style={styles.feedbackLabel}>What didn't you like? (optional)</label>
            <textarea
              value={dislikedFeedback}
              onChange={(e) => setDislikedFeedback(e.target.value)}
              placeholder="e.g., Too dark, wrong style..."
              style={styles.feedbackTextarea}
              rows={2}
            />
          </div>
          <div style={styles.feedbackGroup}>
            <label style={styles.feedbackLabel}>What did you like? (optional)</label>
            <textarea
              value={likedFeedback}
              onChange={(e) => setLikedFeedback(e.target.value)}
              placeholder="e.g., Great colors, nice composition..."
              style={styles.feedbackTextarea}
              rows={2}
            />
          </div>
        </div>
      </div>

      <p style={styles.hint}>Use arrow keys or buttons to swipe</p>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#0f0f0f",
    padding: "20px",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "700px",
    marginBottom: "20px",
    fontSize: "14px",
    color: "#888888",
  } as React.CSSProperties,
  roundLabel: {
    fontWeight: "bold",
  } as React.CSSProperties,
  progress: {},
  imageWrapper: {
    maxWidth: "700px",
    width: "100%",
    aspectRatio: "1",
    marginBottom: "30px",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  } as React.CSSProperties,
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  } as React.CSSProperties,
  controls: {
    display: "flex",
    gap: "16px",
    maxWidth: "700px",
    width: "100%",
  } as React.CSSProperties,
  button: {
    flex: 1,
    padding: "14px",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as React.CSSProperties,
  dislikeButton: {
    backgroundColor: "#ff4444",
    color: "#ffffff",
  } as React.CSSProperties,
  likeButton: {
    backgroundColor: "#6c63ff",
    color: "#ffffff",
  } as React.CSSProperties,
  hint: {
    marginTop: "16px",
    fontSize: "12px",
    color: "#666666",
  } as React.CSSProperties,
  feedbackSection: {
    width: "100%",
    maxWidth: "700px",
    marginBottom: "20px",
  } as React.CSSProperties,
  feedbackInputs: {
    display: "flex",
    gap: "16px",
    marginBottom: "20px",
  } as React.CSSProperties,
  feedbackGroup: {
    flex: 1,
  } as React.CSSProperties,
  feedbackLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#cccccc",
    marginBottom: "8px",
  } as React.CSSProperties,
  feedbackTextarea: {
    width: "100%",
    padding: "8px",
    border: "1px solid #444444",
    borderRadius: "4px",
    backgroundColor: "#2a2a2a",
    color: "#ffffff",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "60px",
  } as React.CSSProperties,
};
