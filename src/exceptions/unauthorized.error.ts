import ApiResponseError from "../interfaces/api-response-error";
import LogBuilder from "../utils/log-builder";
import BaseError from "./base.error";

export default class UnauthorizedError extends BaseError{

    constructor() {
        super('Unauthorized Error');
    }
}