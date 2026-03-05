import { useState, useEffect, useRef } from "react";
import { X, ArrowRight, Eye, EyeOff, Zap, ShieldCheck, FileDown } from "lucide-react";
import { supabase } from "../lib/supabase";

interface AuthModalProps {
  onClose: () => void;
  onAuth: () => void;
}

type AuthMode = "signin" | "signup";

// Defined at module level so React never sees it as a new component on re-render
const FIELD: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "0.875rem",
  padding: "0.9rem 1.1rem",
  fontSize: 15,
  color: "var(--white-primary)",
  fontFamily: "'Space Grotesk', sans-serif",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box" as const,
};

function Field({
  id, label, type, value, onChange, placeholder, autoComplete, inputRef, action,
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; autoComplete: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <label htmlFor={id} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(235,235,235,0.45)", fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{ ...FIELD, paddingRight: action ? "3rem" : FIELD.padding as string }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(204,255,0,0.5)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        {action && (
          <div style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)" }}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export function AuthModal({ onClose, onAuth }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => firstInputRef.current?.focus(), 80); }, [mode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "signup" && !name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);

    if (mode === "signup") {
      const { error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });
      if (err) { setError(err.message); setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { onAuth(); } else { setConfirmSent(true); }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) {
        setError(err.message === "Invalid login credentials" ? "Wrong email or password." : err.message);
        setLoading(false);
        return;
      }
      onAuth();
    }
    setLoading(false);
  }

  function switchMode() { setError(null); setConfirmSent(false); setMode((m) => (m === "signup" ? "signin" : "signup")); }

  const overlayStyle: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 50,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "1rem",
    background: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(8px)",
  };

  // ── Email confirm state ───────────────────────────────────────────────────
  if (confirmSent) {
    return (
      <div ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true" style={overlayStyle}>
        <div style={{
          position: "relative",
          width: "100%", maxWidth: 480,
          background: "rgba(12,12,12,0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "2rem",
          padding: "3rem 2.5rem",
          textAlign: "center",
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          <button onClick={onClose} style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "none", border: "none", cursor: "pointer", color: "rgba(235,235,235,0.3)" }}>
            <X size={18} />
          </button>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(204,255,0,0.1)", border: "1px solid rgba(204,255,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: 28 }}>✉</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--white-primary)", marginBottom: "0.75rem" }}>Check your email</h2>
          <p style={{ fontSize: 14, color: "rgba(235,235,235,0.5)", lineHeight: 1.7, marginBottom: "2rem" }}>
            We sent a confirmation link to<br />
            <strong style={{ color: "var(--lime)" }}>{email}</strong>.<br />
            Click it to activate your account, then sign in.
          </p>
          <button onClick={switchMode} className="neon-btn" style={{ padding: "0.875rem 2rem", fontSize: 14 }}>
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  // ── Main modal — split layout ─────────────────────────────────────────────
  return (
    <div ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true" style={overlayStyle}>
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 880,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "rgba(12,12,12,0.97)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "2rem",
        overflow: "hidden",
        fontFamily: "'Space Grotesk', sans-serif",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
      }}>
        {/* ── Left panel — branding ─────────────────────────────────── */}
        <div style={{
          padding: "3rem",
          background: "rgba(204,255,0,0.04)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: 520,
        }}>
          {/* Logo */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.01em", color: "var(--white-primary)", marginBottom: "2.5rem" }}>
              Resume<span style={{ color: "var(--lime)" }}>AI</span>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <div className="mono" style={{ color: "var(--lime)", marginBottom: "0.75rem" }}>
                {mode === "signup" ? "get started free" : "welcome back"}
              </div>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em", color: "var(--white-primary)" }}>
                {mode === "signup"
                  ? <>Tailor your resume.<br /><span style={{ color: "var(--lime)" }}>Land more interviews.</span></>
                  : <>Good to see<br /><span style={{ color: "var(--lime)" }}>you again.</span></>
                }
              </h2>
            </div>

            {/* Benefits */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { icon: <Zap size={14} />, text: "Tailored bullets in under 60 seconds" },
                { icon: <ShieldCheck size={14} />, text: "Zero hallucinations — we verify every change" },
                { icon: <FileDown size={14} />, text: "Download as PDF or DOCX instantly" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(204,255,0,0.1)", border: "1px solid rgba(204,255,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--lime)" }}>
                    {icon}
                  </div>
                  <span style={{ fontSize: 13, color: "rgba(235,235,235,0.55)", lineHeight: 1.4 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom trust line */}
          <p style={{ fontSize: 11, color: "rgba(235,235,235,0.2)", marginTop: "2rem", lineHeight: 1.6 }}>
            Your resume data is processed in memory<br />and never stored on our servers.
          </p>
        </div>

        {/* ── Right panel — form ────────────────────────────────────── */}
        <div style={{ padding: "3rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "none", border: "none", cursor: "pointer", color: "rgba(235,235,235,0.3)", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--white-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(235,235,235,0.3)")}
          >
            <X size={18} />
          </button>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--white-primary)", marginBottom: "0.375rem" }}>
              {mode === "signup" ? "Create your free account" : "Sign in to ResumeAI"}
            </h3>
            <p style={{ fontSize: 13, color: "rgba(235,235,235,0.4)" }}>
              {mode === "signup" ? "No credit card required." : "Resume tailoring awaits."}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            {mode === "signup" && (
              <Field
                id="auth-name" label="Full Name" type="text"
                value={name} onChange={setName}
                placeholder="Jane Smith" autoComplete="name"
                inputRef={mode === "signup" ? firstInputRef : undefined}
              />
            )}

            <Field
              id="auth-email" label="Email" type="email"
              value={email} onChange={setEmail}
              placeholder="jane@university.edu" autoComplete="email"
              inputRef={mode === "signin" ? firstInputRef : undefined}
            />

            <Field
              id="auth-password" label="Password" type={showPassword ? "text" : "password"}
              value={password} onChange={setPassword}
              placeholder="Min. 8 characters"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              action={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(235,235,235,0.3)", display: "flex", padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {error && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#fca5a5", fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="neon-btn"
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "0.25rem",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  {mode === "signup" ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>
                  {mode === "signup" ? "Create free account" : "Sign in"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <div style={{ marginTop: "1.75rem", paddingTop: "1.75rem", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "rgba(235,235,235,0.4)" }}>
              {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
              <button
                type="button"
                onClick={switchMode}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--lime)", fontWeight: 700, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {mode === "signup" ? "Sign in" : "Sign up free"}
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
