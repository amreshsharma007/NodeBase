export default interface QueueInterface<Entry> {
    send(key: string, message: Entry | Entry[]): void;

    init(): void;

    deInit(): void;
}
