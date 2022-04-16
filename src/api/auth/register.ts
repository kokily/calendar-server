import type { Context } from 'koa';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { User } from '../../entities/User';
import { validateBody } from '../../libs/utils';
import { dataSource } from '../../server';

async function register(ctx: Context) {
  type RequestType = {
    username: string;
    password: string;
  };

  const schema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().min(4).required(),
  });

  if (!validateBody(ctx, schema)) return;

  const { username, password }: RequestType = ctx.request.body;

  try {
    const userRepo = await dataSource.getRepository(User);
    const exists = await userRepo.findOneBy({ username });

    if (exists) {
      ctx.status = 409;
      ctx.body = '이미 사용중인 아이디입니다.';
      return;
    }

    const user = new User();

    user.username = username;
    user.password = await bcrypt.hash(password, 10);

    await userRepo.save(user);

    ctx.body = {
      user_id: user.id,
      username: user.username,
    };
  } catch (err: any) {
    ctx.throw(500, err);
  }
}

export default register;
