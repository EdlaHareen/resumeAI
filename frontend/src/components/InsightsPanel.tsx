import type { Scores } from "../types";

interface Props {
  scores: Scores;
  projectedMatchPercent: number;
  atsKeywords: string[];
  edgeCaseCount: number;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function scoreColor(value: number) {
  if (value >= 75) return "var(--success)";
  if (value >= 55) return "var(--warning)";
  return "var(--error)";
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  const color = scoreColor(value);

  return (
    <div style={{ marginBottom: "0.95rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", gap: "0.75rem" }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color }}>
          {value}%
        </span>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${clamp(value)}%`, background: color }} />
      </div>
    </div>
  );
}

export function InsightsPanel({ scores, projectedMatchPercent, atsKeywords, edgeCaseCount }: Props) {
  const projected = clamp(projectedMatchPercent);
  const delta = projected - scores.match_percent;
  const ringColor = scoreColor(projected);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (projected / 100) * circumference;

  return (
    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-lg)",
          padding: "1.2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.85rem",
        }}
      >
        <div className="label">Projected Match</div>
        <svg width="104" height="104" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="52" cy="52" r={radius} fill="none" stroke="var(--elevated-2)" strokeWidth="7" />
          <circle
            cx="52"
            cy="52"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        </svg>
        <div style={{ textAlign: "center", marginTop: -6 }}>
          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              color: ringColor,
              letterSpacing: "-0.04em",
            }}
          >
            {projected}%
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            {delta >= 0 ? `+${delta}` : delta}% vs current baseline
          </div>
        </div>
      </div>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-lg)",
          padding: "1rem",
        }}
      >
        <div className="label" style={{ marginBottom: "0.9rem" }}>
          Score Breakdown
        </div>
        <ScoreRow label="Job Match" value={scores.match_percent} />
        <ScoreRow label="ATS Score" value={scores.ats_score} />
      </div>

      {atsKeywords.length > 0 && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
            padding: "1rem",
          }}
        >
          <div className="label" style={{ marginBottom: "0.75rem" }}>
            ATS Keywords
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {atsKeywords.slice(0, 18).map((keyword) => (
              <span key={keyword} className="pill pill-accent" style={{ fontSize: 11 }}>
                {keyword}
              </span>
            ))}
            {atsKeywords.length > 18 && (
              <span className="pill pill-ghost" style={{ fontSize: 11 }}>
                +{atsKeywords.length - 18}
              </span>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          background: edgeCaseCount > 0 ? "var(--warning-soft)" : "var(--success-soft)",
          borderRadius: "var(--r-lg)",
          border: `1px solid ${
            edgeCaseCount > 0 ? "rgba(245, 158, 11, 0.25)" : "rgba(16, 185, 129, 0.25)"
          }`,
          padding: "0.95rem 1rem",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: edgeCaseCount > 0 ? "var(--warning)" : "var(--success)",
            marginBottom: "0.2rem",
          }}
        >
          {edgeCaseCount > 0
            ? `${edgeCaseCount} review flag${edgeCaseCount !== 1 ? "s" : ""} to inspect`
            : "No formatting or validation flags"}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
          {edgeCaseCount > 0
            ? "Keep an eye on reverted or suspicious suggestions before exporting."
            : "This session looks clean enough to export once your bullet choices are final."}
        </div>
      </div>
    </div>
  );
}
