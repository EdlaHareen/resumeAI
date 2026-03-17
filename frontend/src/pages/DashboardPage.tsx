import { useEffect, useState, useMemo } from "react";
import { FileText, Plus, TrendingUp, Clock, ExternalLink, Search, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import { UserNav } from "../components/UserNav";
import { loadHistory } from "../lib/history";
import type { HistoryEntry, TailorResponse } from "../types";
import type { User } from "@supabase/supabase-js";

interface Props {
  user: User;
  onNewResume: () => void;
  onSignOut: () => void;
  onLogoClick: () => void;
  onBack: () => void;
  onReopen: (result: TailorResponse) => void;
}

function ScorePill({ value, color }: { value: number; color: string }) {
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 9999, padding: "0.15rem 0.5rem" }}>
      {value}%
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const DATE_GROUPS = ["This Month", "Last Month", "Older"] as const;
type DateGroup = typeof DATE_GROUPS[number];

function getDateGroup(iso: string): DateGroup {
  const now = new Date();
  const date = new Date(iso);
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) return "This Month";
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  if (date.getFullYear() === lastMonth.getFullYear() && date.getMonth() === lastMonth.getMonth()) return "Last Month";
  return "Older";
}

const PAGE_SIZE = 5;

function HistoryCard({ entry, onReopen }: { entry: HistoryEntry; onReopen: (r: TailorResponse) => void }) {
  return (
    <div className="bento-card" style={{ padding: "1.25rem 1.5rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--white-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {entry.original_filename ?? "Resume"}
            </span>
            {entry.job_role && (
              <span style={{ fontSize: 11, padding: "0.15rem 0.6rem", borderRadius: 9999, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(235,235,235,0.4)", whiteSpace: "nowrap" }}>
                {entry.job_role}
              </span>
            )}
          </div>
          {entry.jd_snippet && (
            <p style={{ fontSize: 12, color: "rgba(235,235,235,0.35)", lineHeight: 1.5, marginBottom: "0.75rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
              {entry.jd_snippet}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            {entry.match_percent != null && <ScorePill value={entry.match_percent} color="var(--lime)" />}
            {entry.ats_score != null && <ScorePill value={entry.ats_score} color="#10b981" />}
            {entry.strength_score != null && <ScorePill value={entry.strength_score} color="#f59e0b" />}
            <span style={{ fontSize: 12, color: "rgba(235,235,235,0.25)" }}>
              {entry.changed_bullets}/{entry.total_bullets} bullets changed
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
          <span style={{ fontSize: 11, color: "rgba(235,235,235,0.3)", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>
            {formatDate(entry.created_at)}
          </span>
          {entry.response && (
            <button
              onClick={() => onReopen(entry.response!)}
              style={{
                display: "flex", alignItems: "center", gap: "0.3rem",
                padding: "0.3rem 0.75rem",
                borderRadius: 9999,
                border: "1px solid rgba(204,255,0,0.25)",
                background: "rgba(204,255,0,0.06)",
                color: "var(--lime)",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              <ExternalLink size={11} />
              Re-open
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage({ user, onNewResume, onSignOut, onLogoClick, onBack, onReopen }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openGroups, setOpenGroups] = useState<Set<DateGroup>>(new Set());

  const name: string = (user.user_metadata?.full_name as string | undefined) || "there";
  const firstName = name.split(" ")[0];

  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory()
      .then(setHistory)
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  const filtered = useMemo(() => {
    if (!isSearching) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(e =>
      (e.original_filename ?? "").toLowerCase().includes(q) ||
      (e.job_role ?? "").toLowerCase().includes(q)
    );
  }, [history, searchQuery, isSearching]);

  // Reset to page 1 whenever search changes
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const grouped = useMemo(() => {
    const map: Record<DateGroup, HistoryEntry[]> = { "This Month": [], "Last Month": [], "Older": [] };
    for (const entry of history) map[getDateGroup(entry.created_at)].push(entry);
    return map;
  }, [history]);

  function toggleGroup(group: DateGroup) {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(group) ? next.delete(group) : next.add(group);
      return next;
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={onLogoClick}
          style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", color: "var(--white-primary)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
          aria-label="Go to dashboard"
        >
          Resume<span style={{ color: "var(--lime)" }}>AI</span>
        </button>
        <UserNav user={user} onDashboard={() => {}} onSignOut={onSignOut} onNewResume={onNewResume} />
      </nav>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            marginBottom: "1.5rem",
            background: "none", border: "none", cursor: "pointer", padding: 0,
            color: "rgba(235,235,235,0.4)", fontSize: 13,
            fontFamily: "'Space Grotesk', sans-serif",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--lime)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(235,235,235,0.4)"; }}
        >
          <ArrowLeft size={14} />
          Back to Home
        </button>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="mono" style={{ color: "var(--lime)", marginBottom: "0.5rem" }}>dashboard</div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--white-primary)" }}>
              Welcome back, {firstName} 👋
            </h1>
            <p style={{ marginTop: "0.4rem", fontSize: 14, color: "rgba(235,235,235,0.45)" }}>
              {history.length === 0 ? "No tailored resumes yet. Start your first one!" : `${history.length} resume${history.length !== 1 ? "s" : ""} tailored so far.`}
            </p>
          </div>
          <button
            onClick={onNewResume}
            className="neon-btn"
            style={{ padding: "0.75rem 1.5rem", fontSize: 14, display: "flex", alignItems: "center", gap: "0.5rem", animation: "none" }}
          >
            <Plus size={16} />
            Tailor New Resume
          </button>
        </div>

        {/* Stats row */}
        {history.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Total Tailored", value: history.length, suffix: "", icon: <FileText size={16} /> },
              { label: "Avg Job Match", value: Math.round(history.reduce((s, h) => s + (h.match_percent ?? 0), 0) / history.length), suffix: "%", icon: <TrendingUp size={16} /> },
              { label: "Latest", value: formatDate(history[0].created_at), suffix: "", icon: <Clock size={16} /> },
            ].map(({ label, value, suffix, icon }) => (
              <div key={label} className="bento-card" style={{ padding: "1.25rem 1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", color: "rgba(235,235,235,0.4)" }}>
                  {icon}
                  <span className="mono">{label}</span>
                </div>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--lime)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {value}{suffix}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Search bar */}
        {history.length > 0 && (
          <div style={{ position: "relative", marginBottom: "1.5rem" }}>
            <Search size={15} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "rgba(235,235,235,0.3)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search by filename or job role..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "var(--obsidian)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "0.65rem 1rem 0.65rem 2.5rem",
                fontSize: 14,
                color: "var(--white-primary)",
                fontFamily: "'Space Grotesk', sans-serif",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(204,255,0,0.35)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
            />
          </div>
        )}

        {/* History list */}
        {loadError && (
          <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 13 }}>
            Failed to load history: {loadError}
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "rgba(235,235,235,0.3)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(204,255,0,0.3)", borderTopColor: "var(--lime)", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div className="bento-card" style={{ padding: "4rem", textAlign: "center" }}>
            <FileText size={40} color="rgba(235,235,235,0.15)" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--white-primary)", marginBottom: "0.5rem" }}>No resumes tailored yet</h3>
            <p style={{ fontSize: 14, color: "rgba(235,235,235,0.4)", marginBottom: "1.5rem" }}>Upload your resume and a job description to get started.</p>
            <button onClick={onNewResume} className="neon-btn" style={{ padding: "0.75rem 1.5rem", fontSize: 14, animation: "none" }}>
              Tailor My First Resume
            </button>
          </div>
        ) : isSearching ? (
          /* Flat paginated list when searching */
          <div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "rgba(235,235,235,0.3)", fontSize: 14 }}>
                No results for "{searchQuery}"
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: "rgba(235,235,235,0.3)", marginBottom: "0.75rem", fontFamily: "'JetBrains Mono', monospace" }}>
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {paginated.map(entry => (
                    <HistoryCard key={entry.id} entry={entry} onReopen={onReopen} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
                )}
              </>
            )}
          </div>
        ) : (
          /* Grouped + collapsible when not searching */
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {DATE_GROUPS.filter(g => grouped[g].length > 0).map(group => {
              const isOpen = openGroups.has(group);
              const entries = grouped[group];
              return (
                <div key={group}>
                  <button
                    onClick={() => toggleGroup(group)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.6rem 0.75rem",
                      background: "none",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      color: "rgba(235,235,235,0.5)",
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      {group}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(235,235,235,0.25)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                      {entries.length}
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
                      {entries.map(entry => (
                        <HistoryCard key={entry.id} entry={entry} onReopen={onReopen} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginTop: "1.5rem" }}>
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        style={{
          padding: "0.4rem 0.9rem",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "none",
          color: current === 1 ? "rgba(235,235,235,0.2)" : "rgba(235,235,235,0.6)",
          fontSize: 13,
          cursor: current === 1 ? "not-allowed" : "pointer",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        ← Prev
      </button>
      <span style={{ fontSize: 12, color: "rgba(235,235,235,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>
        {current} / {total}
      </span>
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        style={{
          padding: "0.4rem 0.9rem",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "none",
          color: current === total ? "rgba(235,235,235,0.2)" : "rgba(235,235,235,0.6)",
          fontSize: 13,
          cursor: current === total ? "not-allowed" : "pointer",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        Next →
      </button>
    </div>
  );
}
