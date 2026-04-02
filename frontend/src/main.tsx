import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { applyThemeState, readThemeState } from "./lib/theme";

// One-time migration: old code force-stored "blue" for light+lime users → reset to lime
if (!localStorage.getItem("resumeai_v2")) {
  if (localStorage.getItem("resumeai_accent") === "blue") {
    localStorage.setItem("resumeai_accent", "lime");
  }
  localStorage.setItem("resumeai_v2", "1");
}

// Init theme before React to avoid flash
const { theme: initialTheme, accent: initialAccent } = readThemeState();
applyThemeState(initialTheme, initialAccent);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
