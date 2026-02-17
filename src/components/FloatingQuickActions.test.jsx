import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuickActionsDock from './FloatingQuickActions';
import * as wouter from 'wouter';

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: vi.fn(),
}));

describe('QuickActionsDock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(wouter.useLocation).mockReturnValue(['/dashboard', vi.fn()]);
  });

  it('renders trigger button with accessible label', () => {
    render(<QuickActionsDock />);
    // Should fail if aria-label is missing
    expect(screen.getByLabelText(/abrir ações rápidas/i)).toBeInTheDocument();
  });

  it('menu container has dialog role', () => {
    render(<QuickActionsDock />);
    // Should fail if role="dialog" is missing
    // We need to open it first to be sure it's rendered if we were using conditional rendering,
    // but here it's always rendered, just hidden.
    // However, if we fix it to be hidden, queryByRole might return null when closed.

    const trigger = screen.getByRole('button'); // Fallback since label might be missing
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('menu items are not accessible when closed', () => {
    render(<QuickActionsDock />);
    // Current implementation uses opacity-0 which might still be accessible to some queries,
    // but toBeVisible() handles opacity.
    // However, keyboard focusability is the real issue.
    // We'll check that the menu container has 'invisible' class or similar logic
    // via checking visibility.

    const menuText = screen.queryByText('Novo Projeto');
    // If it's in the DOM but hidden only by opacity, this assertion might pass or fail depending on JSDOM.
    // But conceptually we want it to be strictly hidden.
    expect(menuText).not.toBeVisible();
  });
});
