import { useEffect, useRef } from "react";

interface Props {
  onGetStarted: () => void;
}

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  lime: "#ccff00",
  obsidian: "#0c0c0c",
  black: "#000000",
  white: "#ebebeb",
  emerald: "#10b981",
  glass: {
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
} as const;

// ── Noise SVG overlay (data URI) ─────────────────────────────────────────────
const NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

// ── Grid pattern background ──────────────────────────────────────────────────
const GRID_BG: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
  `,
  backgroundSize: "60px 60px",
};

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <header style={{
      position: "absolute", top: 0, left: 0, right: 0, zIndex: 50,
      padding: "1.5rem 2.5rem",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "0.625rem",
          background: T.lime, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: "#000", lineHeight: 1 }}>R</span>
        </div>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: T.white, letterSpacing: "-0.02em" }}>
          ResumeAI
        </span>
      </div>

      {/* Pill nav */}
      <nav style={{
        ...T.glass,
        borderRadius: "9999px",
        padding: "0.5rem 1.25rem",
        display: "flex", gap: "2rem",
      }}>
        {["Features", "How it Works", "Pricing"].map(link => (
          <a key={link} href={`#${link.toLowerCase().replace(/ /g, "-")}`} style={{
            fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 500,
            color: "rgba(235,235,235,0.7)", textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseOver={e => (e.currentTarget.style.color = T.white)}
          onMouseOut={e => (e.currentTarget.style.color = "rgba(235,235,235,0.7)")}
          >
            {link}
          </a>
        ))}
      </nav>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        {/* System status */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div className="pulse-dot" style={{
            width: 6, height: 6, borderRadius: "50%", background: T.lime,
            animation: "pulse-dot 2s ease-in-out infinite",
          }} />
          <span className="mono" style={{ color: "rgba(235,235,235,0.5)", fontSize: 10 }}>
            SYSTEM ONLINE
          </span>
        </div>
        {/* CTA */}
        <button onClick={onGetStarted} style={{
          background: T.white, color: "#000", fontFamily: "'Space Grotesk',sans-serif",
          fontWeight: 600, fontSize: 14, border: "none", borderRadius: "9999px",
          padding: "0.5rem 1.25rem", cursor: "pointer",
          transition: "background 0.2s, transform 0.2s",
        }}
        onMouseOver={e => { e.currentTarget.style.background = T.lime; }}
        onMouseOut={e => { e.currentTarget.style.background = T.white; }}
        >
          Get Started
        </button>
      </div>
    </header>
  );
}

// ── Hero mockup card ─────────────────────────────────────────────────────────
function HeroMockup() {
  return (
    <div className="float-anim" style={{
      ...T.glass, borderRadius: "2rem", padding: "1.5rem", width: "100%", maxWidth: 400,
      position: "relative",
    }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <span className="mono" style={{ color: "rgba(235,235,235,0.4)" }}>DIFF REVIEW</span>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {["#ff5f57","#febc2e","#28c840"].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
      </div>

      {/* ATS score badge */}
      <div style={{
        ...T.glass, borderRadius: "0.75rem", padding: "0.75rem 1rem",
        marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, color: "rgba(235,235,235,0.6)" }}>ATS Match Score</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 80, height: 4, borderRadius: 9999, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ width: "87%", height: "100%", background: T.lime, borderRadius: 9999 }} />
          </div>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: T.lime, fontWeight: 600 }}>87%</span>
        </div>
      </div>

      {/* Bullet diff */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {/* Original */}
        <div style={{
          background: "rgba(255,80,80,0.08)", borderRadius: "0.75rem",
          padding: "0.75rem 1rem", borderLeft: "2px solid rgba(255,80,80,0.4)",
        }}>
          <div className="mono" style={{ color: "rgba(255,100,100,0.7)", marginBottom: "0.25rem" }}>ORIGINAL</div>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, color: "rgba(235,235,235,0.5)", lineHeight: 1.5, textDecoration: "line-through" }}>
            Developed Python scripts for data processing tasks.
          </p>
        </div>

        {/* Tailored */}
        <div style={{
          background: "rgba(204,255,0,0.05)", borderRadius: "0.75rem",
          padding: "0.75rem 1rem", borderLeft: `2px solid ${T.lime}66`,
        }}>
          <div className="mono" style={{ color: `${T.lime}99`, marginBottom: "0.25rem" }}>TAILORED</div>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, color: T.white, lineHeight: 1.5 }}>
            Engineered Python ETL pipelines processing 50K+ daily records, cutting processing time by 40%.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
          {[
            { label: "Accept", bg: `${T.lime}22`, color: T.lime, border: `${T.lime}44` },
            { label: "Keep Original", bg: "rgba(255,255,255,0.05)", color: "rgba(235,235,235,0.5)", border: "rgba(255,255,255,0.1)" },
            { label: "Edit", bg: "rgba(255,255,255,0.05)", color: "rgba(235,235,235,0.5)", border: "rgba(255,255,255,0.1)" },
          ].map(btn => (
            <button key={btn.label} style={{
              background: btn.bg, color: btn.color,
              border: `1px solid ${btn.border}`, borderRadius: "0.5rem",
              padding: "0.3rem 0.75rem", fontSize: 11, fontWeight: 600,
              fontFamily: "'Space Grotesk',sans-serif", cursor: "pointer",
            }}>
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI cursor badge */}
      <div className="float-anim-delay" style={{
        position: "absolute", top: -16, right: -16,
        background: T.lime, borderRadius: "0.5rem",
        padding: "0.35rem 0.75rem", display: "flex", alignItems: "center", gap: "0.4rem",
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#000" }} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, color: "#000", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          AI Active
        </span>
      </div>
    </div>
  );
}

// ── Floating stat card ───────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="float-anim-delay" style={{
      ...T.glass, borderRadius: "1rem", padding: "0.875rem 1.125rem",
      minWidth: 140,
    }}>
      <div className="mono" style={{ color: "rgba(235,235,235,0.35)", marginBottom: "0.35rem" }}>{label}</div>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: T.lime, letterSpacing: "-0.04em" }}>{value}</div>
      {sub && <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, color: "rgba(235,235,235,0.4)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "0 2.5rem", paddingTop: "6rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: "4rem", width: "100%", alignItems: "center" }}>

        {/* Left — copy */}
        <div>
          {/* AI label */}
          <div className="fade-up-1 mono" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            ...T.glass, borderRadius: "9999px", padding: "0.4rem 0.875rem",
            marginBottom: "1.75rem",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.lime, animation: "pulse-dot 2s infinite" }} />
            <span style={{ color: "rgba(235,235,235,0.5)" }}>AI-POWERED RESUME TAILORING</span>
          </div>

          {/* Giant headline */}
          <h1 className="fade-up-2" style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontWeight: 700,
            fontSize: "clamp(3.5rem, 7vw, 7.5rem)",
            lineHeight: 0.88,
            letterSpacing: "-0.06em",
            color: T.white,
            marginBottom: "1.75rem",
          }}>
            Land Your<br />
            Dream Job<br />
            <em style={{
              fontStyle: "italic",
              background: `linear-gradient(135deg, ${T.lime} 0%, rgba(255,255,255,0.9) 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              in 60 Seconds.
            </em>
          </h1>

          {/* Subheadline */}
          <p className="fade-up-3" style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: "clamp(1rem, 1.3vw, 1.125rem)",
            color: "rgba(235,235,235,0.55)",
            lineHeight: 1.6,
            maxWidth: 520,
            marginBottom: "2.5rem",
          }}>
            Stop rewriting your resume for every application. Upload your resume, paste any job description, and get AI-tailored bullets that match what recruiters screen for —{" "}
            <span style={{ color: T.white }}>without making anything up.</span>
          </p>

          {/* CTAs */}
          <div className="fade-up-4" style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <button className="neon-btn" onClick={onGetStarted} style={{ padding: "0.875rem 2rem", fontSize: 15 }}>
              Start Tailoring Free →
            </button>
            <a href="#how-it-works" style={{
              fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 500,
              color: "rgba(235,235,235,0.6)", textDecoration: "none",
              display: "flex", alignItems: "center", gap: "0.35rem",
              transition: "color 0.2s",
            }}
            onMouseOver={e => (e.currentTarget.style.color = T.white)}
            onMouseOut={e => (e.currentTarget.style.color = "rgba(235,235,235,0.6)")}
            >
              See How It Works ↓
            </a>
          </div>

          {/* Trust micro-copy */}
          <div className="fade-up-4" style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "1.5rem" }}>
            {["Free account", "No credit card", "Resume never stored"].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="6" fill={`${T.lime}22`} />
                  <path d="M3.5 6L5.5 8L8.5 4" stroke={T.lime} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, color: "rgba(235,235,235,0.4)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — mockup */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignSelf: "flex-start" }}>
            <StatCard label="AVG TIME" value="58s" sub="Upload to download" />
            <StatCard label="ACCURACY" value="100%" sub="Zero hallucinations" />
          </div>
          <HeroMockup />
          <div style={{ alignSelf: "flex-start" }}>
            <StatCard label="ATS FORMATS" value="PDF + DOCX" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Trust bar ────────────────────────────────────────────────────────────────
function TrustBar() {
  const items = [
    { icon: "⚡", label: "60-second tailoring" },
    { icon: "🛡", label: "Zero hallucinations" },
    { icon: "✓", label: "ATS-keyword matched" },
    { icon: "↓", label: "PDF + DOCX export" },
    { icon: "🔒", label: "Resume never stored" },
  ];
  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "1.25rem 2.5rem",
      display: "flex", alignItems: "center", justifyContent: "center", gap: "3rem",
      flexWrap: "wrap",
    }}>
      {items.map(({ icon, label }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span style={{ fontSize: 14 }}>{icon}</span>
          <span className="mono" style={{ color: "rgba(235,235,235,0.4)" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Bento features ───────────────────────────────────────────────────────────
function BentoFeatures() {
  return (
    <section id="features" style={{ padding: "6rem 2.5rem" }}>
      <div style={{ marginBottom: "3.5rem" }}>
        <div className="mono" style={{ color: "rgba(235,235,235,0.35)", marginBottom: "0.75rem" }}>// FEATURES</div>
        <h2 style={{
          fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
          fontSize: "clamp(2rem,3.5vw,3rem)", letterSpacing: "-0.05em",
          color: T.white, lineHeight: 1,
        }}>
          Built different.<br />
          <span style={{ color: "rgba(235,235,235,0.35)" }}>For students who need results.</span>
        </h2>
      </div>

      {/* Bento grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "auto auto", gap: "1rem" }}>

        {/* Large 2×2 — Hallucination-free */}
        <div className="bento-card" style={{ gridColumn: "span 2", gridRow: "span 2", padding: "2rem", display: "flex", flexDirection: "column" }}>
          <div className="mono" style={{ color: "rgba(235,235,235,0.3)", marginBottom: "1rem" }}>01 / INTEGRITY</div>
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.625rem", letterSpacing: "-0.04em", color: T.white, lineHeight: 1.15, marginBottom: "0.75rem" }}>
            AI that never<br />makes things up.
          </h3>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: "rgba(235,235,235,0.5)", lineHeight: 1.6, marginBottom: "auto" }}>
            Every rewrite is validated against your original. If the AI can't improve a bullet without inventing facts, it leaves it unchanged. Period.
          </p>
          {/* Validation bars */}
          <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {[
              { label: "Fact accuracy", val: 100, color: T.lime },
              { label: "Keyword match", val: 87, color: T.emerald },
              { label: "ATS compatibility", val: 92, color: T.lime },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, color: "rgba(235,235,235,0.4)" }}>{label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color, fontWeight: 500 }}>{val}%</span>
                </div>
                <div style={{ height: 3, borderRadius: 9999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                  <div style={{ width: `${val}%`, height: "100%", background: color, borderRadius: 9999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tall 1×2 — ATS keywords */}
        <div className="bento-card" style={{ gridColumn: "span 1", gridRow: "span 2", padding: "1.75rem", display: "flex", flexDirection: "column" }}>
          <div className="mono" style={{ color: "rgba(235,235,235,0.3)", marginBottom: "1rem" }}>02 / ATS</div>
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.03em", color: T.white, marginBottom: "0.625rem", lineHeight: 1.2 }}>
            Keywords recruiters actually scan for.
          </h3>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: "rgba(235,235,235,0.45)", lineHeight: 1.6, marginBottom: "auto" }}>
            We analyze the job description and surface the exact ATS keywords woven naturally into your bullets.
          </p>
          {/* Keyword chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1.5rem" }}>
            {["Python", "REST APIs", "CI/CD", "AWS Lambda", "PostgreSQL", "FastAPI", "Docker", "ETL"].map(kw => (
              <span key={kw} style={{
                fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 500,
                background: `${T.lime}15`, color: T.lime,
                border: `1px solid ${T.lime}30`, borderRadius: "0.4rem", padding: "0.25rem 0.5rem",
              }}>
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Accent 1×1 — 60 seconds */}
        <div className="bento-card" style={{
          background: T.lime, border: "none", padding: "1.75rem",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          backgroundImage: NOISE, backgroundBlendMode: "overlay",
          position: "relative", overflow: "hidden",
        }}>
          <div className="mono" style={{ color: "rgba(0,0,0,0.5)" }}>03 / SPEED</div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "3.5rem", letterSpacing: "-0.06em", color: "#000", lineHeight: 1 }}>60s</div>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: "rgba(0,0,0,0.65)", lineHeight: 1.4, marginTop: "0.5rem" }}>
              From upload to tailored resume. Faster than reading the job description.
            </p>
          </div>
        </div>

        {/* 1×1 — Diff review */}
        <div className="bento-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="mono" style={{ color: "rgba(235,235,235,0.3)", marginBottom: "1rem" }}>04 / CONTROL</div>
          <div>
            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.125rem", letterSpacing: "-0.03em", color: T.white, marginBottom: "0.5rem" }}>
              You approve every change.
            </h3>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: "rgba(235,235,235,0.45)", lineHeight: 1.5 }}>
              Accept, reject, or hand-edit each bullet before downloading. Nothing ships without your sign-off.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            {["✓ Accept", "✕ Reject", "✎ Edit"].map(a => (
              <span key={a} style={{
                fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(235,235,235,0.5)",
                background: "rgba(255,255,255,0.06)", borderRadius: "0.375rem",
                padding: "0.25rem 0.5rem", border: "1px solid rgba(255,255,255,0.08)",
              }}>{a}</span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// ── Methodology (light contrast section) ─────────────────────────────────────
function Methodology() {
  const steps = [
    { n: "01", title: "Upload your resume", body: "Drop any PDF or DOCX. Our parser extracts every bullet, company, date, and skill — preserving your exact experience." },
    { n: "02", title: "Paste the job description", body: "The full posting. We analyze required skills, ATS keywords, role level, and what this company actually screens for." },
    { n: "03", title: "Review and download", body: "See every proposed change side-by-side. Accept what you like, reject what you don't, edit anything. Then download your tailored resume." },
  ];

  return (
    <section id="how-it-works" style={{
      background: "#e5e5e5",
      borderRadius: "4rem 4rem 0 0",
      padding: "5rem 2.5rem",
      color: "#000",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
        {/* Left — steps */}
        <div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(0,0,0,0.4)", marginBottom: "1.5rem" }}>
            // HOW IT WORKS
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "clamp(2rem,3vw,2.75rem)", letterSpacing: "-0.05em", lineHeight: 1.1, marginBottom: "3rem" }}>
            Three steps.<br />One great resume.
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {steps.map(({ n, title, body }) => (
              <div key={n} style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                  border: "1.5px solid rgba(0,0,0,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.5)" }}>{n}</span>
                </div>
                <div>
                  <h4 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, marginBottom: "0.375rem" }}>{title}</h4>
                  <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: "rgba(0,0,0,0.55)", lineHeight: 1.6 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — testimonial with portrait placeholder */}
        <div style={{ position: "relative" }}>
          {/* Greyscale portrait placeholder */}
          <div style={{
            width: "100%", aspectRatio: "4/5", borderRadius: "2rem",
            background: "linear-gradient(145deg, #ccc 0%, #999 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", position: "relative",
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: "rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="18" r="10" fill="rgba(255,255,255,0.6)" />
                <ellipse cx="24" cy="42" rx="18" ry="12" fill="rgba(255,255,255,0.6)" />
              </svg>
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }} />
          </div>

          {/* Glassmorphism testimonial card */}
          <div style={{
            position: "absolute", bottom: -20, left: -20, right: 20,
            background: "rgba(12,12,12,0.85)", backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "1.5rem", padding: "1.25rem 1.5rem",
          }}>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: "rgba(235,235,235,0.85)", lineHeight: 1.6, marginBottom: "0.875rem" }}>
              "I used to spend 2 hours tailoring my resume for each application. Now it takes 60 seconds and my callbacks doubled."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.lime, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: "#000" }}>A</span>
              </div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: T.white }}>Aisha K.</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "rgba(235,235,235,0.35)", textTransform: "uppercase", letterSpacing: "0.1em" }}>CS Senior, UT Austin</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer CTA ───────────────────────────────────────────────────────────────
function FooterCTA({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <footer style={{ background: T.black, padding: "5rem 2.5rem 3rem", position: "relative", overflow: "hidden" }}>
      {/* Watermark */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
        fontSize: "clamp(6rem,12vw,10rem)", letterSpacing: "-0.06em",
        color: "rgba(255,255,255,0.035)", whiteSpace: "nowrap",
        pointerEvents: "none", userSelect: "none",
      }}>
        RESUME
      </div>

      {/* CTA content */}
      <div style={{ position: "relative", textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
        <div className="mono" style={{ color: "rgba(235,235,235,0.3)", marginBottom: "1.25rem" }}>// GET STARTED TODAY</div>
        <h2 style={{
          fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
          fontSize: "clamp(2.25rem,4.5vw,3.5rem)", letterSpacing: "-0.05em",
          color: T.white, lineHeight: 1.05, marginBottom: "1.25rem",
        }}>
          Your next interview<br />starts with a better resume.
        </h2>
        <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, color: "rgba(235,235,235,0.45)", lineHeight: 1.6, marginBottom: "2.5rem" }}>
          Free to sign up. Tailor your first resume in under 60 seconds.
        </p>

        {/* Oversized lime CTA button */}
        <button onClick={onGetStarted} style={{
          background: T.lime, color: "#000",
          fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
          fontSize: 18, border: "none", borderRadius: "9999px",
          padding: "1.125rem 3rem", cursor: "pointer",
          transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s",
          boxShadow: `0 0 40px rgba(204,255,0,0.35)`,
          display: "inline-flex", alignItems: "center", gap: "0.625rem",
        }}
        onMouseOver={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 0 70px rgba(204,255,0,0.55)"; }}
        onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(204,255,0,0.35)"; }}
        >
          Start Tailoring Free
          <span style={{ fontSize: 20 }}>→</span>
        </button>

        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "rgba(235,235,235,0.2)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: "1.25rem" }}>
          No credit card · Resume never stored · Cancel anytime
        </p>
      </div>

      {/* Footer links */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: "4rem", paddingTop: "1.5rem",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        flexWrap: "wrap", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{ width: 28, height: 28, borderRadius: "0.5rem", background: T.lime, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: "#000" }}>R</span>
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: "rgba(235,235,235,0.5)" }}>ResumeAI</span>
        </div>

        <div style={{ display: "flex", gap: "2rem" }}>
          {["Privacy", "Terms", "Contact"].map(link => (
            <a key={link} href="#" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: "rgba(235,235,235,0.3)", textDecoration: "none" }}>
              {link}
            </a>
          ))}
        </div>

        <span className="mono" style={{ color: "rgba(235,235,235,0.2)" }}>
          © {new Date().getFullYear()} RESUMEAI
        </span>
      </div>
    </footer>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export function LandingPage({ onGetStarted }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll-triggered fade-up for bento cards and methodology
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".observe-fade").forEach(el => {
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = "translateY(20px)";
      (el as HTMLElement).style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: T.black, minHeight: "100vh", fontFamily: "'Space Grotesk',sans-serif" }}>
      {/* Floating shell */}
      <div ref={shellRef} style={{
        maxWidth: 1600,
        margin: "0 auto",
        background: T.obsidian,
        borderRadius: "2.5rem",
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
        position: "relative",
        ...GRID_BG,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 50px 100px rgba(0,0,0,0.8)",
      }}>
        {/* Noise overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: NOISE, backgroundRepeat: "repeat",
          backgroundSize: "200px 200px", opacity: 0.04,
        }} />

        {/* Glow spheres */}
        <div style={{
          position: "absolute", top: -200, left: "5%", width: 700, height: 700,
          background: `radial-gradient(circle, rgba(204,255,0,0.1) 0%, transparent 70%)`,
          filter: "blur(120px)", pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{
          position: "absolute", top: "35%", right: -150, width: 500, height: 500,
          background: `radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)`,
          filter: "blur(120px)", pointerEvents: "none", zIndex: 0,
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <Nav onGetStarted={onGetStarted} />
          <Hero onGetStarted={onGetStarted} />
          <TrustBar />
          <BentoFeatures />
          <Methodology />
          <FooterCTA onGetStarted={onGetStarted} />
        </div>
      </div>
    </div>
  );
}
