import {
  GetSecretValueCommand,
  SecretsManager,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

export default class AwsEnvUtils {
  private client: SecretsManagerClient;
  private secretId: string;

  constructor({ region, secretId }: { region: string; secretId: string }) {
    // Init the client
    this.client = new SecretsManager({ region });
    this.secretId = secretId;
  }

  public async init(): Promise<number> {
    return new Promise((resolve) => {
      this.client
        .send(new GetSecretValueCommand({ SecretId: this.secretId }))
        .then((data) => {
          if (!data || !data.SecretString) {
            resolve(0);
            return;
          }

          resolve(this.apply(JSON.parse(data.SecretString)));
        });
    });
  }

  protected apply(envs: Record<string, never>): number {
    for (const env in envs) {
      if (!env || !env) continue;
      process.env[env] = envs[env];
    }

    return Object.keys(envs).length;
  }
}
