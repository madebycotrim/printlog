import { render, screen } from '@testing-library/react';
import { UnifiedInput } from './UnifiedInput';
import { describe, it, expect } from 'vitest';

describe('UnifiedInput', () => {
  it('associates label with input via htmlFor and id', () => {
    render(<UnifiedInput label="Test Label" />);

    const label = screen.getByText('Test Label');
    // We look for a textbox that has the label associated
    const input = screen.getByLabelText('Test Label');

    expect(input).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.id);
    expect(input.id).toBeTruthy();
  });

  it('uses provided id if available', () => {
    const testId = 'my-custom-id';
    render(<UnifiedInput label="Test Label 2" id={testId} />);

    const label = screen.getByText('Test Label 2');
    const input = screen.getByRole('textbox');

    expect(label).toHaveAttribute('for', testId);
    expect(input).toHaveAttribute('id', testId);
  });
});
