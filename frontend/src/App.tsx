import { useState } from "react";
import { useSession } from "./hooks/useSession";
import { BriefInput } from "./components/BriefInput";
import { SwipeCard } from "./components/SwipeCard";
import { SummaryCard } from "./components/SummaryCard";
import { HistoryPanel } from "./components/HistoryPanel";

function App() {
  const session = useSession();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleSwipe = async (imageId: string, direction: "left" | "right") => {
    await session.swipe(imageId, direction);

    // Move to next image or trigger summary
    if (session.currentRound && currentImageIndex < session.currentRound.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handleRequestNextBatch = async () => {
    await session.requestNextBatch();
    setCurrentImageIndex(0);
  };

  return (
    <div>
      <HistoryPanel rounds={session.allRounds} />

      {session.error && (
        <div style={styles.errorBanner}>
          <p style={styles.errorText}>Error: {session.error}</p>
        </div>
      )}

      {session.phase === "brief" && (
        <BriefInput onSubmit={session.startSession} isLoading={session.isLoading} />
      )}

      {session.phase === "swiping" && session.currentRound && (
        <SwipeCard
          round={session.currentRound}
          onSwipe={handleSwipe}
          currentImageIndex={currentImageIndex}
        />
      )}

      {session.phase === "summary" && !session.summaryCard && (
        <div style={styles.summaryContainer}>
          <div style={styles.summaryContent}>
            <h2 style={styles.summaryTitle}>Ready for analysis?</h2>
            <p style={styles.summaryText}>
              I've recorded your preferences. Let me analyze them and generate the next batch.
            </p>
            <button
              onClick={handleRequestNextBatch}
              disabled={session.isLoading}
              style={{
                ...styles.summaryButton,
                ...(session.isLoading ? styles.buttonDisabled : {}),
              }}
            >
              {session.isLoading ? "Analyzing..." : "Analyze & Get Next Batch →"}
            </button>
          </div>
        </div>
      )}

      {session.phase === "summary" && session.summaryCard && (
        <SummaryCard
          summary={session.summaryCard.summary}
          liked_attributes={session.summaryCard.liked_attributes}
          disliked_attributes={session.summaryCard.disliked_attributes}
          onNext={handleRequestNextBatch}
          isLoading={session.isLoading}
        />
      )}

      {session.phase === "loading" && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Generating next batch...</p>
        </div>
      )}
    </div>
  );
}

export default App;

const styles = {
  errorBanner: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ff4444",
    padding: "12px 20px",
    zIndex: 10000,
  } as React.CSSProperties,
  errorText: {
    color: "#ffffff",
    fontSize: "14px",
    margin: 0,
  } as React.CSSProperties,
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#0f0f0f",
    flexDirection: "column" as const,
  } as React.CSSProperties,
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #333333",
    borderTop: "4px solid #6c63ff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  } as React.CSSProperties,
  loadingText: {
    fontSize: "16px",
    color: "#888888",
  } as React.CSSProperties,
  summaryContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#0f0f0f",
    padding: "20px",
  } as React.CSSProperties,
  summaryContent: {
    maxWidth: "600px",
    backgroundColor: "#1a1a1a",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center" as const,
  } as React.CSSProperties,
  summaryTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: "16px",
  } as React.CSSProperties,
  summaryText: {
    fontSize: "16px",
    color: "#cccccc",
    marginBottom: "32px",
    lineHeight: "1.5",
  } as React.CSSProperties,
  summaryButton: {
    backgroundColor: "#6c63ff",
    color: "#ffffff",
    border: "none",
    padding: "12px 28px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 200ms",
  } as React.CSSProperties,
  buttonDisabled: {
    backgroundColor: "#444444",
    cursor: "not-allowed",
    opacity: 0.6,
  } as React.CSSProperties,
};

// Add keyframe animation
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
