// ==========================================
// LIFE RANKED SYSTEM - RANK ENGINE
// ==========================================

import { Rank, RankConfig, RadiantLevel, Skill, LpChangeEvent } from '../types';

// Rank configurations ordered from lowest to highest
export const RANK_CONFIGS: RankConfig[] = [
    { rank: 'iron', name: 'Iron', nameEs: 'Hierro', minHours: 0, divisions: 3, lpPerDivision: 100, color: '#5a5a5a', glowColor: '#7a7a7a' },
    { rank: 'bronze', name: 'Bronze', nameEs: 'Bronce', minHours: 15, divisions: 3, lpPerDivision: 100, color: '#cd7f32', glowColor: '#da9655' },
    { rank: 'silver', name: 'Silver', nameEs: 'Plata', minHours: 35, divisions: 3, lpPerDivision: 100, color: '#c0c0c0', glowColor: '#e8e8e8' },
    { rank: 'gold', name: 'Gold', nameEs: 'Oro', minHours: 65, divisions: 3, lpPerDivision: 100, color: '#ffd700', glowColor: '#ffe55c' },
    { rank: 'platinum', name: 'Platinum', nameEs: 'Platino', minHours: 105, divisions: 3, lpPerDivision: 100, color: '#00cec9', glowColor: '#55efc4' },
    { rank: 'diamond', name: 'Diamond', nameEs: 'Diamante', minHours: 160, divisions: 3, lpPerDivision: 100, color: '#a855f7', glowColor: '#c084fc' },
    { rank: 'immortal1', name: 'Immortal 1', nameEs: 'Inmortal 1', minHours: 230, divisions: 1, lpPerDivision: 100, color: '#ef4444', glowColor: '#f87171' },
    { rank: 'immortal2', name: 'Immortal 2', nameEs: 'Inmortal 2', minHours: 310, divisions: 1, lpPerDivision: 100, color: '#dc2626', glowColor: '#ef4444' },
    { rank: 'immortal3', name: 'Immortal 3', nameEs: 'Inmortal 3', minHours: 400, divisions: 1, lpPerDivision: 100, color: '#b91c1c', glowColor: '#dc2626' },
    { rank: 'radiant', name: 'Radiant', nameEs: 'Radiante', minHours: 550, divisions: 1, lpPerDivision: 200, color: '#ffe55c', glowColor: '#fff9c4' },
];

// Radiant internal thresholds (exponential scaling)
export const RADIANT_THRESHOLDS: { level: RadiantLevel; minLp: number; name: string }[] = [
    { level: 'low', minLp: 0, name: 'Radiante Bajo' },
    { level: 'mid', minLp: 200, name: 'Radiante Medio' },
    { level: 'high', minLp: 500, name: 'Radiante Alto' },
    { level: 'elite', minLp: 1000, name: 'Radiante Élite' },
    { level: 'peak', minLp: 2000, name: 'Radiante #1' },
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

// Calculate LP change for a block result
export function calculateLpChange(
    skill: Skill,
    result: 'win' | 'loss' | 'abandon'
): LpChangeEvent {
    let baseChange = 0;
    let newStreak = skill.currentStreak;

    switch (result) {
        case 'win':
            baseChange = LP_WIN;
            newStreak = skill.currentStreak >= 0 ? skill.currentStreak + 1 : 1;
            break;
        case 'loss':
            baseChange = LP_LOSS;
            newStreak = skill.currentStreak <= 0 ? skill.currentStreak - 1 : -1;
            break;
        case 'abandon':
            baseChange = LP_ABANDON;
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

    // Handle demotion
    if (newLp < 0) {
        const config = getRankConfig(skill.rank);

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
    const event = calculateLpChange(skill, result);

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
