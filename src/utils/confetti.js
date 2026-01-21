import confetti from 'canvas-confetti';

/**
 * Trigger confetti celebration
 */
export const celebrate = (options = {}) => {
    const defaults = {
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    };

    confetti({
        ...defaults,
        ...options
    });
};

/**
 * Goal achievement celebration
 */
export const celebrateGoal = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#0ea5e9', '#10b981', '#f59e0b'];

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
};

/**
 * Milestone celebration (bigger effect)
 */
export const celebrateMilestone = () => {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
        zIndex: 10000
    };

    function fire(particleRatio, opts) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
        });
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
};

/**
 * Quick burst
 */
export const quickBurst = () => {
    confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
    });
};
