import { Match } from '../types/snooker';

const STORAGE_ACTIVE_MATCH = 'snooker_active_match_v2';
const STORAGE_HISTORY = 'snooker_match_history_v2';

export function saveActiveMatch(match: Match): void {
  try {
    localStorage.setItem(STORAGE_ACTIVE_MATCH, JSON.stringify(match));
  } catch (err) {
    console.error('Failed to save active match:', err);
  }
}

export function loadActiveMatch(): Match | null {
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_MATCH);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load active match:', err);
    return null;
  }
}

export function clearActiveMatch(): void {
  localStorage.removeItem(STORAGE_ACTIVE_MATCH);
}

export function saveMatchToHistory(match: Match): void {
  try {
    const history = loadMatchHistory();
    const filtered = history.filter(m => m.id !== match.id);
    filtered.unshift(match);
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to save match to history:', err);
  }
}

export function loadMatchHistory(): Match[] {
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load match history:', err);
    return [];
  }
}

export function deleteMatchFromHistory(id: string): void {
  try {
    const history = loadMatchHistory().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to delete match:', err);
  }
}

export function exportHistoryJSON(): string {
  const history = loadMatchHistory();
  return JSON.stringify(history, null, 2);
}

export function exportMatchToCSV(match: Match): string {
  const rows: (string | number)[][] = [
    ['Match Title', match.title],
    ['Date', match.date],
    ['Format', match.gameMode],
    ['Player 1', match.player1Name, 'Frames Won', match.player1FramesWon],
    ['Player 2', match.player2Name, 'Frames Won', match.player2FramesWon],
    ['Winner', match.winnerIndex !== undefined ? (match.winnerIndex === 0 ? match.player1Name : match.player2Name) : 'In Progress'],
    [],
    ['Frame #', 'P1 Score', 'P2 Score', 'Duration (min)', 'P1 High Break', 'P2 High Break', 'P1 Pot %', 'P2 Pot %', 'P1 Break %', 'P2 Break %', 'P1 Fouls', 'P2 Fouls', 'P1 AST (s)', 'P2 AST (s)'],
  ];

  match.frames.forEach((f, idx) => {
    rows.push([
      `Frame ${idx + 1}`,
      f.player1Score,
      f.player2Score,
      Math.round(f.durationSec / 60),
      f.stats[0]?.highestBreak || 0,
      f.stats[1]?.highestBreak || 0,
      `${f.stats[0]?.pottingAccuracy || 0}%`,
      `${f.stats[1]?.pottingAccuracy || 0}%`,
      `${f.stats[0]?.breakRate || 0}%`,
      `${f.stats[1]?.breakRate || 0}%`,
      f.stats[0]?.foulsCount || 0,
      f.stats[1]?.foulsCount || 0,
      `${f.stats[0]?.averageShotTime || 0}s`,
      `${f.stats[1]?.averageShotTime || 0}s`,
    ]);
  });

  return rows.map(r => r.join(',')).join('\n');
}

