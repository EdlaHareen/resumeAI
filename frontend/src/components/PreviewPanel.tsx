import { useState, useEffect, useRef } from "react";
import { Loader2, RefreshCw } from "lucide-react";

interface Props {
  fetchPdf: () => Promise<Blob>;
  refreshKey?: string;
}

export function PreviewPanel({ fetchPdf, refreshKey }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always call the latest fetchPdf (captures current bullet/letter state)
  const fetchPdfRef = useRef(fetchPdf);
  useEffect(() => { fetchPdfRef.current = fetchPdf; }, [fetchPdf]);

  const urlRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  async function load() {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const blob = await fetchPdfRef.current();
      if (requestId !== requestIdRef.current) return;
      const url = URL.createObjectURL(blob);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;
      setPdfUrl(url);
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      setError(e instanceof Error ? e.message : "Preview generation failed.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, pdfUrl ? 350 : 0);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    return () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "0.75rem", flexShrink: 0,
      }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          PDF Preview
        </span>
        <button
          onClick={load}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: "0.375rem",
            padding: "0.375rem 0.875rem", borderRadius: 9999,
            border: "1px solid var(--accent-border)",
            background: "var(--accent-soft)",
            color: loading ? "var(--text-tertiary)" : "var(--accent)",
            fontSize: 12, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
            transition: "background 0.15s",
          }}
        >
          {loading
            ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" />
            : <RefreshCw size={12} aria-hidden="true" />}
          {loading ? "Generating…" : "Refresh Preview"}
        </button>
      </div>

      {/* Preview frame */}
      <div style={{
        flex: 1,
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 0,
        position: "relative",
      }}>
        {/* Spinner overlay while refreshing over existing preview */}
        {loading && pdfUrl && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2,
          }}>
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: "var(--accent)" }} aria-hidden="true" />
          </div>
        )}

        {/* Initial loading state */}
        {loading && !pdfUrl && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", color: "var(--text-secondary)" }}>
            <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "var(--accent)" }} aria-hidden="true" />
            <p style={{ fontSize: 13, margin: 0 }}>Generating preview…</p>
          </div>
        )}

        {/* Error state */}
        {error && !pdfUrl && (
          <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-secondary)" }}>
            <p style={{ fontSize: 13, margin: "0 0 0.75rem" }}>{error}</p>
            <button
              onClick={load}
              style={{
                fontSize: 12, color: "var(--accent)", background: "none", border: "none",
                cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
              }}
            >
              Try again
            </button>
          </div>
        )}

        {pdfUrl && (
          <iframe
            src={`${pdfUrl}#navpanes=0&toolbar=0`}
            title="PDF Preview"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        )}
      </div>
    </div>
  );
}
