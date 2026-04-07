
import { HOLIDAYS_2083 } from '../lib/calendarData';
import { calculatePanchanga } from '../services/panchangaService';
import NepaliDate from 'nepali-date-converter';

/**
 * Sample integration script to loop through BS 2083 dates 
 * and attach Panchanga details to the holiday dataset.
 */
export function getAugmentedHolidays() {
  return HOLIDAYS_2083.map(holiday => {
    const [year, month, day] = holiday.date.split('-').map(Number);
    const adDate = new NepaliDate(year, month - 1, day).toJsDate();
    const panchanga = calculatePanchanga(adDate, holiday.date);
    
    return {
      ...holiday,
      tithi: panchanga.tithi,
      tithi_np: panchanga.tithi_np,
      nakshatra: panchanga.nakshatra,
      nakshatra_np: panchanga.nakshatra_np,
      paksha: panchanga.paksha,
      paksha_np: panchanga.paksha_np
    };
  });
}

// Example usage:
// const augmented = getAugmentedHolidays();
// console.log(augmented[0]);
