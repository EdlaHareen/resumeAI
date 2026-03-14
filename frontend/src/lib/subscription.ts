export type Tier = "free" | "pro";

const ANON_KEY = "resumeai_anon_tailors";

export function getAnonCount(): number {
  try {
    const raw = localStorage.getItem(ANON_KEY);
    if (!raw) return 0;
    const { count, month } = JSON.parse(raw);
    const current = new Date().toISOString().slice(0, 7);
    return month === current ? (count as number) : 0;
  } catch {
    return 0;
  }
}

export function incrementAnonCount(): void {
  const count = getAnonCount();
  const month = new Date().toISOString().slice(0, 7);
  localStorage.setItem(ANON_KEY, JSON.stringify({ count: count + 1, month }));
}

export function anonLimitReached(): boolean {
  return getAnonCount() >= 1;
}
