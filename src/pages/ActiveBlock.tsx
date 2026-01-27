// ==========================================
// ACTIVE BLOCK PAGE
// ==========================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { BlockTimer } from '../components/BlockTimer';
import './ActiveBlock.css';

export function ActiveBlock() {
    const { state, endBlock } = useGame();
    const navigate = useNavigate();

    const skill = state.skills.find(s => s.id === state.activeSkillId);

    useEffect(() => {
        // Redirect if no active block
        if (!state.activeBlockId || !skill) {
            navigate('/');
        }
    }, [state.activeBlockId, skill, navigate]);

    if (!skill) return null;

    const handleComplete = () => {
        // Navigate to result selection (User must confirm win/loss)
        // For now we'll simulate a win for testing flow, but in reality 
        // the timer ending just means the block is done, user must self-report Result
        navigate('/result-selection');
    };

    const handleAbandon = () => {
        endBlock('abandon');
        navigate('/result');
    };

    return (
        <div className="active-block page">
            <div className="active-block__overlay" />

            <div className="active-block__content">
                <div className="active-block__header">
                    <h2>RANKED MATCH IN PROGRESS</h2>
                    <p>FOCUS OR LOSE LP</p>
                </div>

                <BlockTimer
                    durationMinutes={state.activeBlockDuration || state.settings.blockDuration}
                    onComplete={handleComplete}
                    onAbandon={handleAbandon}
                    skillName={skill.name}
                    skillIcon={skill.icon}
                />

                <div className="active-block__rules">
                    <h3>RULES OF ENGAGEMENT</h3>
                    <ul>
                        <li>No distractions allowed</li>
                        <li>No social media checking</li>
                        <li>Full deep work intensity</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
