import mongoose from 'mongoose';

const BlockResultSchema = new mongoose.Schema({
    id: String,
    skillId: String,
    startTime: String,
    endTime: String,
    duration: Number,
    result: { type: String, enum: ['win', 'loss', 'abandon'] },
    lpChange: Number,
    rankBefore: String,
    divisionBefore: Number,
    rankAfter: String,
    divisionAfter: Number,
    notes: String
});

const SkillSchema = new mongoose.Schema({
    id: String,
    name: String,
    icon: String,
    color: String,
    lp: { type: Number, default: 0 },
    rank: { type: String, default: 'iron' },
    division: { type: Number, default: 1 },
    radiantLevel: String,
    radiantLp: Number,
    totalMinutes: { type: Number, default: 0 },
    totalBlocks: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    abandons: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    worstStreak: { type: Number, default: 0 },
    peakRank: { type: String, default: 'iron' },
    peakDivision: { type: Number, default: 1 },
    history: [BlockResultSchema],
    protectedPromotion: { type: Boolean, default: false },
    createdAt: String
});

const SettingsSchema = new mongoose.Schema({
    blockDuration: { type: Number, default: 30 },
    soundEnabled: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true }
});

const PlayerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    googleId: String, // New field for Auth
    email: String,    // New field for Auth
    name: String,     // New field for Auth
    createdAt: String,
    currentSeason: { type: Number, default: 1 },
    seasonStartDate: String,
    skills: [SkillSchema],
    settings: SettingsSchema,
    activeBlockId: String,
    activeSkillId: String,
    activeBlockStartTime: String
});

export const Player = mongoose.model('Player', PlayerSchema);
