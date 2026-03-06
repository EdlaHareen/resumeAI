import { CheckCircle, RotateCcw } from "lucide-react";
import { UserNav } from "../components/UserNav";
import type { User } from "@supabase/supabase-js";

interface Props {
  onStartOver: () => void;
  user: User | null;
  onDashboard: () => void;
  onSignOut: () => void;
  onLogoClick: () => void;
}

export function DonePage({ onStartOver, user, onDashboard, onSignOut, onLogoClick }: Props) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--black)",
      fontFamily: "'Space Grotesk', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1.5rem",
      textAlign: "center",
    }}>
      {/* Nav */}
      {user && (
        <div style={{ position: "fixed", top: 0, right: 0, padding: "1rem 2rem", zIndex: 20 }}>
          <UserNav user={user} onDashboard={onDashboard} onSignOut={onSignOut} onNewResume={onStartOver} />
        </div>
      )}

      {/* Logo */}
      <div style={{ marginBottom: "3rem" }}>
        <button
          type="button"
          onClick={onLogoClick}
          style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.01em", color: "var(--white-primary)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
          aria-label="Go to dashboard"
        >
          Resume<span style={{ color: "var(--lime)" }}>AI</span>
        </button>
      </div>

      {/* Icon */}
      <div style={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        background: "rgba(204,255,0,0.1)",
        border: "2px solid rgba(204,255,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1.5rem",
        animation: "glow-pulse 3s ease-in-out infinite",
      }}>
        <CheckCircle size={32} color="var(--lime)" aria-hidden="true" />
      </div>

      <div className="mono" style={{ color: "var(--lime)", marginBottom: "0.75rem" }}>success</div>

      <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--white-primary)", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
        Resume downloaded!
      </h1>
      <p style={{ maxWidth: 380, fontSize: 15, color: "rgba(235,235,235,0.5)", lineHeight: 1.6, marginBottom: "2.5rem" }}>
        Your tailored resume is in your Downloads folder. Good luck with the application!
      </p>

      <button
        onClick={onStartOver}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.875rem 1.75rem",
          borderRadius: 9999,
          border: "1px solid rgba(204,255,0,0.3)",
          background: "rgba(204,255,0,0.06)",
          color: "var(--lime)",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "'Space Grotesk', sans-serif",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(204,255,0,0.12)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(204,255,0,0.06)")}
      >
        <RotateCcw size={15} aria-hidden="true" />
        Tailor another resume
      </button>

      <p style={{ marginTop: "2rem", fontSize: 12, color: "rgba(235,235,235,0.2)" }}>
        Your session data has been deleted from our servers.
      </p>
    </div>
  );
}
