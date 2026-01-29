// ==========================================
// LIFE RANKED SYSTEM - STORAGE LAYER
// ==========================================

import { PlayerState, PlayerSettings } from '../types';

const STORAGE_KEY = 'life_ranked_system_state';

// Default player settings
export const DEFAULT_SETTINGS: PlayerSettings = {
    blockDuration: 30,
    soundEnabled: true,
    notificationsEnabled: true,
};

// Create initial player state
export function createInitialState(): PlayerState {
    const now = new Date().toISOString();
    return {
        id: `player_${Date.now()}`,
        createdAt: now,
        currentSeason: 1,
        seasonStartDate: now,
        skills: [],
        areas: ['Programación', 'Salud', 'Estudio', 'Arte', 'Trabajo', 'Otros'],
        settings: DEFAULT_SETTINGS,
        activeBlockId: null,
        activeSkillId: null,
        activeBlockStartTime: null,
        activeBlockDuration: null,
    };
}

// Load player state from localStorage
export function loadPlayerState(): PlayerState {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const state = JSON.parse(stored) as PlayerState;
            // Migration: Ensure areas exist for legacy states
            if (!state.areas) {
                state.areas = ['Programación', 'Salud', 'Estudio', 'Arte', 'Trabajo', 'Otros'];
            }
            return state;
        }
    } catch (error) {
        console.error('Error loading player state:', error);
    }
    return createInitialState();
}

// Save player state to localStorage
export function savePlayerState(state: PlayerState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Error saving player state:', error);
    }
}

// Check if a new season should start (30 days)
export function shouldStartNewSeason(seasonStartDate: string): boolean {
    const start = new Date(seasonStartDate);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 30;
}

// Apply season reset (reduce LP by 20%)
export function applySeasonReset(state: PlayerState): PlayerState {
    const now = new Date().toISOString();

    return {
        ...state,
        currentSeason: state.currentSeason + 1,
        seasonStartDate: now,
        skills: state.skills.map(skill => ({
            ...skill,
            lp: Math.floor(skill.lp * 0.8), // 20% LP reduction
            currentStreak: 0, // Reset streaks
            protectedPromotion: false,
        })),
    };
}

// Generate unique ID
export function generateId(prefix: string = 'id'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
