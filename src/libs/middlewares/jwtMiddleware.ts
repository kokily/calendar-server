import type { Middleware } from 'koa';
import { dataSource } from '../../server';
import { Token } from '../../entities/Token';
import { User } from '../../entities/User';
import {
  AccessToken,
  createToken,
  decodeToken,
  RefreshToken,
  tokenRefresh,
} from '../tokens';

const jwtMiddleware: Middleware = async (ctx, next) => {
  const tokenRepo = await dataSource.getRepository(Token);
  const userRepo = await dataSource.getRepository(User);
  let accessToken = ctx.cookies.get('access_token');
  let refreshToken = ctx.cookies.get('refresh_token');

  // 두 토큰 전부 없을 때
  if (!accessToken && !refreshToken) {
    ctx.state.user = undefined;
    console.log('토큰 없음');
    return next();
  }

  try {
    if ((accessToken && refreshToken) || (!accessToken && refreshToken)) {
      // 두 토큰 다 있거나 RefreshToken만 있을 때 디코딩 후 토큰 리프레쉬
      const refreshTokenData = await decodeToken<RefreshToken>(refreshToken);
      const diff = refreshTokenData.exp * 1000 - new Date().getTime();

      if (diff < 1000 * 60 * 30 || !accessToken) {
        // RefreshToken exp(만료시간)가 30분 미만이거나 accessToken이 없을 때
        await tokenRefresh(ctx, refreshToken);
      }

      ctx.state.user = {
        user_id: refreshTokenData.user_id,
        username: refreshTokenData.username,
      };

      return next();
    } else if (accessToken && !refreshToken) {
      // AccessToken은 유효, RefreshToken 만료 시
      const accessTokenData = await decodeToken<AccessToken>(accessToken);
      const refreshTokenData = await tokenRepo.findOneBy({
        fk_user_id: accessTokenData.user_id,
      });

      if (refreshTokenData) {
        await tokenRepo.delete({ fk_user_id: accessTokenData.user_id });
      }

      const user = await userRepo.findOneBy({ id: accessTokenData.user_id });

      if (!user) {
        return next();
      }

      const tokens = await createToken(user);

      ctx.state.user = {
        user_id: accessTokenData.user_id,
        username: accessTokenData.username,
      };

      return next();
    }
  } catch (err: any) {
    console.error(err);
    return next();
  }
};

export default jwtMiddleware;
