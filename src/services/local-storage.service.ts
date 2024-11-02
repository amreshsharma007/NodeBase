import FileService from '../interfaces/file.service';
import DocumentInterface from '../interfaces/document.interface';

export default class LocalStorageService implements FileService {
    download(): void {
    }

    find(): DocumentInterface[] {
        return [];
    }

    findOne(): DocumentInterface | undefined {
        return undefined;
    }

    save(doc: DocumentInterface): void {
    }
}
