import { supabase } from "./supabase";
import type { TailorResponse } from "../types";

export async function saveToHistory(
  response: TailorResponse,
  filename: string,
  jd: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const jdWords = jd.trim().split(/\s+/);
  const jdSnippet = jdWords.slice(0, 30).join(" ") + (jdWords.length > 30 ? "…" : "");

  await supabase.from("tailor_history").insert({
    user_id: user.id,
    original_filename: filename,
    job_role: response.jd_analysis.role_level || null,
    company: null, // extracted from JD if available
    jd_snippet: jdSnippet,
    match_percent: response.scores.match_percent,
    ats_score: response.scores.ats_score,
    strength_score: response.scores.strength_score,
    changed_bullets: response.changed_bullets,
    total_bullets: response.total_bullets,
  });
}

export async function loadHistory() {
  const { data, error } = await supabase
    .from("tailor_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}
