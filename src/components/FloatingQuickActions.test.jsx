import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FloatingQuickActions from './FloatingQuickActions';

// Mock wouter's useLocation hook
vi.mock('wouter', () => ({
  useLocation: vi.fn(),
}));

import { useLocation } from 'wouter';

describe('FloatingQuickActions', () => {
  const mockProps = {
    onNewFilament: vi.fn(),
    onNewPrinter: vi.fn(),
    onNewSupply: vi.fn(),
    onScan: vi.fn(),
  };

  beforeEach(() => {
    useLocation.mockReturnValue(['/dashboard', vi.fn()]);
    vi.clearAllMocks();
  });

  it('renders trigger button with correct aria attributes', () => {
    render(<FloatingQuickActions {...mockProps} />);

    // Check for trigger button with aria-label
    const trigger = screen.getByRole('button', { name: /ações rápidas/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls', 'quick-actions-menu');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('opens menu on click and updates aria attributes', () => {
    render(<FloatingQuickActions {...mockProps} />);
    const trigger = screen.getByRole('button', { name: /ações rápidas/i });

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const menu = screen.getByRole('dialog');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveAttribute('aria-modal', 'true');
    expect(menu).toHaveAttribute('id', 'quick-actions-menu');
    // Ensure it is not hidden to screen readers when open
    expect(menu).not.toHaveAttribute('aria-hidden', 'true');
  });

  it('closes menu when clicking close button', () => {
    render(<FloatingQuickActions {...mockProps} />);
    const trigger = screen.getByRole('button', { name: /ações rápidas/i });
    fireEvent.click(trigger);

    const closeButton = screen.getByRole('button', { name: /fechar menu/i });
    fireEvent.click(closeButton);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // Menu should be hidden or removed from accessibility tree
    const menu = screen.queryByRole('dialog', { hidden: true });
    // It might still be in document but hidden
    if (menu) {
      expect(menu).toHaveClass('invisible');
      expect(menu).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('calls action handlers when items are clicked', () => {
    render(<FloatingQuickActions {...mockProps} />);
    const trigger = screen.getByRole('button', { name: /ações rápidas/i });
    fireEvent.click(trigger);

    // Find "Material" button (using partial text match or exact)
    const materialButton = screen.getByText('Material');
    fireEvent.click(materialButton);

    expect(mockProps.onNewFilament).toHaveBeenCalled();
  });

  it('does not render on non-dashboard routes', () => {
    useLocation.mockReturnValue(['/settings', vi.fn()]);
    const { container } = render(<FloatingQuickActions {...mockProps} />);
    expect(container).toBeEmptyDOMElement();
  });
});
