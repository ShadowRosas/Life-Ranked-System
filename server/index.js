import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import { Player } from './models/Player.js';
import dotenv from 'dotenv';

dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
const client = new OAuth2Client(CLIENT_ID);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/life-ranked';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// API Routes
// ... (Auth, Player, Sync routes remain above)

// Serve Frontend Static Files (Production)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Auth Endpoint (Google + Dev)
app.post('/api/auth/google', async (req, res) => {
    // ... logic remains ...
    try {
        const { token } = req.body;
        let payload;

        // Handle Dev Token (fake)
        if (token.startsWith('fake.')) {
            const parts = token.split('.');
            const decoded = JSON.parse(atob(parts[1]));
            payload = {
                sub: decoded.sub || 'dev_user',
                email: decoded.email || 'dev@example.com',
                name: decoded.name || 'Developer'
            };
            console.log('🔓 Dev Login:', payload.email);
        } else {
            // Handle Real Google Token
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: CLIENT_ID,
            });
            payload = ticket.getPayload();
        }

        if (!payload) throw new Error('Invalid Token');

        const { sub: googleId, email, name } = payload;

        // Find or Create Player
        let player = await Player.findOne({ googleId });
        if (!player) {
            // Check if email exists (migration?) or create new
            // We use googleId as the primary stable ID for auth
            const now = new Date().toISOString();
            player = new Player({
                id: googleId, // Use googleId as the game ID for now
                googleId,
                email,
                name,
                createdAt: now,
                seasonStartDate: now,
                currentSeason: 1,
                skills: [],
                settings: {
                    blockDuration: 30,
                    soundEnabled: true,
                    notificationsEnabled: true
                }
            });
            await player.save();
            console.log('✨ New Player Registered:', email);
        } else {
            console.log('👋 Player Login:', email);
        }

        res.json(player);
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
});

// Get Player State (Create if not exists - Fallback)
app.get('/api/player/:id', async (req, res) => {
    try {
        let player = await Player.findOne({ id: req.params.id });
        if (!player) {
            const now = new Date().toISOString();
            player = new Player({
                id: req.params.id,
                createdAt: now,
                seasonStartDate: now,
                currentSeason: 1,
                skills: [],
                settings: {
                    blockDuration: 30,
                    soundEnabled: true,
                    notificationsEnabled: true
                }
            });
            await player.save();
        }
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sync Player State
app.post('/api/player/:id/sync', async (req, res) => {
    try {
        const { id } = req.params;
        const state = req.body;

        if (state.id !== id) return res.status(400).json({ error: 'ID mismatch' });

        const updated = await Player.findOneAndUpdate(
            { id },
            state,
            { new: true, upsert: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Handle SPA routing - Send index.html for any unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
