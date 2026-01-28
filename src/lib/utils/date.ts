export const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const monthNamesShort = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export interface AcademicMonth {
  month: number;
  year: number;
  name: string;
}

export const getAcademicMonths = (
  activeYearName: string | undefined, 
  period?: { 
    fromMonth?: number | null; 
    fromYear?: number | null; 
    toMonth?: number | null; 
    toYear?: number | null; 
  }
): AcademicMonth[] => {
  if (!activeYearName) return [];
  const parts = activeYearName.split('/');
  const academicStartYear = parseInt(parts[0]);
  const academicEndYear = parts.length > 1 ? parseInt(parts[1]) : academicStartYear + 1;

  // If period is provided, generate months between start and end
  if (period && period.fromMonth && period.fromYear && period.toMonth && period.toYear) {
    const months: AcademicMonth[] = [];
    let currYear = period.fromYear;
    let currMonth = period.fromMonth;

    const endYear = period.toYear;
    const endMonth = period.toMonth;

    while (currYear < endYear || (currYear === endYear && currMonth <= endMonth)) {
      months.push({
        month: currMonth,
        year: currYear,
        name: monthNames[currMonth - 1]
      });

      currMonth++;
      if (currMonth > 12) {
        currMonth = 1;
        currYear++;
      }
    }
    return months;
  }

  // Fallback to standard 12 months of academic year (July to June)
  return [
    { month: 7, year: academicStartYear, name: 'Juli' },
    { month: 8, year: academicStartYear, name: 'Agustus' },
    { month: 9, year: academicStartYear, name: 'September' },
    { month: 10, year: academicStartYear, name: 'Oktober' },
    { month: 11, year: academicStartYear, name: 'November' },
    { month: 12, year: academicStartYear, name: 'Desember' },
    { month: 1, year: academicEndYear, name: 'Januari' },
    { month: 2, year: academicEndYear, name: 'Februari' },
    { month: 3, year: academicEndYear, name: 'Maret' },
    { month: 4, year: academicEndYear, name: 'April' },
    { month: 5, year: academicEndYear, name: 'Mei' },
    { month: 6, year: academicEndYear, name: 'Juni' },
  ];
}

export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return d.toLocaleDateString('id-ID');
  }
  
  return d.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

export function getMonthName(month: number, short: boolean = false): string {
  if (month < 1 || month > 12) return '';
  return short ? monthNamesShort[month - 1] : monthNames[month - 1];
}

export function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  // Academic year starts in July (month 7)
  if (month >= 7) {
    return `${year}/${year + 1}`;
  } else {
    return `${year - 1}/${year}`;
  }
}

export function getAcademicYearList(count: number = 5): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const startYear = currentYear - i;
    years.push(`${startYear}/${startYear + 1}`);
  }
  
  return years;
}
