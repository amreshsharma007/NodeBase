import {Logger} from 'winston';
import {Consumer, Kafka, logLevel, Partitioners, Producer} from 'kafkajs';
import ProcessUtils from '../utils/process.utils';
import LogBuilder from '../utils/log-builder';
import {Callback1Void} from '../interfaces/callbacks';

export default abstract class BaseKafkaService<Child> {
    protected _logger: Logger | undefined = undefined;

    protected _host: string | undefined;

    protected _pollTimeInterval: number | undefined;

    protected _pollTimeout: number | undefined;

    protected _numConsumers: number | undefined = 1;

    protected _topic: string | undefined;

    protected _group: string | undefined;

    protected _clientId: string | undefined;
    protected kafka: Kafka;

    // public setLogger(logger: Logger): Child {
    //   this._logger = logger;
    //   return this.getThis();
    // }

    // public setHost(value: string | undefined): Child {
    //   this._host = value;
    //   return this.getThis();
    // }
    protected producer: Producer | undefined;
    protected onNewMessageReceived:
        | ((message: Record<string, string[]>) => void)
        | undefined;
    private consumers: Consumer[] | undefined;

    protected constructor(host: string, clientId: string) {
        // this._logger = logger;
        this.kafka = new Kafka({
            clientId: clientId,
            brokers: host?.split(',') as string[],
            logCreator:
                (levelKF) =>
                    // This above field can be ignored as we will use global level to configure winston
                    ({namespace, level, label, log}) => {
                        const {message, ...extra} = log;
                        this._logger?.log({
                            level: this.toWinstonLogLevel(level),
                            message,
                            extra,
                        });
                    },
        });
    }

    public setLogger(value: Logger): Child {
        this._logger = value;
        return this.getThis();
    }

    public setPollTimeInterval(value: number | undefined): Child {
        this._pollTimeInterval = value;
        return this.getThis();
    }

    public clientId(value: string | undefined): Child {
        this._clientId = value;
        return this.getThis();
    }

    public setPollTimeout(value: number | undefined): Child {
        this._pollTimeout = value;
        return this.getThis();
    }

    public setNumConsumers(value: number | undefined): Child {
        this._numConsumers = value;
        return this.getThis();
    }

    public setTopic(value: string | undefined): Child {
        this._topic = value;
        return this.getThis();
    }

    public setGroup(value: string | undefined): Child {
        this._group = value;
        return this.getThis();
    }

    public disconnect(): void {
        this.producer?.disconnect();
        // eslint-disable-next-line unicorn/no-array-for-each
        this.consumers?.forEach((i) => i.disconnect());
    }

    toWinstonLogLevel = (level: logLevel) => {
        switch (level) {
            case logLevel.ERROR:
            case logLevel.NOTHING:
                return 'error';
            case logLevel.WARN:
                return 'warn';
            case logLevel.INFO:
                return 'info';
            case logLevel.DEBUG:
                return 'debug';
        }
    };

    public async init(): Promise<void> {
        await this.initSender();

        // Set up a handler to handle the exit process of the Node.js
        process.on('exit', () => {
            this.disconnect();
        });
    }

    public setUp(): void {
    }

    protected abstract getThis(): Child;

    protected async initSender(): Promise<void> {
        this.producer = this.kafka.producer({
            createPartitioner: Partitioners.LegacyPartitioner,
        });
        await this.producer.connect();
    }

    protected startPolling(): void {
    }

    protected async _poll(consumer: Consumer): Promise<void> {
        if (!consumer) return;

        await consumer.run({
            eachBatch: async ({
                                  batch,
                                  resolveOffset,
                                  heartbeat,
                                  commitOffsetsIfNecessary,
                                  uncommittedOffsets,
                                  isRunning,
                                  isStale,
                                  pause,
                              }) => {
                if (!batch?.messages) return;

                const result = {} as Record<string, string[]>;
                for (const msg of batch.messages) {
                    if (!msg.key) continue;
                    if (!Object.keys(result).includes(msg.key.toString()))
                        result[msg.key.toString()] = [];

                    result[msg.key.toString()].push(msg.value + '');
                }

                // Logging section
                if (result) {
                    const lbKafka = LogBuilder.create(
                        'New Kafka message found'
                    ).addSection('Topic', this._topic);

                    for (const key in result) {
                        lbKafka.addSection('Key', key);
                        for (const value of result[key]) {
                            lbKafka.addSection('Message', value);
                        }
                    }

                    this._logger?.info(lbKafka.build());
                }

                if (this.onNewMessageReceived) this.onNewMessageReceived(result);

                // Send signal to kafka
                // That we're still alive
                await heartbeat();

                if (this._pollTimeInterval)
                    await ProcessUtils.sleep(this._pollTimeInterval);
            },
        });
    }

    protected async setOnMessageReceived(
        handler: Callback1Void<Record<string, string[]>>
    ): Promise<void> {
        this.onNewMessageReceived = handler;

        await this.initConsumer();
    }

    protected async initConsumer(): Promise<void> {
        this.consumers = [];

        // Prepare the consumers
        for (let i = 0; i < (this._numConsumers as number); i++) {
            // Here we're setting up group id same as topic
            // because we'd need to track the lags in respect to topic only
            this.consumers.push(
                this.kafka.consumer({groupId: this._group as string})
            );
        }

        if (!this.consumers || this.consumers.length === 0) return;

        this._logger?.info(
            new LogBuilder('New consumer connecting to kafka')
                .addSection('Topic', this._topic)
                .addSection('Num consumers', this._numConsumers + '')
                .build()
        );

        for (const consumer of this.consumers) {
            await consumer.connect();
            await consumer.subscribe({
                topic: this._topic as string,
                fromBeginning: true,
            });

            await this._poll(consumer);
        }
    }
}
