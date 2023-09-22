export default async function disconnect(id?: string) {
	if (!id)
		id = "";
	
	try {
		await fetch(
			`http://${process.env.HOST_IP}:3000/api/signoff?id=${id}`, {
				credentials: "include",
			}
		);
	}
	catch (error) {
		if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
			console.log(error);
	}
}
