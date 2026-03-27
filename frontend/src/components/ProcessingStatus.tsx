import { Check, Loader2 } from "lucide-react";

const STAGES = [
  { id: 1, label: "Parsing your resume" },
  { id: 2, label: "Analyzing the job description" },
  { id: 3, label: "Tailoring your bullets" },
  { id: 4, label: "Verifying accuracy" },
];

interface Props {
  currentStage: number;
}

export function ProcessingStatus({ currentStage }: Props) {
  return (
    <div role="status" aria-live="polite" aria-label={`Processing: stage ${currentStage} of 4`}>
      <ol style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {STAGES.map((stage) => {
          const done = currentStage > stage.id;
          const active = currentStage === stage.id;

          return (
            <li
              key={stage.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                borderRadius: "1rem",
                padding: "0.875rem 1.25rem",
                background: active
                  ? "rgba(204,255,0,0.06)"
                  : done
                  ? "rgba(16,185,129,0.06)"
                  : "rgba(255,255,255,0.02)",
                border: `1px solid ${
                  active
                    ? "rgba(204,255,0,0.25)"
                    : done
                    ? "rgba(16,185,129,0.2)"
                    : "rgba(255,255,255,0.06)"
                }`,
                transition: "all 0.3s ease",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  background: done
                    ? "rgba(16,185,129,0.2)"
                    : active
                    ? "rgba(204,255,0,0.15)"
                    : "rgba(255,255,255,0.06)",
                  border: `1px solid ${
                    done
                      ? "rgba(16,185,129,0.5)"
                      : active
                      ? "rgba(204,255,0,0.5)"
                      : "rgba(255,255,255,0.1)"
                  }`,
                  color: done ? "#10b981" : active ? "var(--lime)" : "var(--text-tertiary)",
                }}
                aria-hidden="true"
              >
                {done ? (
                  <Check size={13} />
                ) : active ? (
                  <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  stage.id
                )}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: done
                    ? "#10b981"
                    : active
                    ? "var(--lime)"
                    : "var(--text-tertiary)",
                }}
              >
                {stage.label}
              </span>
              {done && <span className="sr-only">Complete</span>}
              {active && <span className="sr-only">In progress</span>}
            </li>
          );
        })}
      </ol>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
