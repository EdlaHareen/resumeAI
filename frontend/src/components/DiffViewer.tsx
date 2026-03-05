import { Check, X } from "lucide-react";
import { BulletRow } from "./BulletRow";
import type { BulletDiff, BulletState } from "../types";

interface Props {
  diffs: BulletDiff[];
  bulletStates: Record<string, BulletState>;
  onBulletChange: (bulletId: string, state: BulletState) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

export function DiffViewer({ diffs, bulletStates, onBulletChange, onAcceptAll, onRejectAll }: Props) {
  const acceptedCount = Object.values(bulletStates).filter(
    (s) => s.choice === "accept" || s.choice === "edit"
  ).length;

  if (diffs.length === 0) {
    return (
      <div className="bento-card" style={{ padding: "3rem", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "rgba(235,235,235,0.5)" }}>No changes were suggested for your resume.</p>
        <p style={{ marginTop: "0.5rem", fontSize: 12, color: "rgba(235,235,235,0.3)" }}>
          Your resume may already be well-matched to this job description.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Resume changes">
      {/* Bulk actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <p style={{ fontSize: 14, color: "rgba(235,235,235,0.5)" }}>
          <span style={{ fontWeight: 700, color: "var(--white-primary)" }}>{diffs.length}</span> changes —{" "}
          <span style={{ fontWeight: 700, color: "var(--lime)" }}>{acceptedCount}</span> accepted
        </p>
        <div style={{ display: "flex", gap: "0.5rem" }} role="group" aria-label="Bulk actions">
          <button
            onClick={onAcceptAll}
            style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              padding: "0.4rem 0.875rem",
              borderRadius: 9999,
              border: "1px solid rgba(204,255,0,0.3)",
              background: "rgba(204,255,0,0.07)",
              color: "var(--lime)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <Check size={13} aria-hidden="true" />
            Accept all
          </button>
          <button
            onClick={onRejectAll}
            style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              padding: "0.4rem 0.875rem",
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(235,235,235,0.6)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <X size={13} aria-hidden="true" />
            Keep all original
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {diffs.map((diff) => (
          <BulletRow
            key={diff.bullet_id}
            diff={diff}
            state={bulletStates[diff.bullet_id] ?? { choice: "accept", editedText: diff.tailored }}
            onChange={(state) => onBulletChange(diff.bullet_id, state)}
          />
        ))}
      </div>
    </section>
  );
}
