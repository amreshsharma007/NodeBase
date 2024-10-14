import { AxiosError } from 'axios';
import { isArray } from 'lodash';
import apiResponseCodes from '../constants/apiResponseCodes';

export default class ApiResponse<T> {
  private static ERR_KEY_DEFAULT = 'default';
  private result: T | undefined;
  private success: boolean | undefined;
  private code: number | undefined;
  private httpCode: number | undefined;
  private message: string | undefined;
  private errors = {} as { [type: string]: string[] };
  private page: number;
  private itemsCount: number;
  private allItemsCount: number;

  public constructor() {
    this.page = -1;
    this.itemsCount = -1;
    this.allItemsCount = -1;
  }

  public addError(
    err: string | string[] | Error | AxiosError<ApiResponse<T>>
  ): this {
    if (!err) this.errors = {};

    if ((err as AxiosError<ApiResponse<T>>).isAxiosError) {
      this.errors = Object.assign(
        this.errors,
        ((err as AxiosError)?.response?.data as ApiResponse<T>)?.errors
      );
      // _.map(((err as AxiosError)?.response?.data as ApiResponse<T>)?.errors, _err => this.addError(_err));
    } else if (err instanceof Error) {
      this.errors = Object.assign(this.errors, { [err.name]: err.message });
    } else if (isArray(err)) {
      this.errors = Object.assign(this.errors, {
        [ApiResponse.ERR_KEY_DEFAULT]: [...err],
      });
    } else {
      this.errors = Object.assign(this.errors, {
        [ApiResponse.ERR_KEY_DEFAULT]: err,
      });
    }

    return this;
  }

  public setErrors(
    errors: string[] | Error[] | AxiosError<ApiResponse<T>>[]
  ): this {
    // Clear the errors var
    this.errors = {};

    // Now start adding the values
    if (!errors) return this;
    for (const err of errors) {
      this.addError(err);
    }

    return this;
  }

  public getErrors(): { [key: string]: string[] } {
    return this.errors;
  }

  public setAppCode(code: number): this {
    this.code = code;
    return this;
  }

  public getAppCode(): number {
    return this.code || 500;
  }

  public setHttpCode(code: number): this {
    this.httpCode = code;
    return this;
  }

  public getHttpCode(): number {
    return this.httpCode || 200;
  }

  public setMessage(message: string): this {
    this.message = message;
    return this;
  }

  public getMessage(): string {
    return this.message as string;
  }

  public setResult(result: T): this {
    this.result = result;
    return this;
  }

  public getResult(): T {
    return this.result as T;
  }

  public setItemsCount(count: number): this {
    this.itemsCount = count;
    return this;
  }

  public getItemsCount(): number {
    return this.itemsCount;
  }

  public setPage(page: number): this {
    this.page = page;
    return this;
  }

  public getPage(): number {
    return this.page;
  }

  public setSuccess(success = false): this {
    this.success = success;
    return this;
  }

  public getSuccess(): boolean {
    return this.success || false;
  }

  public setAllItemsCount(totalItems: number): this {
    this.allItemsCount = totalItems;
    return this;
  }

  public getAllItemsCount(): number {
    return this.allItemsCount;
  }

  public markSuccess(): this {
    if (typeof this.success === 'boolean') this.setSuccess(true);
    this.setMessage('Success');
    this.setHttpCode(apiResponseCodes.everythingOk);
    return this;
  }

  // public updateRequest(
  //   req: Request,
  //   code: number,
  //   message: string,
  //   errors: string[]
  // ): boolean {
  //   if (!req) return false;
  //
  //   if (code) req.appCode = code;
  //   if (message) req.message = message;
  //   if (errors && errors.length > 0) {
  //     if (!req.errors) {
  //       req.errors = [];
  //     }
  //     for (const error of errors) {
  //       req.errors.push(error);
  //     }
  //   }
  //
  //   return true;
  // }

  public createResponse(): ApiResponse<T> {
    const data = {} as ApiResponse<T>;

    data['success'] = this.success;
    data['code'] = this.code;

    if (this.itemsCount > -1) {
      data['itemsCount'] = this.itemsCount;
    }

    if (this.page > -1) {
      data['page'] = this.page;
    }

    if (this.allItemsCount > -1) {
      data['allItemsCount'] = this.allItemsCount;
    }

    data['message'] = this.message;
    data['errors'] = this.errors;
    data['result'] = this.result;

    return data;
  }
}
