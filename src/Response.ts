import { AbstractJsonApi } from '@ianriizky/jsonapi-formatter';
import { Response as ExpressResponse } from 'express';

export class Response {
  protected readonly res: ExpressResponse;

  constructor(res: ExpressResponse) {
    this.res = res;
  }

  public jsonApi(body: AbstractJsonApi): ExpressResponse {
    return this.res.status(body.httpStatusCode).json(body.serialize());
  }
}
