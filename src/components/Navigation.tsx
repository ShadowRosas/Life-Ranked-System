// ==========================================
// NAVIGATION COMPONENT
// ==========================================

import { NavLink } from 'react-router-dom';
import { Home, Clock, History, User, Plus, LogOut, BarChart2 } from 'lucide-react';
import { useGame } from '../context/GameContext'; // Import useGame
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import './Navigation.css';

export function Navigation() {
    const { logout } = useGame(); // Extract logout function
    const { t } = useLanguage();

    return (
        <nav className="navigation">
            <div className="navigation__brand">
                <span className="navigation__logo">⚔️</span>
                <span className="navigation__title">LIFE RANKED</span>
            </div>

            <div className="navigation__links">
                <NavLink to="/" className="navigation__link">
                    <Home size={20} />
                    <span>{t('nav_dashboard')}</span>
                </NavLink>
                <NavLink to="/stats" className="navigation__link">
                    <BarChart2 size={20} />
                    <span>Stats</span>
                </NavLink>
                <NavLink to="/history" className="navigation__link">
                    <History size={20} />
                    <span>{t('nav_history')}</span>
                </NavLink>
                <NavLink to="/profile" className="navigation__link">
                    <User size={20} />
                    <span>{t('nav_profile')}</span>
                </NavLink>
                <NavLink to="/skills" className="navigation__link">
                    <Plus size={20} />
                    <span>{t('nav_skills')}</span>
                </NavLink>
                <button className="navigation__link" onClick={logout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <LogOut size={20} />
                    <span>{t('nav_logout')}</span>
                </button>
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <LanguageToggle />
            </div>
        </nav>
    );
}
