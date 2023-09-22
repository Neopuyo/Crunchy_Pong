import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const	cookies = await req.json();

	const	accessToken = cookies.accessToken;
	const	refreshToken = cookies.refreshToken;

	if (!accessToken) {
		const	data = {
			message: "Something went wrong, please try again !",
		};
		return NextResponse.json(data);
	}
	
	const	data = {
		message: "Loading...",
	};

	const	response = NextResponse.json(data);
	response.cookies.set({
		name: "crunchy-token",
		value: accessToken,
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
}
