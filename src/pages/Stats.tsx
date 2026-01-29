// ==========================================
// STATISTICS PAGE (Tracker.gg Style)
// ==========================================

import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { formatHours, getRankDisplayName } from '../lib/rankSystem';
import { Clock, Trophy, Target } from 'lucide-react';
import './Stats.css';

export function Stats() {
    const { state } = useGame();
    const { t } = useLanguage();
    const [selectedArea, setSelectedArea] = React.useState<string>('All');
    const [selectedSkill, setSelectedSkill] = React.useState<string>('All');

    // Areas List
    const areas = useMemo(() => ['All', ...state.areas], [state.areas]);

    // Skills List (filtered by selected Area if not All)
    const skillsList = useMemo(() => {
        if (selectedArea === 'All') return [{ id: 'All', name: 'All' }, ...state.skills];
        return [{ id: 'All', name: 'All' }, ...state.skills.filter(s => s.area === selectedArea)];
    }, [state.skills, selectedArea]);

    // Reset formatted skill if area changes
    React.useEffect(() => {
        setSelectedSkill('All');
    }, [selectedArea]);

    // Flatten history from all skills into a single list
    // Filtered Skills
    const filteredSkills = useMemo(() => {
        let skills = state.skills;
        if (selectedArea !== 'All') {
            skills = skills.filter(s => s.area === selectedArea);
        }
        if (selectedSkill !== 'All') {
            skills = skills.filter(s => s.id === selectedSkill);
        }
        return skills;
    }, [state.skills, selectedArea, selectedSkill]);

    // Flatten history based on filtered skills
    const matchHistory = useMemo(() => {
        const allHistory = filteredSkills.flatMap(skill =>
            skill.history.map(entry => ({
                ...entry,
                skillName: skill.name,
                skillIcon: skill.icon,
                area: skill.area,
            }))
        );
        // Sort by most recent
        return allHistory.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
    }, [filteredSkills]);

    // Calculate aggregated stats (based on filtered skills)
    const totalSessions = matchHistory.length;
    const totalPlayTime = filteredSkills.reduce((sum, s) => sum + s.totalMinutes, 0); // Note: totalMinutes on skill is lifetime. If we want history-based filter, we should sum from matchHistory duration, but skill.totalMinutes is more accurate for total practice time of that skill. Since we filter selected Skill, this sums selected skill(s) total minutes.
    const globalWinRate = (() => {
        const wins = filteredSkills.reduce((sum, s) => sum + s.wins, 0);
        const losses = filteredSkills.reduce((sum, s) => sum + s.losses + s.abandons, 0);
        const total = wins + losses;
        return total > 0 ? Math.round((wins / total) * 100) : 0;
    })();

    return (
        <div className="stats-page page">
            <div className="container">
                <div className="stats-header mb-xl">
                    <div className="flex justify-between items-center flex-wrap gap-md">
                        <h1>{t('nav_stats') || 'STATISTICS'}</h1>
                        <div className="stats-filters">
                            <select
                                value={selectedArea}
                                onChange={(e) => setSelectedArea(e.target.value)}
                                className="filter-select"
                            >
                                {areas.map(area => <option key={area} value={area}>{area}</option>)}
                            </select>
                            <select
                                value={selectedSkill}
                                onChange={(e) => setSelectedSkill(e.target.value)}
                                className="filter-select"
                            >
                                {skillsList.map(skill => (
                                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="stats-overview">
                        <div className="overview-card">
                            <div className="overview-icon"><Clock /></div>
                            <div className="overview-data">
                                <span className="overview-value">{formatHours(totalPlayTime)}</span>
                                <span className="overview-label">Play Time</span>
                            </div>
                        </div>
                        <div className="overview-card">
                            <div className="overview-icon"><Target /></div>
                            <div className="overview-data">
                                <span className="overview-value">{totalSessions}</span>
                                <span className="overview-label">Matches</span>
                            </div>
                        </div>
                        <div className="overview-card">
                            <div className="overview-icon"><Trophy /></div>
                            <div className="overview-data">
                                <span className="overview-value">{globalWinRate}%</span>
                                <span className="overview-label">Win Rate</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stats-section mb-xl">
                    <h2>Active Skills Overview</h2>
                    <div className="table-responsive">
                        <table className="stats-table">
                            <thead>
                                <tr>
                                    <th>Skill</th>
                                    <th>Rank</th>
                                    <th>Area</th>
                                    <th className="text-right">Hours</th>
                                    <th className="text-right">Win Rate</th>
                                    <th className="text-right">Streak</th>
                                    <th className="text-right">LP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSkills.map(skill => {
                                    const games = skill.wins + skill.losses + skill.abandons;
                                    const wr = games > 0 ? Math.round((skill.wins / games) * 100) : 0;
                                    return (
                                        <tr key={skill.id}>
                                            <td className="cell-skill">
                                                <span className="cell-icon">{skill.icon}</span>
                                                <span className="cell-name">{skill.name}</span>
                                            </td>
                                            <td>
                                                <span className="rank-badge-sm" style={{ borderColor: skill.color, color: skill.color }}>
                                                    {getRankDisplayName(skill.rank, skill.division)}
                                                </span>
                                            </td>
                                            <td>{skill.area || '-'}</td>
                                            <td className="text-right">{formatHours(skill.totalMinutes)}</td>
                                            <td className={`text-right ${wr >= 50 ? 'text-success' : 'text-danger'}`}>{wr}%</td>
                                            <td className="text-right">{skill.currentStreak}</td>
                                            <td className="text-right">{skill.lp} LP</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="stats-section">
                    <h2>Match History</h2>
                    {matchHistory.length === 0 ? (
                        <p className="text-muted">No matches recorded yet.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="stats-table history-table">
                                <thead>
                                    <tr>
                                        <th>Result</th>
                                        <th>Skill</th>
                                        <th>Date</th>
                                        <th>Duration</th>
                                        <th className="text-right">LP Change</th>
                                        <th className="text-right">Rank</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matchHistory.map(match => (
                                        <tr key={match.id} className={`row-${match.result}`}>
                                            <td>
                                                <span className={`result-badge result-${match.result}`}>
                                                    {match.result.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="cell-skill">
                                                <span className="cell-icon">{match.skillIcon}</span>
                                                <span className="cell-name">{match.skillName}</span>
                                            </td>
                                            <td className="text-muted">
                                                {new Date(match.endTime).toLocaleDateString()}
                                            </td>
                                            <td>{match.duration}m</td>
                                            <td className={`text-right ${match.lpChange >= 0 ? 'text-success' : 'text-danger'}`}>
                                                {match.lpChange > 0 ? '+' : ''}{match.lpChange}
                                            </td>
                                            <td className="text-right">
                                                {getRankDisplayName(match.rankAfter, match.divisionAfter)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
