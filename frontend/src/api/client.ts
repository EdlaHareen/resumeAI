import type { TailorResponse, DownloadRequest } from "../types";

// In dev, Vite proxies /api → localhost:8001.
// In production, VITE_API_BASE_URL points directly to the Render backend.
const BASE = (import.meta.env.VITE_API_BASE_URL ?? "") + "/api";

export async function tailorResume(
  resumeFile: File,
  jobDescription: string
): Promise<TailorResponse> {
  const form = new FormData();
  form.append("resume_file", resumeFile);
  form.append("job_description", jobDescription);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180_000); // 3-minute timeout

  let resp: Response;
  try {
    resp = await fetch(`${BASE}/tailor`, {
      method: "POST",
      body: form,
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error("The request timed out. The AI pipeline may be under heavy load -- please try again.");
    }
    throw new Error("Could not reach the server. Make sure the backend is running on port 8001.");
  } finally {
    clearTimeout(timeout);
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: "Unknown error" }));
    const detail = err.detail;
    if (typeof detail === "object" && detail.message) {
      throw new Error(detail.message);
    }
    throw new Error(typeof detail === "string" ? detail : "Request failed");
  }

  return resp.json();
}

export async function downloadFile(
  format: "pdf" | "docx",
  req: DownloadRequest
): Promise<Blob> {
  const resp = await fetch(`${BASE}/download/${format}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: "Download failed" }));
    throw new Error(typeof err.detail === "string" ? err.detail : "Download failed");
  }

  return resp.blob();
}

export async function checkHealth(): Promise<{ status: string; ai_providers: Record<string, string> }> {
  const resp = await fetch(`${BASE}/health`);
  return resp.json();
}
