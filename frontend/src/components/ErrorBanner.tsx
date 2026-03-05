import { AlertCircle, X } from "lucide-react";

interface Props {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        borderRadius: "1rem",
        border: "1px solid rgba(248,113,113,0.3)",
        background: "rgba(248,113,113,0.08)",
        padding: "0.875rem 1.125rem",
        color: "#fca5a5",
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
      <p style={{ flex: 1 }}>{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss error"
          style={{
            flexShrink: 0,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "rgba(252,165,165,0.6)",
            display: "flex",
            padding: "0.125rem",
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
