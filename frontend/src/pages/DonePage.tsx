import { CheckCircle, RotateCcw, LayoutDashboard } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Props {
  onStartOver: () => void;
  user: User | null;
  onDashboard: () => void;
  onSignOut: () => void;
  onLogoClick: () => void;
}

export function DonePage({ onStartOver, onDashboard }: Props) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1.5rem",
      textAlign: "center",
    }}>
      {/* Logo */}
      <div style={{ marginBottom: "3rem" }}>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
          Resume<span style={{ color: "var(--accent)" }}>AI</span>
        </span>
      </div>

      {/* Success ring */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "var(--success-soft)",
        border: "2px solid rgba(48,209,88,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1.75rem",
        boxShadow: "0 0 32px rgba(48,209,88,0.15)",
      }}>
        <CheckCircle size={36} color="var(--success)" />
      </div>

      <div className="label" style={{ color: "var(--success)", marginBottom: "0.75rem" }}>
        Success
      </div>

      <h1 style={{
        fontSize: "2rem",
        fontWeight: 700,
        color: "var(--text-primary)",
        letterSpacing: "-0.02em",
        marginBottom: "0.75rem",
      }}>
        Resume downloaded!
      </h1>
      <p style={{
        maxWidth: 360,
        fontSize: 15,
        color: "var(--text-secondary)",
        lineHeight: 1.6,
        marginBottom: "2.5rem",
      }}>
        Your tailored resume is in your Downloads folder. Good luck with the application!
      </p>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={onStartOver}
          className="accent-btn"
          style={{ gap: "0.45rem" }}
        >
          <RotateCcw size={15} />
          Tailor another resume
        </button>

        <button
          onClick={onDashboard}
          className="ghost-btn"
          style={{ gap: "0.45rem" }}
        >
          <LayoutDashboard size={15} />
          Dashboard
        </button>
      </div>

      <p style={{ marginTop: "2.5rem", fontSize: 12, color: "var(--text-muted)" }}>
        Your session data has been deleted from our servers.
      </p>
    </div>
  );
}
