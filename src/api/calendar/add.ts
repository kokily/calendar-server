import type { Context } from 'koa';
import Joi from 'joi';
import { dataSource } from '../../server';
import { Calendar, TimeType } from '../../entities/Calendar';
import { validateBody } from '../../libs/utils';

async function add(ctx: Context) {
  type RequestType = {
    body: string;
    date: Date;
    time: TimeType;
  };

  const schema = Joi.object().keys({
    body: Joi.string().required(),
    date: Joi.string().required(),
    time: Joi.string().required(),
  });

  if (!validateBody(ctx, schema)) return;

  const { body, date, time }: RequestType = ctx.request.body;

  try {
    const valid = `${new Date(date).getFullYear()}-${
      new Date(date).getMonth() + 1
    }-${new Date(date).getDay()}`;
    const calendarRepo = await dataSource.getRepository(Calendar);

    const exists = await calendarRepo.findOneBy({ selected: valid, time });

    if (exists) {
      ctx.status = 409;
      ctx.body = '이미 기록된 일정입니다.';
      return;
    }

    const calendar = new Calendar();

    calendar.body = body;
    calendar.date = date;
    calendar.time = time;
    calendar.selected = valid;

    await calendarRepo.save(calendar);

    ctx.status = 200;
  } catch (err: any) {
    ctx.throw(500, err);
  }
}

export default add;
