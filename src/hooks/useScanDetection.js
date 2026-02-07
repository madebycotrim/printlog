import { useEffect, useRef } from 'react';

/**
 * Hook to detect barcode scanner input (fast typing ending with Enter)
 * @param {Function} onScan - Callback when a scan is detected
 * @param {Object} options - Configuration options
 * @param {number} options.timeThreshold - Max time (ms) between keystrokes to consider as scan (default: 30ms)
 * @param {number} options.minLength - Minimum length of scanned code (default: 3)
 * @param {string[]} options.ignoreTags - Tags to ignore scanning on (default: ['INPUT', 'TEXTAREA'])
 * @param {boolean} options.preventDefault - Prevent default behavior of Enter key (default: true)
 */
export const useScanDetection = (onScan, {
    timeThreshold = 50,
    minLength = 3,
    ignoreTags = ['INPUT', 'TEXTAREA'],
    preventDefault = true
} = {}) => {
    const buffer = useRef([]);
    const lastKeyTime = useRef(0);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const target = e.target;
            const isInput = ignoreTags.includes(target.tagName);

            // If focused on input, we usually let the input handle it, 
            // unless we want to intercept SPECIFICALLY for scanner?
            // Standard behavior: Scanners act as keyboard. 
            // If user is in a Search Input, the input gets the value. 
            // We only want to handle "Global Scan" if NOT typing in an input.
            if (isInput) return;

            const char = e.key;
            const now = Date.now();

            // Reset buffer if too slow (manual typing)
            if (now - lastKeyTime.current > timeThreshold) {
                buffer.current = [];
            }

            lastKeyTime.current = now;

            if (char === 'Enter') {
                if (buffer.current.length >= minLength) {
                    const code = buffer.current.join('');
                    onScan(code);
                    if (preventDefault) e.preventDefault();
                    buffer.current = [];
                }
            } else if (char.length === 1) {
                // Onlyprintable chars
                buffer.current.push(char);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onScan, timeThreshold, minLength, ignoreTags, preventDefault]);
};
