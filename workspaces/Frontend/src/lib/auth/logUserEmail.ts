export default async function logUserEmail(email: string, password: string) {
	
	const	response = await fetch(`http://${process.env.HOST_IP}:4000/api/auth/login`, {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify({
			email: email,
			password: password,
		}),
	});

	if (!response.ok) {
		if (response.status === 401)
			return "wrong password";
		if (response.status === 404)
			return "no user";
		if (response.status === 502)
			return "server error";
		throw new Error('Cannot create user');
	}

	const	data = await response.json();

	return data;
}
