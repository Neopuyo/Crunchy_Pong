export default async function sendNewCode(id: number) {
	const	response = await fetch(`http://${process.env.HOST_IP}:4000/api/auth/sendNewCode/${id}`, {
		method: "POST",
	});

	if (!response.ok)
		throw new Error('Cannot create user');
	
	return await response.json();
}
