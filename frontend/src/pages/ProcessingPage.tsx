import { ProcessingStatus } from "../components/ProcessingStatus";

interface Props {
  stage: number;
}

export function ProcessingPage({ stage }: Props) {
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
    }}>
      {/* Logo */}
      <div style={{ marginBottom: "3rem", textAlign: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.01em", color: "var(--white-primary)" }}>
          Resume<span style={{ color: "var(--lime)" }}>AI</span>
        </span>
      </div>

      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Scanning animation */}
        <div style={{
          position: "relative",
          width: 80,
          height: 80,
          margin: "0 auto 2rem",
          borderRadius: "50%",
          background: "rgba(204,255,0,0.08)",
          border: "2px solid rgba(204,255,0,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}>
          {/* Scan line */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, transparent, var(--lime), transparent)",
            animation: "scan-line 2s ease-in-out infinite",
          }} />
          {/* Pulse ring */}
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "2px solid var(--lime)",
            animation: "pulse 2s ease-in-out infinite",
          }} />
        </div>

        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--white-primary)", letterSpacing: "-0.02em" }}>
            Tailoring your resume...
          </h1>
          <p style={{ marginTop: "0.5rem", fontSize: 14, color: "rgba(235,235,235,0.45)", lineHeight: 1.6 }}>
            This takes about 30–60 seconds. Don't close this page.
          </p>
        </div>

        <ProcessingStatus currentStage={stage} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
