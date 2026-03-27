import { useState, useEffect } from "react";
import { BugReportModal, FeatureRequestModal, GeneralFeedbackModal } from "./FeedbackModals";

type ModalType = "bug" | "feature" | "general" | null;

const MENU_ITEMS = [
  { id: "bug" as const,     label: "Report Bug",      emoji: "🐛", color: "var(--error)" },
  { id: "feature" as const, label: "Request Feature",  emoji: "💡", color: "var(--warning)" },
  { id: "general" as const, label: "Give Feedback",    emoji: "💬", color: "var(--accent)" },
];

export function FeedbackFAB() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Prevent hydration mismatch
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  function openModal(type: ModalType) {
    setActiveModal(type);
    setMenuOpen(false);
  }

  function closeModal() {
    setActiveModal(null);
  }

  return (
    <>
      {/* Backdrop */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 999 }}
        />
      )}

      {/* FAB container */}
      <div style={{ position: "fixed", bottom: "1.75rem", right: "1.75rem", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.6rem" }}>
        {/* Menu items — visible when open */}
        {menuOpen && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", marginBottom: "0.25rem" }}>
            {MENU_ITEMS.map((item, i) => (
              <button
                key={item.id}
                onClick={() => openModal(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  background: "var(--elevated)",
                  border: `1px solid var(--border)`,
                  borderRadius: 9999,
                  padding: "0.55rem 1rem 0.55rem 0.75rem",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  boxShadow: "var(--shadow-md)",
                  animation: `fabItemFadeUp 0.2s ease-out ${i * 0.05}s both`,
                  transition: "border-color 0.2s, transform 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.borderColor = "var(--border-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: `${item.color}18`, border: `1px solid ${item.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Main FAB button */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Feedback"
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: "var(--accent)",
            boxShadow: "0 4px 20px rgba(10,132,255,0.35), 0 4px 12px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s",
            transform: menuOpen ? "rotate(45deg) scale(1.04)" : "rotate(0deg) scale(1)",
            position: "relative",
          }}
          onMouseEnter={(e) => { if (!menuOpen) e.currentTarget.style.transform = "scale(1.08)"; }}
          onMouseLeave={(e) => { if (!menuOpen) e.currentTarget.style.transform = "scale(1)"; }}
        >
          {menuOpen ? "✕" : "✦"}

          {/* Pulse online dot */}
          {!menuOpen && (
            <span style={{
              position: "absolute",
              top: 4, right: 4,
              width: 10, height: 10, borderRadius: "50%",
              background: "var(--success)",
              border: "2px solid var(--surface)",
              animation: "pulse-dot 2s ease-in-out infinite",
            }} />
          )}
        </button>
      </div>

      {/* Modals */}
      <BugReportModal isOpen={activeModal === "bug"} onClose={closeModal} />
      <FeatureRequestModal isOpen={activeModal === "feature"} onClose={closeModal} />
      <GeneralFeedbackModal isOpen={activeModal === "general"} onClose={closeModal} />

      <style>{`
        @keyframes fabItemFadeUp {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
