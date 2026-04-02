import React, { useState } from "react";
import { Check, X, Pencil, RotateCcw } from "lucide-react";
import type { BulletDiff, BulletState } from "../types";

function highlightKeywords(
  text: string,
  keywords: string[],
  injectedKeywords?: string[],
): React.ReactNode {
  // Filter out keywords that are too short (< 3 chars) to avoid matching inside words
  // e.g., "AI" matching inside "maintaining", "daily"
  const minLen = 3;
  const filteredKeywords = keywords.filter((k) => k.length >= minLen);
  const filteredInjected = (injectedKeywords ?? []).filter((k) => k.length >= minLen);
  const all = [...filteredKeywords, ...filteredInjected];
  if (!all.length) return text;

  // Sort by length descending so longer phrases match first (e.g., "AI solutions" before "solutions")
  const sorted = [...all].sort((a, b) => b.length - a.length);
  const escaped = sorted.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  // Use word boundaries to prevent matching inside other words
  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const isInjected = filteredInjected.some((k) => k.toLowerCase() === part.toLowerCase());
    const isKeyword = !isInjected && filteredKeywords.some((k) => k.toLowerCase() === part.toLowerCase());
    if (isInjected) {
      return (
        <mark
          key={i}
          title="Added from JD — verify you have experience with this"
          style={{
            background: "rgba(251,191,36,0.15)",
            color: "#fbbf24",
            borderRadius: "0.2rem",
            padding: "0 0.15rem",
            fontWeight: 600,
            cursor: "help",
          }}
        >
          {part}
        </mark>
      );
    }
    if (isKeyword) {
      return (
        <mark
          key={i}
          style={{
            background: "rgba(204,255,0,0.15)",
            color: "var(--lime)",
            borderRadius: "0.2rem",
            padding: "0 0.15rem",
            fontWeight: 600,
          }}
        >
          {part}
        </mark>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

interface Props {
  diff: BulletDiff;
  state: BulletState;
  onChange: (state: BulletState) => void;
}

export function BulletRow({ diff, state, onChange }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(diff.tailored);

  function handleAccept() { onChange({ choice: "accept", editedText: diff.tailored }); }
  function handleReject() { onChange({ choice: "reject", editedText: diff.original }); }
  function handleEdit() {
    setIsEditing(true);
    setEditText(state.choice === "edit" ? state.editedText : diff.tailored);
  }
  function handleSaveEdit() { onChange({ choice: "edit", editedText: editText }); setIsEditing(false); }
  function handleCancelEdit() { setIsEditing(false); }

  const chosen = state.choice;

  const accentColor = chosen === "accept"
    ? "rgba(204,255,0,0.4)"
    : chosen === "edit"
    ? "rgba(204,255,0,0.25)"
    : "rgba(255,255,255,0.1)";

  return (
    <div
      role="article"
      aria-label={`Bullet change in ${diff.section}`}
      style={{
        borderRadius: "1.25rem",
        border: "1px solid rgba(255,255,255,0.07)",
        borderLeft: `3px solid ${accentColor}`,
        background: "rgba(255,255,255,0.02)",
        padding: "1.25rem",
        transition: "border-color 0.2s",
      }}
    >
      {/* Section label */}
      <span style={{
        display: "inline-block",
        marginBottom: "0.75rem",
        padding: "0.2rem 0.6rem",
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "var(--text-secondary)",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {diff.section}
      </span>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
        {/* Original */}
        <div>
          <p style={{ marginBottom: "0.4rem", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)" }}>
            Original
          </p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", textDecoration: chosen === "reject" ? "none" : "line-through", textDecorationColor: "var(--text-muted)", lineHeight: 1.5 }}>
            {diff.original}
          </p>
        </div>

        {/* Tailored */}
        <div>
          <p style={{ marginBottom: "0.4rem", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)" }}>
            Tailored
          </p>
          {isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <textarea
                rows={3}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                aria-label="Edit tailored bullet"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(204,255,0,0.3)",
                  borderRadius: "0.75rem",
                  padding: "0.625rem",
                  fontSize: 13,
                  color: "var(--white-primary)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  lineHeight: 1.5,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: 9999,
                    border: "none",
                    background: "var(--lime)",
                    color: "#000",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: 9999,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p style={{
              fontSize: 13,
              fontWeight: chosen === "reject" ? 400 : 500,
              color: chosen === "reject" ? "var(--text-tertiary)" : "var(--white-primary)",
              lineHeight: 1.5,
            }}>
              {chosen === "edit"
                ? state.editedText
                : highlightKeywords(diff.tailored, diff.keywords_added, diff.injected_keywords)}
            </p>
          )}
        </div>
      </div>

      {/* Keywords added */}
      {(diff.keywords_added.length > 0 || (diff.injected_keywords?.length ?? 0) > 0) && (
        <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {diff.keywords_added.map((kw) => (
            <span
              key={kw}
              style={{
                padding: "0.15rem 0.5rem",
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 600,
                background: "rgba(204,255,0,0.08)",
                border: "1px solid rgba(204,255,0,0.2)",
                color: "var(--lime)",
              }}
            >
              +{kw}
            </span>
          ))}
          {(diff.injected_keywords ?? []).map((kw) => (
            <span
              key={kw}
              title="Injected from JD — verify you have experience with this"
              style={{
                padding: "0.15rem 0.5rem",
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 600,
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.25)",
                color: "#fbbf24",
                cursor: "help",
              }}
            >
              +{kw} ⚠
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {!isEditing && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }} role="group" aria-label="Bullet actions">
          <button
            onClick={handleAccept}
            aria-pressed={chosen === "accept"}
            style={{
              display: "flex", alignItems: "center", gap: "0.3rem",
              padding: "0.35rem 0.75rem",
              borderRadius: 9999,
              border: `1px solid ${chosen === "accept" ? "rgba(204,255,0,0.5)" : "rgba(255,255,255,0.1)"}`,
              background: chosen === "accept" ? "rgba(204,255,0,0.12)" : "transparent",
              color: chosen === "accept" ? "var(--lime)" : "var(--text-secondary)",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "all 0.15s",
            }}
          >
            <Check size={12} aria-hidden="true" />
            Accept
          </button>
          <button
            onClick={handleReject}
            aria-pressed={chosen === "reject"}
            style={{
              display: "flex", alignItems: "center", gap: "0.3rem",
              padding: "0.35rem 0.75rem",
              borderRadius: 9999,
              border: `1px solid ${chosen === "reject" ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.07)"}`,
              background: chosen === "reject" ? "rgba(255,255,255,0.08)" : "transparent",
              color: chosen === "reject" ? "var(--text-primary)" : "var(--text-tertiary)",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "all 0.15s",
            }}
          >
            <X size={12} aria-hidden="true" />
            Keep original
          </button>
          <button
            onClick={handleEdit}
            aria-pressed={chosen === "edit"}
            style={{
              display: "flex", alignItems: "center", gap: "0.3rem",
              padding: "0.35rem 0.75rem",
              borderRadius: 9999,
              border: `1px solid ${chosen === "edit" ? "rgba(204,255,0,0.4)" : "rgba(255,255,255,0.07)"}`,
              background: chosen === "edit" ? "rgba(204,255,0,0.08)" : "transparent",
              color: chosen === "edit" ? "var(--accent)" : "var(--text-tertiary)",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "all 0.15s",
            }}
          >
            <Pencil size={12} aria-hidden="true" />
            Edit
          </button>
          {chosen !== "accept" && (
            <button
              onClick={handleAccept}
              aria-label="Reset to tailored"
              style={{
                marginLeft: "auto",
                padding: "0.35rem 0.5rem",
                borderRadius: 9999,
                border: "none",
                background: "transparent",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex", alignItems: "center",
              }}
            >
              <RotateCcw size={12} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
