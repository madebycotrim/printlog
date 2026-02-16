import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FloatingQuickActions from './FloatingQuickActions';
import * as Wouter from 'wouter';

// Mock wouter since the component uses useLocation
vi.mock('wouter', () => ({
  useLocation: vi.fn(),
}));

describe('FloatingQuickActions', () => {
  it('renders the trigger button', () => {
    // Mock location to match the condition in the component
    Wouter.useLocation.mockReturnValue(['/dashboard', vi.fn()]);

    render(<FloatingQuickActions />);

    // Check if the button is in the document
    // We look for a button, but it might not have an accessible name yet
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should have an accessible name for the trigger button', () => {
    Wouter.useLocation.mockReturnValue(['/dashboard', vi.fn()]);
    render(<FloatingQuickActions />);

    const triggerButton = screen.getByRole('button', { name: /Abrir ações rápidas/i });
    expect(triggerButton).toBeInTheDocument();
    expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
    expect(triggerButton).toHaveAttribute('aria-controls', 'quick-actions-menu');
  });

  it('should toggle menu visibility and aria attributes', () => {
    Wouter.useLocation.mockReturnValue(['/dashboard', vi.fn()]);
    render(<FloatingQuickActions />);

    const triggerButton = screen.getByRole('button', { name: /Abrir ações rápidas/i });
    fireEvent.click(triggerButton);

    const closeButton = screen.getByRole('button', { name: /Fechar ações rápidas/i });
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('aria-expanded', 'true');

    const menu = screen.getByRole('dialog', { name: /Ações Rápidas/i });
    expect(menu).toBeInTheDocument();
    expect(menu).not.toHaveClass('pointer-events-none');
  });
});
