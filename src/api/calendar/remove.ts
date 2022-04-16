import type { Context } from 'koa';
import { dataSource } from '../../server';
import { Calendar } from '../../entities/Calendar';

async function remove(ctx: Context) {
  const { id }: { id?: string } = ctx.params;

  try {
    const calendarRepo = await dataSource.getRepository(Calendar);

    await calendarRepo.delete({ id });

    ctx.status = 204;
  } catch (err: any) {
    ctx.throw(500, err);
  }
}

export default remove;
