import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { applyThemeState, readThemeState } from "./lib/theme";

// Init theme before React to avoid flash
const { theme: initialTheme, accent: initialAccent } = readThemeState();
applyThemeState(initialTheme, initialAccent);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
