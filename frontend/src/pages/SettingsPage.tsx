import { useEffect, useState } from "react";
import { CreditCard, Moon, Palette, Sparkles, Sun, UserCircle2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Tier } from "../types";
import { applyAccentSelection, applyThemeState, readThemeState } from "../lib/theme";

interface Props {
  user: User;
  tier: Tier;
  onCancelSubscription: () => void;
  onUpgrade: () => void;
}

const ACCENTS = [
  { id: "lime", label: "Lime", hex: "#CCFF00" },
  { id: "blue", label: "Ocean", hex: "#0A84FF" },
  { id: "emerald", label: "Emerald", hex: "#10B981" },
  { id: "amber", label: "Amber", hex: "#F59E0B" },
  { id: "coral", label: "Coral", hex: "#F97316" },
  { id: "graphite", label: "Graphite", hex: "#8B8D98" },
  { id: "indigo", label: "Indigo", hex: "#6366F1" },
] as const;

type ThemeMode = "dark" | "light";
type AccentId = (typeof ACCENTS)[number]["id"];

export function SettingsPage({ user, tier, onCancelSubscription, onUpgrade }: Props) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [accent, setAccent] = useState<AccentId>("lime");

  useEffect(() => {
    const { theme: storedTheme, accent: storedAccent } = readThemeState();
    setTheme(storedTheme);
    setAccent(storedAccent as AccentId);
  }, []);

  function applyTheme(nextTheme: ThemeMode) {
    const { theme: appliedTheme, accent: appliedAccent } = applyThemeState(nextTheme, accent);
    setTheme(appliedTheme);
    setAccent(appliedAccent as AccentId);
  }

  function applyAccent(nextAccent: AccentId) {
    const { theme: appliedTheme, accent: appliedAccent } = applyAccentSelection(theme, nextAccent);
    setTheme(appliedTheme);
    setAccent(appliedAccent as AccentId);
  }

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "1.5rem",
        background:
          "radial-gradient(circle at top center, color-mix(in srgb, var(--accent) 9%, transparent) 0, transparent 32%), var(--bg)",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <section
          className="bento-card"
          style={{
            padding: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 650 }}>
            <div className="label" style={{ marginBottom: "0.45rem" }}>
              Settings
            </div>
            <h1 style={{ fontSize: "2.1rem", letterSpacing: "-0.05em", color: "var(--text-primary)", marginBottom: "0.65rem" }}>
              Account, billing, and workspace appearance
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              Keep your profile, plan, and visual preferences in sync from one place. Theme and accent changes
              apply immediately across the workspace.
            </p>
          </div>

          <div className={`pill ${tier === "pro" ? "pill-pro" : "pill-neutral"}`}>{tier.toUpperCase()} PLAN</div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(300px, 360px) minmax(0, 1fr)",
            gap: "1rem",
          }}
        >
          <div className="bento-card" style={{ padding: "1.25rem" }}>
            <div className="label" style={{ marginBottom: "0.35rem" }}>
              Profile
            </div>
            <h2 style={{ fontSize: 20, color: "var(--text-primary)", marginBottom: "1rem" }}>Your account</h2>

            <div
              style={{
                padding: "1rem",
                borderRadius: 18,
                background: "var(--elevated)",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--accent-soft)",
                    border: "1px solid var(--accent-border)",
                    color: "var(--accent)",
                  }}
                >
                  <UserCircle2 size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                    {(user.user_metadata?.full_name as string | undefined) || "ResumeAI user"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{user.email}</div>
                </div>
              </div>

              <div style={{ display: "grid", gap: "0.6rem" }}>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  Auth provider: <span style={{ color: "var(--text-primary)" }}>{user.app_metadata.provider ?? "email"}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  Account created:{" "}
                  <span style={{ color: "var(--text-primary)" }}>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bento-card" style={{ padding: "1.25rem" }}>
            <div className="label" style={{ marginBottom: "0.35rem" }}>
              Plan & Billing
            </div>
            <h2 style={{ fontSize: 20, color: "var(--text-primary)", marginBottom: "1rem" }}>Manage your access</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: "1rem",
                alignItems: "center",
                padding: "1rem",
                borderRadius: 18,
                border: "1px solid var(--border)",
                background:
                  tier === "pro"
                    ? "linear-gradient(135deg, color-mix(in srgb, var(--pro) 10%, var(--surface)) 0%, var(--elevated) 100%)"
                    : "var(--elevated)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.35rem" }}>
                  <CreditCard size={18} color={tier === "pro" ? "var(--pro)" : "var(--text-secondary)"} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                    {tier === "pro" ? "ResumeAI Pro" : "ResumeAI Free"}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {tier === "pro"
                    ? "You have access to premium templates, DOCX export, and cover-letter generation."
                    : "Upgrade to unlock premium templates, DOCX export, and cover letters."}
                </p>
              </div>

              {tier === "pro" ? (
                <button type="button" className="ghost-btn" onClick={onCancelSubscription} style={{ color: "var(--error)" }}>
                  Cancel Plan
                </button>
              ) : (
                <button type="button" className="accent-btn" onClick={onUpgrade}>
                  <Sparkles size={16} />
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        </section>

        <section
          className="bento-card"
          style={{
            padding: "1.25rem",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 380px)",
            gap: "1rem",
          }}
        >
          <div>
            <div className="label" style={{ marginBottom: "0.35rem" }}>
              Appearance
            </div>
            <h2 style={{ fontSize: 20, color: "var(--text-primary)", marginBottom: "1rem" }}>Theme and accent</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(160px, 220px))", gap: "0.85rem", marginBottom: "1rem" }}>
              {[
                { id: "dark" as const, label: "Dark", icon: <Moon size={18} /> },
                { id: "light" as const, label: "Light", icon: <Sun size={18} /> },
              ].map((option) => {
                const active = theme === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => applyTheme(option.id)}
                    className="bento-card"
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      cursor: "pointer",
                      background: active ? "color-mix(in srgb, var(--accent-soft) 50%, var(--surface))" : "var(--elevated)",
                      borderColor: active ? "var(--accent-border)" : "var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.45rem", color: active ? "var(--accent)" : "var(--text-secondary)" }}>
                      {option.icon}
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{option.label}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {option.id === "dark" ? "High-contrast workspace for long review sessions." : "Bright canvas for clean export planning."}
                    </p>
                  </button>
                );
              })}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.7rem" }}>
                <Palette size={16} color="var(--accent)" />
                <span className="label">Accent Color</span>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {ACCENTS.map((item) => {
                  const active = accent === item.id;
                  const limeLockedToDark = theme === "light" && item.id === "lime";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => applyAccent(item.id)}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        border: active ? "3px solid var(--surface)" : "2px solid transparent",
                        outline: active ? `2px solid ${item.hex}` : "none",
                        background: item.hex,
                        cursor: "pointer",
                        boxShadow: active ? `0 0 0 4px color-mix(in srgb, ${item.hex} 24%, transparent)` : "none",
                        opacity: limeLockedToDark ? 0.7 : 1,
                      }}
                      title={limeLockedToDark ? `${item.label} switches back to dark mode` : item.label}
                    />
                  );
                })}
              </div>
              <p style={{ marginTop: "0.7rem", fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.6 }}>
                Lime is reserved for dark mode so contrast stays sharp. If you choose lime while using light mode, the workspace will switch back to dark automatically.
              </p>
            </div>
          </div>

          <div
            className="bento-card"
            style={{
              padding: "1rem",
              background: "var(--elevated)",
            }}
          >
            <div className="label" style={{ marginBottom: "0.35rem" }}>
              Live Preview
            </div>
            <div
              style={{
                borderRadius: 18,
                padding: "1rem",
                border: "1px solid var(--border)",
                background: "var(--surface)",
              }}
            >
              <div
                style={{
                  height: 140,
                  borderRadius: 16,
                  padding: "1rem",
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--surface)) 0%, var(--surface) 80%)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div className="label" style={{ color: "var(--accent)", marginBottom: "0.35rem" }}>
                    ResumeAI
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.3rem" }}>
                    {theme === "dark" ? "Night mode workspace" : "Light mode workspace"}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Accent: {ACCENTS.find((item) => item.id === accent)?.label}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span className="pill pill-accent">Primary</span>
                  <span className="pill pill-ghost">Secondary</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
