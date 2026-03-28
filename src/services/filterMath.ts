/**
 * Filter Math Service
 * IIR filter calculations for parametric EQ
 */

export type FilterType = 'PK' | 'LSC' | 'HSC'; // Peaking, Low Shelf, High Shelf

export interface BandSettings {
  enabled: boolean;
  fcHz: number; // Center frequency in Hz
  gainDb: number; // Gain in dB
  q: number; // Q factor
  filterType: FilterType;
}

export interface EQProfile {
  preamp: number; // Preamp gain in dB
  bands: BandSettings[];
}

/**
 * Calculate biquad filter coefficients for a given band
 * Based on RBJ Audio EQ Cookbook
 */
export function calculateBiquadCoefficients(
  settings: BandSettings,
  sampleRate: number
): { b0: number; b1: number; b2: number; a0: number; a1: number; a2: number } {
  const w0 = (2 * Math.PI * settings.fcHz) / sampleRate;
  const sin_w0 = Math.sin(w0);
  const cos_w0 = Math.cos(w0);
  const A = Math.pow(10, settings.gainDb / 40);
  const alpha = sin_w0 / (2 * settings.q);

  let b0, b1, b2, a0, a1, a2;

  if (settings.filterType === 'PK') {
    // Peaking filter
    b0 = 1 + alpha * A;
    b1 = -2 * cos_w0;
    b2 = 1 - alpha * A;
    a0 = 1 + alpha / A;
    a1 = -2 * cos_w0;
    a2 = 1 - alpha / A;
  } else if (settings.filterType === 'LSC') {
    // Low shelf
    const const2SqrtA = 2 * Math.sqrt(A) * alpha;
    b0 = A * ((A + 1) - (A - 1) * cos_w0 + const2SqrtA);
    b1 = 2 * A * ((A - 1) - (A + 1) * cos_w0);
    b2 = A * ((A + 1) - (A - 1) * cos_w0 - const2SqrtA);
    a0 = (A + 1) + (A - 1) * cos_w0 + const2SqrtA;
    a1 = -2 * ((A - 1) + (A + 1) * cos_w0);
    a2 = (A + 1) + (A - 1) * cos_w0 - const2SqrtA;
  } else {
    // High shelf
    const const2SqrtA = 2 * Math.sqrt(A) * alpha;
    b0 = A * ((A + 1) + (A - 1) * cos_w0 + const2SqrtA);
    b1 = -2 * A * ((A - 1) + (A + 1) * cos_w0);
    b2 = A * ((A + 1) + (A - 1) * cos_w0 - const2SqrtA);
    a0 = (A + 1) - (A - 1) * cos_w0 + const2SqrtA;
    a1 = 2 * ((A - 1) - (A + 1) * cos_w0);
    a2 = (A + 1) - (A - 1) * cos_w0 - const2SqrtA;
  }

  // Normalize
  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a0: 1,
    a1: a1 / a0,
    a2: a2 / a0,
  };
}

/**
 * Calculate frequency response magnitude at a given frequency
 */
export function calculateMagnitude(
  settings: BandSettings,
  frequencyHz: number,
  sampleRate: number
): number {
  const coeffs = calculateBiquadCoefficients(settings, sampleRate);
  const w = (2 * Math.PI * frequencyHz) / sampleRate;
  const cos_w = Math.cos(w);

  const numerator =
    Math.pow(coeffs.b0, 2) +
    Math.pow(coeffs.b1, 2) +
    Math.pow(coeffs.b2, 2) +
    2 * coeffs.b0 * coeffs.b2 * cos_w * 2 -
    2 * coeffs.b1 * (coeffs.b0 + coeffs.b2) * cos_w;

  const denominator =
    1 +
    Math.pow(coeffs.a1, 2) +
    Math.pow(coeffs.a2, 2) +
    2 * coeffs.a2 * cos_w * 2 -
    2 * coeffs.a1 * (1 + coeffs.a2) * cos_w;

  const magnitude = Math.sqrt(numerator / denominator);
  return 20 * Math.log10(Math.max(magnitude, 1e-10)); // Convert to dB
}

/**
 * Calculate combined frequency response for all bands at given frequency
 */
export function calculateCombinedFrequencyResponse(
  profile: EQProfile,
  frequencyHz: number,
  sampleRate: number
): number {
  let totalGain = profile.preamp;
  for (const band of profile.bands) {
    if (band.enabled) {
      totalGain += calculateMagnitude(band, frequencyHz, sampleRate);
    }
  }
  return totalGain;
}

/**
 * Create a frequency response array for visualization
 */
export function generateFrequencyResponse(
  profile: EQProfile,
  sampleRate: number = 48000,
  points: number = 256
): number[] {
  const response: number[] = [];
  const minFreq = 20;
  const maxFreq = sampleRate / 2;
  const logMinFreq = Math.log10(minFreq);
  const logMaxFreq = Math.log10(maxFreq);

  for (let i = 0; i < points; i++) {
    const logFreq = logMinFreq + (i / (points - 1)) * (logMaxFreq - logMinFreq);
    const freq = Math.pow(10, logFreq);
    const magnitude = calculateCombinedFrequencyResponse(profile, freq, sampleRate);
    response.push(magnitude);
  }

  return response;
}

/**
 * Default EQ profile (neutral)
 */
export const DEFAULT_EQ_PROFILE: EQProfile = {
  preamp: 0,
  bands: [
    { enabled: true, fcHz: 32, gainDb: 0, q: 0.707, filterType: 'PK' },
    { enabled: true, fcHz: 64, gainDb: 0, q: 0.707, filterType: 'PK' },
    { enabled: true, fcHz: 125, gainDb: 0, q: 0.707, filterType: 'PK' },
    { enabled: true, fcHz: 250, gainDb: 0, q: 0.707, filterType: 'PK' },
    { enabled: true, fcHz: 500, gainDb: 0, q: 0.707, filterType: 'PK' },
    { enabled: true, fcHz: 1000, gainDb: 0, q: 0.707, filterType: 'PK' },
    { enabled: true, fcHz: 2000, gainDb: 0, q: 0.707, filterType: 'PK' },
    { enabled: true, fcHz: 4000, gainDb: 0, q: 0.707, filterType: 'PK' },
    { enabled: true, fcHz: 8000, gainDb: 0, q: 0.707, filterType: 'PK' },
    { enabled: true, fcHz: 16000, gainDb: 0, q: 0.707, filterType: 'PK' },
  ],
};
