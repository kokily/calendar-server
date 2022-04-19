import Router from 'koa-router';
import authorized from '../../libs/middlewares/authorized';
import add from './add';
import list from './list';
import read from './read';
import remove from './remove';
import update from './update';

const calendar = new Router();

calendar.post('/', add);
calendar.get('/', list);
calendar.get('/:id', authorized, read);
calendar.delete('/:id', authorized, remove);
calendar.patch('/:id', authorized, update);

export default calendar;
