import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickActionsDock from './FloatingQuickActions';

// Mock wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', () => ({
    useLocation: () => ['/dashboard', mockSetLocation],
}));

describe('QuickActionsDock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the trigger button with correct initial aria attributes', () => {
        render(<QuickActionsDock />);

        const trigger = screen.getByLabelText(/Abrir ações rápidas/i);
        expect(trigger).toBeInTheDocument();
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(trigger).toHaveAttribute('aria-controls', 'quick-actions-menu');
    });

    it('opens the menu on click and updates aria attributes', () => {
        render(<QuickActionsDock />);

        const trigger = screen.getByLabelText(/Abrir ações rápidas/i);
        fireEvent.click(trigger);

        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(trigger).toHaveAttribute('aria-label', 'Fechar ações rápidas');

        const menu = screen.getByRole('dialog');
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute('aria-modal', 'true');
        expect(menu).toHaveAttribute('aria-label', 'Ações Rápidas');
        // Check visibility via opacity class logic indirectly or directly if JSDOM handles it.
        // Since we rely on classes for visibility, we can check for the class.
        expect(menu).toHaveClass('opacity-100');
    });

    it('closes the menu when clicking the close button', () => {
        render(<QuickActionsDock />);

        // Open menu
        fireEvent.click(screen.getByLabelText(/Abrir ações rápidas/i));

        // Close menu
        const closeButton = screen.getByLabelText(/Fechar menu/i);
        fireEvent.click(closeButton);

        const trigger = screen.getByLabelText(/Abrir ações rápidas/i);
        expect(trigger).toHaveAttribute('aria-expanded', 'false');

        const menu = screen.getByRole('dialog');
        expect(menu).toHaveClass('opacity-0');
    });

    it('closes the menu on Escape key', () => {
        render(<QuickActionsDock />);

        // Open menu
        fireEvent.click(screen.getByLabelText(/Abrir ações rápidas/i));
        const menu = screen.getByRole('dialog');
        expect(menu).toHaveClass('opacity-100');

        // Press Escape
        fireEvent.keyDown(window, { key: 'Escape' });

        const trigger = screen.getByLabelText(/Abrir ações rápidas/i);
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(menu).toHaveClass('opacity-0');
    });
});
