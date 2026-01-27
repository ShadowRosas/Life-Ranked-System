// ==========================================
// RESULT SELECTION PAGE
// ==========================================

import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Trophy, XCircle } from 'lucide-react';
import './ResultSelection.css';

export function ResultSelection() {
    const { state, endBlock } = useGame();
    const navigate = useNavigate();

    // Guard clause
    if (!state.activeBlockId) {
        // If we're here without an active block (e.g. refresh), redirect to home
        // But in development we might want to test this page
        // For now, redirect to home if no Active Block
        if (process.env.NODE_ENV === 'production') {
            // navigate('/');
            // return null;
        }
    }

    const handleResult = (result: 'win' | 'loss') => {
        endBlock(result);
        navigate('/result');
    };

    return (
        <div className="result-selection page">
            <div className="container result-selection__container">
                <h1 className="text-center">MATCH COMPLETE</h1>
                <p className="text-center text-muted mb-xl">REPORT YOUR PERFORMANCE HONESTLY</p>

                <div className="result-selection__options">
                    <button
                        className="result-option result-option--win"
                        onClick={() => handleResult('win')}
                    >
                        <div className="result-option__icon">
                            <Trophy size={64} />
                        </div>
                        <h2>VICTORY</h2>
                        <p>Objective Completed</p>
                        <span className="result-option__lp">+20 LP</span>
                    </button>

                    <button
                        className="result-option result-option--loss"
                        onClick={() => handleResult('loss')}
                    >
                        <div className="result-option__icon">
                            <XCircle size={64} />
                        </div>
                        <h2>DEFEAT</h2>
                        <p>Distracted / Failed</p>
                        <span className="result-option__lp">-20 LP</span>
                    </button>
                </div>

                <p className="text-center text-muted mt-lg">
                    Dishonesty will result in a permanent ban from your own potential.
                </p>
            </div>
        </div>
    );
}
