// ==========================================
// AUDIO SYSTEM (Web Audio API)
// ==========================================

class AudioSystem {
    private ctx: AudioContext | null = null;
    private enabled: boolean = true;

    constructor() {
        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    private init() {
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle(enabled: boolean) {
        this.enabled = enabled;
    }

    private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1, delay: number = 0) {
        if (!this.ctx || !this.enabled) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + delay + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + duration);
    }

    playClick() {
        this.playTone(800, 'sine', 0.05, 0.05);
    }

    playHover() {
        this.playTone(400, 'sine', 0.03, 0.02);
    }

    playStart() {
        this.playTone(200, 'sawtooth', 0.5, 0.1);
        this.playTone(400, 'sine', 0.5, 0.1, 0.1);
        this.playTone(800, 'square', 0.8, 0.05, 0.2);
    }

    playWin() {
        // Victory chord (Major)
        const now = 0;
        this.playTone(523.25, 'triangle', 0.6, 0.1, now);       // C5
        this.playTone(659.25, 'triangle', 0.6, 0.1, now + 0.1); // E5
        this.playTone(783.99, 'triangle', 0.8, 0.1, now + 0.2); // G5
        this.playTone(1046.50, 'sine', 1.0, 0.2, now + 0.3);    // C6
    }

    playLoss() {
        // Defeat chord (Diminished/Minor)
        const now = 0;
        this.playTone(300, 'sawtooth', 0.8, 0.1, now);
        this.playTone(280, 'sawtooth', 0.8, 0.1, now + 0.2);
        this.playTone(200, 'sawtooth', 1.5, 0.2, now + 0.4);
    }

    playRankUp() {
        // Epic rank up sound
        this.playTone(440, 'sine', 0.1, 0.1, 0);
        this.playTone(554, 'sine', 0.1, 0.1, 0.1);
        this.playTone(659, 'sine', 0.1, 0.1, 0.2);
        this.playTone(880, 'square', 1.5, 0.2, 0.3);
        this.playTone(220, 'sawtooth', 2.0, 0.3, 0);
    }

    playTimerComplete() {
        // Notification sound for timer finish
        const now = 0;
        this.playTone(600, 'sine', 0.1, 0.1, now);
        this.playTone(800, 'sine', 0.1, 0.1, now + 0.1);
        this.playTone(1000, 'sine', 0.3, 0.1, now + 0.2);
    }
}

export const audio = new AudioSystem();
