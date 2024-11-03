import LogBuilder from "../utils/log-builder";

export default abstract class BaseError extends Error {

    error: { [key: string]: string[] } | string | undefined;

    protected constructor(message: string, error: { [key: string]: string[] } | string | undefined = undefined) {
        super(message || 'Error occurred');

        this.name = this.constructor.name;
        this.error = error;
        this.message = message || 'Error occurred';
    }

    toString() {
        const lb = new LogBuilder(this.message);
        if (!!this.error) {
            if (typeof this.error !== 'string')
                for (let key in this.error) {
                    lb.addSection(key, this.error[key]?.join(", "));
                } else lb.addErrorSection(this.error);
        }
        return lb.build();
    }
}