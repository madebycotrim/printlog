import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FAQSection from './FAQSection';

describe('FAQSection', () => {
    it('renders FAQ section with accessible attributes', () => {
        render(<FAQSection />);

        // Find the first question button
        const questionText = screen.getByText('Preciso instalar algum programa?');
        const questionButton = questionText.closest('button');
        expect(questionButton).toBeInTheDocument();

        // Initial state: collapsed
        expect(questionButton).toHaveAttribute('aria-expanded', 'false');

        // Verify aria-controls points to the content
        const contentId = questionButton.getAttribute('aria-controls');
        expect(contentId).toBeTruthy();

        // Verify content region exists and is linked
        // We use document.getElementById because the content might be hidden
        const contentRegion = document.getElementById(contentId);
        expect(contentRegion).toBeInTheDocument();
        expect(contentRegion).toHaveAttribute('role', 'region');
        expect(contentRegion).toHaveAttribute('aria-labelledby', questionButton.id);

        // Click to expand
        fireEvent.click(questionButton);

        // Expanded state
        expect(questionButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('toggles expansion on click', () => {
        render(<FAQSection />);
        const questionText = screen.getByText('Preciso instalar algum programa?');
        const questionButton = questionText.closest('button');

        fireEvent.click(questionButton);

        // Check visual indicator (chevron rotation)
        // We need to find the svg inside the button
        // Since lucide-react renders svgs, we can look for 'svg' tag
        const chevron = questionButton.querySelector('svg');
        expect(chevron).toHaveClass('rotate-180');
    });
});
