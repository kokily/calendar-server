import type { Context } from 'koa';
import { dataSource } from '../../server';
import { Token } from '../../entities/Token';
import { User } from '../../entities/User';

async function check(ctx: Context) {
  try {
    const { user_id } = ctx.state.user;

    if (!user_id) {
      ctx.throw(401, '로그인 후 이용해 주세요.');
    }

    const userRepo = await dataSource.getRepository(User);
    const tokenRepo = await dataSource.getRepository(Token);
    const user = await userRepo.findOneBy({ id: user_id });

    if (!user) {
      ctx.status = 401;
      ctx.body = '로그인 후 이용해 주세요.';
      return;
    }

    const token = await tokenRepo.findOneBy({ fk_user_id: user.id });

    if (!token) {
      ctx.status = 401;
      ctx.body = '토큰이 존재하지 않습니다.';
      return;
    }

    ctx.body = {
      user_id,
      username: user.username,
    };
  } catch (err: any) {
    ctx.throw(500, err);
  }
}

export default check;
