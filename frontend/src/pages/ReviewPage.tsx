import { useState } from "react";
import { ScorePanel } from "../components/ScorePanel";
import { DiffViewer } from "../components/DiffViewer";
import { EdgeCaseAlert } from "../components/EdgeCaseAlert";
import { DownloadBar } from "../components/DownloadBar";
import { ErrorBanner } from "../components/ErrorBanner";
import { UserNav } from "../components/UserNav";
import type { TailorResponse, BulletState, DownloadRequest } from "../types";
import { downloadFile } from "../api/client";
import type { User } from "@supabase/supabase-js";

interface Props {
  result: TailorResponse;
  onDone: () => void;
  user: User | null;
  onDashboard: () => void;
  onSignOut: () => void;
  onLogoClick: () => void;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReviewPage({ result, onDone, user, onDashboard, onSignOut, onLogoClick }: Props) {
  const [bulletStates, setBulletStates] = useState<Record<string, BulletState>>(() => {
    const init: Record<string, BulletState> = {};
    for (const diff of result.diff) {
      init[diff.bullet_id] = { choice: "accept", editedText: diff.tailored };
    }
    return init;
  });
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  function buildDownloadRequest(): DownloadRequest {
    const accepted: Record<string, string> = {};
    for (const diff of result.diff) {
      const state = bulletStates[diff.bullet_id] ?? { choice: "accept", editedText: diff.tailored };
      if (state.choice === "accept") accepted[diff.bullet_id] = diff.tailored;
      else if (state.choice === "edit") accepted[diff.bullet_id] = state.editedText;
      else accepted[diff.bullet_id] = "original";
    }
    return { session_id: result.session_id, accepted_bullets: accepted };
  }

  async function handleDownload(format: "pdf" | "docx") {
    setDownloading(format);
    setDownloadError(null);
    try {
      const req = buildDownloadRequest();
      const blob = await downloadFile(format, req);
      triggerDownload(blob, `tailored_resume.${format}`);
      onDone();
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  }

  function handleBulletChange(bulletId: string, state: BulletState) {
    setBulletStates((prev) => ({ ...prev, [bulletId]: state }));
  }

  function handleAcceptAll() {
    const next: Record<string, BulletState> = {};
    for (const diff of result.diff) {
      next[diff.bullet_id] = { choice: "accept", editedText: diff.tailored };
    }
    setBulletStates(next);
  }

  function handleRejectAll() {
    const next: Record<string, BulletState> = {};
    for (const diff of result.diff) {
      next[diff.bullet_id] = { choice: "reject", editedText: diff.original };
    }
    setBulletStates(next);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Nav */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(16px)",
      }}>
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
          <span className="mono" style={{ color: "rgba(235,235,235,0.35)" }}>step 3 of 3 — review</span>
        )}
      </nav>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "2.5rem 1.5rem 8rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div className="mono" style={{ color: "var(--lime)", marginBottom: "0.5rem" }}>review changes</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--white-primary)", letterSpacing: "-0.02em" }}>
            Review Changes
          </h1>
          <p style={{ marginTop: "0.5rem", fontSize: 14, color: "rgba(235,235,235,0.45)" }}>
            {result.changed_bullets} of {result.total_bullets} bullets tailored for this role. Accept, reject, or edit each one.
          </p>
        </div>

        {/* Scores */}
        <div style={{ marginBottom: "1.5rem" }}>
          <ScorePanel scores={result.scores} />
        </div>

        {/* Edge case alerts */}
        {result.edge_cases.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <EdgeCaseAlert edgeCases={result.edge_cases} />
          </div>
        )}

        {/* Download error */}
        {downloadError && (
          <div style={{ marginBottom: "1rem" }}>
            <ErrorBanner message={downloadError} onDismiss={() => setDownloadError(null)} />
          </div>
        )}

        {/* ATS Keywords */}
        {result.jd_analysis.ats_keywords.length > 0 && (
          <div className="bento-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
            <h2 className="mono" style={{ marginBottom: "1rem", color: "rgba(235,235,235,0.5)" }}>
              ATS keywords detected
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {result.jd_analysis.ats_keywords.slice(0, 20).map((kw) => (
                <span
                  key={kw}
                  style={{
                    borderRadius: 9999,
                    padding: "0.25rem 0.75rem",
                    fontSize: 12,
                    fontWeight: 600,
                    background: "rgba(204,255,0,0.08)",
                    border: "1px solid rgba(204,255,0,0.2)",
                    color: "var(--lime)",
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Diff viewer */}
        <DiffViewer
          diffs={result.diff}
          bulletStates={bulletStates}
          onBulletChange={handleBulletChange}
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
        />
      </main>

      <DownloadBar
        onDownloadPDF={() => handleDownload("pdf")}
        onDownloadDOCX={() => handleDownload("docx")}
        downloading={downloading}
      />
    </div>
  );
}
