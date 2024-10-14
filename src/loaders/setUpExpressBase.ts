import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { isCelebrateError } from 'celebrate';
import ApiResponse from '../helpers/api-response';
import apiResponseCodes from '../constants/apiResponseCodes';
import { AxiosError } from 'axios';
import ExceptionMonitorService from '../services/exception-monitor.service';

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Status check for project
 *     description: Check and tell if project is up or not
 *     tags:
 *       - Health Check Controller
 *     responses:
 *       200:
 *         description: A Blank response.
 */
function setUpExpressBase({
  server,
  exceptionMonitor,
  allowedOrigins,
  allowedHeaders,
  useCORS,
}: {
  server: Application;
  exceptionMonitor?: ExceptionMonitorService;
  useCORS?: boolean;
  allowedOrigins?: string[];
  allowedHeaders?: string[];
}): void {
  server.get('/health', (req: Request, res: Response) => {
    // const resp = new ApiResponse();
    // resp.markSuccess();
    // return res.status(res.statusCode).json(resp.createResponse());
    return res.status(200).send();
  });

  // Disable the x-powered-by header
  server.disable('x-powered-by');

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc.)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  server.enable('trust proxy');

  // The magic package that prevents frontend developers going nuts
  // Alternate description:
  // Enable Cross Origin Resource Sharing to all origins by default
  if (useCORS)
    server.use(
      cors({
        origin: allowedOrigins,
        allowedHeaders,
        // Allow follow-up middleware to override this CORS for options
        // preflightContinue: true,
      })
    );

  // Some sauce that always add since 2014
  // "Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it."
  // Maybe not needed anymore ?
  // server.use(require('method-override')());

  // Transforms the raw string of req.body into json
  server.use(express.json());

  /// catch 404 and forward to error handler
  server.use((req: Request, res: Response) => {
    if (!req.status && !req.httpStatusCode) {
      // res
      //   .send(
      //     new ApiResponse()
      //       .setMessage('Error occurred')
      //       .addError('Not found')
      //       .createResponse()
      //   )
      //   .status(apiResponseCodes.urlNotFound)
      //   .end();

      return res.status(apiResponseCodes.urlNotFound).send();
    }
  });

  /// error handlers
  server.use(
    (
      err: string | string[] | Error | AxiosError<ApiResponse<unknown>, any>,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      /**
       * Handle 401 thrown by express-jwt library
       */
      if (err) {
        // (Container.get('logger') as winston.Logger).error(err);

        const apiResponse = new ApiResponse();
        if (isCelebrateError(err)) {
          /**
           * Handle Joi Errors
           */
          // apiResponse.setMessage('Validation Error');
          apiResponse.setSuccess(false);
          // apiResponse.setAppCode(apiResponseCodes.validationFailed);
          apiResponse.setHttpCode(apiResponseCodes.validationFailed);

          /**
           * Copy error messages
           * to error section
           */
          if (err.details) {
            for (const errDetail of err.details.values()) {
              apiResponse.addError(errDetail.message);
            }
          }
        } else if (err.constructor.name == 'RequestValidationError') {
          apiResponse.addError(err);
          apiResponse.setMessage('Validation error');
          return res
            .status(apiResponseCodes.validationFailed)
            .send(apiResponse.createResponse())
            .end();
        } else if ((err as Error).name === 'UnauthorizedError') {
          /**
           * Handle Unauthorized Error
           */
          apiResponse.setSuccess(false);

          apiResponse.setHttpCode(
            apiResponseCodes.unauthorized || req.httpStatusCode
          );

          /**
           * Copy error messages
           * to error section
           */
          // if (err.details) {
          //   for (const errDetail of err.details) {
          //     apiResponse.addError(errDetail.message);
          //   }
          // } else {
          //   apiResponse.setErrors(['Authorization Error']);
          // }
        } else {
          // throw err;
          return next(err);
        }

        return res
          .status(apiResponse.getHttpCode())
          .send(apiResponse.createResponse())
          .end();
      }

      return next(err);
    }
  );

  server.use(
    (err: { status: never; message: never }, req: Request, res: Response) => {
      req.errors =
        req.errors && req.errors.length > 0
          ? req.errors
          : [err.message || 'Server error. Please try again later'];

      // Send to mail
      exceptionMonitor?.send(err as unknown as Error);

      return res
        .status(err.status || req.appCode || req.httpStatusCode || 500)
        .send(
          new ApiResponse()
            .setSuccess(false)
            .setHttpCode(err.status || req.appCode || req.httpStatusCode || 500)
            .setErrors(req.errors)
            .createResponse()
        );
    }
  );
}

export default setUpExpressBase;
