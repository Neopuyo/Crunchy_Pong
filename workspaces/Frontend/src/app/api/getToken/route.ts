import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
	const	crunchyToken = cookies().get("crunchy-token")?.value;

	if (crunchyToken)
		return NextResponse.json({
			success: true,
			cookie: crunchyToken,
		});
	
	return NextResponse.json({
		success: false,
	});
}
