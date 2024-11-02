import DocumentInterface from './document.interface';

export default interface FileService {
    save(doc: DocumentInterface): void;

    find(): DocumentInterface[];

    findOne(): DocumentInterface | undefined;

    download(): void;
}
