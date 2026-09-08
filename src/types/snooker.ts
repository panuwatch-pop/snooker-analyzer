export type GameMode = '15-reds' | '6-reds' | 'snooker-ga' | 'electric-count';

export type BallColor = 'red' | 'yellow' | 'green' | 'brown' | 'blue' | 'pink' | 'black';

export type PocketLocation = 
  | 'top-left' 
  | 'top-right' 
  | 'middle-left' 
  | 'middle-right' 
  | 'bottom-left' 
  | 'bottom-right' 
  | 'any';

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

export interface ElectricConfig {
  countMode: 'ball-only' | 'ball-plus-ga'; // 'ball-only' = 1 ball = 1 pt, 'ball-plus-ga' = count balls + ga bonus
  redPoints: number; // default 1
  yellowPoints: number; // default 1 or 2 or 4
  greenPoints: number; // default 1
  brownPoints: number; // default 1
  bluePoints: number; // default 1
  pinkPoints: number; // default 1
  blackPoints: number; // default 1 or 2 or 4
  lastBlackPoints: number; // default 2, 4, 7, 10
  foulPenalty: number; // default 1 or 4 or 7
  handicapEnabled: boolean;
  handicapGiverIndex: 0 | 1; // 0 = Player 1 gives handicap, 1 = Player 2 gives handicap
  handicapGiverRatio: number; // e.g. 80 means 100:80 (plays 100 pts -> counts 80 pts)
  handicapReceiverRatio: number; // 100
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
  rawPoints?: number;
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
  gaCount?: number;
  gaPenalty?: number;
  gaDeducted?: number;
  gaAwardedToOpponent?: number;
  pocket?: PocketLocation;
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
  gaEarned?: number;
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
  totalGa?: number;
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
  player1Ga?: number;
  player2Ga?: number;
  redsRemaining: number;
  legalTarget: LegalTarget;
  freeBallActive: boolean;
  shots: Shot[];
  visits: Visit[];
  isCompleted: boolean;
  winnerIndex?: 0 | 1;
  stats: [PlayerStats, PlayerStats];
  electricConfig?: ElectricConfig;
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
  player1Ga?: number;
  player2Ga?: number;
  frames: Frame[];
  currentFrameIndex: number;
  isCompleted: boolean;
  winnerIndex?: 0 | 1;
  totalDurationSec: number;
  shotClockSeconds?: number;
  electricConfig?: ElectricConfig;
}
