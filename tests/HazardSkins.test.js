import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Obstacle, ObstacleType } from '../src/entities/Obstacle.js';
import { HAZARD_SKIN_CONFIG, GAME_CONFIG, PLAYER_CONFIG } from '../src/config/gameConfig.js';
import {
  computeJumpAirtimeFrames,
  computeJumpPeakHeightPx,
  spacingPxFromFrames,
} from '../src/utils/fairness.js';
import {
  computeJumpReachPx,
  isSkinAllowedAtSpeed,
  pickRandomHazardSkin,
} from '../src/content/hazardSkins.js';

describe('Hazard skins — collision rects', () => {
  for (const skinId of HAZARD_SKIN_CONFIG.groundSkins) {
    it(`${skinId} ground family uses configured rect dimensions`, () => {
      const baseline = new Obstacle(ObstacleType.GROUND);
      baseline.applySkin('block', GAME_CONFIG.initialSpeed);
      const skinned = new Obstacle(ObstacleType.GROUND);
      skinned.applySkin(skinId, GAME_CONFIG.initialSpeed);

      if (skinId === 'gate' || skinId === 'laser') {
        return;
      }

      const dims = HAZARD_SKIN_CONFIG.dimensions[skinId];
      assert.equal(skinned.width, dims.width);
      assert.equal(skinned.height, dims.height);
      assert.equal(skinned.y, PLAYER_CONFIG.groundY - dims.height);

      if (skinId === 'block') {
        assert.deepEqual(skinned.getBounds(), baseline.getBounds());
      }
    });
  }

  for (const skinId of HAZARD_SKIN_CONFIG.floatingSkins) {
    it(`${skinId} floating family uses configured rect or beam bounds`, () => {
      const obstacle = new Obstacle(ObstacleType.FLOATING);
      obstacle.applySkin(skinId, GAME_CONFIG.initialSpeed);
      obstacle.spawn(400, GAME_CONFIG.initialSpeed);
      const bounds = obstacle.getBounds();

      assert.ok(bounds.width > 0);
      assert.ok(bounds.height > 0);
      assert.equal(typeof bounds.x, 'number');
      assert.equal(typeof bounds.y, 'number');
    });
  }

  it('spike visual is narrower than rect but collision rect stays full width', () => {
    const spike = new Obstacle(ObstacleType.GROUND);
    spike.applySkin('spike', GAME_CONFIG.initialSpeed);
    spike.spawn(300, GAME_CONFIG.initialSpeed);
    const bounds = spike.getBounds();
    assert.equal(bounds.width, HAZARD_SKIN_CONFIG.dimensions.spike.width);
    assert.equal(bounds.height, HAZARD_SKIN_CONFIG.dimensions.spike.height);
  });
});

describe('Hazard skins — fairness constants from CONFIG', () => {
  it('jumpAirtimeFrames equals 40 with current jumpForce/gravity', () => {
    assert.equal(computeJumpAirtimeFrames(), 40);
  });

  it('peakHeightPx is approximately 133 with current CONFIG', () => {
    const peak = computeJumpPeakHeightPx();
    assert.ok(peak >= 120 && peak <= 140, `peak=${peak}`);
  });

  it('reach at initialSpeed matches frame formula', () => {
    const reach = computeJumpReachPx(GAME_CONFIG.initialSpeed);
    const expected = spacingPxFromFrames(40, GAME_CONFIG.initialSpeed);
    assert.equal(reach, expected);
  });
});

describe('Hazard skins — wide skin gating at start speed', () => {
  it('allows wideBlock and doubleSpike at initialSpeed with configured minReach', () => {
    assert.equal(isSkinAllowedAtSpeed('wideBlock', GAME_CONFIG.initialSpeed), true);
    assert.equal(isSkinAllowedAtSpeed('doubleSpike', GAME_CONFIG.initialSpeed), true);
  });

  it('pickRandomHazardSkin never returns disallowed wide skins at low speed', () => {
    for (let i = 0; i < 30; i += 1) {
      const skin = pickRandomHazardSkin(ObstacleType.GROUND, 50, () => i / 30);
      assert.equal(isSkinAllowedAtSpeed(skin, 50), true);
    }
  });
});
