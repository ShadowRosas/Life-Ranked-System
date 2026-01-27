// ==========================================
// APP COMPONENT (ROUTING)
// ==========================================


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { ActiveBlock } from './pages/ActiveBlock';
import { ResultSelection } from './pages/ResultSelection';
import { BlockResult } from './pages/BlockResult';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { SkillManager } from './pages/SkillManager';
import { StartBlock } from './pages/StartBlock';


import { useGame } from './context/GameContext';
import { Login } from './pages/Login';

function AppContent() {
    const { isAuthenticated } = useGame();

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

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

                {/* New Start Block Selection Page */}
                <Route path="/start/:skillId" element={<StartBlock />} />

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
