export async function getDoubleEmail(email: string) {
	const	encodeEmail = encodeURIComponent(email);

	const	response = await fetch(`http://${process.env.HOST_IP}:4000/api/users/email?email=${encodeEmail}`);

	if (!response.ok)
		throw new Error("Cannot check if email is already used");
	
	const	data = await response.json();

	return data as {
		exists: boolean,
		provider: string,
	};
}

export function checkPassword(password: string): string {
	if (/[ ]/.test(password))
		return "The password must not contain any space";
	if (/["'`]/.test(password))
		return "The password must not contain any quote";
	if (password.length < 8
		|| !/[A-Z]/.test(password)
		|| !/[0-9]/.test(password)
		|| !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
	)
		return "The password must contain at least 8 characters, with one capital letter, one digit and one special character";
	return "";
}
