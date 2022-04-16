import Router from 'koa-router';
import auth from './auth';
import calendar from './calendar';

const api = new Router();

api.use('/auth', auth.routes());
api.use('/calendar', calendar.routes());

export default api;
