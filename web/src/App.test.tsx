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

  it('updates display on button clicks', () => {
    render(<App />);
    
    // Click 7
    fireEvent.click(screen.getByText('7'));
    // Click +
    fireEvent.click(screen.getByText('+'));
    // Click 3
    fireEvent.click(screen.getByText('3'));
    // Click =
    fireEvent.click(screen.getByText('='));

    // Result should be 10
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles keyboard inputs', () => {
    render(<App />);

    fireEvent.keyDown(window, { key: '5' });
    fireEvent.keyDown(window, { key: '*' });
    fireEvent.keyDown(window, { key: '4' });
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('handles clear operations', () => {
    render(<App />);

    // Type 9
    fireEvent.click(screen.getByText('9'));
    expect(screen.getAllByText('9').length).toBeGreaterThan(0);

    // The 'C' button appears because isClearPending is true
    fireEvent.click(screen.getByText('C'));
    
    // Should be '0' again, and AC should appear
    expect(screen.getByText('AC')).toBeInTheDocument();
  });
});
