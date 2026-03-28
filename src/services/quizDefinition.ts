/**
 * Quiz Definition Service
 * Defines 7 quiz questions with 4 EQ variations each
 */

import type { EQProfile } from './filterMath';
import { generateFrequencyResponse } from './filterMath';

export interface QuizQuestion {
  id: number;
  title: string;
  description: string;
  variations: {
    label: 'A' | 'B' | 'C' | 'D';
    eqProfile: EQProfile;
  }[];
}

/**
 * Create a base profile for variations
 */
function createBaseProfile(): EQProfile {
  return {
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
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    title: 'Bass Character',
    description: 'Which bass response do you prefer?',
    variations: [
      {
        label: 'A',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[0].gainDb = 4; // 32 Hz: +4dB
          p.bands[1].gainDb = 6; // 64 Hz: +6dB
          p.bands[2].gainDb = 3; // 125 Hz: +3dB
          return p;
        })(),
      },
      {
        label: 'B',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[0].gainDb = 2;
          p.bands[1].gainDb = 2;
          p.bands[2].gainDb = 0;
          return p;
        })(),
      },
      {
        label: 'C',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[0].gainDb = -2;
          p.bands[1].gainDb = -1;
          p.bands[2].gainDb = 1;
          return p;
        })(),
      },
      {
        label: 'D',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[0].gainDb = 6;
          p.bands[1].gainDb = 8;
          p.bands[2].gainDb = 5;
          p.bands[3].gainDb = 2;
          return p;
        })(),
      },
    ],
  },
  {
    id: 2,
    title: 'Lower Midrange Warmth',
    description: 'Do you prefer warmth or clarity in the lower mids?',
    variations: [
      {
        label: 'A',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[3].gainDb = 5; // 250 Hz: warm
          p.bands[4].gainDb = 4; // 500 Hz: warm
          return p;
        })(),
      },
      {
        label: 'B',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[3].gainDb = 2;
          p.bands[4].gainDb = 1;
          return p;
        })(),
      },
      {
        label: 'C',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[3].gainDb = -3; // Clear, lean lower mids
          p.bands[4].gainDb = -2;
          return p;
        })(),
      },
      {
        label: 'D',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[2].gainDb = 3;
          p.bands[3].gainDb = 4;
          p.bands[4].gainDb = 3;
          p.bands[5].gainDb = 1;
          return p;
        })(),
      },
    ],
  },
  {
    id: 3,
    title: 'Midrange Presence',
    description: 'How forward should the vocals/presence be?',
    variations: [
      {
        label: 'A',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[5].gainDb = 6; // 1kHz: presence peak
          p.bands[6].gainDb = 4; // 2kHz: presence
          return p;
        })(),
      },
      {
        label: 'B',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[5].gainDb = 3;
          p.bands[6].gainDb = 2;
          return p;
        })(),
      },
      {
        label: 'C',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[5].gainDb = -2; // Recessed
          p.bands[6].gainDb = -1;
          return p;
        })(),
      },
      {
        label: 'D',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[5].gainDb = 8;
          p.bands[6].gainDb = 6;
          p.bands[7].gainDb = 2;
          return p;
        })(),
      },
    ],
  },
  {
    id: 4,
    title: 'Treble Presence & Brilliance',
    description: 'How much air and brightness do you want?',
    variations: [
      {
        label: 'A',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[7].gainDb = 5; // 4kHz brightness
          p.bands[8].gainDb = 6; // 8kHz air
          p.bands[9].gainDb = 4; // 16kHz brilliance
          return p;
        })(),
      },
      {
        label: 'B',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[7].gainDb = 2;
          p.bands[8].gainDb = 2;
          p.bands[9].gainDb = 1;
          return p;
        })(),
      },
      {
        label: 'C',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[7].gainDb = -2; // Dark, rolled off treble
          p.bands[8].gainDb = -3;
          p.bands[9].gainDb = -4;
          return p;
        })(),
      },
      {
        label: 'D',
        eqProfile: (() => {
          const p = createBaseProfile();
          p.bands[7].gainDb = 7;
          p.bands[8].gainDb = 8;
          p.bands[9].gainDb = 6;
          return p;
        })(),
      },
    ],
  },
  {
    id: 5,
    title: 'Brightness vs Warmth Overall',
    description: 'Bright and analytical or warm and smooth?',
    variations: [
      {
        label: 'A',
        eqProfile: (() => {
          const p = createBaseProfile();
          // Bright and analytical
          p.bands[3].gainDb = -2;
          p.bands[4].gainDb = -2;
          p.bands[6].gainDb = 3;
          p.bands[7].gainDb = 4;
          p.bands[8].gainDb = 5;
          return p;
        })(),
      },
      {
        label: 'B',
        eqProfile: (() => {
          const p = createBaseProfile();
          // Balanced
          p.bands[3].gainDb = 1;
          p.bands[5].gainDb = 2;
          p.bands[7].gainDb = 2;
          return p;
        })(),
      },
      {
        label: 'C',
        eqProfile: (() => {
          const p = createBaseProfile();
          // Warm and smooth
          p.bands[1].gainDb = 2;
          p.bands[3].gainDb = 3;
          p.bands[5].gainDb = 2;
          p.bands[7].gainDb = -2;
          p.bands[8].gainDb = -3;
          return p;
        })(),
      },
      {
        label: 'D',
        eqProfile: (() => {
          const p = createBaseProfile();
          // Very warm, lush
          p.bands[0].gainDb = 3;
          p.bands[1].gainDb = 4;
          p.bands[2].gainDb = 2;
          p.bands[3].gainDb = 4;
          p.bands[5].gainDb = 1;
          p.bands[7].gainDb = -4;
          return p;
        })(),
      },
    ],
  },
  {
    id: 6,
    title: 'Problem Frequency Control',
    description: 'How would you handle potential mud and harshness?',
    variations: [
      {
        label: 'A',
        eqProfile: (() => {
          const p = createBaseProfile();
          // Scoop mids (remove mud and harshness)
          p.bands[3].gainDb = -3; // 250 Hz: less mud
          p.bands[4].gainDb = -2; // 500 Hz
          p.bands[6].gainDb = -2; // 2kHz: less harshness
          return p;
        })(),
      },
      {
        label: 'B',
        eqProfile: (() => {
          const p = createBaseProfile();
          // Gentle scoop
          p.bands[3].gainDb = -1;
          p.bands[4].gainDb = -1;
          p.bands[6].gainDb = -1;
          return p;
        })(),
      },
      {
        label: 'C',
        eqProfile: (() => {
          const p = createBaseProfile();
          // Boost problematic areas for color
          p.bands[2].gainDb = 2; // 125 Hz
          p.bands[4].gainDb = 2; // 500 Hz: interesting color
          p.bands[6].gainDb = 2; // 2kHz: color
          return p;
        })(),
      },
      {
        label: 'D',
        eqProfile: (() => {
          const p = createBaseProfile();
          // Aggressive scoop
          p.bands[3].gainDb = -4;
          p.bands[4].gainDb = -4;
          p.bands[5].gainDb = -2;
          p.bands[6].gainDb = -3;
          return p;
        })(),
      },
    ],
  },
  {
    id: 7,
    title: 'Overall Tonal Refinement',
    description: 'Final refinement: which overall signature feels right?',
    variations: [
      {
        label: 'A',
        eqProfile: (() => {
          const p = createBaseProfile();
          // Studio neutral with slight presence
          p.bands[5].gainDb = 2;
          p.bands[7].gainDb = 1;
          return p;
        })(),
      },
      {
        label: 'B',
        eqProfile: (() => {
          const p = createBaseProfile();
          // Popular/consumer curve (smile)
          p.bands[0].gainDb = 3;
          p.bands[1].gainDb = 2;
          p.bands[5].gainDb = 1;
          p.bands[8].gainDb = 3;
          p.bands[9].gainDb = 4;
          return p;
        })(),
      },
      {
        label: 'C',
        eqProfile: (() => {
          const p = createBaseProfile();
          // Cinema/film mix (warm and present mids)
          p.bands[3].gainDb = 3;
          p.bands[5].gainDb = 4;
          p.bands[6].gainDb = 2;
          p.bands[8].gainDb = -2;
          return p;
        })(),
      },
      {
        label: 'D',
        eqProfile: (() => {
          const p = createBaseProfile();
          // Bass-heavy headphone curve
          p.bands[0].gainDb = 6;
          p.bands[1].gainDb = 5;
          p.bands[5].gainDb = 2;
          p.bands[7].gainDb = 4;
          p.bands[8].gainDb = 3;
          return p;
        })(),
      },
    ],
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Automatically assign filter type + Q factor from the derived gain contour.
 * This mimics how a human usually starts broad (shelves/low Q) and narrows
 * only where local peaks/dips need more surgical shaping.
 */
function autoAssignQAndFilters(profile: EQProfile): void {
  const gains = profile.bands.map((band) => band.gainDb);

  // Broad low/high tilt detection to decide shelf usage on the extremes.
  const lowAvg = (gains[0] + gains[1] + gains[2]) / 3;
  const lowMidAvg = (gains[3] + gains[4] + gains[5]) / 3;
  const highAvg = (gains[7] + gains[8] + gains[9]) / 3;
  const highMidAvg = (gains[4] + gains[5] + gains[6]) / 3;

  const lowTilt = lowAvg - lowMidAvg;
  const highTilt = highAvg - highMidAvg;

  for (let i = 0; i < profile.bands.length; i++) {
    const band = profile.bands[i];
    const gain = Math.abs(band.gainDb);

    const prev = i > 0 ? gains[i - 1] : gains[i];
    const next = i < gains.length - 1 ? gains[i + 1] : gains[i];
    const localProminence = Math.abs(gains[i] - (prev + next) / 2);

    // Filter type selection
    if (i === 0) {
      band.filterType = Math.abs(lowTilt) >= 0.8 ? 'LSC' : 'PK';
    } else if (i === profile.bands.length - 1) {
      band.filterType = Math.abs(highTilt) >= 0.8 ? 'HSC' : 'PK';
    } else {
      band.filterType = 'PK';
    }

    // Q factor selection
    if (band.filterType === 'PK') {
      // Narrower Q when local feature is sharper, broader when tilt-like.
      const q = 0.55 + 0.45 * localProminence + 0.08 * gain;
      band.q = Math.round(clamp(q, 0.4, 4.5) * 100) / 100;
    } else {
      // Shelves are usually broader by default.
      const shelfQ = 0.55 + 0.05 * gain;
      band.q = Math.round(clamp(shelfQ, 0.45, 1.2) * 100) / 100;
    }
  }
}

/**
 * Set a safe preamp based on the final EQ curve so boosted regions do not clip.
 * Targets approximately 1 dB of peak headroom.
 */
function autoAssignPreampForHeadroom(profile: EQProfile): void {
  const originalPreamp = profile.preamp;
  profile.preamp = 0;

  const response = generateFrequencyResponse(profile, 48000, 512);
  const maxBoostDb = response.reduce((max, value) => Math.max(max, value), -Infinity);

  const targetPeakDb = -1.0;
  const recommendedPreamp = Math.min(0, targetPeakDb - maxBoostDb);

  // Keep inside UI control range.
  profile.preamp = Math.round(clamp(recommendedPreamp, -12, 0) * 10) / 10;

  // Preserve any intentional lower preamp if it was already more conservative.
  if (originalPreamp < profile.preamp) {
    profile.preamp = originalPreamp;
  }
}

/**
 * Derive EQ profile from quiz answers
 * @param answers Array of answer indices (0-3 for A-D) for each question
 * @returns Blended EQ profile based on selected variations
 */
export function deriveEQFromQuiz(answers: number[]): EQProfile {
  if (answers.length !== QUIZ_QUESTIONS.length) {
    throw new Error('Invalid number of answers');
  }

  const resultProfile = createBaseProfile();

  // Average the selected variations across all questions
  for (let questionIdx = 0; questionIdx < answers.length; questionIdx++) {
    const answerIdx = answers[questionIdx];
    const question = QUIZ_QUESTIONS[questionIdx];
    const selectedVariation = question.variations[answerIdx];

    // Add each band from the selected variation
    for (let bandIdx = 0; bandIdx < selectedVariation.eqProfile.bands.length; bandIdx++) {
      resultProfile.bands[bandIdx].gainDb += selectedVariation.eqProfile.bands[bandIdx].gainDb / answers.length;
    }

    // Add preamp contribution
    resultProfile.preamp += selectedVariation.eqProfile.preamp / answers.length;
  }

  // Round to reasonable precision (0.1 dB)
  for (const band of resultProfile.bands) {
    band.gainDb = Math.round(band.gainDb * 10) / 10;
  }
  resultProfile.preamp = Math.round(resultProfile.preamp * 10) / 10;

  // Auto-design filter topology and Q after quiz, before manual fine tuning.
  autoAssignQAndFilters(resultProfile);
  autoAssignPreampForHeadroom(resultProfile);

  return resultProfile;
}
