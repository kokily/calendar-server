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
    let date;

    if (year && month) {
      if (month.length < 2) {
        date = `${year}-0${month}`;
      } else {
        date = `${year}-${month}`;
      }
    } else if (!year && !month) {
      if (new Date().getMonth().toString().length < 2) {
        date = `${new Date().getFullYear()}-0${new Date().getMonth()}`;
      } else {
        date = `${new Date().getFullYear()}-${new Date().getMonth()}`;
      }
    }

    const query = await dataSource
      .getRepository(Calendar)
      .createQueryBuilder('calendar')
      .where("to_char(calendar.date, 'YYYY-MM') = :date", { date });

    const calendar = await query.getMany();

    ctx.body = calendar;
  } catch (err: any) {
    ctx.throw(500, err);
  }
}

export default list;
