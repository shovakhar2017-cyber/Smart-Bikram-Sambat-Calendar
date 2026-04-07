import { 
  getPanchanga,
  PanchangaResult
} from './astronomyService';

export interface PanchangaDetails extends PanchangaResult {
  events: string[];
}

/**
 * Calculates Panchanga details for a given date.
 * Uses lightweight astronomical calculations.
 */
export function calculatePanchanga(date: Date, bsDateStr: string): PanchangaDetails {
  const result = getPanchanga(date, bsDateStr);

  // Special Events Logic
  const events: string[] = [];

  return {
    ...result,
    events
  };
}
