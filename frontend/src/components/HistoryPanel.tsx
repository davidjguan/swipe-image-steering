import { useState } from "react";
import { imageDataUrl, type Round } from "../api/client";

interface HistoryPanelProps {
  rounds: Round[];
}

export function HistoryPanel({ rounds }: HistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...styles.toggleButton,
          ...(isOpen ? styles.toggleButtonOpen : {}),
        }}
      >
        {isOpen ? "✕ History" : "☰ History"}
      </button>

      {/* Sidebar */}
      {isOpen && (
        <div style={styles.sidebarOverlay} onClick={() => setIsOpen(false)}>
          <div
            style={styles.sidebar}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={styles.title}>History</h2>

            {rounds.length === 0 ? (
              <p style={styles.empty}>No rounds yet</p>
            ) : (
              <div style={styles.roundsList}>
                {rounds.map((round, idx) => (
                  <div key={idx} style={styles.roundItem}>
                    <div style={styles.roundHeader}>
                      <h3 style={styles.roundTitle}>Round {round.round_number}</h3>
                    </div>

                    {/* Thumbnail strip */}
                    <div style={styles.thumbnailStrip}>
                      {round.images.map((img) => (
                        <div
                          key={img.id}
                          style={{
                            ...styles.thumbnail,
                            ...(img.direction === "right"
                              ? styles.thumbnailLiked
                              : img.direction === "left"
                              ? styles.thumbnailDisliked
                              : {}),
                          }}
                        >
                          <img
                            src={imageDataUrl(img.base64_data)}
                            alt="thumbnail"
                            style={styles.thumbnailImage}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Summary text */}
                    {round.gpt_summary && (
                      <p style={styles.summaryText}>{round.gpt_summary}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              style={styles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  toggleButton: {
    position: "fixed" as const,
    top: "20px",
    right: "20px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "bold",
    backgroundColor: "#6c63ff",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    zIndex: 999,
    transition: "all 0.2s ease",
  } as React.CSSProperties,
  toggleButtonOpen: {
    backgroundColor: "#5a52d5",
  } as React.CSSProperties,
  sidebarOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  } as React.CSSProperties,
  sidebar: {
    position: "fixed" as const,
    right: 0,
    top: 0,
    bottom: 0,
    width: "420px",
    backgroundColor: "#0f0f0f",
    borderLeft: "2px solid #333333",
    overflowY: "auto" as const,
    zIndex: 1001,
    padding: "20px",
    display: "flex",
    flexDirection: "column" as const,
  } as React.CSSProperties,
  title: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#ffffff",
  } as React.CSSProperties,
  roundsList: {
    flex: 1,
    overflowY: "auto" as const,
    marginBottom: "20px",
  } as React.CSSProperties,
  roundItem: {
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #333333",
  } as React.CSSProperties,
  roundHeader: {
    marginBottom: "12px",
  } as React.CSSProperties,
  roundTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#6c63ff",
  } as React.CSSProperties,
  thumbnailStrip: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
  } as React.CSSProperties,
  thumbnail: {
    flex: 1,
    aspectRatio: "1",
    borderRadius: "4px",
    overflow: "hidden",
    border: "2px solid #333333",
  } as React.CSSProperties,
  thumbnailLiked: {
    borderColor: "#22aa44",
  } as React.CSSProperties,
  thumbnailDisliked: {
    borderColor: "#dd4444",
  } as React.CSSProperties,
  thumbnailImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  } as React.CSSProperties,
  summaryText: {
    fontSize: "12px",
    color: "#888888",
    lineHeight: "1.4",
  } as React.CSSProperties,
  empty: {
    color: "#666666",
    fontStyle: "italic" as const,
    marginBottom: "20px",
  } as React.CSSProperties,
  closeButton: {
    padding: "10px",
    fontSize: "14px",
    backgroundColor: "#333333",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "auto",
  } as React.CSSProperties,
};
