import { Router } from 'express';

import SessionController from './app/controllers/SessionController';

import autoMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);

routes.use(autoMiddleware);

routes.get('/students', (req, res) => {
  return res.json({ ok: true, user_id: req.userId });
})

export default routes;
