// Unit conversion for the diet profile form. The diet-profile and meal-plan services
// store and expect metric (weight in kg, height in cm); the form lets users pick.

export type WeightUnit = 'lb' | 'kg';
export type HeightUnit = 'ftin' | 'cm';

const KG_PER_LB = 0.45359237;
const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;

/** Rounds to one decimal place, which is more precision than a bathroom scale gives. */
function roundTo1(value: number): number {
  return Math.round(value * 10) / 10;
}

// Two decimals, so a weight entered in pounds comes back as the same number when the
// stored kg value is shown in pounds again (180 lb -> 81.65 kg -> 180 lb).
export function lbToKg(lb: number): number {
  return Math.round(lb * KG_PER_LB * 100) / 100;
}

export function kgToLb(kg: number): number {
  return roundTo1(kg / KG_PER_LB);
}

export function feetInchesToCm(feet: number, inches: number): number {
  return roundTo1((feet * INCHES_PER_FOOT + inches) * CM_PER_INCH);
}

export function inchesToFeetInches(totalInches: number): { feet: number; inches: number } {
  return {
    feet: Math.floor(totalInches / INCHES_PER_FOOT),
    inches: totalInches % INCHES_PER_FOOT,
  };
}

export function cmToInches(cm: number): number {
  return cm / CM_PER_INCH;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / CM_PER_INCH);
  return {
    feet: Math.floor(totalInches / INCHES_PER_FOOT),
    inches: totalInches % INCHES_PER_FOOT,
  };
}

/** Parses a form field. Returns null for empty or non-numeric input. */
export function parseNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}
