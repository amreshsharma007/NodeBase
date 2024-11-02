import winston, {format} from 'winston';
import * as fs from 'node:fs';
import moment, {now} from 'moment';
import LogLevel from '../interfaces/log-level';

/**
 * This following icons are explored on internet
 * you can find all these icons at following link
 *
 * https://emojipedia.org/
 */
const myFormat = format.printf((inputs) => {
    const {level, timestamp, stack} = inputs;
    let {message, label} = inputs;

    /**
     * Faaltu kaam,
     * But it's works
     */
    const levelSymbol = Symbol.for('level') as unknown as string;

    /**
     * Modify Stack's path
     * if case LOG path prefix is defined
     */
    // if (process.env.LOG_PATH_PREFIX && stack) {
    //   stack = stack.replaceAll(
    //     /\(([./A-Z_a-z]+):(\d+:\d+)\)/g,
    //     (a: never, b: string, c: string) => {
    //       b = b.replaceAll('/', '\\');
    //       return '(' + process.env.LOG_PATH_PREFIX + b + ':' + c + ')';
    //     }
    //   );
    // }

    if (inputs[levelSymbol] === 'error') {
        message = stack
            ? '\n' + level.replace('error', stack)
            : level.replace('error', message);
    }

    // Null or blank spaces check
    if (!message || message === '' || message.length === 0) {
        return '';
    }

    if (process.env.ENABLE_FORMATTED_LOG !== 'true') {
        return message;
    }

    /**
     * Setting default icon
     * to information
     */
    let icon = '✌️';

    if (inputs[levelSymbol] === 'error') {
        icon = '🔥';
    }

    if (inputs[levelSymbol] === 'warning') {
        icon = '⚠️ ';
    }

    label = label ? ', ' + label : '';

    if (inputs[levelSymbol] === 'info') {
        return `[${timestamp}${label}]  ${level}: ${icon}  ${message}`;
    }

    if (inputs[levelSymbol] === 'warn') {
        return `[${timestamp}${label}]  ${level}: ${icon}  ${message}`;
    }

    if (inputs[levelSymbol] === 'error') {
        return `[${timestamp}${label}] ${level}: ${icon}  ${message}`;
    }

    return `[${timestamp}${label}] ${level}: ${icon}  ${message}`;
});

winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'green',
});

const createLogger = (opts: {
    dir?: string | undefined;
    filePrefix?: string | undefined;
    enableConsoleLog: boolean;
    enableFileLog: boolean;
    logLevel: LogLevel;
    timestampFormat?: string;
}): winston.Logger => {
    const transports = [];

    if (opts.enableFileLog) {
        if (!opts.dir)
            throw new Error('Console logs are enabled but dir not defined');

        const fileName =
            opts.dir +
            '/' +
            (opts.filePrefix || 'debug') +
            '-' +
            moment(now()).format('DD-MMM-YYYY') +
            '.log';

        try {
            // Create Logs Dir, if not exists
            fs.mkdirSync(opts.dir, {recursive: true});
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log('Cannot create folder', error);
        }

        transports.push(
            new winston.transports.File({
                filename: fileName,
                level: opts.logLevel,
                format: winston.format.combine(
                    winston.format.errors({stack: true}),
                    winston.format.timestamp({
                        format: opts.timestampFormat || 'DD-MMM-YYYY hh:mm:ss A',
                    }),
                    myFormat
                ),
            })
        );
    }

    if (opts.enableConsoleLog) {
        transports.push(
            new winston.transports.Console({
                level: opts.logLevel,
                format: winston.format.combine(
                    winston.format.errors({stack: true}),
                    winston.format.timestamp({
                        format: opts.timestampFormat || 'DD-MMM-YYYY hh:mm:ss A',
                    }),
                    myFormat
                ),
            })
        );
    }

    return winston.createLogger({
        level: opts.logLevel,
        levels: winston.config.npm.levels,
        format: winston.format.combine(
            winston.format.timestamp({
                format: opts.timestampFormat || 'YYYY-MM-DD HH:mm:ss',
            }),
            winston.format.errors({stack: true}),
            winston.format.colorize(),
            winston.format.splat(),
            winston.format.json()
        ),
        transports,
    });
};

export default createLogger;
