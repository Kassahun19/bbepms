export function formatETB(amount: number | string | undefined | null): string {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num).replace('ETB', 'ETB ');
}

export function formatNumber(value: number | string | undefined | null): string {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(value: number | string | undefined | null): string {
  const num = Number(value) || 0;
  return `${num.toFixed(1)}%`;
}

export function formatDate(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
