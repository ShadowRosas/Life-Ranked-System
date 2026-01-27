// ==========================================
// START BLOCK SELECTION PAGE
// ==========================================

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, AlertTriangle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { calculateBaseLp } from '../lib/rankSystem';
import './StartBlock.css';

const DURATION_OPTIONS = [5, 10, 15, 25, 30, 45, 60, 70, 80, 90];

export function StartBlock() {
    const { skillId } = useParams();
    const navigate = useNavigate();
    const { state, startBlock } = useGame();
    const [selectedDuration, setSelectedDuration] = useState<number>(30); // Default 30 min

    const skill = state.skills.find(s => s.id === skillId);

    if (!skill) {
        return (
            <div className="page-center">
                <h2>Skill Not Found</h2>
                <button className="btn btn-secondary" onClick={() => navigate('/')}>
                    Return Home
                </button>
            </div>
        );
    }

    const handleStart = () => {
        startBlock(skill.id, selectedDuration);
        navigate('/active');
    };

    const potentialLp = calculateBaseLp(selectedDuration);

    return (
        <div className="start-block page">
            <motion.div
                className="start-block__header"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <button
                    className="btn-icon-only absolute-left"
                    onClick={() => navigate('/')}
                >
                    <ArrowLeft size={24} />
                </button>
                <h2>CONFIGURE MATCH</h2>
                <div className="start-block__skill">
                    <span>{skill.icon}</span>
                    <span>{skill.name}</span>
                </div>
            </motion.div>

            <motion.div
                className="duration-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                {DURATION_OPTIONS.map((duration) => {
                    const lp = calculateBaseLp(duration);
                    const isSelected = selectedDuration === duration;

                    return (
                        <div
                            key={duration}
                            className={`duration-card ${isSelected ? 'duration-card--selected' : ''}`}
                            onClick={() => setSelectedDuration(duration)}
                        >
                            <span className="duration-card__time">{duration}m</span>
                            <span className={`duration-card__lp ${lp > 0 ? 'duration-card__lp--positive' : 'duration-card__lp--zero'}`}>
                                {lp > 0 ? `+${lp} LP` : 'No LP'}
                            </span>
                        </div>
                    );
                })}
            </motion.div>

            <motion.div
                className="start-block__warning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex-center gap-sm mb-xs">
                    <AlertTriangle size={16} />
                    <strong>HIGH STAKES RANKED</strong>
                </div>
                <p>
                    Winning grants <strong>{potentialLp} LP</strong>. <br />
                    Optimal duration is between <strong>30-60 minutes</strong>.<br />
                    Longer is not always better. Focus is key.
                </p>
            </motion.div>

            <div className="start-block__footer">
                <button
                    className="btn btn-primary btn-lg pulse-animation"
                    onClick={handleStart}
                >
                    <Play size={20} />
                    START RANKED ({selectedDuration}m)
                </button>
            </div>
        </div>
    );
}
