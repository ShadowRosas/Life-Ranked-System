// ==========================================
// DASHBOARD PAGE
// ==========================================

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Target, Flame, Trophy } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { SkillCard } from '../components/SkillCard';
import { formatHours } from '../lib/rankSystem';
import './Dashboard.css';

export function Dashboard() {
    const { state } = useGame();
    const navigate = useNavigate();

    // Calculate total stats
    const totalHours = state.skills.reduce((sum, s) => sum + s.totalMinutes, 0);
    const totalWins = state.skills.reduce((sum, s) => sum + s.wins, 0);
    const totalLosses = state.skills.reduce((sum, s) => sum + s.losses, 0);
    const bestStreak = Math.max(...state.skills.map(s => s.bestStreak), 0);

    // Check if there's an active block
    if (state.activeBlockId && state.activeSkillId) {
        navigate('/active');
        return null;
    }

    return (
        <div className="dashboard page">
            <motion.div
                className="dashboard__header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="dashboard__welcome">
                    <h1>Life Ranked System</h1>
                    <p className="text-secondary">Temporada {state.currentSeason} • Tu camino al peak humano</p>
                </div>

                <div className="dashboard__stats">
                    <div className="dashboard__stat">
                        <Target size={24} />
                        <div>
                            <span className="dashboard__stat-value">{formatHours(totalHours)}</span>
                            <span className="dashboard__stat-label">Tiempo Total</span>
                        </div>
                    </div>
                    <div className="dashboard__stat">
                        <Trophy size={24} />
                        <div>
                            <span className="dashboard__stat-value dashboard__stat-value--win">{totalWins}</span>
                            <span className="dashboard__stat-label">Victorias</span>
                        </div>
                    </div>
                    <div className="dashboard__stat">
                        <Flame size={24} />
                        <div>
                            <span className="dashboard__stat-value dashboard__stat-value--streak">{bestStreak}</span>
                            <span className="dashboard__stat-label">Mejor Racha</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="dashboard__content">
                <div className="dashboard__section">
                    <div className="dashboard__section-header">
                        <h2>Tus Habilidades</h2>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/skills')}
                        >
                            <Play size={18} />
                            Gestionar Skills
                        </button>
                    </div>

                    {state.skills.length === 0 ? (
                        <motion.div
                            className="dashboard__empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="dashboard__empty-icon">🎯</div>
                            <h3>Sin habilidades aún</h3>
                            <p>Crea tu primera habilidad para comenzar a rankear</p>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => navigate('/skills')}
                            >
                                Crear Skill
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="dashboard__skills"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {state.skills.map((skill, index) => (
                                <motion.div
                                    key={skill.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <SkillCard
                                        skill={skill}
                                        onClick={() => navigate(`/start/${skill.id}`)}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>

            <motion.div
                className="dashboard__motto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                "No estoy motivado, estoy rankeando."
            </motion.div>
        </div>
    );
}
