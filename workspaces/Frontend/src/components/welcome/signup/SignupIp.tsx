"use client"

import ChatService from "@/services/Chat.service";
import LogIn from "../login/LogIn";

export default function SignupIp() {
	
	ChatService.instance = null;

	return <LogIn />
}
