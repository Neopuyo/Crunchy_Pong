import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const	{code} = await req.json();
	const	crunchyToken = cookies().get("crunchy-token")?.value;

	if (!crunchyToken)
		return NextResponse.json({
			success: false,
			error: 'no token',
		});
	
	if (!code)
		return NextResponse.json({
			success: false,
			error: 'no code',
		});

	try {
		const	res = await fetch(`http://backend:4000/api/2fa/authenticate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${crunchyToken}`,
			},
			body: JSON.stringify({
				twoFactorAuthenticationCode: code,
			}),
		})

		if (res.status === 401)
			return NextResponse.json({
				success: false,
				error: 'no token',
			});

		if (!res.ok)
			throw new Error('fetch failed');

		const	data = await res.json();

		if (!data.success)
			return NextResponse.json({
				success: false,
				error: data.error,
			});
		
		const	response = NextResponse.json({success: data.success});

		response.cookies.set({
			name: "crunchy-token",
			value: data.access_token,
			httpOnly: true,
			sameSite: "strict",
			path: "/",
			secure: false,
		});

		response.cookies.set({
			name: "refresh-token",
			value: data.refresh_token,
			httpOnly: true,
			sameSite: "strict",
			path: "/",
			secure: false,
		});

		return response;

	} catch (err) {
		if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
			console.log(err);
		return NextResponse.json({
			success: false,
			error: "fail",
		});
	}
}
