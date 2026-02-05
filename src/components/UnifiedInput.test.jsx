import { render, screen } from '@testing-library/react';
import { UnifiedInput } from './UnifiedInput';
import { describe, it, expect } from 'vitest';

describe('UnifiedInput', () => {
  it('associates label with input', () => {
    render(<UnifiedInput label="Email Address" type="email" />);

    // This should find the input by its label text.
    // If the label is not properly associated (via htmlFor/id), this will fail.
    const input = screen.getByLabelText(/Email Address/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  it('sets aria-invalid when error is present', () => {
    render(<UnifiedInput label="Username" error={true} />);
    const input = screen.getByLabelText(/Username/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
