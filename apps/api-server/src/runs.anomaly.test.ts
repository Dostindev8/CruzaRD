import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import { createApp } from './app.js';
import { computeServerScore } from '@cruza-rd/shared-types';

describe('POST /api/v1/runs — forged score anomaly', () => {
  let baseUrl = '';
  let server: ReturnType<ReturnType<typeof createApp>['listen']>;
  let token = '';

  before(async () => {
    const app = createApp();
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', () => resolve()));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;

    const authRes = await fetch(`${baseUrl}/api/v1/auth/guest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ deviceId: 'test-device-anomaly-001' }),
    });
    assert.equal(authRes.status, 200);
    const authBody = (await authRes.json()) as { accessToken: string };
    token = authBody.accessToken;
    assert.ok(token);
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it('flags SCORE_DELTA_GT_5PCT when client score is far above server score', async () => {
    const distanceMeters = 100;
    const bananasCollected = 2;
    const multiplierMax = 2;
    const validated = computeServerScore({
      distanceMeters,
      bananasCollected,
      multiplierMax,
    });
    // Forge: claim ~10x the legitimate score
    const forgedScore = Math.max(validated * 10, validated + 500);

    const res = await fetch(`${baseUrl}/api/v1/runs`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        distanceMeters,
        score: forgedScore,
        multiplierMax,
        coinsEarned: 50,
        picaPolloCollected: 0,
        bananasCollected,
        jumpsCount: 5,
        slidesCount: 1,
        powerupUsesCount: 0,
        revivesUsed: 0,
      }),
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      anomalyFlags: string[];
      validatedScore: number;
      coinsGranted: number;
      accepted: boolean;
    };

    assert.equal(body.accepted, true);
    assert.equal(body.validatedScore, validated);
    assert.ok(
      body.anomalyFlags.includes('SCORE_DELTA_GT_5PCT'),
      `expected SCORE_DELTA_GT_5PCT, got ${JSON.stringify(body.anomalyFlags)}`,
    );
    // Conservative coins: never above client claim, and below a naive grant
    assert.ok(body.coinsGranted <= 50);
    assert.ok(body.coinsGranted >= 0);
  });
});
