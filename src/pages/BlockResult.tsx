// ==========================================
// BLOCK RESULT PAGE (ANIMATION)
// ==========================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { LPAnimation } from '../components/LPAnimation';
import { RankBadge } from '../components/RankBadge';
import { getRankDisplayName, getStreakModifier } from '../lib/rankSystem';
import { motion, AnimatePresence } from 'framer-motion';
import './BlockResult.css';

export function BlockResult() {
    const { state } = useGame();
    const navigate = useNavigate();
    const [step, setStep] = useState<'lp' | 'rank' | 'summary'>('lp');

    // Get the most recent history item (the one just completed)
    // We need to find which skill was just updated.
    // Since we don't have the activeSkillId cleared yet in some flows or cleared in others,
    // we rely on finding the most recent history item across all skills.

    const allHistory = state.skills.flatMap(s => s.history).sort((a, b) =>
        new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
    );

    const lastResult = allHistory[0];

    useEffect(() => {
        if (!lastResult) {
            navigate('/');
        }
    }, [lastResult, navigate]);

    if (!lastResult) return null;

    const skill = state.skills.find(s => s.id === lastResult.skillId);
    if (!skill) return null;

    const isPromotion = lastResult.rankAfter !== lastResult.rankBefore ||
        lastResult.divisionAfter > lastResult.divisionBefore;

    const isDemotion = lastResult.rankAfter !== lastResult.rankBefore &&
        getRankDisplayName(lastResult.rankAfter, 1) !== getRankDisplayName(lastResult.rankBefore, 1);

    // Determine streak bonus from the LP change
    // We know Total = Base + Bonus. 
    // Base is 20, -20, or -30.
    let baseLP = 0;
    if (lastResult.result === 'win') baseLP = 20;
    else if (lastResult.result === 'loss') baseLP = -20;
    else baseLP = -30;

    const bonusLP = lastResult.lpChange - baseLP;

    const handleLpComplete = () => {
        if (isPromotion || isDemotion) {
            setStep('rank');
        } else {
            setStep('summary');
        }
    };

    return (
        <div className="block-result page">
            <div className="block-result__content">
                <AnimatePresence mode='wait'>
                    {step === 'lp' && (
                        <motion.div
                            key="lp"
                            className="block-result__section"
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <h2 className={`result-title result-title--${lastResult.result}`}>
                                {lastResult.result === 'win' ? 'VICTORY' : 'DEFEAT'}
                            </h2>

                            <LPAnimation
                                change={baseLP}
                                bonus={bonusLP}
                                type={lastResult.result}
                                onComplete={handleLpComplete}
                            />
                        </motion.div>
                    )}

                    {step === 'rank' && (
                        <motion.div
                            key="rank"
                            className="block-result__section"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onAnimationComplete={() => setTimeout(() => setStep('summary'), 3000)}
                        >
                            <h2 className="result-title result-title--rank">
                                {isPromotion ? 'RANK PROMOTION' : 'RANK UPDATE'}
                            </h2>

                            <div className="rank-reveal">
                                <RankBadge
                                    rank={lastResult.rankAfter}
                                    division={lastResult.divisionAfter}
                                    size="lg"
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 'summary' && (
                        <motion.div
                            key="summary"
                            className="block-result__section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="result-summary">
                                <div className="result-summary__header">
                                    <RankBadge
                                        rank={lastResult.rankAfter}
                                        division={lastResult.divisionAfter}
                                    />
                                    <div className="result-summary__lp">
                                        {skill.lp} / 100 LP
                                    </div>
                                </div>

                                <div className="result-summary__stats">
                                    <div className="summary-stat">
                                        <span className="summary-stat__label">Duration</span>
                                        <span className="summary-stat__value">{lastResult.duration}m</span>
                                    </div>
                                    <div className="summary-stat">
                                        <span className="summary-stat__label">Streak</span>
                                        <span className="summary-stat__value">{skill.currentStreak}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary btn-lg mt-lg"
                                    onClick={() => navigate('/')}
                                >
                                    CONTINUE
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
