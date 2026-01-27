// ==========================================
// STREAK INDICATOR COMPONENT
// ==========================================

import './StreakIndicator.css';

interface StreakIndicatorProps {
    streak: number;
}

export function StreakIndicator({ streak }: StreakIndicatorProps) {
    if (streak === 0) {
        return null;
    }

    const isWinStreak = streak > 0;
    const absStreak = Math.abs(streak);
    const intensity = Math.min(absStreak, 5); // Cap visual intensity at 5

    return (
        <div
            className={`streak-indicator streak-indicator--${isWinStreak ? 'win' : 'lose'}`}
            style={{ '--intensity': intensity } as React.CSSProperties}
        >
            <div className="streak-indicator__icon">
                {isWinStreak ? '🔥' : '❄️'}
            </div>
            <div className="streak-indicator__info">
                <span className="streak-indicator__count">{absStreak}</span>
                <span className="streak-indicator__label">
                    {isWinStreak ? 'Win Streak' : 'Lose Streak'}
                </span>
            </div>
            {isWinStreak && absStreak >= 3 && (
                <div className="streak-indicator__bonus">
                    +{absStreak >= 5 ? 10 : 5} LP Bonus
                </div>
            )}
            {!isWinStreak && absStreak >= 3 && (
                <div className="streak-indicator__penalty">
                    {absStreak >= 5 ? -10 : -5} LP Tilt
                </div>
            )}
        </div>
    );
}
