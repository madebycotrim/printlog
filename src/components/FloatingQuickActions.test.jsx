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
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should have an accessible name for the trigger button', () => {
    Wouter.useLocation.mockReturnValue(['/dashboard', vi.fn()]);
    render(<FloatingQuickActions />);

    // Search specifically for the button with the label
    const triggerButton = screen.getByRole('button', { name: /Abrir ações rápidas/i });
    expect(triggerButton).toBeInTheDocument();
    expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
    expect(triggerButton).toHaveAttribute('aria-controls');
  });

  it('should toggle aria-expanded and label when clicked', () => {
    Wouter.useLocation.mockReturnValue(['/dashboard', vi.fn()]);
    render(<FloatingQuickActions />);

    const triggerButton = screen.getByRole('button', { name: /Abrir ações rápidas/i });

    // Click to open
    fireEvent.click(triggerButton);
    expect(triggerButton).toHaveAttribute('aria-expanded', 'true');
    expect(triggerButton).toHaveAttribute('aria-label', 'Fechar ações rápidas');

    // Click to close
    fireEvent.click(triggerButton);
    expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
    expect(triggerButton).toHaveAttribute('aria-label', 'Abrir ações rápidas');
  });
});
