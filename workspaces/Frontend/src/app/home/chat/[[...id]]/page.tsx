import ChatServer from "@/components/chatPage/ChatServer";
import LoadingSuspense from "@/components/loading/LoadingSuspense";
import { Refresher } from "@/components/refresher/Refresher";
import { Suspense } from "react";

export default async function ChatPage({ params: { id } }: {
	params: {
		id: string[];
	}
}) {
	let	channelId: number | undefined = undefined;

	if (id && id.length >= 0 && !isNaN(parseInt(id[0])))
		channelId = parseInt(id[0]);

	return (
		<>
			<Refresher />
			<Suspense fallback={<LoadingSuspense/>}>
				<ChatServer channelId={channelId}/>
			</Suspense>
		</>
	)
}
