import { useState } from "react";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  FileText,
  LayoutTemplate,
  Mail,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CreditCard,
  Shield,
  Sun,
  Moon,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Tier } from "../types";
import { applyThemeState, readThemeState } from "../lib/theme";

interface NavItem { id: string; label: string; icon: ReactNode; }

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",  label: "Dashboard",     icon: <LayoutDashboard size={16} /> },
  { id: "resumes",    label: "Resumes",        icon: <FileText size={16} /> },
  { id: "templates",  label: "Templates",      icon: <LayoutTemplate size={16} /> },
  { id: "cover",      label: "Cover Letters",  icon: <Mail size={16} /> },
  { id: "review",     label: "AI Review",      icon: <Sparkles size={16} /> },
  { id: "settings",   label: "Settings",       icon: <Settings size={16} /> },
];

interface Props {
  children: ReactNode;
  user: User;
  tier: Tier;
  activeNav?: string;
  topbarTitle?: string;
  topbarRight?: ReactNode;
  onNav?: (id: string) => void;
  onSignOut?: () => void;
  onDashboard?: () => void;
  isAdmin?: boolean;
}

export function AppShell({
  children, user, tier, activeNav,
  topbarTitle, topbarRight,
  onNav, onSignOut, onDashboard, isAdmin,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setThemeState] = useState<"dark"|"light">(() => {
    const { theme: storedTheme, accent: storedAccent } = readThemeState();
    applyThemeState(storedTheme, storedAccent);
    return storedTheme;
  });

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    const { theme: appliedTheme } = applyThemeState(next, readThemeState().accent);
    setThemeState(appliedTheme);
  }

  const sidebarW = collapsed ? 60 : 228;
  const name = (user.user_metadata?.full_name as string | undefined) || user.email || "User";
  const initials = name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      background:
        "radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 12%, transparent) 0, transparent 26%), var(--bg)",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside style={{
        width: sidebarW, minWidth: sidebarW,
        height: "100vh",
        display: "flex", flexDirection: "column",
        background: "color-mix(in srgb, var(--surface) 92%, black 8%)",
        borderRight: "1px solid var(--border)",
        boxShadow: "inset -1px 0 0 rgba(255,255,255,0.02)",
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden", position: "relative", zIndex: 10,
      }}>
        {/* Logo row */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "1.1rem 0" : "1.1rem 0.875rem 1.1rem 1rem",
          borderBottom: "1px solid var(--border)", minHeight: 54,
        }}>
          {!collapsed && (
            <button onClick={onDashboard} style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              display: "flex", alignItems: "center",
            }}>
              <span style={{
                fontWeight: 700, fontSize: 15,
                color: "var(--text-primary)", letterSpacing: "-0.02em",
              }}>
                Resume<span style={{ color: "var(--accent)" }}>AI</span>
              </span>
            </button>
          )}
          {collapsed && (
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: "var(--text-primary)",
                fontSize: 10,
                fontWeight: 700,
                lineHeight: 1.05,
                textAlign: "center",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
              onClick={onDashboard}
            >
              Resume
              <br />
              <span style={{ color: "var(--accent)" }}>AI</span>
            </button>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "0.25rem", color: "var(--text-tertiary)",
                borderRadius: "var(--r-sm)", display: "flex",
                transition: "color var(--dur-fast), background var(--dur-fast)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color="var(--text-secondary)"; (e.currentTarget as HTMLButtonElement).style.background="var(--elevated)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color="var(--text-tertiary)"; (e.currentTarget as HTMLButtonElement).style.background="none"; }}
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              margin: "0.5rem auto", background: "none", border: "none",
              cursor: "pointer", padding: "0.3rem",
              color: "var(--text-tertiary)", borderRadius: "var(--r-sm)",
              display: "flex", alignItems: "center",
            }}
          >
            <ChevronRight size={14} />
          </button>
        )}

        {/* Nav */}
        <nav style={{
          flex: 1, padding: "0.5rem 0.5rem",
          display: "flex", flexDirection: "column", gap: 2,
          overflowY: "auto", overflowX: "hidden",
        }}>
          {!collapsed && (
            <div style={{ padding: "0.5rem 0.75rem 0.35rem" }}>
              <div className="label">Workspaces</div>
            </div>
          )}
          {NAV_ITEMS.map(item => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-item${active ? " active" : ""}`}
                onClick={() => onNav?.(item.id)}
                title={collapsed ? item.label : undefined}
                style={{ justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "0.6rem" : "0.525rem 0.825rem" }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}

          {isAdmin && (
            <button
              className={`sidebar-item${activeNav === "admin" ? " active" : ""}`}
              onClick={() => onNav?.("admin")}
              title={collapsed ? "Admin" : undefined}
              style={{
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "0.6rem" : "0.525rem 0.825rem",
                marginTop: "auto", borderTop: "1px solid var(--border)",
                borderRadius: 0, paddingTop: "0.75rem",
              }}
            >
              <Shield size={16} style={{ flexShrink: 0 }} />
              {!collapsed && "Admin"}
            </button>
          )}
        </nav>

        {/* User footer */}
        <div style={{
          borderTop: "1px solid var(--border)",
          padding: collapsed ? "0.75rem 0" : "0.75rem 0.625rem",
          display: "flex", flexDirection: "column", gap: "0.5rem",
        }}>
          <div style={{
            display: "flex", alignItems: "center",
            gap: collapsed ? 0 : "0.6rem",
            justifyContent: collapsed ? "center" : "flex-start",
            overflow: "hidden",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "var(--accent-soft)",
              border: "1.5px solid var(--accent-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: 12, fontWeight: 700, color: "var(--accent)",
            }}>
              {initials}
            </div>
            {!collapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {name}
                </div>
                <span className={`pill ${tier === "pro" ? "pill-pro" : "pill-neutral"}`} style={{ fontSize: 10, padding: "0.1rem 0.4rem", marginTop: 2 }}>
                  {tier}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <div style={{ display: "flex", gap: "0.375rem" }}>
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                style={{
                  padding: "0.35rem 0.6rem",
                  background: "var(--elevated)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-md)", color: "var(--text-secondary)",
                  fontSize: 11, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all var(--dur-fast)",
                }}
                title={theme === "dark" ? "Switch to light" : "Switch to dark"}
              >
                {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
              </button>

              {tier === "free" && (
                <button
                  onClick={() => onNav?.("upgrade")}
                  style={{
                    flex: 1, padding: "0.35rem 0.5rem",
                    background: "var(--pro-soft)", border: "1px solid var(--pro-border)",
                    borderRadius: "var(--r-md)", color: "var(--pro)",
                    fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem",
                  }}
                >
                  <CreditCard size={11} /> Upgrade
                </button>
              )}

              <button
                onClick={onSignOut}
                title="Sign out"
                style={{
                  padding: "0.35rem 0.55rem",
                  background: "transparent", border: "1px solid var(--border)",
                  borderRadius: "var(--r-md)", color: "var(--text-tertiary)",
                  fontSize: 11, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all var(--dur-fast)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="var(--error)"; (e.currentTarget as HTMLButtonElement).style.color="var(--error)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="var(--border)"; (e.currentTarget as HTMLButtonElement).style.color="var(--text-tertiary)"; }}
              >
                <LogOut size={13} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        {/* Topbar */}
        <header style={{
          height: 50, minHeight: 50,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 1.25rem",
          borderBottom: "1px solid var(--border)",
          background: "color-mix(in srgb, var(--surface) 88%, black 12%)",
          backdropFilter: "blur(16px)",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            {topbarTitle ?? "ResumeAI"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {topbarRight}
          </div>
        </header>

        {/* Content */}
        <main style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
