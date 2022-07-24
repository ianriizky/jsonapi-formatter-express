import {
  AbstractJsonApi,
  JsonApiException,
} from '@ianriizky/jsonapi-formatter';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Response as JsonApiResponse } from './Response';

expand(config());

type CustomCallback = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => Response | AbstractJsonApi | void;

export function errorHandler(customCallback?: CustomCallback) {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    const error = err.stack || err;

    console.error(error);

    if (res.headersSent) {
      return next(err);
    }

    const response = new JsonApiResponse(res);

    if (customCallback) {
      const result = customCallback(err, req, res, next);

      if (result instanceof Response) {
        return result;
      }

      if (result instanceof AbstractJsonApi) {
        return response.jsonApi(result);
      }
    }

    let show_meta_on_error = true;

    const envShowMetaOnError: string | undefined =
      process.env?.JSONAPI_SHOW_META_ON_ERROR;
    const envNode: string | undefined = process.env?.NODE_ENV;

    if (envShowMetaOnError === 'false') {
      show_meta_on_error = false;
    } else if (envNode === 'production') {
      show_meta_on_error = false;
    }

    const jsonApiException = new JsonApiException({
      app_url: process.env?.APP_URL || 'http://localhost:3000',
      show_meta_on_error,
    });

    return response.jsonApi(
      jsonApiException
        .setHttpStatusCode(StatusCodes.INTERNAL_SERVER_ERROR)
        .setErrorsFromNodejs(err)
    );
  };
}
