import type { Context } from 'koa';
import { dataSource } from '../../server';
import { Calendar } from '../../entities/Calendar';

async function list(ctx: Context) {
  type QueryType = {
    month?: string;
    year?: string;
  };

  const { month, year }: QueryType = ctx.query;

  try {
    if (year && month) {
      let date;

      if (month.length < 2) {
        date = `${year}-0${month}`;
      } else {
        date = `${year}-${month}`;
      }

      const query = await dataSource
        .getRepository(Calendar)
        .createQueryBuilder('calendar')
        .where("to_char(calendar.date, 'YYYY-MM') = :date", { date });

      const calendar = await query.getMany();

      ctx.body = calendar;
    } else {
      return;
    }
  } catch (err: any) {
    ctx.throw(500, err);
  }
}

export default list;
