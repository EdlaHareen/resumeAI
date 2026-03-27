import { useMemo, useState } from "react";
import { ArrowRight, FileText, LayoutTemplate, Link2, RefreshCw } from "lucide-react";
import type { BaseResumeInfo } from "../api/client";
import { ErrorBanner } from "../components/ErrorBanner";
import { TEMPLATES } from "../components/TemplateMockup";
import type { TemplateId } from "../types";

interface Props {
  baseResume: BaseResumeInfo | null;
  templateId: TemplateId;
  loading: boolean;
  error: string | null;
  onboarding?: boolean;
  onClearError: () => void;
  onChangeResume: () => void;
  onChangeTemplate: () => void;
  onSubmit: (jobInput: string) => void;
}

const MIN_JD_WORDS = 50;

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function TailorSetupPage({
  baseResume,
  templateId,
  loading,
  error,
  onboarding = false,
  onClearError,
  onChangeResume,
  onChangeTemplate,
  onSubmit,
}: Props) {
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((template) => template.id === templateId) ?? TEMPLATES[0],
    [templateId],
  );

  const wordCount = countWords(jobDescription);
  const hasLongDescription = wordCount >= MIN_JD_WORDS;
  const hasUrl = /^https?:\/\//i.test(jobUrl.trim());
  const canSubmit = Boolean(baseResume?.found) && (hasLongDescription || hasUrl) && !loading;

  function handleSubmit() {
    if (!canSubmit) return;
    const payload = [
      hasUrl ? `Job post URL: ${jobUrl.trim()}` : "",
      jobDescription.trim(),
    ].filter(Boolean).join("\n\n");
    onSubmit(payload);
  }

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "1.5rem",
        background:
          "radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 10%, transparent) 0, transparent 30%), var(--bg)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <section className="bento-card" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ maxWidth: 720 }}>
            <div className="label" style={{ marginBottom: "0.45rem" }}>
              Tailor Resume
            </div>
            <h1 style={{ fontSize: "2.1rem", color: "var(--text-primary)", letterSpacing: "-0.05em", marginBottom: "0.55rem" }}>
              Review your setup, paste the role, and start tailoring
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              Your default resume and selected template are already connected here. Change either one if needed, then
              paste the job description or job post URL and start the tailoring flow.
            </p>
          </div>

          {onboarding && (
            <div
              style={{
                minWidth: 250,
                padding: "1rem",
                borderRadius: 18,
                border: "1px solid var(--accent-border)",
                background: "color-mix(in srgb, var(--accent-soft) 45%, var(--surface))",
              }}
            >
              <div className="label" style={{ color: "var(--accent)", marginBottom: "0.35rem" }}>
                Step 3 of 3
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.35rem" }}>
                Your setup is ready
              </p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Paste the role you want to target and launch the tailoring review.
              </p>
            </div>
          )}
        </section>

        {error && (
          <div style={{ marginBottom: "0.25rem" }}>
            <ErrorBanner message={error} onDismiss={onClearError} />
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          <div className="bento-card" style={{ padding: "1.25rem" }}>
            <div className="label" style={{ marginBottom: "0.35rem" }}>
              Selected Resume
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.9rem" }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: "var(--accent-soft)",
                  border: "1px solid var(--accent-border)",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FileText size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.3rem", overflowWrap: "anywhere" }}>
                  {baseResume?.found ? baseResume.filename : "No default resume selected"}
                </p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {baseResume?.found
                    ? "This default base resume will be used for the tailoring run."
                    : "Select a default resume first so the tailoring flow knows which file to use."}
                </p>
              </div>
            </div>
            <button type="button" className="ghost-btn" onClick={onChangeResume}>
              {baseResume?.found ? "Change Resume" : "Choose Resume"}
            </button>
          </div>

          <div className="bento-card" style={{ padding: "1.25rem" }}>
            <div className="label" style={{ marginBottom: "0.35rem" }}>
              Selected Template
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.9rem" }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: "var(--accent-soft)",
                  border: "1px solid var(--accent-border)",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LayoutTemplate size={20} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.3rem" }}>
                  {selectedTemplate.label}
                </p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {selectedTemplate.desc}
                </p>
              </div>
            </div>
            <button type="button" className="ghost-btn" onClick={onChangeTemplate}>
              Change Template
            </button>
          </div>
        </section>

        <section className="bento-card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 340px)", gap: "1rem", alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem", marginBottom: "0.9rem" }}>
                <label htmlFor="tailor-job-description" className="label">
                  Job Description
                </label>
                <span style={{ fontSize: 11, color: hasLongDescription ? "var(--accent)" : "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {wordCount} / {MIN_JD_WORDS} words recommended
                </span>
              </div>
              <textarea
                id="tailor-job-description"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the full job description here for the strongest tailoring result."
                rows={12}
                style={{
                  width: "100%",
                  borderRadius: 18,
                  border: `1px solid ${hasLongDescription || wordCount === 0 ? "var(--border)" : "rgba(255, 149, 0, 0.4)"}`,
                  background: "var(--elevated)",
                  color: "var(--text-primary)",
                  padding: "1rem",
                  fontSize: 14,
                  lineHeight: 1.65,
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "'Inter', sans-serif",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div
                style={{
                  padding: "1rem",
                  borderRadius: 18,
                  border: "1px solid var(--border)",
                  background: "var(--elevated)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.55rem" }}>
                  <Link2 size={15} color="var(--accent)" />
                  <span className="label">Job Post URL</span>
                </div>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(event) => setJobUrl(event.target.value)}
                  placeholder="https://company.com/jobs/role"
                  style={{
                    width: "100%",
                    borderRadius: 14,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text-primary)",
                    padding: "0.85rem 0.95rem",
                    fontSize: 14,
                    outline: "none",
                    fontFamily: "'Inter', sans-serif",
                    boxSizing: "border-box",
                    marginBottom: "0.6rem",
                  }}
                />
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  You can paste a job post link here too. For best results, include the full job description above whenever possible.
                </p>
              </div>

              <div
                style={{
                  padding: "1rem",
                  borderRadius: 18,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                }}
              >
                <div className="label" style={{ marginBottom: "0.45rem" }}>
                  What Happens Next
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "0.85rem" }}>
                  We’ll start tailoring with your selected resume and template, then open the review workspace so you can accept or edit every change.
                </p>
                <button type="button" className="accent-btn" onClick={handleSubmit} disabled={!canSubmit} style={{ width: "100%", justifyContent: "center" }}>
                  {loading ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <ArrowRight size={16} />}
                  {loading ? "Starting Tailor..." : "Tailor My Resume"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
