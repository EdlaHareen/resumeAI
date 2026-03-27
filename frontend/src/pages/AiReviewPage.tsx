import { useEffect, useMemo, useState } from "react";
import { BarChart3, ChevronRight, FileText, Sparkles, TrendingUp } from "lucide-react";
import { loadHistory } from "../lib/history";
import type { HistoryEntry, TailorResponse } from "../types";

interface Props {
  activeResult: TailorResponse | null;
  onNewResume: () => void;
  onReopen: (result: TailorResponse) => void;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function scoreSeries(entries: HistoryEntry[]) {
  return entries
    .slice(0, 6)
    .map((entry) => ({
      id: entry.id,
      label: new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      match: entry.match_percent ?? entry.response?.scores.match_percent ?? 0,
      ats: entry.ats_score ?? entry.response?.scores.ats_score ?? 0,
      response: entry.response,
    }))
    .reverse();
}

export function AiReviewPage({ activeResult, onNewResume, onReopen }: Props) {
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

  const summary = useMemo(() => {
    const source = history.length > 0 ? history : [];
    const matchValues = source.map((entry) => entry.match_percent ?? entry.response?.scores.match_percent ?? 0);
    const atsValues = source.map((entry) => entry.ats_score ?? entry.response?.scores.ats_score ?? 0);

    const keywords = new Map<string, number>();
    for (const entry of history) {
      for (const keyword of entry.response?.jd_analysis.ats_keywords ?? []) {
        keywords.set(keyword, (keywords.get(keyword) ?? 0) + 1);
      }
    }

    return {
      avgMatch: average(matchValues),
      avgAts: average(atsValues),
      topKeywords: [...keywords.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([keyword]) => keyword),
      recent: history.slice(0, 5),
      chart: scoreSeries(history),
    };
  }, [history]);

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "1.5rem",
        background:
          "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 10%, transparent) 0, transparent 35%), var(--bg)",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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
          <div style={{ maxWidth: 640 }}>
            <div className="label" style={{ marginBottom: "0.45rem" }}>
              AI Review
            </div>
            <h1 style={{ fontSize: "2.1rem", letterSpacing: "-0.05em", color: "var(--text-primary)", marginBottom: "0.65rem" }}>
              See how your tailoring quality is trending
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              This section turns saved resume sessions into a reusable analysis layer. You can compare match scores,
              inspect repeated ATS signals, and jump back into the exact review that produced them.
            </p>
          </div>

          {activeResult ? (
            <button type="button" className="accent-btn" onClick={() => onReopen(activeResult)}>
              <Sparkles size={16} />
              Continue Current Review
            </button>
          ) : (
            <button type="button" className="accent-btn" onClick={onNewResume}>
              <FileText size={16} />
              Tailor New Resume
            </button>
          )}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {[
            { label: "Average Match", value: `${summary.avgMatch}%`, icon: <TrendingUp size={18} /> },
            { label: "Average ATS", value: `${summary.avgAts}%`, icon: <BarChart3 size={18} /> },
          ].map((item) => (
            <div key={item.label} className="bento-card" style={{ padding: "1.2rem", background: "var(--surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.7rem", color: "var(--accent)" }}>
                {item.icon}
                <span className="label">{item.label}</span>
              </div>
              <div style={{ fontSize: "1.9rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.05em" }}>
                {loading ? "..." : item.value}
              </div>
            </div>
          ))}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
            gap: "1rem",
          }}
        >
          <div className="bento-card" style={{ padding: "1.25rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <div className="label" style={{ marginBottom: "0.35rem" }}>
                Recent Trend
              </div>
              <h2 style={{ fontSize: 20, color: "var(--text-primary)" }}>Last saved sessions</h2>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: 220 }} />
            ) : summary.chart.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${summary.chart.length}, minmax(0, 1fr))`,
                  alignItems: "end",
                  gap: "0.85rem",
                  minHeight: 220,
                }}
              >
                {summary.chart.map((item) => (
                  <div key={item.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <div
                      style={{
                        width: "100%",
                        minWidth: 56,
                        display: "flex",
                        alignItems: "end",
                        justifyContent: "center",
                        gap: 6,
                        height: 160,
                      }}
                    >
                      {[
                        { value: item.match, color: "var(--accent)" },
                        { value: item.ats, color: "var(--success)" },
                      ].map((bar, index) => (
                        <div
                          key={`${item.id}:${index}`}
                          style={{
                            width: 12,
                            height: `${Math.max(bar.value, 8)}%`,
                            borderRadius: 999,
                            background: bar.color,
                            boxShadow: `0 10px 20px color-mix(in srgb, ${bar.color} 40%, transparent)`,
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{item.label}</div>
                      <button
                        type="button"
                        onClick={() => item.response && onReopen(item.response)}
                        style={{
                          marginTop: "0.35rem",
                          border: "none",
                          background: "transparent",
                          color: "var(--accent)",
                          fontSize: 12,
                          cursor: item.response ? "pointer" : "default",
                        }}
                      >
                        Open
                      </button>
                    </div>
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
                <BarChart3 size={32} color="var(--text-tertiary)" style={{ margin: "0 auto 0.8rem" }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.35rem" }}>
                  No analytics yet
                </p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: "1rem" }}>
                  Save a few tailored sessions and this page will start surfacing meaningful trends.
                </p>
                <button type="button" className="accent-btn" onClick={onNewResume}>
                  <FileText size={16} />
                  Tailor First Resume
                </button>
              </div>
            )}
          </div>

          <div className="bento-card" style={{ padding: "1.25rem" }}>
            <div className="label" style={{ marginBottom: "0.35rem" }}>
              Repeated ATS Language
            </div>
            <h2 style={{ fontSize: 20, color: "var(--text-primary)", marginBottom: "0.85rem" }}>Keywords showing up across sessions</h2>

            {summary.topKeywords.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.2rem" }}>
                {summary.topKeywords.map((keyword) => (
                  <span key={keyword} className="pill pill-accent">
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: "1.2rem" }}>
                Keyword analysis will appear once you have stored tailored sessions with ATS data.
              </p>
            )}

            <div style={{ display: "grid", gap: "0.75rem" }}>
              {summary.recent.slice(0, 4).map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className="bento-card"
                  onClick={() => entry.response && onReopen(entry.response)}
                  style={{
                    padding: "0.95rem 1rem",
                    background: "var(--elevated)",
                    textAlign: "left",
                    cursor: entry.response ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.2rem" }}>
                        {entry.job_role || entry.response?.resume_summary.title || "Saved review"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {entry.match_percent ?? entry.response?.scores.match_percent ?? 0}% match · {entry.ats_score ?? entry.response?.scores.ats_score ?? 0}% ATS
                      </div>
                    </div>
                    <ChevronRight size={16} color="var(--text-tertiary)" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
