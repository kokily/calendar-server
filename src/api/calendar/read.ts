import type { Context } from 'koa';
import { dataSource } from '../../server';
import { Calendar } from '../../entities/Calendar';

async function read(ctx: Context) {
  const { id }: { id?: string } = ctx.params;

  try {
    const calendarRepo = await dataSource.getRepository(Calendar);
    const calendar = await calendarRepo.findBy({ id });

    if (!calendar) {
      ctx.status = 404;
      ctx.body = '존재하지 않는 캘린더입니다.';
      return;
    }

    ctx.body = calendar;
  } catch (err: any) {
    ctx.throw(500, err);
  }
}

export default read;
