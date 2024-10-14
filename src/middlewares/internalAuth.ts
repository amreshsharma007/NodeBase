import { NextFunction, Request, Response } from 'express';
import RequestUtils from '../utils/request.utils';

import argon2 from 'argon2';

/**
 * Attach user to req.currentUser
 * @param hashedToken string
 */
const internalAuth = (hashedToken: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (
      await argon2.verify(
        hashedToken,
        RequestUtils.getTokenFromHeader(req) as string
      )
    )
      return next();

    next(new Error('Unauthorised'));
  };
};

export default internalAuth;
