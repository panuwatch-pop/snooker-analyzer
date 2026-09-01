export type GameMode = '15-reds' | '6-reds';

export type BallColor = 'red' | 'yellow' | 'green' | 'brown' | 'blue' | 'pink' | 'black';

export type LegalTarget = 
  | 'red' 
  | 'color' 
  | 'yellow' 
  | 'green' 
  | 'brown' 
  | 'blue' 
  | 'pink' 
  | 'black' 
  | 'game-over';

export interface BallInfo {
  color: BallColor;
  nameTh: string;
  nameEn: string;
  points: number;
  cssClass: string;
  numpadKey: string;
  regularKey: string;
}

export interface Shot {
  id: string;
  shotNumber: number;
  timestamp: string;
  shotTimeSec: number;
  playerIndex: 0 | 1;
  action: 'pot' | 'foul' | 'miss' | 'end-turn' | 'safety';
  ballPotted?: BallColor;
  points: number;
  redsRemainingBefore: number;
  redsRemainingAfter: number;
  legalTargetBefore: LegalTarget;
  legalTargetAfter: LegalTarget;
  visitNumber: number;
  ballsInVisit: number;
  visitBreakPoints: number;
  isBreakAttempt: boolean;
  concededOpportunity?: boolean;
  notes?: string;
}

export interface Visit {
  visitNumber: number;
  playerIndex: 0 | 1;
  shots: Shot[];
  pointsScored: number;
  ballsPotted: number;
  hadFoul: boolean;
  foulPointsGiven: number;
  totalTimeSec: number;
  endedWithOpportunityGiven: boolean;
}

export interface PlayerStats {
  totalPoints: number;
  potsAttempted: number;
  potsPotted: number;
  pottingAccuracy: number; // %
  totalVisits: number;
  breakVisits: number; // visits with >= 2 balls potted
  breakRate: number; // %
  breakTiers: {
    twoToFourBalls: number;
    twentyPlus: number;
    fiftyPlus: number;
    seventyPlus: number;
    centuryPlus: number;
  };
  highestBreak: number;
  foulsCount: number;
  foulPointsConceded: number;
  foulRate: number; // %
  errorsConceded: number; // visits ending leaving opponent immediate pot
  errorRate: number; // %
  totalShotTimeSec: number;
  averageShotTime: number; // AST in seconds
}

export interface Frame {
  id: string;
  frameNumber: number;
  startTime: number;
  endTime?: number;
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
  winnerIndex?: 0 | 1;
  stats: [PlayerStats, PlayerStats];
}

export type MatchLengthType = 'best-of' | 'unlimited';

export interface Match {
  id: string;
  date: string;
  title: string;
  player1Name: string;
  player2Name: string;
  gameMode: GameMode;
  matchLengthType: MatchLengthType;
  bestOfFrames: number; // 0 = unlimited / practice
  player1FramesWon: number;
  player2FramesWon: number;
  frames: Frame[];
  currentFrameIndex: number;
  isCompleted: boolean;
  winnerIndex?: 0 | 1;
  totalDurationSec: number;
  shotClockSeconds?: number;
}
