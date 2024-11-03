import BaseError from "./base.error";

export default class UnauthorizedError extends BaseError{

    constructor() {
        super('Unauthorized Error');
    }
}