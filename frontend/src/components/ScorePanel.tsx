import type { Scores } from "../types";

interface Props {
  scores: Scores;
}

function ScoreBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ flex: 1 }} aria-label={`${label}: ${value}%`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(235,235,235,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color }}>
          {value}%
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 9999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            borderRadius: 9999,
            background: color,
            transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}

export function ScorePanel({ scores }: Props) {
  return (
    <div className="bento-card" style={{ padding: "1.25rem 1.5rem" }} aria-label="Resume scores">
      <h2 className="mono" style={{ marginBottom: "1.25rem", color: "rgba(235,235,235,0.5)" }}>
        resume scores
      </h2>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <ScoreBar value={scores.match_percent} label="Job Match" color="var(--lime)" />
        <ScoreBar value={scores.ats_score} label="ATS Score" color="#10b981" />
        <ScoreBar value={scores.strength_score} label="Bullet Strength" color="#f59e0b" />
      </div>
    </div>
  );
}
