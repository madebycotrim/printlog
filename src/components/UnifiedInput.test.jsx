import React from 'react';
import { render, screen } from '@testing-library/react';
import { UnifiedInput } from './UnifiedInput';
import { describe, it, expect } from 'vitest';

describe('UnifiedInput', () => {
  it('associates label with input using id', () => {
    render(<UnifiedInput label="Email Address" type="email" />);

    // This will fail if the label is not associated with the input
    const input = screen.getByLabelText('Email Address');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  it('uses provided id if available', () => {
    const customId = "custom-input-id";
    render(<UnifiedInput label="Username" id={customId} />);

    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('id', customId);
  });

  it('provides accessible label for ghost variant', () => {
     render(<UnifiedInput label="Search" variant="ghost" />);
     // Ghost variant hides the visual label, so we expect aria-label on the input
     // because the visual label is hidden
     const input = screen.getByLabelText('Search');
     expect(input).toBeInTheDocument();
  });
});
