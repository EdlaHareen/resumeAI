import { useState, useEffect } from "react";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UploadPage } from "./pages/UploadPage";
import { ProcessingPage } from "./pages/ProcessingPage";
import { ReviewPage } from "./pages/ReviewPage";
import { DonePage } from "./pages/DonePage";
import { AuthModal } from "./components/AuthModal";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { saveToHistory } from "./lib/history";
import type { AppStep, TailorResponse } from "./types";
import { tailorResume } from "./api/client";
import type { User } from "@supabase/supabase-js";

export default function App() {
  const [step, setStep] = useState<AppStep>("landing");
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [processingStage, setProcessingStage] = useState(1);
  const [result, setResult] = useState<TailorResponse | null>(null);
  const [, setCurrentFile] = useState<File | null>(null);
  const [, setCurrentJd] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  function handleGetStarted() {
    if (!isSupabaseConfigured || user) {
      setStep(user ? "dashboard" : "upload");
    } else {
      setShowAuth(true);
    }
  }

  function handleAuthSuccess() {
    setShowAuth(false);
    setStep("dashboard");
  }

  function handleSignOut() {
    setUser(null);
    setStep("landing");
  }

  async function handleSubmit(file: File, jd: string) {
    setLoading(true);
    setError(null);
    setStep("processing");
    setProcessingStage(1);
    setCurrentFile(file);
    setCurrentJd(jd);

    const intervals: ReturnType<typeof setTimeout>[] = [];
    [8000, 18000, 32000].forEach((delay, i) => {
      intervals.push(setTimeout(() => setProcessingStage(i + 2), delay));
    });

    try {
      const response = await tailorResume(file, jd);
      intervals.forEach(clearTimeout);
      setResult(response);
      // Save to Supabase history (fire and forget)
      if (user) saveToHistory(response, file.name, jd).catch(console.error);
      setStep("review");
    } catch (e) {
      intervals.forEach(clearTimeout);
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setStep("upload");
    } finally {
      setLoading(false);
    }
  }

  function handleStartOver() {
    setStep(user ? "dashboard" : "upload");
    setResult(null);
    setError(null);
    setCurrentFile(null);
    setCurrentJd("");
    setProcessingStage(1);
  }

  function renderPage() {
    switch (step) {
      case "landing":
        return <LandingPage onGetStarted={handleGetStarted} />;

      case "dashboard":
        return user ? (
          <DashboardPage
            user={user}
            onNewResume={() => setStep("upload")}
            onSignOut={handleSignOut}
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
          />
        );

      case "processing":
        return <ProcessingPage stage={processingStage} />;

      case "review":
        return result ? (
          <ReviewPage
            result={result}
            onDone={() => setStep("done")}
            user={user}
            onDashboard={() => setStep("dashboard")}
            onSignOut={handleSignOut}
          />
        ) : null;

      case "done":
        return (
          <DonePage
            onStartOver={handleStartOver}
            user={user}
            onDashboard={() => setStep("dashboard")}
            onSignOut={handleSignOut}
          />
        );
    }
  }

  return (
    <>
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuthSuccess} />
      )}
      {renderPage()}
    </>
  );
}
