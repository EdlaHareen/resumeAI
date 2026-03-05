import { AlertTriangle, Info } from "lucide-react";
import type { EdgeCase } from "../types";

interface Props {
  edgeCases: EdgeCase[];
}

export function EdgeCaseAlert({ edgeCases }: Props) {
  if (edgeCases.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {edgeCases.map((ec) => (
        <div
          key={ec.type}
          role="status"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            borderRadius: "1rem",
            padding: "0.875rem 1.125rem",
            fontSize: 13,
            lineHeight: 1.5,
            background: ec.severity === "warning"
              ? "rgba(245,158,11,0.08)"
              : "rgba(99,102,241,0.08)",
            border: `1px solid ${ec.severity === "warning" ? "rgba(245,158,11,0.25)" : "rgba(99,102,241,0.25)"}`,
            color: ec.severity === "warning"
              ? "#fbbf24"
              : "#a5b4fc",
          }}
        >
          {ec.severity === "warning" ? (
            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          ) : (
            <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          )}
          <p>{ec.message}</p>
        </div>
      ))}
    </div>
  );
}
