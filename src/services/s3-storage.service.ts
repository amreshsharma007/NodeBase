import {Upload} from '@aws-sdk/lib-storage';
import {PutObjectCommandInput, S3Client} from '@aws-sdk/client-s3';
import FileService from '../interfaces/file.service';
import DocumentInterface from '../interfaces/document.interface';
import {AwsCredentialIdentity} from '@smithy/types';

export default class S3StorageService implements FileService {
    // keyId: string | undefined = '';
    // accessKey: string | undefined = '';
    // region: string | undefined = '';

    client: S3Client;

    constructor(keyId: string, accessKey: string, region: string) {
        this.client = new S3Client({
            credentials: {
                accessKeyId: keyId,
                secretAccessKey: accessKey,
            } as AwsCredentialIdentity,
            region: region,
        });
    }

    download(): void {
    }

    find(): DocumentInterface[] {
        this;
        return [];
    }

    findOne(): DocumentInterface | undefined {
        return undefined;
    }

    save(doc: DocumentInterface): void {
        new Upload({
            params: {} as PutObjectCommandInput,
            client: this.client,
            tags: [],
            queueSize: 4,
        });
    }
}
