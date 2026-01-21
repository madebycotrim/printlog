/**
 * Haptic feedback for mobile devices
 */

class HapticFeedback {
    constructor() {
        this.enabled = localStorage.getItem('haptics-enabled') !== 'false';
        this.supported = 'vibrate' in navigator;
    }

    // Basic vibration
    vibrate(pattern = 10) {
        if (!this.enabled || !this.supported) return;
        navigator.vibrate(pattern);
    }

    // Predefined patterns
    light() {
        this.vibrate(10);
    }

    medium() {
        this.vibrate(20);
    }

    heavy() {
        this.vibrate(50);
    }

    success() {
        this.vibrate([10, 50, 10]);
    }

    error() {
        this.vibrate([50, 100, 50]);
    }

    notification() {
        this.vibrate([10, 30, 10, 30]);
    }

    selection() {
        this.vibrate(5);
    }

    // Toggle haptics
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('haptics-enabled', this.enabled);
        return this.enabled;
    }

    // Check if supported
    isSupported() {
        return this.supported;
    }
}

// Export singleton
export const haptics = new HapticFeedback();
