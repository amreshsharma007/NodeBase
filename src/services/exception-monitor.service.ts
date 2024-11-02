import winston from 'winston';
import ProcessUtils from '../utils/process.utils';
import KafkaQueueService from './kafka-queue.service';

export default class ExceptionMonitorService {
    // private readonly _to: string[];
    // private readonly _from: string;
    private readonly _id: string;
    private _logger: winston.Logger | undefined;
    private queueService = new KafkaQueueService<Record<string, unknown>>('', '');

    constructor({
                    kafkaConnection,
                    kafkaTopic,
                    kafkaGroupId,
                    kafkaClientId,
                    // to,
                    // from,
                    id,
                    logger,
                }: {
        kafkaConnection: string;
        kafkaTopic: string;
        kafkaGroupId: string;
        kafkaClientId: string;
        id: string;
        logger?: winston.Logger;
        // to: string[];
        // from: string;
    }) {
        if (!kafkaConnection)
            throw new Error('Error initializing exception service');

        // this._to = to;
        // this._from = from;
        this._id = id;

        this.queueService = new KafkaQueueService(kafkaConnection, kafkaClientId);
        // .clientId(kafkaClientId)
        // .setGroup(kafkaGroupId)
        // .setTopic(kafkaTopic)
        // .setLogger(logger as winston.Logger);

        this.queueService.clientId(kafkaClientId);
        this.queueService.setGroup(kafkaGroupId);
        this.queueService.setTopic(kafkaTopic);
        this.queueService.setLogger(logger as winston.Logger);

        this.queueService.init().then(() => {
            logger?.info('Initializing exception service kafka service');
        });
    }

    public send(error: Error): Promise<void> | undefined {
        return this.queueService?.send('exception', {
            // to: this._to,
            // from: this._from,
            params: {
                error,
                id: this._id,
            },
        });
    }

    public listen(): void {
        process.on('uncaughtException', this.handleListenCallback);
    }

    private handleListenCallback = async (err: Error) => {
        this._logger?.error(
            'in handle listen callback\n' +
            new Date().toUTCString() +
            ' uncaughtException:',
            err.message
        );
        await ProcessUtils.sleep(1000);
        this._logger?.error(err.stack);
        process.exit(1);
    };
}
