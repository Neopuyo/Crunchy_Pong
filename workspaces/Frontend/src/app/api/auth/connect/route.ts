import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
	const	refreshToken = cookies().get("refresh-token")?.value;
	const	crunchyToken = cookies().get("crunchy-token")?.value;

	if (crunchyToken) {
		try {
			
			const	response = NextResponse.json({status:200});
			response.cookies.set({
				name: "crunchy-token",
				value: crunchyToken,
				httpOnly: true,
				sameSite: "strict",
				path: "/",
				secure: false,
			});

			if (refreshToken)
				response.cookies.set({
					name: "refresh-token",
					value: refreshToken,
					httpOnly: true,
					sameSite: "strict",
					path: "/",
					secure: false,
				});

			return response;

		} catch (err) {
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
				console.log(err);
		}
	}
	return NextResponse.json({status: 400});
}
