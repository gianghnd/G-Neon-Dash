/**
 * Pattern catalog P1–P10 — frame-based element spacing.
 *
 * Responsibility: Static pattern data with minDifficulty gates and weights.
 */

import { computeSafeGapFrames, computeGroundFloatingMinFrames } from '../utils/fairness.js';

const safeGap = Math.ceil(computeSafeGapFrames());
const groundFloatingMin = Math.ceil(computeGroundFloatingMinFrames());

export const PATTERN_LIBRARY = [
  {
    id: 'P1',
    name: 'Single Ground',
    minDifficulty: 0,
    weight: 1,
    elements: [{ type: 'ground', skin: 'block', tMinFrames: 0 }],
  },
  {
    id: 'P2',
    name: 'Single Floating',
    minDifficulty: 0,
    weight: 1,
    elements: [{ type: 'floating', skin: 'bar', tMinFrames: 0 }],
  },
  {
    id: 'P3',
    name: 'Single Spike',
    minDifficulty: 0.2,
    weight: 1,
    elements: [{ type: 'ground', skin: 'spike', tMinFrames: 0 }],
  },
  {
    id: 'P4',
    name: 'Ground→Ground',
    minDifficulty: 0.35,
    weight: 1,
    elements: [
      { type: 'ground', skin: 'block', tMinFrames: 0 },
      { type: 'ground', skin: 'block', tMinFrames: safeGap },
    ],
  },
  {
    id: 'P5',
    name: 'Ground→Floating',
    minDifficulty: 0.35,
    weight: 1,
    elements: [
      { type: 'ground', skin: 'block', tMinFrames: 0 },
      { type: 'floating', skin: 'bar', tMinFrames: groundFloatingMin },
    ],
  },
  {
    id: 'P6',
    name: 'Floating→Ground',
    minDifficulty: 0.35,
    weight: 1,
    elements: [
      { type: 'floating', skin: 'bar', tMinFrames: 0 },
      { type: 'ground', skin: 'block', tMinFrames: safeGap },
    ],
  },
  {
    id: 'P7',
    name: 'Ground→Spike',
    minDifficulty: 0.55,
    weight: 1,
    elements: [
      { type: 'ground', skin: 'spike', tMinFrames: 0 },
      { type: 'ground', skin: 'block', tMinFrames: safeGap },
    ],
  },
  {
    id: 'P8',
    name: 'Ground→Ground→Floating',
    minDifficulty: 0.55,
    weight: 1,
    elements: [
      { type: 'ground', skin: 'block', tMinFrames: 0 },
      { type: 'ground', skin: 'block', tMinFrames: safeGap },
      { type: 'floating', skin: 'bar', tMinFrames: groundFloatingMin },
    ],
  },
  {
    id: 'P9',
    name: 'Floating→Ground→Floating',
    minDifficulty: 0.55,
    weight: 1,
    elements: [
      { type: 'floating', skin: 'bar', tMinFrames: 0 },
      { type: 'ground', skin: 'block', tMinFrames: safeGap },
      { type: 'floating', skin: 'bar', tMinFrames: groundFloatingMin },
    ],
  },
  {
    id: 'P10',
    name: 'Alternating Spike/Floating',
    minDifficulty: 0.85,
    weight: 0.25,
    elements: [
      { type: 'ground', skin: 'spike', tMinFrames: 0 },
      { type: 'floating', skin: 'bar', tMinFrames: groundFloatingMin },
      { type: 'ground', skin: 'spike', tMinFrames: safeGap },
      { type: 'floating', skin: 'bar', tMinFrames: groundFloatingMin },
    ],
  },
];

export const PATTERN_FALLBACK_ID = 'P1';

export function getPatternById(id) {
  return PATTERN_LIBRARY.find((pattern) => pattern.id === id) ?? PATTERN_LIBRARY[0];
}
