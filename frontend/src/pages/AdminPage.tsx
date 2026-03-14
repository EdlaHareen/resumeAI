import { useEffect, useState } from "react";
import { Users, Clock, Shield, TrendingUp } from "lucide-react";
import { UserNav } from "../components/UserNav";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

const BASE = "/api/admin";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
  tier: "free" | "pro";
  sub_status: string;
  usage_this_month: number;
}

interface HistoryRow {
  id: string;
  user_id: string;
  original_filename: string | null;
  job_role: string | null;
  company: string | null;
  match_percent: number | null;
  ats_score: number | null;
  changed_bullets: number | null;
  total_bullets: number | null;
  created_at: string;
}

type Tab = "users" | "history";

async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ""}`,
      ...(options.headers ?? {}),
    },
  });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function TierBadge({ tier }: { tier: "free" | "pro" }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
      padding: "0.15rem 0.5rem", borderRadius: 9999,
      background: tier === "pro" ? "rgba(204,255,0,0.12)" : "rgba(255,255,255,0.05)",
      border: `1px solid ${tier === "pro" ? "rgba(204,255,0,0.35)" : "rgba(255,255,255,0.1)"}`,
      color: tier === "pro" ? "var(--lime)" : "rgba(235,235,235,0.4)",
    }}>
      {tier}
    </span>
  );
}

interface Props {
  user: User;
  onLogoClick: () => void;
  onBack: () => void;
}

export function AdminPage({ user, onLogoClick, onBack }: Props) {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tierLoading, setTierLoading] = useState<string | null>(null);

  useEffect(() => {
    loadTab(tab);
  }, [tab]);

  async function loadTab(t: Tab) {
    setLoading(true);
    setError(null);
    try {
      const resp = await adminFetch(t === "users" ? "/users" : "/history");
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ detail: "Failed" }));
        throw new Error(err.detail ?? "Request failed");
      }
      const data = await resp.json();
      if (t === "users") setUsers(data);
      else setHistory(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSetTier(userId: string, tier: "free" | "pro") {
    setTierLoading(userId);
    try {
      const resp = await adminFetch(`/subscription/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ tier }),
      });
      if (!resp.ok) throw new Error("Failed to update tier");
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier } : u));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update tier");
    } finally {
      setTierLoading(null);
    }
  }

  const proCount = users.filter(u => u.tier === "pro").length;
  const totalSessions = history.length;
  const avgMatch = history.length
    ? Math.round(history.reduce((s, h) => s + (h.match_percent ?? 0), 0) / history.length)
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={onLogoClick}
          style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", color: "var(--white-primary)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
        >
          Resume<span style={{ color: "var(--lime)" }}>AI</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Shield size={14} color="var(--lime)" />
          <span className="mono" style={{ fontSize: 12, color: "var(--lime)" }}>admin</span>
          <UserNav
            user={user}
            onDashboard={onBack}
            onSignOut={() => { supabase.auth.signOut(); onBack(); }}
            onNewResume={onBack}
          />
        </div>
      </nav>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div className="mono" style={{ color: "var(--lime)", marginBottom: "0.5rem" }}>admin panel</div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--white-primary)" }}>
            Control Center
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total Users", value: users.length, icon: <Users size={15} />, color: "var(--lime)" },
            { label: "Pro Users", value: proCount, icon: <Shield size={15} />, color: "#10b981" },
            { label: "Total Sessions", value: totalSessions, icon: <Clock size={15} />, color: "#f59e0b" },
            { label: "Avg Match %", value: `${avgMatch}%`, icon: <TrendingUp size={15} />, color: "var(--lime)" },
          ].slice(0, tab === "users" ? 3 : 4).map(({ label, value, icon, color }) => (
            <div key={label} className="bento-card" style={{ padding: "1.25rem 1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "rgba(235,235,235,0.4)" }}>
                {icon}
                <span className="mono" style={{ fontSize: 11 }}>{label}</span>
              </div>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0" }}>
          {(["users", "history"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "0.6rem 1.25rem",
                background: "none",
                border: "none",
                borderBottom: tab === t ? "2px solid var(--lime)" : "2px solid transparent",
                color: tab === t ? "var(--lime)" : "rgba(235,235,235,0.4)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
                textTransform: "capitalize",
                transition: "color 0.15s",
                marginBottom: "-1px",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "rgba(235,235,235,0.3)" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid rgba(204,255,0,0.3)", borderTopColor: "var(--lime)", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            Loading...
          </div>
        ) : tab === "users" ? (
          <UsersTable users={users} onSetTier={handleSetTier} tierLoading={tierLoading} />
        ) : (
          <HistoryTable rows={history} users={users} />
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function UsersTable({ users, onSetTier, tierLoading }: {
  users: AdminUser[];
  onSetTier: (id: string, tier: "free" | "pro") => void;
  tierLoading: string | null;
}) {
  if (users.length === 0) return <Empty label="No users yet" />;

  return (
    <div className="bento-card" style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Email", "Joined", "Last Active", "Tier", "Usage/mo", "Actions"].map(h => (
              <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(235,235,235,0.35)", fontWeight: 600, whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <td style={{ padding: "0.75rem 1rem", color: "var(--white-primary)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {u.email}
                  {u.is_admin && (
                    <Shield size={11} color="var(--lime)" />
                  )}
                </div>
              </td>
              <td style={{ padding: "0.75rem 1rem", color: "rgba(235,235,235,0.4)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, whiteSpace: "nowrap" }}>
                {formatDate(u.created_at)}
              </td>
              <td style={{ padding: "0.75rem 1rem", color: "rgba(235,235,235,0.4)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, whiteSpace: "nowrap" }}>
                {formatDate(u.last_sign_in_at)}
              </td>
              <td style={{ padding: "0.75rem 1rem" }}>
                <TierBadge tier={u.tier} />
              </td>
              <td style={{ padding: "0.75rem 1rem", color: "rgba(235,235,235,0.5)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                {u.usage_this_month}
              </td>
              <td style={{ padding: "0.75rem 1rem" }}>
                {!u.is_admin && (
                  <button
                    onClick={() => onSetTier(u.id, u.tier === "pro" ? "free" : "pro")}
                    disabled={tierLoading === u.id}
                    style={{
                      padding: "0.25rem 0.65rem",
                      borderRadius: 9999,
                      border: `1px solid ${u.tier === "pro" ? "rgba(239,68,68,0.3)" : "rgba(204,255,0,0.3)"}`,
                      background: u.tier === "pro" ? "rgba(239,68,68,0.06)" : "rgba(204,255,0,0.06)",
                      color: u.tier === "pro" ? "#f87171" : "var(--lime)",
                      fontSize: 11, fontWeight: 600, cursor: tierLoading === u.id ? "not-allowed" : "pointer",
                      fontFamily: "'Space Grotesk', sans-serif",
                      opacity: tierLoading === u.id ? 0.5 : 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {u.tier === "pro" ? "Downgrade" : "Upgrade"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HistoryTable({ rows, users }: { rows: HistoryRow[]; users: AdminUser[] }) {
  if (rows.length === 0) return <Empty label="No sessions yet" />;

  const userEmailMap: Record<string, string> = {};
  for (const u of users) userEmailMap[u.id] = u.email;

  return (
    <div className="bento-card" style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["File", "Job Role", "User", "Match", "ATS", "Changed", "Date"].map(h => (
              <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(235,235,235,0.35)", fontWeight: 600, whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} style={{ borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <td style={{ padding: "0.75rem 1rem", color: "var(--white-primary)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {row.original_filename ?? "Resume"}
              </td>
              <td style={{ padding: "0.75rem 1rem", color: "rgba(235,235,235,0.5)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {row.job_role ?? "—"}
              </td>
              <td style={{ padding: "0.75rem 1rem", color: "rgba(235,235,235,0.4)", fontSize: 11, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userEmailMap[row.user_id] ?? row.user_id?.slice(0, 8) ?? "—"}
              </td>
              <td style={{ padding: "0.75rem 1rem", fontFamily: "'JetBrains Mono', monospace", color: "var(--lime)", fontWeight: 700, fontSize: 12 }}>
                {row.match_percent != null ? `${row.match_percent}%` : "—"}
              </td>
              <td style={{ padding: "0.75rem 1rem", fontFamily: "'JetBrains Mono', monospace", color: "#10b981", fontWeight: 700, fontSize: 12 }}>
                {row.ats_score != null ? `${row.ats_score}%` : "—"}
              </td>
              <td style={{ padding: "0.75rem 1rem", color: "rgba(235,235,235,0.4)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                {row.changed_bullets ?? "—"}/{row.total_bullets ?? "—"}
              </td>
              <td style={{ padding: "0.75rem 1rem", color: "rgba(235,235,235,0.3)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, whiteSpace: "nowrap" }}>
                {formatDate(row.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div style={{ textAlign: "center", padding: "4rem", color: "rgba(235,235,235,0.3)", fontSize: 14 }}>
      {label}
    </div>
  );
}
