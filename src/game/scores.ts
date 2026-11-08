const KEY = "chiyao.scores.v1";
const MUTE = "chiyao.mute.v1";

export type ScoreRow = { score: number; wave: number; at: number };

type Save = { version: 1; rows: ScoreRow[] };

function empty(): ScoreRow[] {
  return [];
}

export function loadScores(): ScoreRow[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw) as Save;
    if (!data || data.version !== 1 || !Array.isArray(data.rows)) return empty();
    return data.rows
      .filter((row) => row && typeof row.score === "number" && typeof row.wave === "number")
      .slice(0, 8);
  } catch {
    return empty();
  }
}

export function submitScore(score: number, wave: number): { rows: ScoreRow[]; rank: number | null } {
  const row: ScoreRow = { score: Math.max(0, Math.round(score)), wave, at: Date.now() };
  const rows = loadScores();
  rows.push(row);
  rows.sort((a, b) => b.score - a.score || b.wave - a.wave || a.at - b.at);
  const kept = rows.slice(0, 8);
  const rankIndex = kept.indexOf(row);
  try {
    const save: Save = { version: 1, rows: kept };
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* private mode */
  }
  return { rows: kept, rank: rankIndex >= 0 ? rankIndex + 1 : null };
}

export function loadMute(): boolean {
  try {
    return localStorage.getItem(MUTE) === "1";
  } catch {
    return false;
  }
}

export function saveMute(muted: boolean) {
  try {
    localStorage.setItem(MUTE, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
}
