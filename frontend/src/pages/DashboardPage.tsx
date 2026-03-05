import { useEffect, useState } from "react";
import { FileText, Plus, TrendingUp, Clock } from "lucide-react";
import { UserNav } from "../components/UserNav";
import { loadHistory } from "../lib/history";
import type { HistoryEntry } from "../types";
import type { User } from "@supabase/supabase-js";

interface Props {
  user: User;
  onNewResume: () => void;
  onSignOut: () => void;
}

function ScorePill({ value, color }: { value: number; color: string }) {
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 9999, padding: "0.15rem 0.5rem" }}>
      {value}%
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function DashboardPage({ user, onNewResume, onSignOut }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const name: string = (user.user_metadata?.full_name as string | undefined) || "there";
  const firstName = name.split(" ")[0];

  useEffect(() => {
    loadHistory()
      .then(setHistory)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", color: "var(--white-primary)" }}>
          Resume<span style={{ color: "var(--lime)" }}>AI</span>
        </span>
        <UserNav user={user} onDashboard={() => {}} onSignOut={onSignOut} onNewResume={onNewResume} />
      </nav>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="mono" style={{ color: "var(--lime)", marginBottom: "0.5rem" }}>dashboard</div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--white-primary)" }}>
              Welcome back, {firstName} 👋
            </h1>
            <p style={{ marginTop: "0.4rem", fontSize: 14, color: "rgba(235,235,235,0.45)" }}>
              {history.length === 0 ? "No tailored resumes yet. Start your first one!" : `${history.length} resume${history.length !== 1 ? "s" : ""} tailored so far.`}
            </p>
          </div>
          <button
            onClick={onNewResume}
            className="neon-btn"
            style={{ padding: "0.75rem 1.5rem", fontSize: 14, display: "flex", alignItems: "center", gap: "0.5rem", animation: "none" }}
          >
            <Plus size={16} />
            Tailor New Resume
          </button>
        </div>

        {/* Stats row */}
        {history.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Total Tailored", value: history.length, suffix: "", icon: <FileText size={16} /> },
              { label: "Avg Job Match", value: Math.round(history.reduce((s, h) => s + (h.match_percent ?? 0), 0) / history.length), suffix: "%", icon: <TrendingUp size={16} /> },
              { label: "Latest", value: formatDate(history[0].created_at), suffix: "", icon: <Clock size={16} /> },
            ].map(({ label, value, suffix, icon }) => (
              <div key={label} className="bento-card" style={{ padding: "1.25rem 1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", color: "rgba(235,235,235,0.4)" }}>
                  {icon}
                  <span className="mono">{label}</span>
                </div>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--lime)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {value}{suffix}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* History list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "rgba(235,235,235,0.3)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(204,255,0,0.3)", borderTopColor: "var(--lime)", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div className="bento-card" style={{ padding: "4rem", textAlign: "center" }}>
            <FileText size={40} color="rgba(235,235,235,0.15)" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--white-primary)", marginBottom: "0.5rem" }}>No resumes tailored yet</h3>
            <p style={{ fontSize: 14, color: "rgba(235,235,235,0.4)", marginBottom: "1.5rem" }}>Upload your resume and a job description to get started.</p>
            <button onClick={onNewResume} className="neon-btn" style={{ padding: "0.75rem 1.5rem", fontSize: 14, animation: "none" }}>
              Tailor My First Resume
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {history.map((entry) => (
              <div key={entry.id} className="bento-card" style={{ padding: "1.25rem 1.5rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--white-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entry.original_filename ?? "Resume"}
                      </span>
                      {entry.job_role && (
                        <span style={{ fontSize: 11, padding: "0.15rem 0.6rem", borderRadius: 9999, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(235,235,235,0.4)", whiteSpace: "nowrap" }}>
                          {entry.job_role}
                        </span>
                      )}
                    </div>
                    {entry.jd_snippet && (
                      <p style={{ fontSize: 12, color: "rgba(235,235,235,0.35)", lineHeight: 1.5, marginBottom: "0.75rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                        {entry.jd_snippet}
                      </p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                      {entry.match_percent != null && <ScorePill value={entry.match_percent} color="var(--lime)" />}
                      {entry.ats_score != null && <ScorePill value={entry.ats_score} color="#10b981" />}
                      {entry.strength_score != null && <ScorePill value={entry.strength_score} color="#f59e0b" />}
                      <span style={{ fontSize: 12, color: "rgba(235,235,235,0.25)" }}>
                        {entry.changed_bullets}/{entry.total_bullets} bullets changed
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(235,235,235,0.3)", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatDate(entry.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
