import { useEffect, useState, useRef } from "react";
import { ProcessingStatus } from "../components/ProcessingStatus";
import type { TailorResponse } from "../types";

interface Props {
  requestId: string;
  onComplete: (result: TailorResponse) => void;
  onError: (message: string) => void;
}

// Rough per-stage time estimates (seconds) shown to the user
const STAGE_ESTIMATES: Record<number, string> = {
  1: "~5s",
  2: "~5s",
  3: "~20s",
  4: "~10s",
};

export function ProcessingPage({ requestId, onComplete, onError }: Props) {
  const [stage, setStage] = useState(1);
  const [stageMessage, setStageMessage] = useState("Starting up...");
  const [elapsed, setElapsed] = useState(0);
  const stageStartRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Refs keep callbacks stable so the SSE effect never captures stale closures
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  useEffect(() => { onCompleteRef.current = onComplete; });
  useEffect(() => { onErrorRef.current = onError; });

  // Elapsed timer — resets on each new stage
  useEffect(() => {
    stageStartRef.current = Date.now();
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - stageStartRef.current) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage]);

  useEffect(() => {
    const es = new EventSource(`/api/tailor/stream/${requestId}`);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "stage") {
          setStage(data.stage);
          if (data.message) setStageMessage(data.message);
        } else if (data.type === "done") {
          es.close();
          const r = data.result;
          if (!r || !r.diff || !r.scores) {
            onErrorRef.current("Unexpected response from server. Please try again.");
            return;
          }
          onCompleteRef.current(r as TailorResponse);
        } else if (data.type === "error") {
          es.close();
          onErrorRef.current(data.message || "Pipeline failed. Please try again.");
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      onErrorRef.current("Lost connection to server. Please re-submit your resume.");
    };

    return () => es.close();
  }, [requestId]);

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
      <div style={{ marginBottom: "3rem", textAlign: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.01em", color: "var(--white-primary)" }}>
          Resume<span style={{ color: "var(--lime)" }}>AI</span>
        </span>
      </div>

      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{
          position: "relative",
          width: 80, height: 80,
          margin: "0 auto 2rem",
          borderRadius: "50%",
          background: "rgba(204,255,0,0.08)",
          border: "2px solid rgba(204,255,0,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg, transparent, var(--lime), transparent)",
            animation: "scan-line 2s ease-in-out infinite",
          }} />
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "2px solid var(--lime)",
            animation: "pulse 2s ease-in-out infinite",
          }} />
        </div>

        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--white-primary)", letterSpacing: "-0.02em" }}>
            Tailoring your resume...
          </h1>
          <p style={{ marginTop: "0.5rem", fontSize: 14, color: "rgba(235,235,235,0.45)", lineHeight: 1.6 }}>
            {stageMessage}
          </p>
          <p style={{ marginTop: "0.375rem", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "rgba(235,235,235,0.25)" }}>
            stage {stage}/4 · {elapsed}s elapsed · est. {STAGE_ESTIMATES[stage] ?? "..."} total
          </p>
        </div>

        <ProcessingStatus currentStage={stage} />
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
        @keyframes scan-line { 0% { top: 0; } 50% { top: calc(100% - 2px); } 100% { top: 0; } }
      `}</style>
    </div>
  );
}
