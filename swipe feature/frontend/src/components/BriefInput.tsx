import { useState } from "react";

interface BriefInputProps {
  onSubmit: (brief: string) => void;
  isLoading: boolean;
}

export function BriefInput({ onSubmit, isLoading }: BriefInputProps) {
  const [brief, setBrief] = useState("");

  const handleSubmit = () => {
    if (brief.trim()) {
      onSubmit(brief);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && brief.trim()) {
      handleSubmit();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <h1 style={styles.title}>Swipe Image Steering</h1>
        <p style={styles.subtitle}>
          Write your creative brief. We'll generate images and learn from your swipes.
        </p>

        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the style, mood, and subject you want to explore..."
          style={styles.textarea}
          disabled={isLoading}
        />

        <button
          onClick={handleSubmit}
          disabled={isLoading || !brief.trim()}
          style={{
            ...styles.button,
            ...(isLoading || !brief.trim() ? styles.buttonDisabled : styles.buttonHover),
          }}
        >
          {isLoading ? "Generating..." : "Generate Images"}
        </button>

        <p style={styles.hint}>Tip: Ctrl+Enter to submit</p>
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
  wrapper: {
    maxWidth: "600px",
    width: "100%",
  } as React.CSSProperties,
  title: {
    fontSize: "48px",
    fontWeight: "bold",
    marginBottom: "12px",
    color: "#ffffff",
  } as React.CSSProperties,
  subtitle: {
    fontSize: "16px",
    color: "#aaaaaa",
    marginBottom: "32px",
    lineHeight: "1.6",
  } as React.CSSProperties,
  textarea: {
    width: "100%",
    minHeight: "200px",
    padding: "16px",
    fontSize: "16px",
    border: "2px solid #333333",
    borderRadius: "8px",
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    fontFamily: "inherit",
    resize: "none",
    marginBottom: "20px",
    outline: "none",
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
  hint: {
    fontSize: "12px",
    color: "#666666",
    marginTop: "12px",
    textAlign: "center" as const,
  },
};
