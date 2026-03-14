import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Info } from "lucide-react";
import type { EdgeCase } from "../types";

interface Props {
  edgeCases: EdgeCase[];
}

export function EdgeCaseAlert({ edgeCases }: Props) {
  const [open, setOpen] = useState(false);

  if (edgeCases.length === 0) return null;

  const warnings = edgeCases.filter((e) => e.severity === "warning");
  const infos = edgeCases.filter((e) => e.severity !== "warning");
  const label = warnings.length > 0
    ? `${warnings.length} AI suggestion${warnings.length > 1 ? "s" : ""} reverted`
    : `${infos.length} AI note${infos.length > 1 ? "s" : ""}`;
  const color = warnings.length > 0 ? "#fbbf24" : "#a5b4fc";
  const bg = warnings.length > 0 ? "rgba(245,158,11,0.08)" : "rgba(99,102,241,0.08)";
  const border = warnings.length > 0 ? "rgba(245,158,11,0.25)" : "rgba(99,102,241,0.25)";

  return (
    <div style={{ borderRadius: "1rem", border: `1px solid ${border}`, background: bg, overflow: "hidden" }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          padding: "0.75rem 1.125rem",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color,
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'Space Grotesk', sans-serif",
          textAlign: "left",
        }}
      >
        <AlertTriangle size={14} style={{ flexShrink: 0 }} aria-hidden="true" />
        <span style={{ flex: 1 }}>{label}</span>
        {open
          ? <ChevronUp size={14} style={{ flexShrink: 0 }} aria-hidden="true" />
          : <ChevronDown size={14} style={{ flexShrink: 0 }} aria-hidden="true" />}
      </button>

      {/* Expanded details */}
      {open && (
        <div
          style={{
            borderTop: `1px solid ${border}`,
            padding: "0.75rem 1.125rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.625rem",
          }}
        >
          {edgeCases.map((ec, i) => (
            <div
              key={`${ec.type}-${i}`}
              style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}
            >
              {ec.severity === "warning"
                ? <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 2, color: "#fbbf24" }} aria-hidden="true" />
                : <Info size={13} style={{ flexShrink: 0, marginTop: 2, color: "#a5b4fc" }} aria-hidden="true" />}
              <p style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.55,
                color: ec.severity === "warning" ? "rgba(251,191,36,0.85)" : "rgba(165,180,252,0.85)",
              }}>
                {ec.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
