// ==========================================
// LIFE RANKED SYSTEM - GAME CONTEXT
// ==========================================

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { PlayerState, Skill, BlockResult } from '../types';
import { loadPlayerState, savePlayerState, generateId, shouldStartNewSeason, applySeasonReset, createInitialState } from '../lib/storage';
import { applyLpChange, createSkill } from '../lib/rankSystem';
import { audio } from '../lib/audio';

const API_URL = '/api';

// Action types
type GameAction =
    | { type: 'LOAD_STATE'; payload: PlayerState }
    | { type: 'ADD_SKILL'; payload: { name: string; icon: string; color: string; initialRank?: string } }
    | { type: 'DELETE_SKILL'; payload: string }
    | { type: 'START_BLOCK'; payload: { skillId: string; durationMinutes: number } }
    | { type: 'END_BLOCK'; payload: { result: 'win' | 'loss' | 'abandon'; notes?: string } }
    | { type: 'CANCEL_BLOCK' }
    | { type: 'UPDATE_SETTINGS'; payload: Partial<PlayerState['settings']> }
    | { type: 'CHECK_SEASON' }
    | { type: 'LOGIN_SUCCESS'; payload: PlayerState }
    | { type: 'LOGOUT' };

function gameReducer(state: PlayerState, action: GameAction): PlayerState {

    // Audio Feedback
    switch (action.type) {
        case 'START_BLOCK': audio.playStart(); break;
        case 'END_BLOCK':
            if (action.payload.result === 'win') audio.playWin();
            else if (action.payload.result === 'loss') audio.playLoss();
            break;
        case 'ADD_SKILL': audio.playHover(); break;
        case 'DELETE_SKILL': audio.playClick(); break;
        case 'CANCEL_BLOCK': audio.playClick(); break;
        case 'LOGIN_SUCCESS': audio.playWin(); break; // Nice sound on login
    }

    switch (action.type) {
        case 'LOAD_STATE':
            return action.payload;

        case 'LOGIN_SUCCESS':
            return action.payload;

        case 'LOGOUT':
            return createInitialState();

        case 'ADD_SKILL': {
            const newSkill = createSkill(
                action.payload.name,
                action.payload.icon,
                action.payload.color
            );

            // Handle Initial Rank
            if (action.payload.initialRank && action.payload.initialRank !== 'iron') {
                const rank = action.payload.initialRank as any;
                newSkill.rank = rank;
                newSkill.peakRank = rank;
                newSkill.lp = 50; // Start in middle of division

                // Add "Placed" history
                newSkill.history.push({
                    id: generateId('placed'),
                    skillId: newSkill.id,
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString(),
                    duration: 0,
                    result: 'win', // counts as a win for placement
                    lpChange: 0,
                    rankBefore: 'iron',
                    divisionBefore: 1,
                    rankAfter: rank,
                    divisionAfter: 1,
                    notes: 'Initial Placement'
                });
            }

            return {
                ...state,
                skills: [...state.skills, newSkill],
            };
        }

        case 'DELETE_SKILL': {
            const isActiveSkill = state.activeSkillId === action.payload;
            return {
                ...state,
                skills: state.skills.filter(s => s.id !== action.payload),
                activeBlockId: isActiveSkill ? null : state.activeBlockId,
                activeSkillId: isActiveSkill ? null : state.activeSkillId,
                activeBlockStartTime: isActiveSkill ? null : state.activeBlockStartTime,
                activeBlockDuration: isActiveSkill ? null : state.activeBlockDuration,
            };
        }

        case 'START_BLOCK': {
            const now = new Date().toISOString();
            return {
                ...state,
                activeBlockId: generateId('block'),
                activeSkillId: action.payload.skillId,
                activeBlockStartTime: now,
                activeBlockDuration: action.payload.durationMinutes,
            };
        }

        case 'END_BLOCK': {
            if (!state.activeBlockId || !state.activeSkillId || !state.activeBlockStartTime) {
                return state;
            }

            const skill = state.skills.find(s => s.id === state.activeSkillId);
            if (!skill) return state;

            const now = new Date();
            const startTime = new Date(state.activeBlockStartTime);

            // Calculate actual elapsed minutes for record
            const elapsedMinutes = Math.round((now.getTime() - startTime.getTime()) / (1000 * 60));

            // Use PLANNED duration for scoring calculation as per strictly enforced rules
            // If activeBlockDuration is null (legacy), fallback to settings or elapsed
            const targetDuration = state.activeBlockDuration || state.settings.blockDuration || elapsedMinutes;

            const { updatedSkill, event } = applyLpChange(skill, action.payload.result, targetDuration);

            if (event.promotion) audio.playRankUp();

            const blockResult: BlockResult = {
                id: state.activeBlockId,
                skillId: skill.id,
                startTime: state.activeBlockStartTime,
                endTime: now.toISOString(),
                duration: elapsedMinutes, // Record actual time spent
                result: action.payload.result,
                lpChange: event.amount + event.bonusAmount,
                rankBefore: skill.rank,
                divisionBefore: skill.division,
                rankAfter: updatedSkill.rank,
                divisionAfter: updatedSkill.division,
                notes: action.payload.notes,
            };

            return {
                ...state,
                skills: state.skills.map(s =>
                    s.id === skill.id
                        ? { ...updatedSkill, history: [blockResult, ...updatedSkill.history] }
                        : s
                ),
                activeBlockId: null,
                activeSkillId: null,
                activeBlockStartTime: null,
                activeBlockDuration: null,
            };
        }

        case 'CANCEL_BLOCK':
            return {
                ...state,
                activeBlockId: null,
                activeSkillId: null,
                activeBlockStartTime: null,
                activeBlockDuration: null,
            };

        case 'UPDATE_SETTINGS':
            return {
                ...state,
                settings: { ...state.settings, ...action.payload },
            };

        case 'CHECK_SEASON':
            if (shouldStartNewSeason(state.seasonStartDate)) {
                return applySeasonReset(state);
            }
            return state;

        default:
            return state;
    }
}

interface GameContextValue {
    state: PlayerState;
    dispatch: React.Dispatch<GameAction>;
    addSkill: (name: string, icon: string, color: string, initialRank?: string) => void;
    deleteSkill: (id: string) => void;
    startBlock: (skillId: string, durationMinutes: number) => void;
    endBlock: (result: 'win' | 'loss' | 'abandon', notes?: string) => void;
    cancelBlock: () => void;
    getActiveSkill: () => Skill | undefined;
    login: (token: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(gameReducer, loadPlayerState());

    // Init Logic (Simplified: Use local first, auth will overwrite)
    useEffect(() => {
        dispatch({ type: 'CHECK_SEASON' });
    }, []);

    // Sync to Backend
    useEffect(() => {
        if (state.id) {
            savePlayerState(state); // Always save local

            // Sync remote only if we have an ID (we always do)
            fetch(`${API_URL}/player/${state.id}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state),
            }).catch(e => console.warn('Sync failed', e));
        }
    }, [state]);

    const addSkill = (name: string, icon: string, color: string, initialRank?: string) => {
        dispatch({ type: 'ADD_SKILL', payload: { name, icon, color, initialRank } });
    };

    const deleteSkill = (id: string) => {
        dispatch({ type: 'DELETE_SKILL', payload: id });
    };

    const startBlock = (skillId: string, durationMinutes: number) => {
        dispatch({ type: 'START_BLOCK', payload: { skillId, durationMinutes } });
    };

    const endBlock = (result: 'win' | 'loss' | 'abandon', notes?: string) => {
        dispatch({ type: 'END_BLOCK', payload: { result, notes } });
    };

    const cancelBlock = () => {
        dispatch({ type: 'CANCEL_BLOCK' });
    };

    const getActiveSkill = () => {
        return state.skills.find(s => s.id === state.activeSkillId);
    };

    const login = async (token: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            if (res.ok) {
                const playerState = await res.json();
                dispatch({ type: 'LOGIN_SUCCESS', payload: playerState });
                return true;
            }
            return false;
        } catch (e) {
            console.error('Login error', e);
            return false;
        }
    };

    const logout = () => {
        dispatch({ type: 'LOGOUT' });
        // Clear local storage manually if needed to force full reset
        localStorage.removeItem('life_ranked_system_state');
    };

    return (
        <GameContext.Provider
            value={{
                state,
                dispatch,
                addSkill,
                deleteSkill,
                startBlock,
                endBlock,
                cancelBlock,
                getActiveSkill,
                login,
                logout,
                isAuthenticated: !!state.googleId // Check if authenticated via Google
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

export function useGame(): GameContextValue {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
