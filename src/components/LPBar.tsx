// ==========================================
// LP BAR COMPONENT
// ==========================================

import { motion } from 'framer-motion';
import './LPBar.css';

interface LPBarProps {
    currentLp: number;
    maxLp?: number;
    showLabel?: boolean;
    animated?: boolean;
}

export function LPBar({
    currentLp,
    maxLp = 100,
    showLabel = true,
    animated = true
}: LPBarProps) {
    const percentage = Math.min((currentLp / maxLp) * 100, 100);

    return (
        <div className="lp-bar">
            {showLabel && (
                <div className="lp-bar__label">
                    <span className="lp-bar__text">LP</span>
                    <span className="lp-bar__value">{currentLp} / {maxLp}</span>
                </div>
            )}
            <div className="lp-bar__track">
                <motion.div
                    className="lp-bar__fill"
                    initial={animated ? { width: 0 } : false}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <div className="lp-bar__glow" style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
