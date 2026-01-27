// ==========================================
// DASHBOARD PAGE
// ==========================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Target, Flame, Trophy } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { SkillCard } from '../components/SkillCard';
import { formatHours } from '../lib/rankSystem';
import './Dashboard.css';

export function Dashboard() {
    const { state } = useGame();
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Calculate total stats
    const totalHours = state.skills.reduce((sum, s) => sum + s.totalMinutes, 0);
    const totalWins = state.skills.reduce((sum, s) => sum + s.wins, 0);
    const bestStreak = Math.max(...state.skills.map(s => s.bestStreak), 0);

    const activeSkill = state.skills.find(s => s.id === state.activeSkillId);

    // Redirect to active block if one is in progress
    React.useEffect(() => {
        if (state.activeBlockId && state.activeSkillId && activeSkill) {
            navigate('/active');
        }
    }, [state.activeBlockId, state.activeSkillId, activeSkill, navigate]);

    if (state.activeBlockId && state.activeSkillId && activeSkill) {
        return null;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } }
    };

    return (
        <div className="dashboard page">
            <motion.div
                className="dashboard__header"
                initial={{ opacity: 0, y: -50, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                style={{ perspective: 1000 }}
            >
                <div className="dashboard__welcome">
                    <motion.h1
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {t('dash_welcome')}
                    </motion.h1>
                    <p className="text-secondary">{t('dash_subtitle', { season: state.currentSeason })}</p>
                </div>

                <div className="dashboard__stats">
                    <motion.div
                        className="dashboard__stat"
                        whileHover={{ scale: 1.05, translateY: -5 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Target size={24} />
                        <div>
                            <span className="dashboard__stat-value">{formatHours(totalHours)}</span>
                            <span className="dashboard__stat-label">{t('dash_total_time')}</span>
                        </div>
                    </motion.div>
                    <motion.div
                        className="dashboard__stat"
                        whileHover={{ scale: 1.05, translateY: -5 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Trophy size={24} />
                        <div>
                            <span className="dashboard__stat-value dashboard__stat-value--win">{totalWins}</span>
                            <span className="dashboard__stat-label">{t('dash_wins')}</span>
                        </div>
                    </motion.div>
                    <motion.div
                        className="dashboard__stat"
                        whileHover={{ scale: 1.05, translateY: -5 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Flame size={24} />
                        <div>
                            <span className="dashboard__stat-value dashboard__stat-value--streak">{bestStreak}</span>
                            <span className="dashboard__stat-label">{t('dash_best_streak')}</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <div className="dashboard__content">
                <div className="dashboard__section">
                    <div className="dashboard__section-header">
                        <h2>{t('dash_skills_title')}</h2>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/skills')}
                        >
                            <Play size={18} />
                            {t('dash_manage_skills')}
                        </button>
                    </div>

                    {state.skills.length === 0 ? (
                        <motion.div
                            className="dashboard__empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="dashboard__empty-icon">🎯</div>
                            <h3>{t('dash_no_skills')}</h3>
                            <p>{t('dash_create_first')}</p>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => navigate('/skills')}
                            >
                                {t('dash_create_btn')}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="dashboard__skills"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                        >
                            {state.skills.map((skill) => (
                                <motion.div
                                    key={skill.id}
                                    variants={itemVariants}
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
                transition={{ delay: 1 }}
            >
                {t('dash_motto')}
            </motion.div>
        </div>
    );
}
