import { BallInfo, BallColor, LegalTarget, Shot, Visit, PlayerStats, GameMode } from '../types/snooker';

export const BALLS: BallInfo[] = [
  { color: 'red', nameTh: 'ลูกแดง', nameEn: 'Red', points: 1, cssClass: 'ball-red', numpadKey: '1', regularKey: '1' },
  { color: 'yellow', nameTh: 'ลูกเหลือง', nameEn: 'Yellow', points: 2, cssClass: 'ball-yellow', numpadKey: '2', regularKey: '2' },
  { color: 'green', nameTh: 'ลูกเขียว', nameEn: 'Green', points: 3, cssClass: 'ball-green', numpadKey: '3', regularKey: '3' },
  { color: 'brown', nameTh: 'ลูกน้ำตาล', nameEn: 'Brown', points: 4, cssClass: 'ball-brown', numpadKey: '4', regularKey: '4' },
  { color: 'blue', nameTh: 'ลูกน้ำเงิน', nameEn: 'Blue', points: 5, cssClass: 'ball-blue', numpadKey: '5', regularKey: '5' },
  { color: 'pink', nameTh: 'ลูกชมพู', nameEn: 'Pink', points: 6, cssClass: 'ball-pink', numpadKey: '6', regularKey: '6' },
  { color: 'black', nameTh: 'ลูกดำ', nameEn: 'Black', points: 7, cssClass: 'ball-black', numpadKey: '7', regularKey: '7' },
];

export const BALL_MAP: Record<BallColor, BallInfo> = BALLS.reduce((acc, b) => {
  acc[b.color] = b;
  return acc;
}, {} as Record<BallColor, BallInfo>);

export const FINAL_COLORS: BallColor[] = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];

/**
 * Calculates remaining points on the table.
 * Standard Snooker table points calculation:
 * - If Reds remaining > 0: (Reds * 8) + 27 (+ 7 if currently on color after red)
 * - If 0 Reds remaining: Clears 6 colors in order (27 -> 25 -> 22 -> 18 -> 13 -> 7 -> 0)
 */
export function calculateRemainingPoints(
  redsRemaining: number,
  shots: Shot[] = [],
  _gameMode: GameMode = '15-reds'
): number {
  if (redsRemaining > 0) {
    // Check if the last pot was a red (so striker is on color)
    const lastPot = [...shots].reverse().find(s => s.action === 'pot');
    const isCurrentlyOnColor = lastPot && lastPot.ballPotted === 'red';
    return (redsRemaining * 8) + 27 + (isCurrentlyOnColor ? 7 : 0);
  }

  // 0 reds remaining: Calculate remaining points based on which of the 6 colors are still on the table
  let lastRedIndex = -1;
  for (let i = shots.length - 1; i >= 0; i--) {
    if (shots[i].action === 'pot' && shots[i].ballPotted === 'red') {
      lastRedIndex = i;
      break;
    }
  }

  const shotsAfterLastRed = lastRedIndex >= 0 ? shots.slice(lastRedIndex + 1) : shots;
  const potShotsAfterLastRed = shotsAfterLastRed.filter(s => s.action === 'pot' && s.ballPotted);

  // If the very first pot after the last red was in the same visit as the last red, that was the color for the last red
  let colorPotsToExclude = 0;
  if (lastRedIndex >= 0 && potShotsAfterLastRed.length > 0) {
    const lastRedShot = shots[lastRedIndex];
    if (potShotsAfterLastRed[0].visitNumber === lastRedShot.visitNumber) {
      colorPotsToExclude = 1;
    }
  }

  const finalColorPots = potShotsAfterLastRed.slice(colorPotsToExclude);
  const pottedColors = new Set<string>();
  for (const shot of finalColorPots) {
    if (shot.ballPotted && shot.ballPotted !== 'red') {
      pottedColors.add(shot.ballPotted);
    }
  }

  const colorPoints: Record<string, number> = {
    yellow: 2,
    green: 3,
    brown: 4,
    blue: 5,
    pink: 6,
    black: 7,
  };

  let remaining = 0;
  for (const [color, pts] of Object.entries(colorPoints)) {
    if (!pottedColors.has(color)) {
      remaining += pts;
    }
  }

  return remaining;
}

/**
 * Calculates snookers required.
 * Each foul yields at least 4 penalty points.
 */
export function calculateSnookersRequired(pointsDiff: number, remainingPoints: number): number {
  if (pointsDiff <= remainingPoints) {
    return 0;
  }
  const deficit = pointsDiff - remainingPoints;
  return Math.ceil(deficit / 4);
}

/**
 * Determine the next legal target after a pot or foul.
 */
export function getNextTargetAfterPot(
  currentReds: number,
  currentTarget: LegalTarget,
  pottedBall: BallColor
): { nextReds: number; nextTarget: LegalTarget } {
  if (pottedBall === 'red') {
    const nextReds = Math.max(0, currentReds - 1);
    return { nextReds, nextTarget: 'color' };
  }

  // A color ball was potted
  if (currentTarget === 'color') {
    if (currentReds > 0) {
      return { nextReds: currentReds, nextTarget: 'red' };
    } else {
      // Last red followed by color completed -> move to yellow
      return { nextReds: 0, nextTarget: 'yellow' };
    }
  }

  // Final colors clearance sequence
  if (pottedBall === 'yellow' && currentTarget === 'yellow') {
    return { nextReds: 0, nextTarget: 'green' };
  }
  if (pottedBall === 'green' && currentTarget === 'green') {
    return { nextReds: 0, nextTarget: 'brown' };
  }
  if (pottedBall === 'brown' && currentTarget === 'brown') {
    return { nextReds: 0, nextTarget: 'blue' };
  }
  if (pottedBall === 'blue' && currentTarget === 'blue') {
    return { nextReds: 0, nextTarget: 'pink' };
  }
  if (pottedBall === 'pink' && currentTarget === 'pink') {
    return { nextReds: 0, nextTarget: 'black' };
  }
  if (pottedBall === 'black' && currentTarget === 'black') {
    return { nextReds: 0, nextTarget: 'game-over' };
  }

  return { nextReds: currentReds, nextTarget: currentTarget };
}

/**
 * Reset legal target after a miss, foul, or end of turn.
 */
export function getTargetAfterTurnEnd(currentReds: number, currentTarget: LegalTarget): LegalTarget {
  if (currentReds > 0) {
    return 'red';
  }
  if (currentTarget === 'color') {
    // Was on color after last red, but turn ended -> next striker must play yellow
    return 'yellow';
  }
  return currentTarget;
}

/**
 * Check if a ball is legal to pot given current state.
 */
export function isBallLegal(ball: BallColor, legalTarget: LegalTarget, redsRemaining: number): boolean {
  if (legalTarget === 'game-over') return false;

  if (legalTarget === 'red') {
    return ball === 'red';
  }

  if (legalTarget === 'color') {
    return ball !== 'red';
  }

  return ball === legalTarget;
}

/**
 * Calculate comprehensive player statistics for a player in a frame / match.
 */
export function calculatePlayerStats(
  shots: Shot[],
  visits: Visit[],
  playerIndex: 0 | 1,
  opponentShots: Shot[]
): PlayerStats {
  const pShots = shots.filter(s => s.playerIndex === playerIndex);
  const pVisits = visits.filter(v => v.playerIndex === playerIndex);

  // 9.1 Total Points = Pots + Opponent fouls points conceded to this player
  const potsPoints = pShots
    .filter(s => s.action === 'pot')
    .reduce((sum, s) => sum + s.points, 0);

  const opponentFoulPoints = opponentShots
    .filter(s => s.action === 'foul')
    .reduce((sum, s) => sum + s.points, 0);

  const totalPoints = potsPoints + opponentFoulPoints;

  // 9.2 Potting Accuracy %
  // Potted balls vs Total pot attempts
  const potsPotted = pShots.filter(s => s.action === 'pot').length;
  // Attempts = potted balls + misses/end-turns/fouls where player tried to pot
  const nonPotAttempts = pShots.filter(s => s.action === 'miss' || s.action === 'foul' || s.action === 'end-turn').length;
  const potsAttempted = potsPotted + (nonPotAttempts > 0 ? nonPotAttempts : (pVisits.length > 0 ? pVisits.length : 0));
  const pottingAccuracy = potsAttempted > 0 ? (potsPotted / potsAttempted) * 100 : 0;

  // 9.3 Break Rate % (Criteria: >= 2 balls potted in visit)
  const totalVisits = pVisits.length;
  const breakVisits = pVisits.filter(v => v.ballsPotted >= 2).length;
  const breakRate = totalVisits > 0 ? (breakVisits / totalVisits) * 100 : 0;

  // Break Tiers Breakdown
  const breakTiers = {
    twoToFourBalls: pVisits.filter(v => v.ballsPotted >= 2 && v.pointsScored < 20).length,
    twentyPlus: pVisits.filter(v => v.pointsScored >= 20 && v.pointsScored < 50).length,
    fiftyPlus: pVisits.filter(v => v.pointsScored >= 50 && v.pointsScored < 70).length,
    seventyPlus: pVisits.filter(v => v.pointsScored >= 70 && v.pointsScored < 100).length,
    centuryPlus: pVisits.filter(v => v.pointsScored >= 100).length,
  };

  // 9.8 Highest Break
  const highestBreak = pVisits.reduce((max, v) => Math.max(max, v.pointsScored), 0);

  // 9.6 Fouls Count & Conceded Points
  const fouls = pShots.filter(s => s.action === 'foul');
  const foulsCount = fouls.length;
  const foulPointsConceded = fouls.reduce((sum, s) => sum + s.points, 0);
  const foulRate = totalVisits > 0 ? (foulsCount / totalVisits) * 100 : 0;

  // 9.7 Unforced Error / Opportunity Conceded %
  // (Visits where player ended turn/missed/fouled and opponent scored on their next immediate shot)
  const errorsConceded = pVisits.filter(v => v.endedWithOpportunityGiven).length;
  const errorRate = totalVisits > 0 ? (errorsConceded / totalVisits) * 100 : 0;

  // 9.4 Average Shot Time (AST) in seconds
  const totalShotTimeSec = pShots.reduce((sum, s) => sum + (s.shotTimeSec || 0), 0);
  const averageShotTime = pShots.length > 0 ? totalShotTimeSec / pShots.length : 0;

  return {
    totalPoints,
    potsAttempted,
    potsPotted,
    pottingAccuracy: Math.round(pottingAccuracy * 10) / 10,
    totalVisits,
    breakVisits,
    breakRate: Math.round(breakRate * 10) / 10,
    breakTiers,
    highestBreak,
    foulsCount,
    foulPointsConceded,
    foulRate: Math.round(foulRate * 10) / 10,
    errorsConceded,
    errorRate: Math.round(errorRate * 10) / 10,
    totalShotTimeSec: Math.round(totalShotTimeSec),
    averageShotTime: Math.round(averageShotTime * 10) / 10,
  };
}

export function createInitialFrame(
  frameNumber: number,
  gameMode: GameMode,
  p1FramesWon: number = 0,
  p2FramesWon: number = 0
): {
  id: string;
  frameNumber: number;
  startTime: number;
  durationSec: number;
  player1Score: number;
  player2Score: number;
  player1FramesWon: number;
  player2FramesWon: number;
  redsRemaining: number;
  legalTarget: LegalTarget;
  freeBallActive: boolean;
  shots: Shot[];
  visits: Visit[];
  isCompleted: boolean;
  stats: [PlayerStats, PlayerStats];
} {
  const redsRemaining = gameMode === '15-reds' ? 15 : 6;
  const emptyStats: PlayerStats = {
    totalPoints: 0,
    potsAttempted: 0,
    potsPotted: 0,
    pottingAccuracy: 0,
    totalVisits: 0,
    breakVisits: 0,
    breakRate: 0,
    breakTiers: { twoToFourBalls: 0, twentyPlus: 0, fiftyPlus: 0, seventyPlus: 0, centuryPlus: 0 },
    highestBreak: 0,
    foulsCount: 0,
    foulPointsConceded: 0,
    foulRate: 0,
    errorsConceded: 0,
    errorRate: 0,
    totalShotTimeSec: 0,
    averageShotTime: 0,
  };

  return {
    id: 'frame-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    frameNumber,
    startTime: Date.now(),
    durationSec: 0,
    player1Score: 0,
    player2Score: 0,
    player1FramesWon: p1FramesWon,
    player2FramesWon: p2FramesWon,
    redsRemaining,
    legalTarget: 'red',
    freeBallActive: false,
    shots: [],
    visits: [],
    isCompleted: false,
    stats: [ { ...emptyStats }, { ...emptyStats } ],
  };
}
