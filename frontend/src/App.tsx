import { useState, useEffect, Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

class ReviewErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ReviewPage crash:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif" }}>
          <div style={{ textAlign: "center", maxWidth: 400, padding: "2rem" }}>
            <p style={{ color: "#ccff00", fontWeight: 700, marginBottom: "0.5rem" }}>Something went wrong</p>
            <p style={{ color: "rgba(235,235,235,0.5)", fontSize: 13, marginBottom: "1.5rem" }}>{this.state.message}</p>
            <button onClick={() => this.setState({ hasError: false, message: "" })} style={{ padding: "0.6rem 1.5rem", background: "#ccff00", color: "#000", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UploadPage } from "./pages/UploadPage";
import { ProcessingPage } from "./pages/ProcessingPage";
import { ReviewPage } from "./pages/ReviewPage";
import { CoverLetterPage } from "./pages/CoverLetterPage";
import { DonePage } from "./pages/DonePage";
import { AdminPage } from "./pages/AdminPage";
import { AuthModal } from "./components/AuthModal";
import { UpgradeModal } from "./components/UpgradeModal";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { saveToHistory } from "./lib/history";
import { incrementAnonCount, anonLimitReached } from "./lib/subscription";
import type { AppStep, TailorResponse, Tier, UpgradeReason } from "./types";
import { startTailor, getUserSubscription, ApiError } from "./api/client";
// Note: createCheckoutSession removed — now using Razorpay via UpgradeModal directly
import type { User } from "@supabase/supabase-js";

export default function App() {
  const [step, setStep] = useState<AppStep>("landing");
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<Tier>("free");
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [result, setResult] = useState<TailorResponse | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentJd, setCurrentJd] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Detect /admin URL — set step before auth resolves
    if (window.location.pathname === "/admin") {
      setStep("admin");
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchTier(u.id);
        // Restore authenticated users to dashboard on refresh instead of landing
        setStep(prev => prev === "admin" ? "admin" : "dashboard");
      }
      setSessionReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchTier(u.id);
      else setTier("free");
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchTier(userId: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const info = await getUserSubscription(userId, session?.access_token);
      setTier(info.tier);
    } catch {
      setTier("free");
    }
  }

  function showUpgrade(reason: UpgradeReason) {
    setUpgradeReason(reason);
  }

  function handleGetStarted() {
    if (!isSupabaseConfigured || user) {
      setStep(user ? "dashboard" : "upload");
    } else {
      setShowAuth(true);
    }
  }

  function handleAuthSuccess() {
    setShowAuth(false);
    // Preserve admin step if user logged in from /admin route
    setStep(prev => prev === "admin" ? "admin" : "dashboard");
  }

  function handleSignOut() {
    setUser(null);
    setStep("landing");
  }

  async function handleSubmit(file: File, jd: string) {
    // Anonymous: allow 1 tailor, then require sign-up
    if (!user) {
      if (anonLimitReached()) {
        setShowAuth(true);
        return;
      }
      incrementAnonCount();
    }
    setLoading(true);
    setError(null);
    setCurrentFile(file);
    setCurrentJd(jd);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const rid = await startTailor(file, jd, user?.id ?? undefined, session?.access_token ?? undefined);
      setRequestId(rid);
      setStep("processing");
    } catch (e) {
      if (e instanceof ApiError && e.code === "limit_reached") {
        showUpgrade("tailor_limit");
      } else {
        setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handlePipelineDone(response: TailorResponse) {
    setResult(response);
    if (user && tier === "pro") saveToHistory(response, currentFile?.name ?? "", currentJd).catch(console.error);
    setStep("review");
  }

  function handlePipelineError(message: string) {
    setError(message);
    setStep("upload");
  }

  function handleReopen(response: TailorResponse) {
    setResult(response);
    setStep("review");
  }

  function handleStartOver() {
    setStep(user ? "dashboard" : "upload");
    setResult(null);
    setError(null);
    setCurrentFile(null);
    setCurrentJd("");
    setRequestId(null);
  }

  /** Clicking ResumeAI logo from any page goes to dashboard (or upload if not signed in). */
  function handleLogoClick() {
    setStep(user ? "dashboard" : "upload");
  }

  function renderPage() {
    switch (step) {
      case "landing":
        return <LandingPage onGetStarted={handleGetStarted} onLogoClick={handleLogoClick} />;

      case "dashboard":
        return user ? (
          <DashboardPage
            user={user}
            onNewResume={() => setStep("upload")}
            onSignOut={handleSignOut}
            onLogoClick={handleLogoClick}
            onBack={() => setStep("landing")}
            onReopen={handleReopen}
          />
        ) : null;

      case "upload":
        return (
          <UploadPage
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            onClearError={() => setError(null)}
            user={user}
            onDashboard={() => setStep("dashboard")}
            onSignOut={handleSignOut}
            onLogoClick={handleLogoClick}
          />
        );

      case "processing":
        return requestId ? (
          <ProcessingPage
            requestId={requestId}
            onComplete={handlePipelineDone}
            onError={handlePipelineError}
          />
        ) : null;

      case "review":
        return result ? (
          <ReviewErrorBoundary>
          <ReviewPage
            result={result}
            onDone={() => setStep("done")}
            onCoverLetter={() => {
              if (tier !== "pro") { showUpgrade("cover_letter"); return; }
              setStep("cover-letter");
            }}
            user={user}
            tier={tier}
            onDashboard={() => setStep("dashboard")}
            onSignOut={handleSignOut}
            onLogoClick={handleLogoClick}
            onUpgrade={showUpgrade}
          />
          </ReviewErrorBoundary>
        ) : null;

      case "cover-letter":
        return result ? (
          <CoverLetterPage
            resumeSummary={result.resume_summary}
            jdAnalysis={result.jd_analysis}
            onDone={() => setStep("review")}
            user={user}
            onDashboard={() => setStep("dashboard")}
            onSignOut={handleSignOut}
            onLogoClick={handleLogoClick}
          />
        ) : null;

      case "done":
        return (
          <DonePage
            onStartOver={handleStartOver}
            user={user}
            onDashboard={() => setStep("dashboard")}
            onSignOut={handleSignOut}
            onLogoClick={handleLogoClick}
          />
        );
      case "admin":
        if (!sessionReady) return null;
        if (!user) {
          if (!showAuth) setShowAuth(true);
          return null;
        }
        if (!user.user_metadata?.is_admin) {
          // Not admin — silently redirect to dashboard
          setTimeout(() => setStep("dashboard"), 0);
          return null;
        }
        return <AdminPage user={user} onLogoClick={handleLogoClick} onBack={() => setStep("dashboard")} />;

      default:
        return <LandingPage onGetStarted={handleGetStarted} onLogoClick={handleLogoClick} />;
    }
  }

  return (
    <>
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuthSuccess} />
      )}
      {upgradeReason && (
        <UpgradeModal
          reason={upgradeReason}
          user={user}
          onClose={() => setUpgradeReason(null)}
          onSignIn={() => { setUpgradeReason(null); setShowAuth(true); }}
        />
      )}
      {renderPage()}
    </>
  );
}
