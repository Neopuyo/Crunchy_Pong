import { Refresher } from "@/components/refresher/Refresher";
import { Suspense } from "react";
import LoadingSuspense from "@/components/loading/LoadingSuspense";
import HomeServer from "@/components/home/HomeServer";

export default async function HomePage() {
	return (
		<>
			<Refresher />
			<Suspense fallback={<LoadingSuspense/>}>
				<HomeServer />
			</Suspense>
		</>
	)
}
