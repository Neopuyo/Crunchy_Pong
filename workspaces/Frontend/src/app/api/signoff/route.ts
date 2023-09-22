import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
	const	id: string | null = req.nextUrl.searchParams.get('id');
	const	crunchyToken = cookies().get('crunchy-token')?.value;

	if (id && id.length > 0) {
		try {
			fetch(`http://backend:4000/api/users/disconnect/${id}`, {
				method: "DELETE",
			});
		}
		catch (error: any) {
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
				console.log(error.message);
		}
	}
	else if (crunchyToken) {
		try {
			fetch(`http://backend:4000/api/users/disconnectByToken`, {
				method: "DELETE",
				credentials: 'include',
			});
		}
		catch (error: any) {
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
				console.log(error.message);
		}
	}
	
	const	response = new NextResponse;

	response.cookies.set({
		name: "crunchy-token",
		value: "deleted",
		httpOnly: true,
		sameSite: "strict",
		maxAge: 0,
		secure: false,
	});

	response.cookies.set({
		name: "refresh-token",
		value: "deleted",
		httpOnly: true,
		sameSite: "strict",
		maxAge: 0,
		secure: false,
	});
	
	return response;
}
