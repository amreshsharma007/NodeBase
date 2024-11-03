import BaseError from "./base.error";

export default class ServerError extends BaseError {

    constructor(error: { [key: string]: string[] } | string | undefined) {
        super('Server Error occurred', error);
    }
}