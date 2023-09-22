import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const	code: string | null = req.nextUrl.searchParams.get('code');
	const	id: string | null = req.nextUrl.searchParams.get('id');

	if (code && id) {
		try {
			const	res = await fetch(`http://backend:4000/api/auth/verifyCode/${code}/${id}`);
			const	data = await res.json();

			const	response = NextResponse.json(data);
			if (data?.success) {
				response.cookies.set({
					name: "crunchy-token",
					value: data.access_token,
					httpOnly: true,
					sameSite: "strict",
					path: "/",
					secure: false,
				});

				if (data.refresh_token)
					response.cookies.set({
						name: "refresh-token",
						value: data.refresh_token,
						httpOnly: true,
						sameSite: "strict",
						path: "/",
						secure: false,
					});
			}
			return response;
		}
		catch (err) {
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
				console.log(err);
		}
	}
	const	data = {
		success: false,
		message: "Something went wrong, please try again!",
	}
	return NextResponse.json(data);
}
