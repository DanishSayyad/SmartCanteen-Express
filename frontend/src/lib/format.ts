const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
});

const compactFormatter = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1
});

export const formatCurrencyFromPaise = (value: number) => inrFormatter.format(value / 100);

export const formatDateTime = (value?: string | Date | null) => {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

export const formatDateShort = (value?: string | Date | null) => {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium'
  }).format(new Date(value));
};

export const formatCompactNumber = (value: number) => compactFormatter.format(value);

export const formatPhone = (value?: string | null) => value || 'Not provided';
