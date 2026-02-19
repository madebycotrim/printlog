import { render, screen } from '@testing-library/react';
import { UnifiedInput } from './UnifiedInput';
import { describe, it, expect } from 'vitest';

describe('UnifiedInput', () => {
  it('associates label with input', () => {
    render(<UnifiedInput label="Email Address" type="email" />);
    const input = screen.getByLabelText('Email Address');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  it('uses provided id if available', () => {
    render(<UnifiedInput label="Username" id="user-123" />);
    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('id', 'user-123');
  });

  it('shows error state with aria-invalid', () => {
    render(<UnifiedInput label="Password" error="Invalid password" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not show error state when valid', () => {
    render(<UnifiedInput label="Password" />);
    const input = screen.getByLabelText('Password');
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
  });
});
