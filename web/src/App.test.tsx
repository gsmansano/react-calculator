import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { calculatorApi } from './services/calculatorApi';

vi.mock('./services/calculatorApi', () => ({
  calculatorApi: {
    calculateBinary: vi.fn(),
    calculateUnary: vi.fn(),
  },
  CalculatorApiError: class CalculatorApiError extends Error {
    code: string;
    status: number;
    constructor(message: string, code: string, status: number) {
      super(message);
      this.code = code;
      this.status = status;
    }
  }
}));

describe('App Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders correctly and shows initial zero', () => {
    render(<App />);
    expect(screen.getByText('Calculator')).toBeInTheDocument();
    
    // There are multiple 0s (one in Display, one on Keypad)
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });

  it('updates display on button clicks and shows expression', async () => {
    vi.mocked(calculatorApi.calculateBinary).mockResolvedValueOnce({ result: 10, formatted: '10', operation: 'add' } as any);

    render(<App />);
    
    fireEvent.click(screen.getByText('7'));
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('='));

    expect(await screen.findByText('10')).toBeInTheDocument();
    // Verify expression
    expect(screen.getByText('7 + 3 =')).toBeInTheDocument();
  });

  it('handles keyboard inputs', async () => {
    vi.mocked(calculatorApi.calculateBinary).mockResolvedValueOnce({ result: 20, formatted: '20', operation: 'multiply' } as any);

    render(<App />);

    fireEvent.keyDown(window, { key: '5' });
    fireEvent.keyDown(window, { key: '*' });
    fireEvent.keyDown(window, { key: '4' });
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(await screen.findByText('20')).toBeInTheDocument();
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
