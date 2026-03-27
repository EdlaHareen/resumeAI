import React from "react";
import { TemplateId, Tier } from "../types";

export const TEMPLATES = [
  { id: "jake",     label: "Jake's Classic", desc: "ATS-safe · Minimal · Clean",  pro: false },
  { id: "modern",   label: "Modern",         desc: "Navy accents · Bold headers",  pro: true  },
  { id: "soham",    label: "ATS Pro",        desc: "Small-caps · ATS optimized",   pro: true  },
  { id: "overleaf", label: "Clean",          desc: "Open bullets · Minimal",       pro: true  },
] as const;

interface MockupProps {
  id: TemplateId;
}

export function TemplateMockup({ id }: MockupProps) {
  const isModern = id === "modern";
  const isSoham = id === "soham" || id === "overleaf";
  const isJake = id === "jake";
  const isOverleaf = id === "overleaf";

  const accentColor = isModern ? "#141E61" : "#111";
  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: isModern ? 13 : isSoham ? 12 : 10,
    fontWeight: 700,
    color: accentColor,
    borderBottom: isModern ? "2px solid #141E61" : isSoham ? "0.6px solid #aaa" : "0.4px solid #111",
    paddingBottom: 2,
    marginTop: 12,
    marginBottom: 4,
    textTransform: isJake ? "uppercase" : "none",
    fontVariant: isSoham ? "small-caps" : "normal",
    fontFamily: "Arial, Helvetica, sans-serif",
  };

  const nameStyle: React.CSSProperties = {
    fontSize: isModern ? 22 : isSoham ? 16 : 15,
    fontWeight: 700,
    color: accentColor,
    textAlign: isModern ? "left" : "center",
    marginBottom: 2,
    fontFamily: "Arial, Helvetica, sans-serif",
  };

  const subHeaderStyle: React.CSSProperties = {
    fontSize: 10,
    color: "#444",
    textAlign: isModern ? "left" : "center",
    marginBottom: 12,
    fontFamily: "Arial, Helvetica, sans-serif",
  };

  const entryHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    fontWeight: 700,
    color: "#111",
    fontFamily: "Arial, Helvetica, sans-serif",
  };

  const entrySubHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 10,
    fontStyle: "italic",
    color: isModern ? "#141E61" : "#333",
    marginTop: 1,
    fontFamily: "Arial, Helvetica, sans-serif",
  };

  const bulletStyle: React.CSSProperties = {
    fontSize: 10,
    color: "#333",
    marginLeft: 15,
    marginTop: 2,
    lineHeight: 1.3,
    fontFamily: "Arial, Helvetica, sans-serif",
    position: "relative",
  };

  const bulletChar = isOverleaf ? "○" : "•";

  return (
    <div style={{ width: 520, minHeight: 735, background: "#fff", padding: "40px 50px", boxSizing: "border-box", color: "#000" }}>
      <div style={nameStyle}>DASHIELL HAMMETT</div>
      <div style={subHeaderStyle}>555-0199 | detective@continental.com | linkedin.com/in/dash | San Francisco, CA</div>

      <div style={sectionHeaderStyle}>TECHNICAL SKILLS</div>
      <div style={{ fontSize: 10, color: "#111", fontFamily: "Arial, sans-serif" }}>
        <strong>Languages:</strong> Python, TypeScript, SQL, Go, LaTeX<br/>
        <strong>Frameworks:</strong> React, FastAPI, Node.js, Tailwind CSS
      </div>

      <div style={sectionHeaderStyle}>WORK EXPERIENCE</div>
      <div>
        <div style={entryHeaderStyle}>
          <span>Continental Detective Agency</span>
          <span>Aug. 1923 – Present</span>
        </div>
        <div style={entrySubHeaderStyle}>
          <span>Lead Investigator</span>
          <span>San Francisco, CA</span>
        </div>
        {[
          "Solved high-profile cases involving the Maltese Falcon using advanced deduplication logic.",
          "Refactored street-level surveillance workflows, increasing efficiency by 40%.",
          "Collaborated with local authorities to ensure 99.9% uptime for public safety protocols."
        ].map((b, i) => (
          <div key={i} style={bulletStyle}>
            <span style={{ position: "absolute", left: -12 }}>{bulletChar}</span>
            {b}
          </div>
        ))}
      </div>

      <div style={sectionHeaderStyle}>PROJECTS</div>
      <div>
        <div style={entryHeaderStyle}>
          <span>Red Harvest Analysis Tool | <i>Python, NLP</i></span>
          <span>Jan. 1929</span>
        </div>
        {[
          "Developed an NLP-based threat assessment tool to analyze gang communications in Personville.",
          "Implemented a real-time alerting system for cross-border asset tracking."
        ].map((b, i) => (
          <div key={i} style={bulletStyle}>
            <span style={{ position: "absolute", left: -12 }}>{bulletChar}</span>
            {b}
          </div>
        ))}
      </div>

      <div style={sectionHeaderStyle}>EDUCATION</div>
      <div>
        <div style={entryHeaderStyle}>
          <span>University of Hard Knocks</span>
          <span>June 1915</span>
        </div>
        <div style={entrySubHeaderStyle}>
          <span>Bachelor of Science in Deduction</span>
          <span>GPA: 3.9/4.0</span>
        </div>
      </div>
    </div>
  );
}

export function TemplateThumbnail({ id }: MockupProps) {
  const SCALE = 0.32;
  return (
    <div style={{
      width: "100%",
      aspectRatio: "1 / 1.4142",
      overflow: "hidden",
      borderRadius: "0.4rem",
      background: "#fff",
      position: "relative",
    }}>
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        transformOrigin: "top left",
        transform: `scale(${SCALE})`,
        width: `${100 / SCALE}%`,
        pointerEvents: "none",
      }}>
        <TemplateMockup id={id} />
      </div>
    </div>
  );
}

interface ModalProps {
  template: typeof TEMPLATES[number];
  tier: Tier;
  onSelect: (id: TemplateId) => void;
  onUpgrade: () => void;
  onClose: () => void;
}

export function TemplatePreviewModal({ template, tier, onSelect, onUpgrade, onClose }: ModalProps) {
  const isLocked = template.pro && tier !== "pro";

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 620,
          background: "#111",
          borderRadius: "1.25rem",
          border: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh"
        }}
      >
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "#fff" }}>{template.label}</h3>
              {template.pro && <span style={{ background: "#ccff00", color: "#000", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>PRO</span>}
            </div>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>{template.desc}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 24, padding: 0 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "1.5rem", display: "flex", justifyContent: "center", background: "#1a1a1a" }}>
          <div style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.5)", borderRadius: 4, overflow: "hidden" }}>
            <TemplateMockup id={template.id} />
          </div>
        </div>

        <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {isLocked ? (
            <button 
              onClick={onUpgrade}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "0.75rem",
                background: "#ccff00",
                color: "#111",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontSize: 15
              }}
            >
              Upgrade to Pro to Use This Template
            </button>
          ) : (
            <button 
              onClick={() => { onSelect(template.id); onClose(); }}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "0.75rem",
                background: "#ccff00",
                color: "#111",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontSize: 15
              }}
            >
              Use This Template
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
