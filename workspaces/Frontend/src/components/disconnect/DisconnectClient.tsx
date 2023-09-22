"use client"

import disconnect from "@/lib/disconnect/disconnect";
import ChatService from "@/services/Chat.service";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function DisconnectClient() {

	useEffect(() => {

		let	intervalNb = 0;

		const	intervalId = setInterval(() => {
			intervalNb++;
			const chatService = new ChatService();

			if (chatService.socket) {
				chatService.disconnectClient = true;
				chatService.disconnect();
				clearInterval(intervalId);
			}
			if (intervalNb >= 10)
				clearInterval(intervalId);

			}, 1000);

		return () => {
			clearInterval(intervalId);
		}
	}, []);

	const	signoff = async () => {
		await disconnect();
	}

	useEffect(() => {
		toast.info("You have been disconnected...");
	}, []);

	signoff();

	return <></>;
}
