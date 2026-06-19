export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export function getMonthName(month: number): string {
  const names = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];
  return names[month - 1];
}

export function getWeekdayNames(): string[] {
  return ['日', '一', '二', '三', '四', '五', '六'];
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export function generateCalendarDays(
  year: number,
  month: number,
  summaryMap: Map<string, { is_anomaly: boolean; max_turbidity: number; max_ph_deviation: number }>
) {
  const days: Array<{
    date: string;
    day: number;
    isCurrentMonth: boolean;
    isAnomaly?: boolean;
    hasData: boolean;
    maxTurbidity?: number;
    maxPhDeviation?: number;
  }> = [];
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = formatDate(new Date(prevYear, prevMonth - 1, day));
    const summary = summaryMap.get(date);
    days.push({
      date,
      day,
      isCurrentMonth: false,
      hasData: !!summary,
      isAnomaly: summary?.is_anomaly,
      maxTurbidity: summary?.max_turbidity,
      maxPhDeviation: summary?.max_ph_deviation
    });
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = formatDate(new Date(year, month - 1, day));
    const summary = summaryMap.get(date);
    days.push({
      date,
      day,
      isCurrentMonth: true,
      hasData: !!summary,
      isAnomaly: summary?.is_anomaly,
      maxTurbidity: summary?.max_turbidity,
      maxPhDeviation: summary?.max_ph_deviation
    });
  }
  
  const remainingDays = 42 - days.length;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  
  for (let day = 1; day <= remainingDays; day++) {
    const date = formatDate(new Date(nextYear, nextMonth - 1, day));
    const summary = summaryMap.get(date);
    days.push({
      date,
      day,
      isCurrentMonth: false,
      hasData: !!summary,
      isAnomaly: summary?.is_anomaly,
      maxTurbidity: summary?.max_turbidity,
      maxPhDeviation: summary?.max_ph_deviation
    });
  }
  
  return days;
}
