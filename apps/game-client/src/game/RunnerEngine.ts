import {
  BASE_SPEED,
  CHUNK_LENGTH,
  LANE_COUNT,
  LANE_LERP_MS,
  MAX_SKATE_CHARGES,
  SKATE_DURATION_S,
  SKATE_SPEED_BONUS,
  SLIDE_DURATION_MS,
  laneX,
  sampleDifficulty,
} from './DifficultyCurve';
import { ScoreManager } from './ScoreManager';
import type { Gesture } from './InputController';

export type ObstacleKind =
  | 'barrier_high'
  | 'barrier_low'
  | 'train'
  | 'container'
  | 'motoconcho'
  | 'gap';

export type CollectibleKind = 'banana' | 'coin' | 'pica_pollo' | 'mangu' | 'skate_charge';

export interface WorldEntity {
  id: number;
  kind: ObstacleKind | CollectibleKind;
  isCollectible: boolean;
  lane: number;
  z: number;
  y: number;
  collected?: boolean;
}

export interface RunnerSnapshot {
  lane: number;
  x: number;
  y: number;
  z: number;
  sliding: boolean;
  jumping: boolean;
  skating: boolean;
  skateCharges: number;
  skateFill: number;
  entities: WorldEntity[];
  score: ScoreManager;
  paused: boolean;
  dead: boolean;
  invulnerable: boolean;
}

let nextId = 1;

export class RunnerEngine {
  score = new ScoreManager();
  lane = 1;
  x = 0;
  y = 0;
  worldZ = 0;
  velY = 0;
  slidingUntil = 0;
  skatingUntil = 0;
  skateCharges: number;
  paused = false;
  dead = false;
  invulnerable = false;
  entities: WorldEntity[] = [];
  private nextChunkAt = 0;
  private laneFromX = 0;
  private laneToX = 0;
  private laneLerpT = 1;
  private onDeath?: () => void;
  private onMissionHint?: (msg: string) => void;

  constructor(initialSkate = 8) {
    this.skateCharges = Math.min(MAX_SKATE_CHARGES, initialSkate);
    this.spawnChunk(0);
    this.spawnChunk(CHUNK_LENGTH);
    this.nextChunkAt = CHUNK_LENGTH * 2;
  }

  setCallbacks(opts: { onDeath?: () => void; onMissionHint?: (msg: string) => void }) {
    this.onDeath = opts.onDeath;
    this.onMissionHint = opts.onMissionHint;
  }

  reset(skateCharges = this.skateCharges) {
    this.score = new ScoreManager();
    this.lane = 1;
    this.x = 0;
    this.y = 0;
    this.worldZ = 0;
    this.velY = 0;
    this.slidingUntil = 0;
    this.skatingUntil = 0;
    this.skateCharges = skateCharges;
    this.paused = false;
    this.dead = false;
    this.invulnerable = false;
    this.entities = [];
    this.nextChunkAt = 0;
    this.spawnChunk(0);
    this.spawnChunk(CHUNK_LENGTH);
    this.nextChunkAt = CHUNK_LENGTH * 2;
  }

  revive() {
    this.dead = false;
    this.paused = false;
    this.invulnerable = true;
    this.skatingUntil = performance.now() / 1000 + 2;
    // clear nearby obstacles
    this.entities = this.entities.filter((e) => e.z > this.worldZ + 18 || e.isCollectible);
  }

  applyGesture(g: Gesture, nowMs: number) {
    if (!g || this.paused || this.dead) return;
    if (g === 'jump') this.jump();
    if (g === 'slide') {
      this.slidingUntil = nowMs + SLIDE_DURATION_MS;
      this.score.slides += 1;
    }
    if (g === 'left') this.changeLane(-1);
    if (g === 'right') this.changeLane(1);
    if (g === 'doubleTap') this.activateSkate(nowMs / 1000);
  }

  private jump() {
    if (this.y <= 0.05) {
      this.velY = 7.2;
      this.score.jumps += 1;
    }
  }

  private changeLane(dir: number) {
    const next = Math.max(0, Math.min(LANE_COUNT - 1, this.lane + dir));
    if (next === this.lane) return;
    this.lane = next;
    this.laneFromX = this.x;
    this.laneToX = laneX(next);
    this.laneLerpT = 0;
  }

  private activateSkate(nowS: number) {
    if (this.skateCharges <= 0 || nowS < this.skatingUntil) return;
    this.skateCharges -= 1;
    this.skatingUntil = nowS + SKATE_DURATION_S;
    this.score.powerupUses += 1;
  }

  tick(dt: number, nowMs: number) {
    if (this.paused || this.dead) return this.snapshot();

    const nowS = nowMs / 1000;
    const skating = nowS < this.skatingUntil;
    this.invulnerable = skating;
    const diff = sampleDifficulty(this.score.distance);
    const speed = BASE_SPEED * diff.speedMult * (skating ? SKATE_SPEED_BONUS : 1);

    this.worldZ += speed * dt;
    this.score.addDistance(speed * dt);

    // gravity / jump
    this.velY -= 22 * dt;
    this.y += this.velY * dt;
    if (this.y < 0) {
      this.y = 0;
      this.velY = 0;
    }

    // lane lerp
    if (this.laneLerpT < 1) {
      this.laneLerpT = Math.min(1, this.laneLerpT + (dt * 1000) / LANE_LERP_MS);
      const t = this.laneLerpT;
      this.x = this.laneFromX + (this.laneToX - this.laneFromX) * t;
    } else {
      this.x = laneX(this.lane);
    }

    // chunks
    while (this.worldZ + CHUNK_LENGTH * 1.5 > this.nextChunkAt) {
      this.spawnChunk(this.nextChunkAt, diff.obstacleDensity);
      this.nextChunkAt += CHUNK_LENGTH;
    }

    // cull behind
    this.entities = this.entities.filter((e) => e.z > this.worldZ - 8);

    this.resolveCollisions(nowMs, skating);
    return this.snapshot();
  }

  private spawnChunk(z0: number, density = 0.4) {
    // Grace period: no obstacles in the first ~25m so the player can learn controls
    if (z0 < 25) {
      for (let i = 0; i < 3; i++) {
        this.entities.push({
          id: nextId++,
          kind: i % 2 === 0 ? 'coin' : 'banana',
          isCollectible: true,
          lane: i % 3,
          z: z0 + 8 + i * 6,
          y: 1.2,
        });
      }
      return;
    }
    const count = Math.floor(2 + density * 5);
    for (let i = 0; i < count; i++) {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const z = z0 + 6 + Math.random() * (CHUNK_LENGTH - 10);
      const roll = Math.random();
      if (roll < 0.55) {
        const kinds: ObstacleKind[] = [
          'barrier_high',
          'barrier_low',
          'container',
          'train',
          'motoconcho',
          'gap',
        ];
        const kind = kinds[Math.floor(Math.random() * kinds.length)];
        this.entities.push({
          id: nextId++,
          kind,
          isCollectible: false,
          lane,
          z,
          y: kind === 'barrier_low' ? 0.4 : kind === 'gap' ? -0.5 : 0.6,
        });
      } else {
        const ck: CollectibleKind[] =
          Math.random() < 0.08
            ? ['mangu']
            : Math.random() < 0.12
              ? ['skate_charge']
              : Math.random() < 0.35
                ? ['pica_pollo']
                : Math.random() < 0.55
                  ? ['banana']
                  : ['coin'];
        this.entities.push({
          id: nextId++,
          kind: ck[0],
          isCollectible: true,
          lane,
          z,
          y: 1.2,
        });
      }
    }

    // side dressing markers (no collision) as decorative containers far lanes — skip
  }

  private resolveCollisions(nowMs: number, skating: boolean) {
    const sliding = nowMs < this.slidingUntil;
    for (const e of this.entities) {
      if (e.collected) continue;
      const dz = e.z - this.worldZ;
      if (Math.abs(dz) > 1.1) continue;
      if (e.lane !== this.lane) continue;

      if (e.isCollectible) {
        e.collected = true;
        switch (e.kind) {
          case 'banana':
            this.score.collectBanana();
            break;
          case 'coin':
            this.score.collectCoin();
            break;
          case 'pica_pollo':
            this.score.collectPicaPollo();
            break;
          case 'mangu':
            this.score.collectMangu();
            break;
          case 'skate_charge':
            this.skateCharges = Math.min(MAX_SKATE_CHARGES, this.skateCharges + 1);
            break;
        }
        continue;
      }

      if (skating) continue;

      let hit = false;
      if (e.kind === 'barrier_high' && this.y < 1.1) hit = true;
      if (e.kind === 'barrier_low' && !sliding) hit = true;
      if (e.kind === 'gap' && this.y < 0.9) hit = true;
      if (e.kind === 'container' || e.kind === 'train' || e.kind === 'motoconcho') {
        if (this.y < 1.35) hit = true;
      }

      if (hit) {
        this.score.resetStreak();
        this.dead = true;
        this.onDeath?.();
        break;
      }
    }
  }

  snapshot(): RunnerSnapshot {
    const nowS = performance.now() / 1000;
    return {
      lane: this.lane,
      x: this.x,
      y: this.y,
      z: this.worldZ,
      sliding: performance.now() < this.slidingUntil,
      jumping: this.y > 0.05,
      skating: nowS < this.skatingUntil,
      skateCharges: this.skateCharges,
      skateFill: this.skateCharges / MAX_SKATE_CHARGES,
      entities: this.entities.filter((e) => !e.collected),
      score: this.score,
      paused: this.paused,
      dead: this.dead,
      invulnerable: this.invulnerable,
    };
  }
}
