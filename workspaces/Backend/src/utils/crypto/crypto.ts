import { promisify } from 'util';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoService {
  private key: Buffer | null = null;
  private init: Promise<void> | null = null;

  async getKey(): Promise<Buffer> {
    if (this.key) return this.key;

    if (!this.init) this.init = this.initialize();

    await this.init;
    return this.key as Buffer;
  }

  private async initialize(): Promise<void> {
    this.key = (await promisify(scrypt)(
      process.env.CRYPTO_KEY,
      'salt',
      32,
    )) as Buffer;
  }

  public async encrypt(data: string | null): Promise<string> {
    if (!data) return '';

    const iv = randomBytes(16);
    const key = await this.getKey();
    const cipher = createCipheriv('aes-256-cbc', key, iv);

    const encryptedData = Buffer.concat([cipher.update(data), cipher.final()]);

    return iv.toString('hex') + encryptedData.toString('hex');
  }

  public async decrypt(data: string | null) {
    if (!data) return '';

    const iv = Buffer.from(data.slice(0, 32), 'hex');
    const key = await this.getKey();
    data = data.slice(32);
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    const result = Buffer.concat([
      decipher.update(Buffer.from(data, 'hex')),
      decipher.final(),
    ]);
    return result.toString();
  }
}
