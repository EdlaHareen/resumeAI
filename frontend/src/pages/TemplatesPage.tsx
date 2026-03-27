import { useMemo, useState } from "react";
import { CheckCircle2, Crown, LayoutTemplate } from "lucide-react";
import type { TemplateId, Tier, UpgradeReason } from "../types";
import { TEMPLATES, TemplatePreviewModal, TemplateThumbnail } from "../components/TemplateMockup";

interface Props {
  templateId: TemplateId;
  tier: Tier;
  onTemplateChange: (template: TemplateId) => void;
  onUpgrade: (reason: UpgradeReason) => void;
  onboardingGuide?: boolean;
  templateConfirmed?: boolean;
  onTemplateConfirmed?: () => void;
  onProceed?: () => void;
}

export function TemplatesPage({
  templateId,
  tier,
  onTemplateChange,
  onUpgrade,
  onboardingGuide = false,
  templateConfirmed = false,
  onTemplateConfirmed,
  onProceed,
}: Props) {
  const [previewId, setPreviewId] = useState<TemplateId | null>(null);

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((template) => template.id === templateId) ?? TEMPLATES[0],
    [templateId],
  );

  const previewTemplate = previewId ? TEMPLATES.find((template) => template.id === previewId) ?? null : null;

  function handleTemplateSelection(template: TemplateId) {
    onTemplateChange(template);
    onTemplateConfirmed?.();
  }

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "1.5rem",
        background:
          "radial-gradient(circle at top center, color-mix(in srgb, var(--accent) 12%, transparent) 0, transparent 30%), var(--bg)",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <section
          className="bento-card"
          style={{
            padding: "1.5rem",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, 360px)",
            gap: "1.25rem",
            alignItems: "center",
          }}
        >
          <div>
            <div className="label" style={{ marginBottom: "0.45rem" }}>
              Templates
            </div>
            <h1 style={{ fontSize: "2.1rem", color: "var(--text-primary)", letterSpacing: "-0.05em", marginBottom: "0.65rem" }}>
              Choose the layout your exports use by default
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 620 }}>
              The template you select here becomes the default for future PDF exports. Pro templates stay fully
              ATS-friendly while giving you more visual range for different roles.
            </p>
          </div>

          <div
            className="bento-card"
            style={{
              padding: "1rem",
              background: "var(--elevated)",
            }}
          >
            <div className="label" style={{ marginBottom: "0.35rem" }}>
              Active Template
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--accent-soft)",
                  border: "1px solid var(--accent-border)",
                  color: "var(--accent)",
                }}
              >
                <LayoutTemplate size={22} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{selectedTemplate.label}</span>
                  {selectedTemplate.pro && <span className="pill pill-pro">Pro</span>}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{selectedTemplate.desc}</p>
              </div>
            </div>
          </div>
        </section>

        {onboardingGuide && (
          <section
            className="bento-card"
            style={{
              padding: "1rem 1.1rem",
              borderColor: "var(--accent-border)",
              background: "color-mix(in srgb, var(--accent-soft) 42%, var(--surface))",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ maxWidth: 760 }}>
                <div className="label" style={{ color: "var(--accent)", marginBottom: "0.4rem" }}>
                  Step 2 of 2
                </div>
                <h2 style={{ fontSize: 18, color: "var(--text-primary)", marginBottom: "0.45rem" }}>
                  Pick the template you want to tailor with
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  Choose the layout you want as your starting template for this workflow. After you confirm one, proceed to the tailoring screen.
                </p>
              </div>

              <button type="button" className="accent-btn" disabled={!templateConfirmed} onClick={onProceed}>
                Proceed
              </button>
            </div>
          </section>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
          }}
        >
          {TEMPLATES.map((template) => {
            const isSelected = template.id === templateId;
            const isLocked = template.pro && tier !== "pro";

            return (
              <div
                key={template.id}
                className="bento-card"
                style={{
                  padding: "1rem",
                  background: isSelected ? "color-mix(in srgb, var(--accent-soft) 55%, var(--surface))" : "var(--surface)",
                  borderColor: isSelected ? "var(--accent-border)" : "var(--border)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPreviewId(template.id)}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      borderRadius: 16,
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                      background: "#ffffff",
                      marginBottom: "1rem",
                    }}
                  >
                    <TemplateThumbnail id={template.id} />
                    {isSelected && (
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "var(--accent)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "var(--shadow-accent)",
                        }}
                      >
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                    {isLocked && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(15, 23, 42, 0.42)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backdropFilter: "blur(1px)",
                        }}
                      >
                        <span className="pill pill-pro">
                          <Crown size={12} />
                          Pro
                        </span>
                      </div>
                    )}
                  </div>
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.45rem" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{template.label}</h3>
                  {template.pro && <span className="pill pill-pro">Pro</span>}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, minHeight: 42 }}>
                  {template.desc}
                </p>

                <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap", marginTop: "1rem" }}>
                  <button type="button" className="ghost-btn" onClick={() => setPreviewId(template.id)}>
                    Preview
                  </button>
                  <button
                    type="button"
                    className={isSelected ? "ghost-btn" : "accent-btn"}
                    onClick={() => {
                      if (isLocked) {
                        onUpgrade("docx");
                        return;
                      }
                      handleTemplateSelection(template.id);
                    }}
                  >
                    {isLocked
                      ? "Unlock Pro"
                      : onboardingGuide && isSelected && !templateConfirmed
                        ? "Confirm Template"
                        : isSelected
                          ? "Selected"
                          : "Use Template"}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          tier={tier}
          onSelect={handleTemplateSelection}
          onUpgrade={() => onUpgrade("docx")}
          onClose={() => setPreviewId(null)}
        />
      )}
    </div>
  );
}
