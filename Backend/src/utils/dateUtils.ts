export function getFiscalYearForDate(dateStr: string): string {
  if (!dateStr) return 'FY-2026-27';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return 'FY-2026-27';
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const startYear = month >= 7 ? year : year - 1;
  const endYear = startYear + 1;
  return `FY-${startYear}-${String(endYear).slice(2)}`;
}

export function getDayOfWeekFromDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', { weekday: 'long' });
    }
  } catch (e) {
    // fallback
  }
  return 'Monday';
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
