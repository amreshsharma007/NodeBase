import {NextFunction, Request, Response} from 'express';

/**
 * Helper function to
 * queue ECollection, I-Sure
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function queueFunc(fn: unknown) {
    let lastPromise = Promise.resolve();
    return function (req: Request, res: Response, next: NextFunction) {
        const returnedPromise = lastPromise.then(() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return fn(req, res, next);
        });
        lastPromise = returnedPromise.catch(() => {
        });
        return returnedPromise;
    };
}

export function queueFuncWrapper(fn: unknown) {
    return function (req: Request, res: Response, next: NextFunction): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fn(req, res, next)
            .then(() => {
            })
            .catch(() => {
            });
    };
}
