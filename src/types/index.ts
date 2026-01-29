// ==========================================
// LIFE RANKED SYSTEM - TYPES
// ==========================================

// Rank tiers from lowest to highest
export type Rank =
    | 'iron'
    | 'bronze'
    | 'silver'
    | 'gold'
    | 'platinum'
    | 'diamond'
    | 'immortal1'
    | 'immortal2'
    | 'immortal3'
    | 'radiant';

// Radiant internal levels (exponential progression)
export type RadiantLevel =
    | 'low'
    | 'mid'
    | 'high'
    | 'elite'
    | 'peak';

// Block result types
export type BlockResultType = 'win' | 'loss' | 'abandon';

// Individual block/match result
export interface BlockResult {
    id: string;
    skillId: string;
    startTime: string;
    endTime: string;
    duration: number; // in minutes
    result: BlockResultType;
    lpChange: number;
    rankBefore: Rank;
    divisionBefore: number;
    rankAfter: Rank;
    divisionAfter: number;
    notes?: string;
}

// Skill/ability that the user is practicing
export interface Skill {
    id: string;
    name: string;
    icon: string;
    description?: string;
    color: string;
    area?: string; // Grouping category (e.g. Health, Coding)
    lp: number; // 0-100 per division
    rank: Rank;
    division: number; // 1-3 for most ranks, 1 for immortal/radiant
    radiantLevel?: RadiantLevel; // only used when rank is 'radiant'
    radiantLp?: number; // internal LP within radiant (exponential)
    totalMinutes: number; // accumulated practice time
    totalBlocks: number;
    wins: number;
    losses: number;
    abandons: number;
    currentStreak: number; // positive = win streak, negative = lose streak
    bestStreak: number;
    worstStreak: number;
    peakRank: Rank;
    peakDivision: number;
    history: BlockResult[];
    protectedPromotion: boolean; // free loss after promotion
    mmr: number; // Hidden Matchmaking Rating (Quality Hours)
    initialRank?: Rank;
    placementMinutes: number; // Theoretical base hours for Area rank
    createdAt: string;
}

export interface SkillTemplate {
    name: string;
    icon: string;
    color: string;
    area?: string;
}

// Player/user state
export interface PlayerState {
    id: string;
    googleId?: string;
    email?: string;
    name?: string;
    picture?: string;
    createdAt: string;
    currentSeason: number;
    seasonStartDate: string;
    skills: Skill[];
    areas: string[]; // User defined areas for grouping
    settings: PlayerSettings;
    activeBlockId: string | null;
    activeSkillId: string | null;
    activeBlockStartTime: string | null;
    activeBlockDuration: number | null; // Planned duration in minutes
}

// User preferences
export interface PlayerSettings {
    blockDuration: number; // in minutes (default 30)
    soundEnabled: boolean;
    notificationsEnabled: boolean;
}

// Rank configuration
export interface RankConfig {
    rank: Rank;
    name: string;
    nameEs: string;
    minHours: number;
    divisions: number;
    lpPerDivision: number;
    color: string;
    glowColor: string;
}

// LP change event for animations
export interface LpChangeEvent {
    type: 'win' | 'loss' | 'abandon';
    amount: number;
    bonusAmount: number; // from streaks
    newLp: number;
    oldLp: number;
    promotion: boolean;
    demotion: boolean;
    newRank?: Rank;
    newDivision?: number;
}

// Active block state
export interface ActiveBlock {
    id: string;
    skillId: string;
    startTime: string;
    remainingSeconds: number;
    isPaused: boolean;
}

// Predefined skill templates
export interface SkillTemplate {
    name: string;
    icon: string;
    color: string;
}
