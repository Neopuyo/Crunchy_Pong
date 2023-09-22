import { NextResponse } from "next/server";

const	verifyCaptcha = async (token: string) => {
	const	verificationUrl =
		"https://www.google.com/recaptcha/api/siteverify?secret="
		+ process.env.SECRET_KEY
		+ "&response="
		+ token;
	
	return await fetch(verificationUrl, {
		method: "POST",
	});
}

export async function POST(	
	req: Request,
) {
	try {
		const	token = (await req.json()).gRecaptchaToken;
		const	response = await verifyCaptcha(token);

		const	data = await response.json();

		if (data?.success && data?.score >= 0.5)
			return NextResponse.json({
				status: "ok",
			});
	}
	catch(error) {
		return NextResponse.json({
			status: "error",
		});
	}
	return NextResponse.json({
		status: "error",
	});
}
