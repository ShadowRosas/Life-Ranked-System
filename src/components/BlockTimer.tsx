// ==========================================
// BLOCK TIMER COMPONENT
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import './BlockTimer.css';

interface BlockTimerProps {
    durationMinutes: number;
    onComplete: () => void;
    onAbandon: () => void;
    skillName: string;
    skillIcon: string;
}

export function BlockTimer({
    durationMinutes,
    onComplete,
    onAbandon,
    skillName,
    skillIcon
}: BlockTimerProps) {
    const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);
    const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

    const totalSeconds = durationMinutes * 60;
    const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
    const isLowTime = remainingSeconds <= 60; // Last minute
    const isFinalCountdown = remainingSeconds <= 10;

    useEffect(() => {

        const interval = setInterval(() => {
            setRemainingSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [onComplete]);

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const handleAbandon = () => {
        if (showAbandonConfirm) {
            onAbandon();
        } else {
            setShowAbandonConfirm(true);
            setTimeout(() => setShowAbandonConfirm(false), 3000);
        }
    };

    return (
        <div className={`block-timer ${isLowTime ? 'block-timer--urgent' : ''}`}>
            <div className="block-timer__skill">
                <span className="block-timer__skill-icon">{skillIcon}</span>
                <span className="block-timer__skill-name">{skillName}</span>
            </div>

            <motion.div
                className="block-timer__display"
                animate={isFinalCountdown ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
            >
                <svg className="block-timer__circle" viewBox="0 0 200 200">
                    <circle
                        className="block-timer__track"
                        cx="100" cy="100" r="90"
                        fill="none"
                        strokeWidth="8"
                    />
                    <motion.circle
                        className="block-timer__progress"
                        cx="100" cy="100" r="90"
                        fill="none"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={565.48}
                        initial={{ strokeDashoffset: 565.48 }}
                        animate={{ strokeDashoffset: 565.48 - (progress / 100) * 565.48 }}
                        transition={{ duration: 0.5 }}
                    />
                </svg>

                <div className="block-timer__time">
                    {formatTime(remainingSeconds)}
                </div>
            </motion.div>

            <div className="block-timer__status">
                RANKED BLOCK ACTIVE
            </div>

            <div className="block-timer__controls">
                <div className="block-timer__controls-spacer"></div>

                <button
                    className={`btn ${showAbandonConfirm ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={handleAbandon}
                >
                    <X size={20} />
                    {showAbandonConfirm ? 'CONFIRM ABANDON (-30 LP)' : 'Abandon'}
                </button>
            </div>

            {isLowTime && (
                <motion.div
                    className="block-timer__warning"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    ⚡ FINAL PUSH - DON'T GIVE UP!
                </motion.div>
            )}
        </div>
    );
}
