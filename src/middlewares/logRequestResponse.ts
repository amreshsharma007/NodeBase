import { NextFunction, Response } from 'express';
import { Container } from 'typedi';
import moment, { Duration } from 'moment/moment';
import { Logger } from 'winston';
import { IncomingHttpHeaders } from 'http';
import LogBuilder from '../utils/log-builder';
import Request from '../interfaces/request';

/**
 * Print log
 *
 * @param id
 * @param title
 * @param method
 * @param url of type string
 * @param headers
 * @param responseBody
 * @param timeDuration Time duration of type moment.Duration
 * @param queryParams
 */
const printLog = ({
  id,
  title,
  method,
  url,
  headers,
  responseBody,
  timeDuration,
  queryParams,
}: {
  title: string;
  id: string;
  method: string;
  url: string;
  queryParams?: string;
  headers: IncomingHttpHeaders;
  responseBody?: string;
  timeDuration?: Duration;
}) => {
  (Container.get('logger') as Logger).info(
    new LogBuilder(title)
      .addSection('Id', id)
      .addSection(method, url)
      .addSection('Request Accept', headers['accept'])
      .addSection('Request QueryParams', queryParams)
      .addSection('Request Client IP', '0.0.0.0')
      .addSection('Request Headers', JSON.stringify(headers))
      // .addSection('Request QueryParams', headers['content-type'])
      .addSection(
        timeDuration ? 'Time Duration' : undefined,
        timeDuration
          ? (timeDuration as unknown as Duration).asSeconds() + ' seconds'
          : undefined
      )
      .build()
  );
};

/**
 * Logger Interceptor
 * To Intercept all the request and response
 */
const logRequestResponse = () => {
  return async (
    request: Request,
    response: Response,
    next: NextFunction | undefined
  ): Promise<void> => {
    try {
      // (Container.get('logger') as Logger).info('');
      /**
       * Log the Full Path
       * for the request
       * by using the method
       * as Prefix
       */
      printLog({
        title: 'New Request Found',
        id: request.id,
        method: request.method,
        url: request.baseUrl,
        queryParams: request.url,
        headers: request.headers,
        timeDuration: undefined,
      });

      // Update timing in the request object
      request.time = moment();

      if (process.env.LOG_RESPONSE === 'true') {
        const [oldWrite, oldEnd] = [response.write, response.end];
        const chunks: Buffer[] = [];

        (response.write as unknown) = function (
          chunk: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>
        ) {
          chunks.push(Buffer.from(chunk));
          // eslint-disable-next-line @typescript-eslint/ban-types,prefer-rest-params
          (oldWrite as Function).apply(response, arguments);
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        response.end = async function (chunk) {
          if (chunk) {
            chunks.push(Buffer.from(chunk));
          }
          const body = Buffer.concat(chunks).toString('utf8');

          /**
           * Log the response
           * which is being responded to
           * API
           */
          // (Container.get('logger') as Logger).info('');
          printLog({
            title: 'Response Logs',
            id: request['id'],
            method: request.method,
            url: request.baseUrl,
            queryParams: request.url,
            headers: request.headers,
            responseBody:
              response.getHeader('Content-Type') === 'application/json'
                ? body
                : 'file',
            timeDuration: undefined,
          });
          // printLog(
          //   'Response Logs',
          //   'Response',
          //   response.statusCode,
          //   response.getHeader('Content-Type') === 'application/json' ? body : 'file',
          //   request.originalUrl,
          //   moment.duration(moment().diff(request.time)) as unknown as undefined,
          // );

          /**
           * To Save the things
           * in DB
           */

          try {
            // await Container.get(APILoggerService).update(
            //   request,
            //   { _id: request.apiLog._id },
            //   {
            //     response: body
            //   },
            //   {} as MongooseOptionInterface
            // );
          } catch (error) {
            (Container.get('logger') as Logger).error(error);
          }

          // eslint-disable-next-line @typescript-eslint/ban-types,prefer-rest-params
          (oldEnd as Function).apply(response, arguments);
        };
      }

      /**
       * Proceed to Next
       * if provided
       */
      if (next) next();
    } catch (error) {
      (Container.get('logger') as Logger).error(error);
    }
  };
};

export default logRequestResponse;
