import { v4 as uuidv4 } from 'uuid';
import { NextFunction, Request, Response } from 'express';

function generateV4UUID(_request: any) {
  return uuidv4();
}

const ATTRIBUTE_NAME = 'id';

export default function requestID({
  generator = generateV4UUID,
  headerName = 'X-Request-Id',
  setHeader = true,
} = {}) {
  return function (
    request: Request,
    response: Response,
    next: NextFunction
  ): void {
    const oldValue = request.get(headerName);
    const id = oldValue === undefined ? generator(request) : oldValue;

    if (setHeader) {
      response.set(headerName, id);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    request[ATTRIBUTE_NAME] = id;

    next();
  };
}
