import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  FileText,
  LayoutTemplate,
  Mail,
  Plus,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { loadHistory } from "../lib/history";
import type { AppStep, HistoryEntry, TailorResponse, Tier, UpgradeReason } from "../types";

interface Props {
  user: User;
  tier: Tier;
  onNewResume: () => void;
  onOpenSection: (step: Extract<AppStep, "resumes" | "templates" | "cover-letters" | "ai-review" | "settings">) => void;
  onReopen: (result: TailorResponse) => void;
  onUpgrade: (reason: UpgradeReason) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getTopKeywords(history: HistoryEntry[]) {
  const counts = new Map<string, number>();
  for (const entry of history) {
    const keywords = entry.response?.jd_analysis.ats_keywords ?? [];
    for (const keyword of keywords) {
      const normalized = keyword.trim();
      if (!normalized) continue;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([keyword]) => keyword);
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div
      className="bento-card"
      style={{
        padding: "1.25rem",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--surface) 88%, white 12%), var(--surface))",
      }}
    >
      <div className="label" style={{ marginBottom: "0.75rem" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: "1.9rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.04em",
          marginBottom: "0.35rem",
        }}
      >
        {value}
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{helper}</p>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  actionLabel,
  onClick,
  locked = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bento-card"
      style={{
        textAlign: "left",
        padding: "1.25rem",
        cursor: "pointer",
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--surface) 82%, white 18%), var(--surface))",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--accent-soft)",
          border: "1px solid var(--accent-border)",
          color: "var(--accent)",
          marginBottom: "1rem",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          marginBottom: "0.4rem",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{title}</h3>
        {locked && <span className="pill pill-pro">Pro</span>}
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, minHeight: 42 }}>
        {description}
      </p>
      <div
        style={{
          marginTop: "1rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          color: "var(--accent)",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {actionLabel}
        <ArrowUpRight size={14} />
      </div>
    </button>
  );
}

function RecentSessionCard({
  entry,
  onReopen,
}: {
  entry: HistoryEntry;
  onReopen: (result: TailorResponse) => void;
}) {
  if (!entry.response) return null;

  const title = entry.job_role || entry.response.resume_summary.title || "Tailored resume";

  return (
    <div
      className="bento-card"
      style={{
        padding: "1rem 1.1rem",
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        alignItems: "center",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginBottom: "0.3rem",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{title}</span>
          <span className="pill pill-ghost">{entry.match_percent ?? entry.response.scores.match_percent}% match</span>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
          }}
        >
          {entry.original_filename ?? "Untitled resume"} · {formatDate(entry.created_at)}
        </p>
      </div>
      <button type="button" className="ghost-btn" onClick={() => onReopen(entry.response!)}>
        Open Review
      </button>
    </div>
  );
}

export function DashboardPage({
  user,
  tier,
  onNewResume,
  onOpenSection,
  onReopen,
  onUpgrade,
}: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    loadHistory()
      .then((rows) => {
        if (mounted) setHistory(rows);
      })
      .catch((err: Error) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const firstName = ((user.user_metadata?.full_name as string | undefined) || user.email || "there").split(" ")[0];

  const summary = useMemo(() => {
    const matchValues = history.map((entry) => entry.match_percent ?? entry.response?.scores.match_percent ?? 0);
    const atsValues = history.map((entry) => entry.ats_score ?? entry.response?.scores.ats_score ?? 0);
    return {
      total: history.length,
      avgMatch: average(matchValues),
      avgAts: average(atsValues),
      topKeywords: getTopKeywords(history),
      recent: history.slice(0, 3),
    };
  }, [history]);

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "1.5rem",
        background:
          "radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 18%, transparent) 0, transparent 38%), var(--bg)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <section
          className="bento-card"
          style={{
            padding: "1.6rem",
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--accent) 10%, var(--surface)) 0%, var(--surface) 55%, color-mix(in srgb, var(--surface) 70%, white 30%) 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 620 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
                <span className="pill pill-accent">Workspace</span>
                <span className={`pill ${tier === "pro" ? "pill-pro" : "pill-neutral"}`}>{tier.toUpperCase()}</span>
              </div>
              <h1
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.2rem)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.06em",
                  color: "var(--text-primary)",
                  marginBottom: "0.8rem",
                }}
              >
                Welcome back, {firstName}.
              </h1>
              <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 560 }}>
                This is your resume command center. Tailor new roles, reopen past sessions, switch templates,
                and jump straight into the part of the workflow you need from the left menu.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button type="button" className="accent-btn" onClick={onNewResume}>
                <Plus size={16} />
                Tailor New Resume
              </button>
              <button type="button" className="ghost-btn" onClick={() => onOpenSection("resumes")}>
                <FileText size={16} />
                Open Library
              </button>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          <StatCard
            label="Tailored Sessions"
            value={loading ? "..." : String(summary.total)}
            helper={summary.total > 0 ? "Reusable from the Resume Library" : "Start your first tailored resume"}
          />
          <StatCard
            label="Average Match"
            value={loading ? "..." : `${summary.avgMatch}%`}
            helper="Based on the sessions saved to your account"
          />
          <StatCard
            label="Average ATS"
            value={loading ? "..." : `${summary.avgAts}%`}
            helper="A quick read on structure and keyword alignment"
          />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.95fr)",
            gap: "1rem",
          }}
        >
          <div className="bento-card" style={{ padding: "1.35rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <div className="label" style={{ marginBottom: "0.4rem" }}>
                  Recent Sessions
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Continue where you left off</h2>
              </div>
              <button type="button" className="ghost-btn" onClick={() => onOpenSection("resumes")}>
                View All
              </button>
            </div>

            {error && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.85rem 1rem",
                  borderRadius: 14,
                  background: "var(--error-soft)",
                  border: "1px solid rgba(255, 69, 58, 0.2)",
                  color: "var(--error)",
                  fontSize: 13,
                }}
              >
                Failed to load your history: {error}
              </div>
            )}

            {loading ? (
              <div style={{ display: "grid", gap: "0.85rem" }}>
                {[0, 1, 2].map((item) => (
                  <div key={item} className="skeleton" style={{ height: 92 }} />
                ))}
              </div>
            ) : summary.recent.length > 0 ? (
              <div style={{ display: "grid", gap: "0.8rem" }}>
                {summary.recent.map((entry) => (
                  <RecentSessionCard key={entry.id} entry={entry} onReopen={onReopen} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "2rem 1.25rem",
                  borderRadius: 18,
                  border: "1px dashed var(--border)",
                  background: "var(--elevated)",
                  textAlign: "center",
                }}
              >
                <FileText size={34} color="var(--text-tertiary)" style={{ margin: "0 auto 0.8rem" }} />
                <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.35rem" }}>
                  No tailored sessions yet
                </p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: "1rem" }}>
                  Upload a resume and job description to start building your library.
                </p>
                <button type="button" className="accent-btn" onClick={onNewResume}>
                  <Plus size={16} />
                  Start Tailoring
                </button>
              </div>
            )}
          </div>

          <div className="bento-card" style={{ padding: "1.35rem" }}>
            <div className="label" style={{ marginBottom: "0.4rem" }}>
              Repeated Signals
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.9rem" }}>
              Common keywords in your saved work
            </h2>

            {summary.topKeywords.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", marginBottom: "1.2rem" }}>
                {summary.topKeywords.map((keyword) => (
                  <span key={keyword} className="pill pill-accent" style={{ fontSize: 12 }}>
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: "1.2rem" }}>
                Your dashboard will start surfacing recurring ATS terms after a few tailored sessions.
              </p>
            )}

            <div
              style={{
                borderRadius: 18,
                padding: "1rem",
                background: "var(--elevated)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.55rem",
                  marginBottom: "0.55rem",
                  color: "var(--accent)",
                }}
              >
                <TrendingUp size={16} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Best next move</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {summary.total === 0
                  ? "Build your first tailored resume so the rest of the workspace can give you useful history, analytics, and cover-letter context."
                  : "Use the Resume Library to reopen your strongest session, then export polished versions or generate a matching cover letter from the same context."}
              </p>
            </div>
          </div>
        </section>

        <section>
          <div style={{ marginBottom: "0.9rem" }}>
            <div className="label" style={{ marginBottom: "0.35rem" }}>
              Left Menu Shortcuts
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Each workspace area now has its own job</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            <ActionCard
              icon={<FileText size={20} />}
              title="Resume Library"
              description="Reopen saved sessions, manage your base resume, and export PDF or DOCX versions."
              actionLabel="Open resumes"
              onClick={() => onOpenSection("resumes")}
            />
            <ActionCard
              icon={<LayoutTemplate size={20} />}
              title="Templates"
              description="Pick the default resume style used for the next export and preview each layout before selecting."
              actionLabel="Choose template"
              onClick={() => onOpenSection("templates")}
            />
            <ActionCard
              icon={<Mail size={20} />}
              title="Cover Letters"
              description="Start a cover letter from your current or past tailored sessions instead of rebuilding context."
              actionLabel={tier === "pro" ? "Open cover letters" : "Unlock cover letters"}
              onClick={() => {
                if (tier === "pro") {
                  onOpenSection("cover-letters");
                  return;
                }
                onUpgrade("cover_letter");
              }}
              locked={tier !== "pro"}
            />
            <ActionCard
              icon={<Sparkles size={20} />}
              title="AI Review"
              description="Track match trends, inspect recent analyses, and jump back into your latest tailored review."
              actionLabel="Open insights"
              onClick={() => onOpenSection("ai-review")}
            />
            <ActionCard
              icon={<Settings size={20} />}
              title="Settings"
              description="Manage your plan, appearance, and account preferences without leaving the workspace."
              actionLabel="Open settings"
              onClick={() => onOpenSection("settings")}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
