import * as bcrypt from 'bcryptjs';

export default async function hash(data: string) {
	const	salt = await bcrypt.genSalt();

	return await bcrypt.hash(data, salt);
}
