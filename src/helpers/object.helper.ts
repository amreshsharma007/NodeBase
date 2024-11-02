export default class ObjectHelper {
    removeNullAndEmptyValues(obj: Record<string, unknown>): void {
        for (const key of Object.keys(obj)) {
            if (typeof obj[key] === 'undefined') {
                delete obj[key];
            }
        }
    }

    /**
     * Matches and search by using regex expression
     * in the given string
     *
     * @param object
     * @param pattern
     * @param exactMatch
     */
    doObjectContainKeyPattern(
        object: Record<string, unknown>,
        pattern: string,
        exactMatch = false
    ): boolean {
        if (exactMatch) return Object.keys(object).includes(pattern);

        return (
            Object.keys(object).filter((key) =>
                new RegExp('/' + pattern + '/').test(key)
            ).length > 0
        );
    }

    /**
     * Matches and search by using regex expression
     * in the given string
     *
     * @param object
     * @param pattern
     */
    removeObjectKeyByPattern(
        object: Record<string, unknown>,
        pattern: string
    ): Record<string, unknown> {
        const matchedKeys = Object.keys(object).filter((key) =>
            new RegExp('/' + pattern + '/').test(key)
        );

        for (const key of matchedKeys) {
            delete object[key];
        }

        return object;
    }

    /**
     * Filter out the object by matching the given string pattern
     * by using the regex expression object
     *
     * @param obj
     * @param pattern
     */
    filterObjectByKeys(
        obj: Record<string, unknown>,
        pattern: string
    ): { [p: string]: unknown } {
        return (
            Object.keys(obj)
                .filter((key) => key.includes(pattern))
                // eslint-disable-next-line unicorn/no-array-reduce
                .reduce((cur, key) => {
                    return Object.assign(cur, {[key]: obj[key]});
                }, {})
        );
    }
}
