"use client"

import ChatService from "@/services/Chat.service";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import LogIn from "../login/LogIn";

export default function SignupLocalhost() {
	
	ChatService.instance = null;

	return (
		<GoogleReCaptchaProvider
		  reCaptchaKey={process.env.WEBSITE_KEY as string}
		  scriptProps={{
			async: false,
			defer: false,
			appendTo: "head",
			nonce: undefined,
		  }}
		>
		  <LogIn />
		</GoogleReCaptchaProvider>
	  );
}
