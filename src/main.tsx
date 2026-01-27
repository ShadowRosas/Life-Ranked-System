import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LanguageProvider } from './context/LanguageContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {/* REEMPLAZA ESTE CLIENT ID. VER: GOOGLE_AUTH_SETUP.md */}
        <GoogleOAuthProvider clientId="YOUR_FULL_CLIENT_ID_HERE.apps.googleusercontent.com">
            <LanguageProvider>
                <App />
            </LanguageProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
