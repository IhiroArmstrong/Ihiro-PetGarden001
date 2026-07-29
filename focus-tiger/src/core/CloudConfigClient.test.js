import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createCloudConfigClient } from './CloudConfigClient.js';
import {
  DEFAULT_CELEBRATE_DANCE_WEIGHTS,
  pickDailyMessageKey
} from './softScheduleConfig.js';

describe('CloudConfigClient · mode local', () => {
  it('does not call fetch; celebrating table matches SSOT', async () => {
    let fetches = 0;
    const client = createCloudConfigClient({
      mode: 'local',
      fetchImpl: async () => {
        fetches += 1;
        throw new Error('should not fetch');
      }
    });

    const celebrating = await client.getEmotionWeightTable('celebrating', 'focus', {
      localDate: '2026-07-29'
    });
    assert.equal(fetches, 0);
    assert.equal(celebrating.configured, true);
    assert.deepEqual([...celebrating.variants], [...DEFAULT_CELEBRATE_DANCE_WEIGHTS]);

    const idle = await client.getEmotionWeightTable('idle', 'idle', {
      localDate: '2026-07-29'
    });
    assert.equal(idle.configured, false);
    assert.equal(idle.variants.length, 0);
  });

  it('daily message equals softScheduleConfig pick; caches by localDate', async () => {
    const client = createCloudConfigClient({ mode: 'local' });
    const expected = pickDailyMessageKey({
      locale: 'zh',
      localDate: '2026-07-29',
      slot: 'tech_verify'
    });
    const a = await client.getDailyMessage({
      locale: 'zh',
      localDate: '2026-07-29'
    });
    const b = await client.getDailyMessage({
      locale: 'zh',
      localDate: '2026-07-29'
    });
    assert.deepEqual(a, expected);
    assert.deepEqual(b, expected);
  });

  it('remote failure falls back to local (principle 6)', async () => {
    const client = createCloudConfigClient({
      mode: 'remote',
      baseUrl: 'https://example.test',
      fetchImpl: async () => {
        throw new Error('network');
      }
    });
    const payload = await client.getEmotionWeightTable('Celebrating', 'focus', {
      localDate: '2026-07-29'
    });
    assert.equal(payload.configured, true);
    assert.deepEqual([...payload.variants], [...DEFAULT_CELEBRATE_DANCE_WEIGHTS]);
  });
});
