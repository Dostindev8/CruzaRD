import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { authRouter } from './routes/auth.js';
import { iapRouter } from './routes/iap.js';
import { leaderboardRouter } from './routes/leaderboard.js';
import { loginRewardRouter } from './routes/loginReward.js';
import { missionsRouter } from './routes/missions.js';
import { playerRouter } from './routes/player.js';
import { runsRouter } from './routes/runs.js';
import { shopRouter } from './routes/shop.js';
import { spinRouter } from './routes/spin.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '64kb' }));
  app.use(globalLimiter);

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'cruza-rd-api' });
  });

  const v1 = express.Router();
  v1.use('/auth', authRouter);
  v1.use('/player', playerRouter);
  v1.use('/runs', runsRouter);
  v1.use('/leaderboard', leaderboardRouter);
  v1.use('/missions', missionsRouter);
  v1.use('/spin', spinRouter);
  v1.use('/login-reward', loginRewardRouter);
  v1.use('/shop', shopRouter);
  v1.use('/iap', iapRouter);

  app.use('/api/v1', v1);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
