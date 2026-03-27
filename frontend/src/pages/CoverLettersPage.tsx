import { useEffect, useMemo, useState } from "react";
import { FileText, Mail, Sparkles } from "lucide-react";
import { loadHistory } from "../lib/history";
import type { HistoryEntry, TailorResponse, Tier, UpgradeReason } from "../types";

interface Props {
  tier: Tier;
  activeResult: TailorResponse | null;
  onNewResume: () => void;
  onOpenGenerator: (result: TailorResponse) => void;
  onUpgrade: (reason: UpgradeReason) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CoverLettersPage({
  tier,
  activeResult,
  onNewResume,
  onOpenGenerator,
  onUpgrade,
}: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadHistory()
      .then((rows) => {
        if (mounted) setHistory(rows);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const sessions = useMemo(() => {
    const results = new Map<string, TailorResponse>();
    if (activeResult) results.set(activeResult.session_id, activeResult);
    for (const entry of history) {
      if (entry.response) results.set(entry.response.session_id, entry.response);
    }
    return [...results.values()];
  }, [activeResult, history]);

  const sessionDates = useMemo(() => {
    const dates = new Map<string, string>();
    for (const entry of history) {
      if (entry.response?.session_id) {
        dates.set(entry.response.session_id, entry.created_at);
      }
    }
    return dates;
  }, [history]);

  if (tier !== "pro") {
    return (
      <div style={{ minHeight: "100%", padding: "1.5rem", background: "var(--bg)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <section
            className="bento-card"
            style={{
              padding: "2rem",
              textAlign: "center",
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--pro) 14%, var(--surface)) 0%, var(--surface) 65%)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 1rem",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--pro-soft)",
                border: "1px solid var(--pro-border)",
                color: "var(--pro)",
              }}
            >
              <Mail size={28} />
            </div>
            <h1 style={{ fontSize: "2.1rem", letterSpacing: "-0.05em", color: "var(--text-primary)", marginBottom: "0.65rem" }}>
              Cover letter generation lives here now
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 620, margin: "0 auto 1.5rem" }}>
              Pick any tailored session and open a dedicated cover-letter editor built from that same resume and job-description context.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" className="accent-btn" onClick={() => onUpgrade("cover_letter")}>
                Unlock Cover Letters
              </button>
              <button type="button" className="ghost-btn" onClick={onNewResume}>
                Tailor New Resume
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "1.5rem",
        background:
          "radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 11%, transparent) 0, transparent 33%), var(--bg)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <section
          className="bento-card"
          style={{
            padding: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 650 }}>
            <div className="label" style={{ marginBottom: "0.45rem" }}>
              Cover Letters
            </div>
            <h1 style={{ fontSize: "2.1rem", letterSpacing: "-0.05em", color: "var(--text-primary)", marginBottom: "0.65rem" }}>
              Generate letters from your tailored sessions
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              Choose a saved resume tailoring session and open the dedicated cover-letter editor with the right
              resume summary and job-analysis context already wired in.
            </p>
          </div>

          <button type="button" className="ghost-btn" onClick={onNewResume}>
            <FileText size={16} />
            Tailor Another Resume
          </button>
        </section>

        {activeResult && (
          <section className="bento-card" style={{ padding: "1.25rem", background: "var(--elevated)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <div className="label" style={{ marginBottom: "0.35rem" }}>
                  Current Session
                </div>
                <h2 style={{ fontSize: 18, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                  Continue from your active resume review
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {activeResult.jd_analysis.role_level} · {activeResult.jd_analysis.industry} · {activeResult.scores.match_percent}% match
                </p>
              </div>
              <button type="button" className="accent-btn" onClick={() => onOpenGenerator(activeResult)}>
                <Sparkles size={16} />
                Open Generator
              </button>
            </div>
          </section>
        )}

        <section className="bento-card" style={{ padding: "1.25rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <div className="label" style={{ marginBottom: "0.35rem" }}>
              Saved Sessions
            </div>
            <h2 style={{ fontSize: 20, color: "var(--text-primary)" }}>Choose a tailored resume to write from</h2>
          </div>

          {loading ? (
            <div style={{ display: "grid", gap: "0.85rem" }}>
              {[0, 1, 2].map((item) => (
                <div key={item} className="skeleton" style={{ height: 118 }} />
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <div style={{ display: "grid", gap: "0.85rem" }}>
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className="bento-card"
                  style={{
                    padding: "1rem",
                    background: "var(--elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                        {session.resume_summary.title || session.jd_analysis.role_level || "Tailored session"}
                      </span>
                      <span className="pill pill-accent">{session.scores.match_percent}% match</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                      {session.resume_summary.name} · {session.jd_analysis.industry || "General"}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                      {sessionDates.has(session.session_id)
                        ? formatDate(sessionDates.get(session.session_id)!)
                        : "Current session"}
                    </p>
                  </div>
                  <button type="button" className="accent-btn" onClick={() => onOpenGenerator(session)}>
                    <Mail size={16} />
                    Generate Cover Letter
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "2rem",
                borderRadius: 18,
                border: "1px dashed var(--border)",
                background: "var(--elevated)",
                textAlign: "center",
              }}
            >
              <Mail size={34} color="var(--text-tertiary)" style={{ margin: "0 auto 0.9rem" }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.35rem" }}>
                You need a tailored session first
              </p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Cover letters use the same tailored resume context, so start by tailoring a role and then come back here.
              </p>
              <button type="button" className="accent-btn" onClick={onNewResume}>
                <FileText size={16} />
                Tailor First Resume
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
