import { useEffect } from "react";
import type { ImageRecord } from "../api/client";

interface SwipeCardProps {
  round: {
    round_number: number;
    images: ImageRecord[];
  };
  onSwipe: (imageId: string, direction: "left" | "right") => void;
  currentImageIndex: number;
}

export function SwipeCard({ round, onSwipe, currentImageIndex }: SwipeCardProps) {
  const currentImage = round.images[currentImageIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        onSwipe(currentImage.id, "left");
      } else if (e.key === "ArrowRight") {
        onSwipe(currentImage.id, "right");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentImage.id, onSwipe]);

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
          src={`data:image/png;base64,${currentImage.base64_data}`}
          alt="Generated"
          style={styles.image}
        />
      </div>

      <div style={styles.controls}>
        <button
          onClick={() => onSwipe(currentImage.id, "left")}
          style={{ ...styles.button, ...styles.dislikeButton }}
        >
          ← Dislike
        </button>
        <button
          onClick={() => onSwipe(currentImage.id, "right")}
          style={{ ...styles.button, ...styles.likeButton }}
        >
          Like →
        </button>
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
};
