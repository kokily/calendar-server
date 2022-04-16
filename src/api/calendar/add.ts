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
    const calendarRepo = await dataSource.getRepository(Calendar);
    const calendar = new Calendar();

    calendar.body = body;
    calendar.date = date;
    calendar.time = time;

    await calendarRepo.save(calendar);

    ctx.body = calendar;
  } catch (err: any) {
    ctx.throw(500, err);
  }
}

export default add;
