import { promisify } from "util";
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import scrypt from "scryptsy";

export class CryptoService {

	private	key: Buffer | null = null;
	private init: Promise<void> | null = null;

	private async	getKey(): Promise<Buffer | undefined> {
		if (this.key)
			return this.key;
		
		if (!this.init)
			this.init = this.initialize();
		
		await this.init;
		if (this.key)
			return this.key as Buffer;
	}

	private async initialize(): Promise<void> {
		// "use server"
		if (process.env.CRYPTO_KEY)
			this.key = scrypt(process.env.CRYPTO_KEY, 'salt', 16384, 8, 1, 32) as Buffer;
			// this.key = (await promisify(scrypt)(process.env.CRYPTO_KEY, 'salt', 32)) as Buffer;
	}

	public async encrypt(data: string | null): Promise<string> {
		if (!data)
			return "";
		
		const	iv = randomBytes(16);
		const	key = await this.getKey();
		
		if (!key)
			throw new Error("Encryption key not valid");
		
		const	cipher = createCipheriv('aes-256-cbc', key, iv);
		
		const	encryptedData = Buffer.concat([
			cipher.update(data),
			cipher.final(),
		]);
	
		return iv.toString('hex') + encryptedData.toString('hex');
	}
	
	public async decrypt(data: string | null) {
		if (!data)
			return "";
		
		const	iv = Buffer.from(data.slice(0, 32), 'hex');
		const	key = await this.getKey();
		data = data.slice(32);
		if (!key)
			throw new Error("Encryption key not valid");
		const	decipher = createDecipheriv('aes-256-cbc', key, iv);
		const	result = Buffer.concat([
			decipher.update(Buffer.from(data, 'hex')),
			decipher.final(),
		]);
		return result.toString();
	}
}
