export type Currency = 'USD' | 'EUR';

export const currencies = {
  USD: { symbol: '$', code: 'USD' },
  EUR: { symbol: '€', code: 'EUR' },
};

export const formatCurrency = (amount: number, currency: Currency = 'USD'): string => {
  const symbol = currencies[currency].symbol;
  return `${symbol}${amount.toFixed(2)}`;
};

export const getCurrencySymbol = (currency: Currency = 'USD'): string => {
  return currencies[currency].symbol;
};

