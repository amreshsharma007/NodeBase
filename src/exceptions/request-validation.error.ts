import ApiResponseError from "../interfaces/api-response-error";
import LogBuilder from "../utils/log-builder";
import BaseError from "./base.error";

export default class RequestValidationError extends BaseError{

    constructor(error: {[key:string]:string[]} | undefined) {
        super('Request Validation Error occurred',error);
    }
}