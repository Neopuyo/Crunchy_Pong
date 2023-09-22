import { cookies } from "next/headers"
import DisconnectClient from "./DisconnectClient";

export default async function Disconnect() {

	const	token = cookies().get("crunchy-token");
	const	refreshToken = cookies().get("refresh-token");

	if ((token && token.value.length > 0
		|| refreshToken && refreshToken.value.length > 0)) {
		return (
			<DisconnectClient />
		);
	}

	return (
		<></>
	)
}
