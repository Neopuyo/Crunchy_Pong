import { NextRequest, NextResponse } from "next/server";
import cloudinary from 'cloudinary';
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth/auth";

export async function POST(req: NextRequest) {

	const	crunchyToken = cookies().get("crunchy-token")?.value;
	let	publicIdReq: string | undefined = undefined;

	try {
		const	{ publicId } = await req.json();
		publicIdReq = publicId;
	}
	catch (err) {}

	try {

		if (!crunchyToken)
			return NextResponse.json({
				success: false,
			}, {
				status: 401,
			});

		const	payload = verifyAuth(crunchyToken);

		if (!payload)
			return NextResponse.json({
				success: false,
			});

		const timestamp = Math.round((new Date).getTime()/1000);

		let	signature = "";

		if (!publicIdReq)
			signature = cloudinary.v2.utils.api_sign_request({
					timestamp: timestamp,
					eager: 'c_pad,h_300,w_400|c_crop,h_200,w_260',
					folder: process.env.CLOUD_FOLDER,
				},
				process.env.CLOUD_SECRET as string);

		else
			signature = cloudinary.v2.utils.api_sign_request({
					timestamp: timestamp,
					public_id: publicIdReq,
				},
				process.env.CLOUD_SECRET as string);

		return NextResponse.json({
			success: true,
			timestamp,
			signature,
		});
	}
	catch (error) {
		if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
			console.log(error);
	}

	return NextResponse.json({
		success: false,
	});
}
