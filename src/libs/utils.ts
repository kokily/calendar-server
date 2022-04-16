import { ObjectSchema } from 'joi';
import { Context } from 'koa';

/**
 * API Request Body validate
 * @param ctx {Context}
 * @param schema {ObjectSchema}
 * @returns {boolean}
 */
export function validateBody(ctx: Context, schema: ObjectSchema<any>): boolean {
  const { error } = schema.validate(ctx.request.body);

  if (error?.details) {
    ctx.status = 400;
    ctx.body = error.details[0].message;
    return false;
  }

  return true;
}
