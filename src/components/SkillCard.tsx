// ==========================================
// SKILL CARD COMPONENT
// ==========================================

import { Skill } from '../types';
import { RankBadge } from './RankBadge';
import { LPBar } from './LPBar';
import { StreakIndicator } from './StreakIndicator';
import { calculateWinRate, formatHours } from '../lib/rankSystem';
import './SkillCard.css';

interface SkillCardProps {
    skill: Skill;
    onClick?: () => void;
    showDetails?: boolean;
}

export function SkillCard({ skill, onClick, showDetails = true }: SkillCardProps) {
    const winRate = calculateWinRate(skill.wins, skill.losses, skill.abandons);
    const totalGames = skill.wins + skill.losses + skill.abandons;

    return (
        <div
            className="skill-card"
            onClick={onClick}
            style={{ '--skill-color': skill.color } as React.CSSProperties}
        >
            <div className="skill-card__header">
                <div className="skill-card__icon">{skill.icon}</div>
                <div className="skill-card__title">
                    <h3 className="skill-card__name">{skill.name}</h3>
                    <span className="skill-card__hours">
                        {formatHours(skill.totalMinutes)}
                    </span>
                </div>
            </div>

            <div className="skill-card__rank">
                <RankBadge
                    rank={skill.rank}
                    division={skill.division}
                    radiantLevel={skill.radiantLevel}
                    size="md"
                />
            </div>

            <div className="skill-card__lp">
                <LPBar currentLp={skill.lp} />
            </div>

            {showDetails && (
                <>
                    {skill.currentStreak !== 0 && (
                        <StreakIndicator streak={skill.currentStreak} />
                    )}

                    <div className="skill-card__stats">
                        <div className="skill-card__stat">
                            <span className="skill-card__stat-value skill-card__stat-value--win">
                                {skill.wins}
                            </span>
                            <span className="skill-card__stat-label">Wins</span>
                        </div>
                        <div className="skill-card__stat">
                            <span className="skill-card__stat-value skill-card__stat-value--loss">
                                {skill.losses}
                            </span>
                            <span className="skill-card__stat-label">Losses</span>
                        </div>
                        <div className="skill-card__stat">
                            <span className="skill-card__stat-value">{winRate}%</span>
                            <span className="skill-card__stat-label">Win Rate</span>
                        </div>
                        <div className="skill-card__stat">
                            <span className="skill-card__stat-value">{totalGames}</span>
                            <span className="skill-card__stat-label">Blocks</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
