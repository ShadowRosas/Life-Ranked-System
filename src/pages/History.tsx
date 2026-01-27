// ==========================================
// HISTORY PAGE
// ==========================================

import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { RankBadge } from '../components/RankBadge';
import { getRankConfig, formatHours } from '../lib/rankSystem';
import './History.css';

export function History() {
    const { state } = useGame();
    const [filterSkillId, setFilterSkillId] = useState<string>('all');

    // Combine all history from all skills
    const allHistory = state.skills.flatMap(s =>
        s.history.map(h => ({ ...h, skillName: s.name, skillIcon: s.icon }))
    ).sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());

    const filteredHistory = filterSkillId === 'all'
        ? allHistory
        : allHistory.filter(h => h.skillId === filterSkillId);

    return (
        <div className="history page">
            <div className="container">
                <div className="history__header">
                    <h1>MATCH HISTORY</h1>

                    <div className="history__filters">
                        <select
                            value={filterSkillId}
                            onChange={(e) => setFilterSkillId(e.target.value)}
                            className="history__filter"
                        >
                            <option value="all">All Skills</option>
                            {state.skills.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="history__list">
                    {filteredHistory.length === 0 ? (
                        <div className="history__empty">
                            <p>No matches recorded yet.</p>
                        </div>
                    ) : (
                        filteredHistory.map(match => (
                            <div key={match.id} className={`history-item history-item--${match.result}`}>
                                <div className="history-item__main">
                                    <div className="history-item__icon">{match.skillIcon}</div>
                                    <div className="history-item__info">
                                        <span className="history-item__skill">{match.skillName}</span>
                                        <span className="history-item__date">
                                            {new Date(match.endTime).toLocaleDateString()} • {new Date(match.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="history-item__stats">
                                    <div className="history-item__stat">
                                        <span>{match.duration}m</span>
                                    </div>

                                    <div className="history-item__rank">
                                        <RankBadge
                                            rank={match.rankAfter}
                                            division={match.divisionAfter}
                                            size="sm"
                                            showLabel={false}
                                        />
                                    </div>

                                    <div className={`history-item__lp history-item__lp--${match.lpChange >= 0 ? 'pos' : 'neg'}`}>
                                        {match.lpChange > 0 ? '+' : ''}{match.lpChange} LP
                                    </div>
                                </div>

                                <div className={`history-item__result history-item__result--${match.result}`}>
                                    {match.result === 'win' ? 'VICTORY' : match.result === 'abandon' ? 'ABANDON' : 'DEFEAT'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
