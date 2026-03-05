import { FileDown, Loader2 } from "lucide-react";

interface Props {
  onDownloadPDF: () => void;
  onDownloadDOCX: () => void;
  downloading: "pdf" | "docx" | null;
  disabled?: boolean;
}

export function DownloadBar({ onDownloadPDF, onDownloadDOCX, downloading, disabled }: Props) {
  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 30,
      borderTop: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(0,0,0,0.88)",
      backdropFilter: "blur(20px)",
      padding: "1rem 2rem",
    }}>
      <div style={{
        maxWidth: 760,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
      }}>
        <p style={{ fontSize: 14, color: "rgba(235,235,235,0.5)" }}>
          Ready to download your tailored resume?
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {/* PDF — lime primary */}
          <button
            onClick={onDownloadPDF}
            disabled={disabled || downloading !== null}
            aria-label="Download PDF resume"
            aria-busy={downloading === "pdf"}
            className="neon-btn"
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.625rem 1.25rem",
              fontSize: 13,
              opacity: disabled || downloading !== null ? 0.6 : 1,
              cursor: disabled || downloading !== null ? "not-allowed" : "pointer",
              animation: "none",
            }}
          >
            {downloading === "pdf" ? (
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" />
            ) : (
              <FileDown size={14} aria-hidden="true" />
            )}
            Download PDF
          </button>

          {/* DOCX — ghost */}
          <button
            onClick={onDownloadDOCX}
            disabled={disabled || downloading !== null}
            aria-label="Download DOCX resume"
            aria-busy={downloading === "docx"}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.625rem 1.25rem",
              borderRadius: 9999,
              border: "1px solid rgba(204,255,0,0.3)",
              background: "transparent",
              color: "var(--lime)",
              fontSize: 13, fontWeight: 700,
              cursor: disabled || downloading !== null ? "not-allowed" : "pointer",
              opacity: disabled || downloading !== null ? 0.6 : 1,
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "background 0.2s",
            }}
          >
            {downloading === "docx" ? (
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" />
            ) : (
              <FileDown size={14} aria-hidden="true" />
            )}
            Download DOCX
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
