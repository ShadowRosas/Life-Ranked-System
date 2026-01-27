// ==========================================
// RANK BADGE COMPONENT
// ==========================================

import { Rank, RadiantLevel } from '../types';
import { getRankConfig, getRankDisplayName } from '../lib/rankSystem';
import './RankBadge.css';

interface RankBadgeProps {
    rank: Rank;
    division: number;
    radiantLevel?: RadiantLevel;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

// Rank icons (simplified SVG representations)
const RANK_ICONS: Record<Rank, string> = {
    iron: '🔩',
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    diamond: '💠',
    immortal1: '🔥',
    immortal2: '🔥',
    immortal3: '🔥',
    radiant: '⭐',
};

export function RankBadge({
    rank,
    division,
    radiantLevel,
    size = 'md',
    showLabel = true
}: RankBadgeProps) {
    const config = getRankConfig(rank);
    const displayName = getRankDisplayName(rank, division, radiantLevel);

    return (
        <div
            className={`rank-badge rank-badge--${size} rank-badge--${rank}`}
            style={{
                '--rank-color': config.color,
                '--rank-glow': config.glowColor,
            } as React.CSSProperties}
        >
            <div className="rank-badge__icon">
                {RANK_ICONS[rank]}
            </div>
            {showLabel && (
                <div className="rank-badge__info">
                    <span className="rank-badge__name">{displayName}</span>
                </div>
            )}
        </div>
    );
}
