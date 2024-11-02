export default class LogBuilder {
    private _log = '';

    public constructor(
        title: string,
        titleValue: string | undefined = undefined
    ) {
        this._log = titleValue ? title + ': ' + titleValue : title;
    }

    public static create(title: string): LogBuilder {
        return new LogBuilder(title);
    }

    public addNewLine(prefix: string | undefined = undefined): LogBuilder {
        this._log += '\n';
        if (prefix) this._log += prefix;
        return this;
    }

    public addSection(
        key: string | undefined,
        value: string | undefined = ''
    ): LogBuilder {
        if (!key) return this;
        this.addNewLine();
        this._log += key;
        if (value) {
            this._log += ': ' + value;
        }
        return this;
    }

    public addErrorSection(message: string | undefined): LogBuilder {
        if (!message) return this;
        this._log += '\nError occurred: ';
        this._log += message;
        return this;
    }

    public addWarningSection(message: string | undefined): LogBuilder {
        if (!message) return this;
        this._log += '\nWarning: ' + message;
        return this;
    }

    public build(skipNewLine = false): string {
        if (skipNewLine) return this._log;
        return this._log + '\n';
    }
}
