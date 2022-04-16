import Router from 'koa-router';
import check from './check';
import login from './login';
import logout from './logout';
import register from './register';

const auth = new Router();

auth.get('/check', check);
auth.post('/login', login);
auth.post('/logout', logout);
auth.post('/register', register);

export default auth;
