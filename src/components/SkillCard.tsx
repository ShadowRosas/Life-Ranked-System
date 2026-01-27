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

import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

export function SkillCard({ skill, onClick, showDetails = true }: SkillCardProps) {
    const winRate = calculateWinRate(skill.wins, skill.losses, skill.abandons);
    const totalGames = skill.wins + skill.losses + skill.abandons;

    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 30 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXVal = e.clientX - rect.left;
        const mouseYVal = e.clientY - rect.top;
        const xPct = mouseXVal / width - 0.5;
        const yPct = mouseYVal / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            className="skill-card"
            onClick={onClick}
            style={{
                '--skill-color': skill.color,
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: 1000
            } as any}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.05, z: 50 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
            <div className="skill-card__bg-glow" style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${skill.color}20, transparent 70%)`, opacity: 0, transition: 'opacity 0.3s' }} />

            <motion.div
                className="skill-card__header"
                style={{ transform: "translateZ(30px)" }}
            >
                <div className="skill-card__icon">{skill.icon}</div>
                <div className="skill-card__title">
                    <h3 className="skill-card__name">{skill.name}</h3>
                    <span className="skill-card__hours">
                        {formatHours(skill.totalMinutes)}
                    </span>
                </div>
            </motion.div>

            <motion.div
                className="skill-card__rank"
                style={{ transform: "translateZ(50px)" }}
            >
                <RankBadge
                    rank={skill.rank}
                    division={skill.division}
                    radiantLevel={skill.radiantLevel}
                    size="md"
                />
            </motion.div>

            <motion.div
                className="skill-card__lp"
                style={{ transform: "translateZ(20px)" }}
            >
                <LPBar currentLp={skill.lp} />
            </motion.div>

            {showDetails && (
                <>
                    {skill.currentStreak !== 0 && (
                        <div style={{ transform: "translateZ(40px)" }}>
                            <StreakIndicator streak={skill.currentStreak} />
                        </div>
                    )}

                    <motion.div
                        className="skill-card__stats"
                        style={{ transform: "translateZ(25px)" }}
                    >
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
                    </motion.div>
                </>
            )}
        </motion.div>
    );
}
