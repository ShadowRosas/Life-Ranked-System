// ==========================================
// NAVIGATION COMPONENT
// ==========================================

import { NavLink } from 'react-router-dom';
import { Home, Clock, History, User, Plus } from 'lucide-react';
import './Navigation.css';

export function Navigation() {
    return (
        <nav className="navigation">
            <div className="navigation__brand">
                <span className="navigation__logo">⚔️</span>
                <span className="navigation__title">LIFE RANKED</span>
            </div>

            <div className="navigation__links">
                <NavLink to="/" className="navigation__link">
                    <Home size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/history" className="navigation__link">
                    <History size={20} />
                    <span>Historial</span>
                </NavLink>
                <NavLink to="/profile" className="navigation__link">
                    <User size={20} />
                    <span>Perfil</span>
                </NavLink>
                <NavLink to="/skills" className="navigation__link">
                    <Plus size={20} />
                    <span>Skills</span>
                </NavLink>
            </div>
        </nav>
    );
}
