/**
 * Budget value object - represents a trip budget in USD
 */
export interface Budget {
  amountUsd: number;
  currency: 'USD';
}

export class BudgetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BudgetError';
  }
}

/**
 * Create a validated Budget value object
 * @param amountUsd - Budget amount in USD (must be positive)
 */
export function createBudget(amountUsd: number): Budget {
  if (amountUsd < 0) {
    throw new BudgetError('Budget cannot be negative');
  }
  
  if (amountUsd > 1_000_000) {
    throw new BudgetError('Budget exceeds maximum limit');
  }

  return {
    amountUsd: Math.round(amountUsd * 100) / 100, // Round to 2 decimal places
    currency: 'USD',
  };
}

/**
 * Format budget for display
 */
export function formatBudget(budget: Budget): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: budget.currency,
    maximumFractionDigits: 0,
  }).format(budget.amountUsd);
}
