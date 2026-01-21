/**
 * Sound System for dashboard events
 */

class SoundSystem {
    constructor() {
        this.enabled = localStorage.getItem('sounds-enabled') !== 'false';
        this.volume = parseFloat(localStorage.getItem('sounds-volume') || '0.3');
        this.sounds = {};
    }

    // Load sound
    load(name, url) {
        if (!this.sounds[name]) {
            this.sounds[name] = new Audio(url);
            this.sounds[name].volume = this.volume;
        }
    }

    // Play sound
    play(name) {
        if (!this.enabled) return;

        const sound = this.sounds[name];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(err => console.log('Sound play failed:', err));
        }
    }

    // Toggle sounds
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('sounds-enabled', this.enabled);
        return this.enabled;
    }

    // Set volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('sounds-volume', this.volume);
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });
    }

    // Beep using Web Audio API (no files needed)
    beep(frequency = 440, duration = 200, type = 'sine') {
        if (!this.enabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;
        gainNode.gain.value = this.volume;

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    }

    // Predefined sounds using Web Audio
    success() {
        this.beep(523.25, 100, 'sine'); // C5
        setTimeout(() => this.beep(659.25, 150, 'sine'), 100); // E5
    }

    error() {
        this.beep(200, 150, 'sawtooth');
    }

    click() {
        this.beep(800, 50, 'square');
    }

    notification() {
        this.beep(440, 100, 'sine');
        setTimeout(() => this.beep(554.37, 200, 'sine'), 150);
    }
}

// Export singleton
export const soundSystem = new SoundSystem();
