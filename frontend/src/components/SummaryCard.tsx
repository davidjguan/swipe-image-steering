interface SummaryCardProps {
  summary: string;
  liked_attributes: string[];
  disliked_attributes: string[];
  onNext: () => void;
  isLoading: boolean;
}

export function SummaryCard({
  summary,
  liked_attributes,
  disliked_attributes,
  onNext,
  isLoading,
}: SummaryCardProps) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Here's what I think you prefer</h2>

        <p style={styles.summary}>{summary}</p>

        <div style={styles.attributesRow}>
          <div style={styles.attributeSection}>
            <h3 style={styles.attributeTitle}>✓ Liked</h3>
            <div style={styles.tagContainer}>
              {liked_attributes.length > 0 ? (
                liked_attributes.map((attr, idx) => (
                  <span key={idx} style={styles.tag_liked}>
                    {attr}
                  </span>
                ))
              ) : (
                <span style={styles.noAttributes}>None yet</span>
              )}
            </div>
          </div>

          <div style={styles.attributeSection}>
            <h3 style={styles.attributeTitle}>✗ Disliked</h3>
            <div style={styles.tagContainer}>
              {disliked_attributes.length > 0 ? (
                disliked_attributes.map((attr, idx) => (
                  <span key={idx} style={styles.tag_disliked}>
                    {attr}
                  </span>
                ))
              ) : (
                <span style={styles.noAttributes}>None yet</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={isLoading}
          style={{
            ...styles.button,
            ...(isLoading ? styles.buttonDisabled : styles.buttonHover),
          }}
        >
          {isLoading ? "Generating..." : "Generate Next Batch →"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#0f0f0f",
    padding: "20px",
  } as React.CSSProperties,
  card: {
    maxWidth: "600px",
    width: "100%",
    backgroundColor: "#1a1a1a",
    padding: "40px",
    borderRadius: "12px",
    border: "2px solid #333333",
  } as React.CSSProperties,
  heading: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "#ffffff",
  } as React.CSSProperties,
  summary: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#cccccc",
    marginBottom: "32px",
  } as React.CSSProperties,
  attributesRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "32px",
  } as React.CSSProperties,
  attributeSection: {
    display: "flex",
    flexDirection: "column" as const,
  } as React.CSSProperties,
  attributeTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "12px",
    color: "#888888",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,
  tagContainer: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
  } as React.CSSProperties,
  tag_liked: {
    display: "inline-block",
    padding: "6px 12px",
    backgroundColor: "#22aa44",
    color: "#ffffff",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
  } as React.CSSProperties,
  tag_disliked: {
    display: "inline-block",
    padding: "6px 12px",
    backgroundColor: "#dd4444",
    color: "#ffffff",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
  } as React.CSSProperties,
  noAttributes: {
    fontSize: "13px",
    color: "#666666",
    fontStyle: "italic" as const,
  } as React.CSSProperties,
  button: {
    width: "100%",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "bold",
    backgroundColor: "#6c63ff",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as React.CSSProperties,
  buttonHover: {
    backgroundColor: "#5a52d5",
  } as React.CSSProperties,
  buttonDisabled: {
    backgroundColor: "#444444",
    cursor: "not-allowed",
    opacity: 0.6,
  } as React.CSSProperties,
};
