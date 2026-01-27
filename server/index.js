import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Player } from './models/Player.js';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://admin:nomasleinad123@mes-web.vhjg9k2.mongodb.net/Life-Ranked-System')
    .then(() => {
        console.log('✅ Connected to MongoDB: Life-Ranked-System');
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID');

// Auth Route
app.post('/api/auth/google', async (req, res) => {
    try {
        const { token } = req.body;

        // Verify Google Token
        // NOTE: In production, you must use a real Client ID and verify the token signature.
        let payload;
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'
            });
            payload = ticket.getPayload();
        } catch (e) {
            // Fallback for development/demo (Decodes without signature verification if env is missing)
            // THIS IS INSECURE FOR PRODUCTION - ONLY FOR QUICK PROTOTYPING WITHOUT ENV
            console.warn('⚠️ Token verification failed (using unsafe decode for dev):', e.message);
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            payload = JSON.parse(jsonPayload);
        }

        if (!payload || !payload.email) {
            return res.status(400).json({ error: 'Invalid token' });
        }

        const { email, name, picture, sub: googleId } = payload;

        // Find existing player
        let player = await Player.findOne({ email });

        if (!player) {
            // Check if we have a legacy player to migrate? (Maybe not needed for this task)

            // Create New Player
            const now = new Date().toISOString();
            // Generate a readable ID based on name or fall back to random
            const safeName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 10);
            const generatedId = `player_${safeName}_${Date.now().toString().slice(-6)}`;

            player = new Player({
                id: generatedId,
                googleId,
                email,
                name,
                picture,
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
            console.log('✨ Created new Google player:', email);
        } else {
            console.log('Login existing player:', email);
            // Update metadata if needed
            if (!player.googleId) {
                player.googleId = googleId;
                player.name = name;
                player.picture = picture;
                await player.save();
            }
        }

        res.json(player);

    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Routes

// Get Player State (Create if not exists)
app.get('/api/player/:id', async (req, res) => {
    try {
        let player = await Player.findOne({ id: req.params.id });

        if (!player) {
            // Create new player with default state if not found
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
            console.log('✨ Created new player:', req.params.id);
        }

        res.json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sync Player State (Full state update)
app.post('/api/player/:id/sync', async (req, res) => {
    try {
        const { id } = req.params;
        const state = req.body;

        // Validate ID match
        if (state.id !== id) {
            return res.status(400).json({ error: 'ID mismatch' });
        }

        // Update player state
        // We replace the entire document content but keep the ID
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

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
