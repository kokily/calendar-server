import type { Middleware } from 'koa';
import { dataSource } from '../../server';
import { User } from '../../entities/User';

const authorize: Middleware = async (ctx, next) => {
  const userRepo = await dataSource.getRepository(User);

  if (!ctx.state.user) {
    ctx.status = 401;
    ctx.body = '로그인 후 이용하세요';
    return;
  }

  const user = await userRepo.findOneBy({ id: ctx.state.user.user_id });

  if (!user) {
    ctx.status = 404;
    ctx.body = '잘못된 로그인 정보입니다.';
    return;
  }

  return next();
};
