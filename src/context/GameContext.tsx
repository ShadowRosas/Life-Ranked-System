// ==========================================
// LIFE RANKED SYSTEM - GAME CONTEXT
// ==========================================

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { PlayerState, Skill, BlockResult } from '../types';
import { loadPlayerState, savePlayerState, generateId, shouldStartNewSeason, applySeasonReset } from '../lib/storage';
import { applyLpChange, createSkill } from '../lib/rankSystem';
import { audio } from '../lib/audio';

const API_URL = 'http://localhost:5000/api';

// Action types
type GameAction =
    | { type: 'LOAD_STATE'; payload: PlayerState }
    | { type: 'ADD_SKILL'; payload: { name: string; icon: string; color: string; initialRank?: string } }
    | { type: 'DELETE_SKILL'; payload: string }
    | { type: 'START_BLOCK'; payload: { skillId: string } }
    | { type: 'END_BLOCK'; payload: { result: 'win' | 'loss' | 'abandon'; notes?: string } }
    | { type: 'CANCEL_BLOCK' }
    | { type: 'UPDATE_SETTINGS'; payload: Partial<PlayerState['settings']> }
    | { type: 'CHECK_SEASON' };

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
    }

    switch (action.type) {
        case 'LOAD_STATE':
            return action.payload;

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

        case 'DELETE_SKILL':
            return {
                ...state,
                skills: state.skills.filter(s => s.id !== action.payload),
            };

        case 'START_BLOCK': {
            const now = new Date().toISOString();
            return {
                ...state,
                activeBlockId: generateId('block'),
                activeSkillId: action.payload.skillId,
                activeBlockStartTime: now,
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
            const duration = Math.round((now.getTime() - startTime.getTime()) / (1000 * 60));

            const { updatedSkill, event } = applyLpChange(skill, action.payload.result, duration);

            if (event.promotion) audio.playRankUp();

            const blockResult: BlockResult = {
                id: state.activeBlockId,
                skillId: skill.id,
                startTime: state.activeBlockStartTime,
                endTime: now.toISOString(),
                duration,
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
            };
        }

        case 'CANCEL_BLOCK':
            return {
                ...state,
                activeBlockId: null,
                activeSkillId: null,
                activeBlockStartTime: null,
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
    startBlock: (skillId: string) => void;
    endBlock: (result: 'win' | 'loss' | 'abandon', notes?: string) => void;
    cancelBlock: () => void;
    getActiveSkill: () => Skill | undefined;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(gameReducer, loadPlayerState());

    // Init from Backend
    useEffect(() => {
        async function init() {
            const localState = loadPlayerState();
            try {
                const id = localState.id || generateId('player');
                // Simple fetch attempt
                const res = await fetch(`${API_URL}/player/${id}`);
                if (res.ok) {
                    const serverState = await res.json();
                    if (serverState && serverState.id) {
                        console.log('Using server state');
                        dispatch({ type: 'LOAD_STATE', payload: serverState });
                        return;
                    }
                }
            } catch (e) {
                console.warn('Backend unavailable, running in offline mode');
            }
            dispatch({ type: 'LOAD_STATE', payload: localState });
            dispatch({ type: 'CHECK_SEASON' });
        }
        init();
    }, []);

    // Sync to Backend
    useEffect(() => {
        savePlayerState(state); // Always save local

        // Sync remote
        fetch(`${API_URL}/player/${state.id}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state),
        }).catch(e => console.warn('Sync failed', e));

    }, [state]);

    const addSkill = (name: string, icon: string, color: string, initialRank?: string) => {
        dispatch({ type: 'ADD_SKILL', payload: { name, icon, color, initialRank } });
    };

    const deleteSkill = (id: string) => {
        dispatch({ type: 'DELETE_SKILL', payload: id });
    };

    const startBlock = (skillId: string) => {
        dispatch({ type: 'START_BLOCK', payload: { skillId } });
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
