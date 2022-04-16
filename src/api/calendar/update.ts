import type { Context } from 'koa';
import Joi from 'joi';
import { dataSource } from '../../server';
import { Calendar } from '../../entities/Calendar';
import { validateBody } from '../../libs/utils';

async function update(ctx: Context) {
  const { id }: { id?: string } = ctx.params;

  type RequestType = {
    body: string;
  };

  const schema = Joi.object().keys({
    body: Joi.string().required(),
  });

  if (!validateBody(ctx, schema)) return;

  const { body }: RequestType = ctx.request.body;

  try {
    const calendarRepo = await dataSource.getRepository(Calendar);

    await calendarRepo.update({ id }, { body });

    ctx.status = 200;
  } catch (err: any) {
    ctx.throw(500, err);
  }
}

export default update;
