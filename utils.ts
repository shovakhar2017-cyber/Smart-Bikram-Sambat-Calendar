import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Basic BS to AD conversion logic if needed, but we'll use nepali-date-converter
// We'll wrap it for easier use
import NepaliDate from 'nepali-date-converter';

export const bsToAd = (year: number, month: number, day: number) => {
  const nepaliDate = new NepaliDate(year, month, day);
  return nepaliDate.toJsDate();
};

export const adToBs = (date: Date) => {
  const nepaliDate = new NepaliDate(date);
  return {
    year: nepaliDate.getYear(),
    month: nepaliDate.getMonth(),
    day: nepaliDate.getDate(),
  };
};

export const formatNepaliNumber = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return num.toString().split('').map(digit => {
    const d = parseInt(digit);
    return isNaN(d) ? digit : nepaliDigits[d];
  }).join('');
};
