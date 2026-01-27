// ==========================================
// LIFE RANKED SYSTEM - RANK ENGINE
// ==========================================

import { Rank, RankConfig, RadiantLevel, Skill, LpChangeEvent } from '../types';

// Rank configurations ordered from lowest to highest
export const RANK_CONFIGS: RankConfig[] = [
    { rank: 'iron', name: 'Iron', nameEs: 'Hierro', minHours: 0, divisions: 3, lpPerDivision: 100, color: '#5a5a5a', glowColor: '#7a7a7a' },
    { rank: 'bronze', name: 'Bronze', nameEs: 'Bronce', minHours: 20, divisions: 3, lpPerDivision: 100, color: '#cd7f32', glowColor: '#da9655' },
    { rank: 'silver', name: 'Silver', nameEs: 'Plata', minHours: 60, divisions: 3, lpPerDivision: 100, color: '#c0c0c0', glowColor: '#e8e8e8' },
    { rank: 'gold', name: 'Gold', nameEs: 'Oro', minHours: 120, divisions: 3, lpPerDivision: 100, color: '#ffd700', glowColor: '#ffe55c' },
    { rank: 'platinum', name: 'Platinum', nameEs: 'Platino', minHours: 200, divisions: 3, lpPerDivision: 100, color: '#00cec9', glowColor: '#55efc4' },
    { rank: 'diamond', name: 'Diamond', nameEs: 'Diamante', minHours: 280, divisions: 3, lpPerDivision: 100, color: '#a855f7', glowColor: '#c084fc' },
    { rank: 'immortal1', name: 'Immortal 1', nameEs: 'Inmortal 1', minHours: 350, divisions: 1, lpPerDivision: 100, color: '#ef4444', glowColor: '#f87171' },
    { rank: 'immortal2', name: 'Immortal 2', nameEs: 'Inmortal 2', minHours: 380, divisions: 1, lpPerDivision: 100, color: '#dc2626', glowColor: '#ef4444' },
    { rank: 'immortal3', name: 'Immortal 3', nameEs: 'Inmortal 3', minHours: 400, divisions: 1, lpPerDivision: 100, color: '#b91c1c', glowColor: '#dc2626' },
    { rank: 'radiant', name: 'Radiant', nameEs: 'Radiante', minHours: 450, divisions: 1, lpPerDivision: 200, color: '#ffe55c', glowColor: '#fff9c4' },
];

// Radiant internal thresholds (exponential scaling)
export const RADIANT_THRESHOLDS: { level: RadiantLevel; minLp: number; name: string; hours: number }[] = [
    { level: 'low', minLp: 0, name: 'Radiante Bajo', hours: 550 },
    { level: 'mid', minLp: 200, name: 'Radiante Medio', hours: 650 },
    { level: 'high', minLp: 500, name: 'Radiante Alto', hours: 800 },
    { level: 'elite', minLp: 1000, name: 'Radiante Élite', hours: 900 },
    { level: 'peak', minLp: 2000, name: 'Radiante #1', hours: 1000 },
];

// LP constants
export const LP_WIN = 20;
export const LP_LOSS = -20;
export const LP_ABANDON = -30;

// Get rank config by rank type
export function getRankConfig(rank: Rank): RankConfig {
    return RANK_CONFIGS.find(r => r.rank === rank) || RANK_CONFIGS[0];
}

// Get rank index (for comparison)
export function getRankIndex(rank: Rank): number {
    return RANK_CONFIGS.findIndex(r => r.rank === rank);
}

// Get radiant level from internal LP
export function getRadiantLevel(radiantLp: number): RadiantLevel {
    for (let i = RADIANT_THRESHOLDS.length - 1; i >= 0; i--) {
        if (radiantLp >= RADIANT_THRESHOLDS[i].minLp) {
            return RADIANT_THRESHOLDS[i].level;
        }
    }
    return 'low';
}

// Get radiant level name
export function getRadiantLevelName(level: RadiantLevel): string {
    return RADIANT_THRESHOLDS.find(t => t.level === level)?.name || 'Radiante';
}

// Calculate streak bonus/penalty
export function getStreakModifier(streak: number): number {
    if (streak >= 5) return 10;  // +10 bonus for 5+ win streak
    if (streak >= 3) return 5;   // +5 bonus for 3-4 win streak
    if (streak <= -5) return -10; // -10 penalty for 5+ loss streak (tilt)
    if (streak <= -3) return -5;  // -5 penalty for 3-4 loss streak
    return 0;
}

// Format hours from minutes
export function formatHours(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

// Get full rank display name
export function getRankDisplayName(rank: Rank, division: number, radiantLevel?: RadiantLevel): string {
    const config = getRankConfig(rank);

    if (rank === 'radiant' && radiantLevel) {
        return getRadiantLevelName(radiantLevel);
    }

    if (config.divisions === 1) {
        return config.nameEs;
    }

    return `${config.nameEs} ${division}`;
}

// Calculate Hidden MMR (Quality Hours)
// Uses an exponential decay for early hours (fast learning) and logarithmic clamping for late hours (diminishing returns)
// Then applies a WinRate multiplier to determine "Quality"
export function calculateMMR(skill: Skill): number {
    const hours = skill.totalMinutes / 60;

    // Win Rate Multiplier: 50% WR = 1x. 100% WR = 1.5x. 0% WR = 0.5x.
    // This rewards quality practice.
    const totalGames = skill.wins + skill.losses + skill.abandons;
    let wrMultiplier = 1;

    if (totalGames > 0) {
        const winRate = skill.wins / totalGames;
        wrMultiplier = 0.5 + (winRate); // Maps 0.0->0.5, 0.5->1.0, 1.0->1.5
    }

    // Base MMR is hours * multiplier
    // This maps conceptually to the "Estimated Effective Hours"
    return hours * wrMultiplier;
}

// Calculate Base LP based on duration (Gaussian Distribution)
// Peak optimal flow state: ~45 mins. Max LP: 30.
// Penalizes too short (<10m) and too long (>90m) sessions.
export function calculateBaseLp(minutes: number): number {
    if (minutes < 5) return 0; // Minimum 5 mins to score

    // Gaussian Parameters
    const maxLp = 30;
    const optimalDuration = 45; // Center of the bell curve
    const tolerance = 25;       // Standard deviation controls the width

    // Formula: Max * e^( -0.5 * ((x - center) / tolerance)^2 )
    const exponent = -0.5 * Math.pow((minutes - optimalDuration) / tolerance, 2);
    const lp = maxLp * Math.exp(exponent);

    return Math.max(1, Math.round(lp));
}

// Calculate LP change for a block result
export function calculateLpChange(
    skill: Skill,
    result: 'win' | 'loss' | 'abandon',
    durationMinutes: number
): LpChangeEvent {
    let baseChange = 0;
    let newStreak = skill.currentStreak;

    const potentialLp = calculateBaseLp(durationMinutes);

    switch (result) {
        case 'win':
            baseChange = potentialLp;
            newStreak = skill.currentStreak >= 0 ? skill.currentStreak + 1 : 1;
            break;
        case 'loss':
            baseChange = -potentialLp; // Symmetry in risk/reward
            newStreak = skill.currentStreak <= 0 ? skill.currentStreak - 1 : -1;
            break;
        case 'abandon':
            // Abandon is worse than loss, maybe 1.5x penalty?
            baseChange = -Math.floor(potentialLp * 1.5);
            // Minimum penalty of -30 regardless of time if standard abandon logic applies?
            // Or just scale it. Let's scale it.
            if (baseChange === 0) baseChange = -5; // Minimum penalty for abandon
            newStreak = skill.currentStreak <= 0 ? skill.currentStreak - 1 : -1;
            break;
    }

    const streakBonus = result === 'win' ? getStreakModifier(newStreak) : 0;
    const streakPenalty = result !== 'win' ? getStreakModifier(newStreak) : 0;

    let totalChange = baseChange + streakBonus + streakPenalty;

    // Check for promotion protection
    if (result !== 'win' && skill.protectedPromotion) {
        totalChange = 0;
    }

    const oldLp = skill.lp;
    let newLp = skill.lp + totalChange;
    let newRank = skill.rank;
    let newDivision = skill.division;
    let promotion = false;
    let demotion = false;

    // Handle promotion
    if (newLp >= 100) {
        const config = getRankConfig(skill.rank);

        if (skill.division < config.divisions) {
            // Move up a division
            newDivision = skill.division + 1;
            newLp = newLp - 100;
            promotion = true;
        } else {
            // Move up a rank
            const currentIndex = getRankIndex(skill.rank);
            if (currentIndex < RANK_CONFIGS.length - 1) {
                newRank = RANK_CONFIGS[currentIndex + 1].rank;
                newDivision = 1;
                newLp = newLp - 100;
                promotion = true;
            } else {
                // Already Radiant, use internal LP
                newLp = Math.min(newLp, 100);
            }
        }
    }

    if (newLp < 0) {
        // const config = getRankConfig(skill.rank); // Unused

        if (skill.division > 1) {
            // Move down a division
            newDivision = skill.division - 1;
            newLp = 100 + newLp; // newLp is negative
            demotion = true;
        } else {
            // Move down a rank
            const currentIndex = getRankIndex(skill.rank);
            if (currentIndex > 0) {
                newRank = RANK_CONFIGS[currentIndex - 1].rank;
                const newConfig = getRankConfig(newRank);
                newDivision = newConfig.divisions;
                newLp = 100 + newLp; // newLp is negative
                demotion = true;
            } else {
                // Already Iron 1, can't go lower
                newLp = 0;
            }
        }
    }

    return {
        type: result,
        amount: baseChange,
        bonusAmount: streakBonus + streakPenalty,
        oldLp,
        newLp,
        promotion,
        demotion,
        newRank: promotion || demotion ? newRank : undefined,
        newDivision: promotion || demotion ? newDivision : undefined,
    };
}

// Apply LP change to skill
export function applyLpChange(skill: Skill, result: 'win' | 'loss' | 'abandon', blockDuration: number): {
    updatedSkill: Skill;
    event: LpChangeEvent;
} {
    const event = calculateLpChange(skill, result, blockDuration);

    let newStreak = skill.currentStreak;
    if (result === 'win') {
        newStreak = skill.currentStreak >= 0 ? skill.currentStreak + 1 : 1;
    } else {
        newStreak = skill.currentStreak <= 0 ? skill.currentStreak - 1 : -1;
    }

    const updatedSkill: Skill = {
        ...skill,
        lp: event.newLp,
        rank: event.newRank || skill.rank,
        division: event.newDivision || skill.division,
        totalMinutes: skill.totalMinutes + blockDuration,
        totalBlocks: skill.totalBlocks + 1,
        wins: result === 'win' ? skill.wins + 1 : skill.wins,
        losses: result === 'loss' ? skill.losses + 1 : skill.losses,
        abandons: result === 'abandon' ? skill.abandons + 1 : skill.abandons,
        currentStreak: newStreak,
        bestStreak: Math.max(skill.bestStreak, newStreak),
        worstStreak: Math.min(skill.worstStreak, newStreak),
        protectedPromotion: event.promotion ? true : (result !== 'win' ? false : skill.protectedPromotion),
    };

    // Update peak rank if promoted to higher rank
    if (event.promotion && event.newRank) {
        const currentPeakIndex = getRankIndex(skill.peakRank);
        const newRankIndex = getRankIndex(event.newRank);
        if (newRankIndex > currentPeakIndex ||
            (newRankIndex === currentPeakIndex && (event.newDivision || 1) > skill.peakDivision)) {
            updatedSkill.peakRank = event.newRank;
            updatedSkill.peakDivision = event.newDivision || 1;
        }
    }

    return { updatedSkill, event };
}

// Create a new skill with default values
export function createSkill(name: string, icon: string, color: string): Skill {
    const now = new Date().toISOString();
    return {
        id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        icon,
        color,
        lp: 0,
        rank: 'iron',
        division: 1,
        totalMinutes: 0,
        totalBlocks: 0,
        wins: 0,
        losses: 0,
        abandons: 0,
        currentStreak: 0,
        bestStreak: 0,
        worstStreak: 0,
        peakRank: 'iron',
        peakDivision: 1,
        history: [],
        protectedPromotion: false,
        createdAt: now,
    };
}

// Calculate win rate percentage
export function calculateWinRate(wins: number, losses: number, abandons: number): number {
    const total = wins + losses + abandons;
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
}
