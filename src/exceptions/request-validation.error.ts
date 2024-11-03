import BaseError from "./base.error";

export default class RequestValidationError extends BaseError {

    constructor(error: { [key: string]: string[] } | string | undefined) {
        super('Request Validation Error occurred', error);
    }
}