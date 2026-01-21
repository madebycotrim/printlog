import React, { createContext, useContext, useState, useCallback } from 'react';

const TourContext = createContext(null);

export const TourProvider = ({ children }) => {
    const [currentTour, setCurrentTour] = useState(null);

    const startTour = useCallback((route) => {
        setCurrentTour(route);
    }, []);

    const resetTour = useCallback((route) => {
        if (route) {
            localStorage.removeItem(`hasSeenTour-${route}`);
        } else {
            // Reset all tours
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('hasSeenTour-')) {
                    localStorage.removeItem(key);
                }
            });
        }
        setCurrentTour(null);
    }, []);

    const hasSeen = useCallback((route) => {
        return localStorage.getItem(`hasSeenTour-${route}`) === 'true';
    }, []);

    const markAsSeen = useCallback((route) => {
        localStorage.setItem(`hasSeenTour-${route}`, 'true');
    }, []);

    const value = {
        currentTour,
        startTour,
        resetTour,
        hasSeen,
        markAsSeen
    };

    return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTour must be used within TourProvider');
    }
    return context;
};
