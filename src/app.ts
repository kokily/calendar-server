import Koa from 'koa';
import Router from 'koa-router';
import logger from 'koa-logger';
import bodyParser from 'koa-body';
import cors from './libs/middlewares/cors';

const app = new Koa();
const router = new Router();

app.use(cors);
app.use(logger());
app.use(bodyParser({ multipart: true }));
app.use(router.routes());
app.use(router.allowedMethods());

export default app;
