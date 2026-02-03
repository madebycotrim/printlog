import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuickActionsDock from './FloatingQuickActions';
import * as wouter from 'wouter';
import React from 'react';

// Mock wouter's useLocation
vi.mock('wouter', () => ({
    useLocation: vi.fn(),
}));

describe('QuickActionsDock', () => {
    it('renders and has correct ARIA attributes', () => {
        // Mock location to be dashboard
        wouter.useLocation.mockReturnValue(['/dashboard', vi.fn()]);

        render(
            <QuickActionsDock
                onNewFilament={vi.fn()}
                onNewPrinter={vi.fn()}
                onNewSupply={vi.fn()}
            />
        );

        // Check trigger button
        const trigger = screen.getByLabelText(/Abrir menu de ações rápidas/i);
        expect(trigger).toBeInTheDocument();
        expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
        expect(trigger).toHaveAttribute('aria-expanded', 'false');

        // Open menu
        fireEvent.click(trigger);

        // Check trigger update
        expect(trigger).toHaveAttribute('aria-label', 'Fechar menu de ações rápidas');
        expect(trigger).toHaveAttribute('aria-expanded', 'true');

        // Check menu container
        const menu = screen.getByRole('dialog');
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute('aria-modal', 'true');
        expect(menu).not.toHaveAttribute('aria-hidden', 'true');

        // Check close button
        const closeBtn = screen.getByLabelText('Fechar menu');
        expect(closeBtn).toBeInTheDocument();
    });
});
