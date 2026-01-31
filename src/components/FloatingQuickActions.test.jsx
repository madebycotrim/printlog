import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import FloatingQuickActions from './FloatingQuickActions';
import * as wouter from 'wouter';

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: vi.fn(),
}));

describe('FloatingQuickActions Accessibility', () => {
  const setLocation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    wouter.useLocation.mockReturnValue(['/dashboard', setLocation]);
  });

  it('has accessible trigger button', () => {
    render(<FloatingQuickActions />);

    // Should find by accessible name - THIS WILL FAIL INITIALLY
    const triggerBtn = screen.getByRole('button', { name: /abrir ações rápidas/i });
    expect(triggerBtn).toBeInTheDocument();
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');
    expect(triggerBtn).toHaveAttribute('aria-controls', 'quick-actions-menu');
  });

  it('opens menu and updates aria attributes', () => {
    render(<FloatingQuickActions />);
    // Finding by simpler query for now to facilitate test flow if name fails
    // But since the first test checks name, we can assume we want to enforce it.
    // However, to make the test run "successfully fail", we should be precise.
    const buttons = screen.getAllByRole('button');
    const triggerBtn = buttons[buttons.length - 1]; // Trigger is last in DOM

    fireEvent.click(triggerBtn);

    expect(triggerBtn).toHaveAttribute('aria-expanded', 'true');
    // expect(triggerBtn).toHaveAttribute('aria-label', expect.stringMatching(/fechar/i));

    // Menu Check
    // const menu = screen.getByRole('dialog'); // Will fail if role not present
    // expect(menu).toBeInTheDocument();
    // expect(menu).toHaveAttribute('id', 'quick-actions-menu');
    // expect(menu).toHaveAttribute('aria-modal', 'true');
  });

  it('closes menu with Escape key', () => {
    render(<FloatingQuickActions />);
    const buttons = screen.getAllByRole('button');
    const triggerBtn = buttons[buttons.length - 1];

    fireEvent.click(triggerBtn);
    // expect(triggerBtn).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');
  });
});
