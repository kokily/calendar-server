import type { Context } from 'koa';
import type { SignOptions } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { dataSource } from '../server';
import { Token } from '../entities/Token';
import { User } from '../entities/User';
import { isProd } from './constants';

export type TokenType = {
  iat: number;
  exp: number;
  iss: string;
  sub: string;
};

export type AccessToken = {
  user_id: string;
  username: string;
} & TokenType;

export type RefreshToken = {
  user_id: string;
  username: string;
  token_id: string;
} & TokenType;

/**
 * Generate Token
 * @param payload {string}
 * @param options {SignOptions}
 * @returns token
 */
export async function generateToken(
  payload: any,
  options?: SignOptions
): Promise<string> {
  const secretKey = process.env.JWT_SECRET!;
  const jwtOptions: SignOptions = {
    issuer: '',
    expiresIn: '15d',
    ...options,
  };

  if (!jwtOptions.expiresIn) {
    delete jwtOptions.expiresIn;
  }

  return new Promise((resolve, reject) => {
    if (!secretKey) return;

    jwt.sign(payload, secretKey, jwtOptions, (err, token) => {
      if (err || token === undefined) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}

/**
 * Decode Token
 * @param token {string}
 * @returns decodedToken {string}
 */
export async function decodeToken<T = any>(token: string): Promise<T> {
  const secretKey = process.env.JWT_SECRET!;

  return new Promise((resolve, reject) => {
    if (!secretKey) return;

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded as any);
    });
  });
}

/**
 * Cookie Set
 * @param ctx {Context}
 * @param tokens { accessToken: string; refreshToken: string; }
 */
export function setCookies(
  ctx: Context,
  tokens?: { accessToken: string; refreshToken: string }
) {
  if (tokens) {
    ctx.cookies.set('access_token', tokens.accessToken, {
      httpOnly: tokens.accessToken ? true : undefined,
      domain: isProd ? '.' : undefined,
      secure: isProd && true,
      sameSite: 'lax',
      maxAge: tokens.accessToken ? 1000 * 15 : undefined,
    });
    ctx.cookies.set('refresh_token', tokens.accessToken, {
      httpOnly: tokens.refreshToken ? true : undefined,
      domain: isProd ? '.' : undefined,
      secure: isProd && true,
      sameSite: 'lax',
      maxAge: tokens.refreshToken ? 1000 * 60 * 60 * 24 * 30 : undefined,
    });
  } else {
    ctx.cookies.set('access_token');
    ctx.cookies.set('refresh_token');
  }
}

/**
 * Create Token
 * @param user {UserModel}
 * @returns { accessToken: string; refreshToken: string; }
 */
export async function createToken(user: User) {
  const tokenRepo = await dataSource.getRepository(Token);
  const token = new Token();

  token.fk_user_id = user.id;

  await tokenRepo.save(token);

  const accessToken = await generateToken(
    { user_id: user.id, username: user.username },
    { subject: 'access_token', expiresIn: '15m' }
  );

  const refreshToken = await generateToken(
    { user_id: user.id, username: user.username, token_id: token.id },
    { subject: 'refresh_token', expiresIn: '15d' }
  );

  token.token = refreshToken;

  await tokenRepo.save(token);

  return { accessToken, refreshToken };
}

/**
 * Token Refresh
 * @param ctx {Context}
 * @param prevRefreshToken {string}
 * @returns decoded.user_id {string}
 */
export async function tokenRefresh(ctx: Context, prevRefreshToken: string) {
  try {
    const decoded = await decodeToken<RefreshToken>(prevRefreshToken);
    const tokenRepo = await dataSource.getRepository(Token);
    const userRepo = await dataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: decoded.user_id });

    if (!user) {
      ctx.throw(500, 'Invalid User Error');
    }

    const now = new Date().getTime();
    const diff = decoded.exp * 1000 - now;
    let refreshToken = prevRefreshToken;

    if (diff < 1000 * 60 * 60 * 24 * 15) {
      refreshToken = await generateToken(
        {
          user_id: user.id,
          username: user.username,
          token_id: decoded.token_id,
        },
        {
          subject: 'refresh_token',
          expiresIn: '15d',
        }
      );
    }

    const accessToken = await generateToken(
      { user_id: user.id, username: user.username },
      { subject: 'access_token', expiresIn: '15m' }
    );

    setCookies(ctx, { accessToken, refreshToken });

    await tokenRepo.update({ id: decoded.token_id }, { token: refreshToken });

    return decoded.user_id;
  } catch (err: any) {
    ctx.throw(500, err);
  }
}
