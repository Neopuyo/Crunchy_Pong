import fetchClientSide from "../fetch/fetchClientSide";

export async function getDoubleLogin(login: string): Promise<string> {
	const	encodeLogin = encodeURIComponent(login);
	const	response = await fetchClientSide(`http://${process.env.HOST_IP}:4000/api/users/login?login=${encodeLogin}`);

	if (!response.ok)
		throw new Error("Cannot check if login is already used");
	
	const	data = await response.json();
	if (data.exists)
		return "Login already used!"

	return "";
}

export function checkLoginFormat(login: string): string {
	if (/[ ]/.test(login))
		return "The login must not contain any space";
	if (/["'`]/.test(login))
		return "The login must not contain any quote";
	if (login.length < 4)
		return "The login must contain at least 4 characters";
	return "";
}
