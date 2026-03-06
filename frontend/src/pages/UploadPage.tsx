import { useState } from "react";
import { UploadZone } from "../components/UploadZone";
import { ErrorBanner } from "../components/ErrorBanner";
import { UserNav } from "../components/UserNav";
import type { User } from "@supabase/supabase-js";

interface Props {
  onSubmit: (file: File, jd: string) => void;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
  user: User | null;
  onDashboard: () => void;
  onSignOut: () => void;
  onLogoClick: () => void;
}

const MIN_JD_WORDS = 50;

export function UploadPage({ onSubmit, loading, error, onClearError, user, onDashboard, onSignOut, onLogoClick }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");

  const jdWordCount = jd.trim().split(/\s+/).filter(Boolean).length;
  const jdTooShort = jd.trim().length > 0 && jdWordCount < MIN_JD_WORDS;
  const canSubmit = file !== null && jdWordCount >= MIN_JD_WORDS && !loading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !file) return;
    onSubmit(file, jd);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={onLogoClick}
          style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", color: "var(--white-primary)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
          aria-label="Go to dashboard"
        >
          Resume<span style={{ color: "var(--lime)" }}>AI</span>
        </button>
        {user ? (
          <UserNav user={user} onDashboard={onDashboard} onSignOut={onSignOut} onNewResume={() => {}} />
        ) : (
          <span className="mono" style={{ color: "rgba(235,235,235,0.35)" }}>step 1 of 3</span>
        )}
      </nav>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div className="mono" style={{ color: "var(--lime)", marginBottom: "0.75rem" }}>upload & tailor</div>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, lineHeight: 1.15, color: "var(--white-primary)", letterSpacing: "-0.02em" }}>
            Tailor your resume<br />
            <span style={{ color: "var(--lime)" }}>to any job in 60 seconds.</span>
          </h1>
          <p style={{ marginTop: "0.75rem", fontSize: 15, color: "rgba(235,235,235,0.5)", lineHeight: 1.6 }}>
            Upload your resume and paste the job description. Our AI rewrites your bullets to match — without making anything up.
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: "1.5rem" }}>
            <ErrorBanner message={error} onDismiss={onClearError} />
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Resume upload */}
            <div className="bento-card" style={{ padding: "1.5rem" }}>
              <label className="mono" style={{ display: "block", marginBottom: "1rem", color: "rgba(235,235,235,0.5)" }}>
                your resume
              </label>
              <UploadZone file={file} onFileSelect={setFile} />
            </div>

            {/* Job description */}
            <div className="bento-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1rem" }}>
                <label htmlFor="jd" className="mono" style={{ color: "rgba(235,235,235,0.5)" }}>
                  job description
                </label>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: jdTooShort ? "#f87171" : "rgba(235,235,235,0.3)",
                  }}
                  aria-live="polite"
                >
                  {jdWordCount} / {MIN_JD_WORDS} words min
                </span>
              </div>
              <textarea
                id="jd"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the full job description here, including responsibilities and requirements..."
                rows={10}
                aria-describedby="jd-hint"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${jdTooShort ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "1rem",
                  padding: "1rem",
                  fontSize: 14,
                  color: "var(--white-primary)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  lineHeight: 1.6,
                  outline: "none",
                  resize: "vertical",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { if (!jdTooShort) e.currentTarget.style.borderColor = "rgba(204,255,0,0.4)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = jdTooShort ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.08)"; }}
              />
              {jdTooShort && (
                <p id="jd-hint" role="alert" style={{ marginTop: "0.5rem", fontSize: 12, color: "#f87171" }}>
                  Paste the full job description for best results (at least {MIN_JD_WORDS} words).
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              aria-busy={loading}
              className="neon-btn"
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: 15,
                opacity: canSubmit ? 1 : 0.4,
                cursor: canSubmit ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    display: "inline-block", width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  Tailoring your resume...
                </>
              ) : "Tailor My Resume →"}
            </button>
          </div>
        </form>

        <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: 12, color: "rgba(235,235,235,0.25)" }}>
          Your resume is processed in memory and never stored on our servers.
        </p>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
