import BaseKafkaService from './base-kafka.service';
import QueueInterface from '../interfaces/queue.interface';
import { Message } from 'kafkajs';
import { Error } from 'mongoose';
import { Callback1Void } from '../interfaces/callbacks';

export default class KafkaQueueService<Entry>
  extends BaseKafkaService<KafkaQueueService<Entry>>
  implements QueueInterface<Entry>
{
  public constructor(host: string, clientId: string) {
    super(host, clientId);
  }

  public async send(key: string, message: Entry | Entry[]): Promise<void> {
    if (!this.producer) return;

    await (Array.isArray(message)
      ? this.producer.send({
          topic: this._topic as string,
          messages: message.map((val) => {
            return { key, value: JSON.stringify(val) } as Message;
          }),
        })
      : this.producer.send({
          topic: this._topic as string,
          messages: [{ key, value: JSON.stringify(message) }] as Message[],
        }));
  }

  public deInit(): void {
    throw new Error('Method not implemented.');
  }

  public async onReceive(
    handler: Callback1Void<Record<string, Entry[]>>
  ): Promise<KafkaQueueService<Entry>> {
    await super.setOnMessageReceived((message: Record<string, string[]>) => {
      // TODO: Optimisation needed
      const result = {} as Record<string, Entry[]>;

      for (const key of Object.keys(message)) {
        result[key] = message[key].map((i) => JSON.parse(i) as Entry);
      }

      handler(result);
    });

    return this.getThis();
  }

  protected getThis(): KafkaQueueService<Entry> {
    return this;
  }
}
