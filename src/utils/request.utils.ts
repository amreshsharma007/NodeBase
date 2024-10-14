import { Request } from 'express';

export default class RequestUtils {
  public static getTokenFromHeader = (req: Request): string | undefined => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (req.query.token && req.query.token.length > 0) {
      return req.query.token as string;
    }

    if (
      (req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Token') ||
      (req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer')
    ) {
      return req.headers.authorization.split(' ')[1];
    }
    return;
  };
}
