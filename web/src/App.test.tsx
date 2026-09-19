import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Integration', () => {
  it('renders correctly and shows initial zero', () => {
    render(<App />);
    expect(screen.getByText('Calculator')).toBeInTheDocument();
    
    // There are multiple 0s (one in Display, one on Keypad)
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });

  it('updates display on button clicks and shows expression', () => {
    render(<App />);
    
    fireEvent.click(screen.getByText('7'));
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('='));

    expect(screen.getByText('10')).toBeInTheDocument();
    // Verify expression
    expect(screen.getByText('7 + 3 =')).toBeInTheDocument();
  });

  it('handles keyboard inputs', () => {
    render(<App />);

    fireEvent.keyDown(window, { key: '5' });
    fireEvent.keyDown(window, { key: '*' });
    fireEvent.keyDown(window, { key: '4' });
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('5 × 4 =')).toBeInTheDocument();
  });

  it('handles clear operations', () => {
    render(<App />);

    fireEvent.click(screen.getByText('9'));
    expect(screen.getAllByText('9').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('C'));
    
    expect(screen.getByText('AC')).toBeInTheDocument();
  });
});
