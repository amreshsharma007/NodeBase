import {Logger} from 'winston';
import {Inject, Service} from 'typedi';

@Service()
export default abstract class LogUtils {
    protected constructor(
        @Inject('logger')
        protected readonly _logger: Logger
    ) {
    }

    error = (message: string, ...meta: unknown[]): void => {
        this._logger.error(message, ...meta);
    };

    info = (message: string, ...meta: unknown[]): void => {
        this._logger.info(message, ...meta);
    };

    warn = (message: string, ...meta: unknown[]): void => {
        this._logger.warn(message, ...meta);
    };

    silly = (message: string, ...meta: unknown[]): void => {
        this._logger.silly(message, ...meta);
    };

    alert = (message: string, ...meta: unknown[]): void => {
        this._logger.alert(message, ...meta);
    };
}
