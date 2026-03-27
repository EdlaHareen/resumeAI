import type { Scores } from "../types";

interface Props {
  scores: Scores;
  projectedMatchPercent?: number;
}

function ScoreBar({
  value,
  label,
  color,
  projected,
}: {
  value: number;
  label: string;
  color: string;
  projected?: number;
}) {
  const delta = projected !== undefined ? projected - value : null;
  const displayValue = projected !== undefined ? projected : value;

  return (
    <div style={{ flex: 1 }} aria-label={`${label}: ${displayValue}%`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
          {delta !== null && delta !== 0 && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 600,
              color: delta > 0 ? "var(--lime)" : "var(--text-tertiary)",
            }}>
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color }}>
            {displayValue}%
          </span>
        </div>
      </div>
      <div style={{ height: 4, borderRadius: 9999, background: "rgba(255,255,255,0.07)", overflow: "hidden", position: "relative" }}>
        {/* original baseline bar (ghost) */}
        {projected !== undefined && delta !== null && delta > 0 && (
          <div
            style={{
              position: "absolute",
              height: "100%",
              width: `${value}%`,
              borderRadius: 9999,
              background: "rgba(255,255,255,0.12)",
            }}
          />
        )}
        <div
          style={{
            height: "100%",
            width: `${displayValue}%`,
            borderRadius: 9999,
            background: color,
            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}

export function ScorePanel({ scores, projectedMatchPercent }: Props) {
  return (
    <div className="bento-card" style={{ padding: "1.25rem 1.5rem" }} aria-label="Resume scores">
      <h2 className="mono" style={{ marginBottom: "1.25rem", color: "var(--text-secondary)" }}>
        resume scores
      </h2>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <ScoreBar
          value={scores.match_percent}
          label="Job Match"
          color="var(--lime)"
          projected={projectedMatchPercent}
        />
        <ScoreBar value={scores.ats_score} label="ATS Score" color="#10b981" />
        <ScoreBar value={scores.strength_score} label="Bullet Strength" color="#f59e0b" />
      </div>
      {projectedMatchPercent !== undefined && projectedMatchPercent !== scores.match_percent && (
        <p style={{ marginTop: "0.875rem", fontSize: 11, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>
          job match updates live as you accept or reject bullets
        </p>
      )}
    </div>
  );
}
