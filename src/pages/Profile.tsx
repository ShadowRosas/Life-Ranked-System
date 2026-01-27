// ==========================================
// PROFILE PAGE
// ==========================================

import { useGame } from '../context/GameContext';
import { RankBadge } from '../components/RankBadge';
import { formatHours, calculateWinRate } from '../lib/rankSystem';
import { Trophy, Clock, Target, Calendar } from 'lucide-react';
import './Profile.css';

export function Profile() {
    const { state } = useGame();

    // Calculate aggregate stats
    const totalHours = state.skills.reduce((sum, s) => sum + s.totalMinutes, 0);
    const totalWins = state.skills.reduce((sum, s) => sum + s.wins, 0);
    const totalLosses = state.skills.reduce((sum, s) => sum + s.losses, 0);
    const totalAbandons = state.skills.reduce((sum, s) => sum + s.abandons, 0);
    const totalBlocks = totalWins + totalLosses + totalAbandons;

    const winRate = calculateWinRate(totalWins, totalLosses, totalAbandons);

    // Find best skill
    const bestSkill = [...state.skills].sort((a, b) => b.lp - a.lp)[0]; // Simplified: just by LP, should check Rank first

    return (
        <div className="profile page">
            <div className="container">
                <div className="profile__header">
                    <div className="profile__avatar">
                        {state.id.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="profile__identity">
                        <h1>PLAYER 1</h1>
                        <p className="text-muted">Season {state.currentSeason} • Started {new Date(state.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="profile__grid">
                    <div className="profile__card profile__card--stats">
                        <h2>CAREER STATS</h2>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <Clock size={20} className="text-secondary" />
                                <span className="stat-item__value">{formatHours(totalHours)}</span>
                                <span className="stat-item__label">Play Time</span>
                            </div>
                            <div className="stat-item">
                                <Trophy size={20} className="text-secondary" />
                                <span className="stat-item__value">{totalWins}</span>
                                <span className="stat-item__label">Wins</span>
                            </div>
                            <div className="stat-item">
                                <Target size={20} className="text-secondary" />
                                <span className="stat-item__value">{winRate}%</span>
                                <span className="stat-item__label">Win Rate</span>
                            </div>
                            <div className="stat-item">
                                <Calendar size={20} className="text-secondary" />
                                <span className="stat-item__value">{totalBlocks}</span>
                                <span className="stat-item__label">Matches</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile__card profile__card--ranks">
                        <h2>HIGHEST RANKS</h2>
                        {state.skills.length === 0 ? (
                            <p className="text-muted">No ranked data available.</p>
                        ) : (
                            <div className="ranks-grid">
                                {state.skills.map(skill => (
                                    <div key={skill.id} className="rank-summary">
                                        <div className="rank-summary__icon">{skill.icon}</div>
                                        <div className="rank-summary__info">
                                            <span className="rank-summary__name">{skill.name}</span>
                                            <RankBadge
                                                rank={skill.peakRank}
                                                division={skill.peakDivision}
                                                size="sm"
                                            />
                                            <span className="rank-summary__peak">PEAK</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
