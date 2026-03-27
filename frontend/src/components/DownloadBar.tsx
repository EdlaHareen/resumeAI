import { FileDown, Loader2, Check, Lock } from "lucide-react";
import type { Tier } from "../types";

interface Props {
  onDownloadPDF: () => void;
  onDownloadDOCX: () => void;
  downloading: "pdf" | "docx" | null;
  downloaded?: "pdf" | "docx" | null;
  disabled?: boolean;
  onCoverLetter?: () => void;
  onDone?: () => void;
  tier: Tier;
}

export function DownloadBar({ onDownloadPDF, onDownloadDOCX, downloading, downloaded, disabled, onCoverLetter, onDone, tier }: Props) {
  const busy = downloading !== null;
  const isPro = tier === "pro";

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
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          {downloaded ? "Resume saved to Downloads. Generate a cover letter or tailor another." : "Ready to download your tailored resume?"}
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* PDF */}
          <button
            onClick={onDownloadPDF}
            disabled={disabled || busy}
            aria-label="Download PDF resume"
            aria-busy={downloading === "pdf"}
            className="neon-btn"
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.625rem 1.25rem",
              fontSize: 13,
              opacity: disabled || busy ? 0.6 : 1,
              cursor: disabled || busy ? "not-allowed" : "pointer",
              animation: "none",
              background: downloaded === "pdf" ? "rgba(204,255,0,0.85)" : undefined,
            }}
          >
            {downloading === "pdf" ? (
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" />
            ) : downloaded === "pdf" ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <FileDown size={14} aria-hidden="true" />
            )}
            {downloaded === "pdf" ? "PDF Downloaded" : "Download PDF"}
          </button>

          {/* DOCX */}
          <button
            onClick={onDownloadDOCX}
            disabled={disabled || busy}
            aria-label={isPro ? "Download DOCX resume" : "Upgrade to Pro for DOCX download"}
            aria-busy={downloading === "docx"}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.625rem 1.25rem",
              borderRadius: 9999,
              border: `1px solid ${downloaded === "docx" ? "rgba(204,255,0,0.6)" : "rgba(204,255,0,0.3)"}`,
              background: downloaded === "docx" ? "rgba(204,255,0,0.15)" : "transparent",
              color: isPro ? "var(--lime)" : "rgba(204,255,0,0.5)",
              fontSize: 13, fontWeight: 700,
              cursor: disabled || busy ? "not-allowed" : "pointer",
              opacity: disabled || busy ? 0.6 : 1,
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "background 0.2s",
            }}
          >
            {downloading === "docx" ? (
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" />
            ) : downloaded === "docx" ? (
              <Check size={14} aria-hidden="true" />
            ) : isPro ? (
              <FileDown size={14} aria-hidden="true" />
            ) : (
              <Lock size={12} aria-hidden="true" />
            )}
            {downloaded === "docx" ? "DOCX Downloaded" : isPro ? "Download DOCX" : "DOCX · Pro"}
          </button>

          {/* Cover letter */}
          {onCoverLetter && (
            <button
              onClick={onCoverLetter}
              disabled={disabled || busy}
              aria-label={isPro ? "Generate cover letter" : "Upgrade to Pro for cover letter"}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.625rem 1.25rem",
                borderRadius: 9999,
                border: "1px solid rgba(204,255,0,0.15)",
                background: "rgba(204,255,0,0.05)",
                color: isPro ? "rgba(204,255,0,0.7)" : "rgba(204,255,0,0.4)",
                fontSize: 13, fontWeight: 600,
                cursor: disabled || busy ? "not-allowed" : "pointer",
                opacity: disabled || busy ? 0.5 : 1,
                fontFamily: "'Space Grotesk', sans-serif",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {!isPro && <Lock size={12} aria-hidden="true" />}
              {isPro ? "Generate Cover Letter →" : "Cover Letter · Pro"}
            </button>
          )}

          {/* Done — only appears after a download */}
          {downloaded && onDone && (
            <button
              onClick={onDone}
              aria-label="Finish and go to dashboard"
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.625rem 1.25rem",
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent",
                color: "var(--text-secondary)",
                fontSize: 13, fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Done
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
