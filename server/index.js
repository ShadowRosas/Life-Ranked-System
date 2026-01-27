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
mongoose.connect('mongodb://127.0.0.1:27017/life-ranked')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

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
