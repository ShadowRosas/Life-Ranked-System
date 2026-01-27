// ==========================================
// APP COMPONENT (ROUTING)
// ==========================================

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { ActiveBlock } from './pages/ActiveBlock';
import { ResultSelection } from './pages/ResultSelection';
import { BlockResult } from './pages/BlockResult';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { SkillManager } from './pages/SkillManager';

// Helper component to handle starting a block from URL
function StartBlockRoute() {
    const { skillId } = useParams();
    const { startBlock, state } = useGame();
    const navigate = useNavigate();

    useEffect(() => {
        if (skillId) {
            // Check if skill exists
            const skill = state.skills.find(s => s.id === skillId);
            if (skill) {
                startBlock(skillId);
                navigate('/active');
            } else {
                navigate('/');
            }
        }
    }, [skillId, state.skills, startBlock, navigate]);

    return null;
}

function AppContent() {
    return (
        <>
            {/* Navigation is visible on all pages except active block and results */}
            <Routes>
                <Route path="/active" element={null} />
                <Route path="/result-selection" element={null} />
                <Route path="/result" element={null} />
                <Route path="*" element={<Navigation />} />
            </Routes>

            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/skills" element={<SkillManager />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />

                {/* Game Loop Pages */}
                <Route path="/active" element={<ActiveBlock />} />
                <Route path="/result-selection" element={<ResultSelection />} />
                <Route path="/result" element={<BlockResult />} />

                {/* Helper route to start a block */}
                <Route path="/start/:skillId" element={<StartBlockRoute />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <GameProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </GameProvider>
    );
}
