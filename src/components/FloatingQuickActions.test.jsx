import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuickActionsDock from './FloatingQuickActions';

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => ['/dashboard', vi.fn()],
}));

describe('QuickActionsDock', () => {
  it('renders the trigger button with accessibility attributes', () => {
    render(<QuickActionsDock />);

    // Check for trigger button
    const trigger = screen.getByRole('button', { name: /abrir ações rápidas/i });
    expect(trigger).toBeInTheDocument();

    // Check initial state
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls', 'quick-actions-menu');
  });

  it('opens menu on click and focuses on accessibility', () => {
    render(<QuickActionsDock />);
    const trigger = screen.getByRole('button', { name: /abrir ações rápidas/i });

    fireEvent.click(trigger);

    // Check that trigger label changed
    expect(trigger).toHaveAttribute('aria-label', 'Fechar ações rápidas');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Check for menu container role
    const menu = screen.getByRole('dialog');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveAttribute('aria-modal', 'true');
    expect(menu).toHaveAttribute('id', 'quick-actions-menu');

    // Check for close button in menu
    const closeBtn = screen.getByRole('button', { name: /fechar menu/i });
    expect(closeBtn).toBeInTheDocument();
  });

  it('closes menu when Escape key is pressed', () => {
    render(<QuickActionsDock />);
    const trigger = screen.getByRole('button', { name: /abrir ações rápidas/i });

    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    // Menu should be closed (queryByRole returns null if not found)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
