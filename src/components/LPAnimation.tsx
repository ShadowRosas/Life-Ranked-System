// ==========================================
// LP ANIMATION COMPONENT
// ==========================================

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LPAnimation.css';

interface LPAnimationProps {
    change: number;
    bonus?: number;
    type: 'win' | 'loss' | 'abandon';
    onComplete?: () => void;
}

export function LPAnimation({ change, bonus = 0, type, onComplete }: LPAnimationProps) {
    const [showBonus, setShowBonus] = useState(false);

    const isPositive = type === 'win';
    const totalChange = change + bonus;

    useEffect(() => {
        if (bonus !== 0) {
            const timer = setTimeout(() => setShowBonus(true), 500);
            return () => clearTimeout(timer);
        }
    }, [bonus]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete?.();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`lp-animation lp-animation--${type}`}>
            <AnimatePresence>
                <motion.div
                    className="lp-animation__main"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <span className="lp-animation__symbol">
                        {isPositive ? '+' : ''}
                    </span>
                    <span className="lp-animation__value">{change}</span>
                    <span className="lp-animation__label">LP</span>
                </motion.div>

                {showBonus && bonus !== 0 && (
                    <motion.div
                        className="lp-animation__bonus"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span>{bonus > 0 ? '+' : ''}{bonus} Streak Bonus</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="lp-animation__particles"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="lp-animation__particle"
                        initial={{
                            x: 0,
                            y: 0,
                            opacity: 1,
                            scale: 1
                        }}
                        animate={{
                            x: (Math.random() - 0.5) * 200,
                            y: isPositive ? -100 - Math.random() * 100 : 100 + Math.random() * 100,
                            opacity: 0,
                            scale: 0.5
                        }}
                        transition={{
                            duration: 1.5,
                            delay: i * 0.1,
                            ease: 'easeOut'
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
}
