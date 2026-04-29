import { useState } from "react";

interface BriefInputProps {
  onSubmit: (request: { brief: string; aspect_ratio?: string; output_mime_type?: string; output_compression_quality?: number; seed?: number }) => void;
  isLoading: boolean;
}

export function BriefInput({ onSubmit, isLoading }: BriefInputProps) {
  const [brief, setBrief] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [outputMimeType, setOutputMimeType] = useState("image/jpeg");
  const [compressionQuality, setCompressionQuality] = useState(95);
  const [seed, setSeed] = useState("");

  const handleSubmit = () => {
    if (brief.trim()) {
      const request = {
        brief,
        aspect_ratio: aspectRatio,
        output_mime_type: outputMimeType,
        output_compression_quality: outputMimeType === "image/jpeg" ? compressionQuality : undefined,
        seed: seed ? parseInt(seed) : undefined
      };
      onSubmit(request);
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

        <div style={styles.optionsContainer}>
          <div style={styles.optionRow}>
            <label style={styles.label}>Aspect Ratio:</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              style={styles.select}
              disabled={isLoading}
            >
              <option value="1:1">Square (1:1)</option>
              <option value="4:3">Landscape (4:3)</option>
              <option value="16:9">Wide (16:9)</option>
              <option value="3:4">Portrait (3:4)</option>
              <option value="9:16">Tall (9:16)</option>
            </select>
          </div>

          <div style={styles.optionRow}>
            <label style={styles.label}>Output Format:</label>
            <select
              value={outputMimeType}
              onChange={(e) => setOutputMimeType(e.target.value)}
              style={styles.select}
              disabled={isLoading}
            >
              <option value="image/png">PNG (Lossless)</option>
              <option value="image/jpeg">JPEG (Compressed)</option>
            </select>
          </div>

          {outputMimeType === "image/jpeg" && (
            <div style={styles.optionRow}>
              <label style={styles.label}>JPEG Quality:</label>
              <input
                type="range"
                min="0"
                max="100"
                value={compressionQuality}
                onChange={(e) => setCompressionQuality(parseInt(e.target.value))}
                style={styles.slider}
                disabled={isLoading}
              />
              <span style={styles.qualityValue}>{compressionQuality}</span>
            </div>
          )}

          <div style={styles.optionRow}>
            <label style={styles.label}>Seed (optional):</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Random if empty"
              style={styles.input}
              disabled={isLoading}
            />
          </div>
        </div>

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
  optionsContainer: {
    marginBottom: "20px",
  } as React.CSSProperties,
  optionRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  } as React.CSSProperties,
  label: {
    fontSize: "14px",
    color: "#ffffff",
    marginRight: "12px",
    minWidth: "120px",
  } as React.CSSProperties,
  select: {
    padding: "8px",
    fontSize: "14px",
    border: "1px solid #333333",
    borderRadius: "4px",
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    flex: 1,
  } as React.CSSProperties,
  input: {
    padding: "8px",
    fontSize: "14px",
    border: "1px solid #333333",
    borderRadius: "4px",
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    flex: 1,
  } as React.CSSProperties,
  slider: {
    flex: 1,
    marginRight: "8px",
  } as React.CSSProperties,
  qualityValue: {
    fontSize: "14px",
    color: "#ffffff",
    minWidth: "30px",
  } as React.CSSProperties,
};
