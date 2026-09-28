#!/usr/bin/env node

/**
 * Project validation script.
 * Checks file structure, required docs, and config exports.
 */

import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const REQUIRED_DIRS = [
  'docs',
  'prompts/claude',
  'prompts/cursor',
  'prompts/chatgpt',
  'src/core',
  'src/config',
  'src/entities',
  'src/systems',
  'src/input',
  'src/ui',
  'src/utils',
  'tests',
  'scripts',
];

const REQUIRED_FILES = [
  'MASTER-RULES.md',
  'README.md',
  'index.html',
  'styles.css',
  'package.json',
  'src/main.js',
  'src/core/Game.js',
  'src/core/GameState.js',
  'src/core/GameLoop.js',
  'src/config/gameConfig.js',
  'src/entities/Player.js',
  'src/entities/Obstacle.js',
  'src/systems/CollisionSystem.js',
  'src/systems/ScoreSystem.js',
  'src/systems/SpawnSystem.js',
  'src/input/InputManager.js',
  'src/ui/UIManager.js',
  'src/utils/math.js',
];

const REQUIRED_DOCS = [
  'docs/00-GAME-OVERVIEW.md',
  'docs/01-GAME-DESIGN.md',
  'docs/02-GAMEPLAY-SPEC.md',
  'docs/03-DIFFICULTY-SYSTEM.md',
  'docs/04-PATTERN-LIBRARY.md',
  'docs/05-FEEDBACK-SYSTEM.md',
  'docs/06-UX-FLOW.md',
  'docs/07-MONETIZATION.md',
  'docs/08-ANALYTICS.md',
  'docs/09-TECH-ARCHITECTURE.md',
  'docs/10-CONFIGURATION.md',
  'docs/11-FEATURE-FLAGS.md',
  'docs/12-TESTING.md',
  'docs/13-DECISION-LOG.md',
  'docs/14-LESSONS-LEARNED.md',
  'docs/15-CURRENT-STATUS.md',
  'docs/16-HANDOFF.md',
  'docs/17-EXTERNAL-REVIEW.md',
];

const SECRET_FILES = ['.env', 'credentials.json'];

let errors = 0;

function check(condition, message) {
  if (!condition) {
    console.error(`✗ ${message}`);
    errors++;
  } else {
    console.log(`✓ ${message}`);
  }
}

console.log('Neon Dash — Project Validation\n');

for (const dir of REQUIRED_DIRS) {
  check(existsSync(join(ROOT, dir)), `Directory: ${dir}`);
}

for (const file of REQUIRED_FILES) {
  check(existsSync(join(ROOT, file)), `File: ${file}`);
}

for (const doc of REQUIRED_DOCS) {
  check(existsSync(join(ROOT, doc)), `Doc: ${doc}`);
}

for (const secretFile of SECRET_FILES) {
  check(!existsSync(join(ROOT, secretFile)), `No secret file: ${secretFile}`);
}

try {
  const configUrl = new URL('../src/config/gameConfig.js', import.meta.url);
  const config = await import(configUrl);
  check(config.PLAYER_CONFIG !== undefined, 'Config export: PLAYER_CONFIG');
  check(config.GAME_CONFIG !== undefined, 'Config export: GAME_CONFIG');
  check(config.FEATURE_FLAGS !== undefined, 'Config export: FEATURE_FLAGS');
  check(config.FEATURE_FLAGS.difficultyDirectorV2 === false, 'Feature flag difficultyDirectorV2 defaults OFF');
  check(config.FEATURE_FLAGS.patternSystemV2 === false, 'Feature flag patternSystemV2 defaults OFF');
  check(config.FEATURE_FLAGS.shieldSystem === false, 'Feature flag shieldSystem defaults OFF');
  check(config.DIFFICULTY_CONFIG.physicsFps === 60, 'DIFFICULTY_CONFIG.physicsFps set');
} catch (e) {
  check(false, `Config import failed: ${e.message}`);
}

console.log(`\nValidation complete: ${errors} error(s)`);
process.exit(errors > 0 ? 1 : 0);
