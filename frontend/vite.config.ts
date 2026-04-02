import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: "..",  // read .env from /resumeAI/ root instead of /resumeAI/frontend/
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        // Inside Docker, use the service name 'backend'; locally use localhost
        target: (globalThis as any).process?.env?.VITE_API_URL || "http://localhost:8001",
        changeOrigin: true,
      },
    },
  },
});
