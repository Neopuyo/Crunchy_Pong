import { Refresher } from "@/components/refresher/Refresher";
import { Suspense } from "react";
import LoadingSuspense from "@/components/loading/LoadingSuspense";
import CreateServer from "@/components/createLogin/CreateServer";

export default async function CreatePage() {
  return (
		<>
			<Refresher />
			<Suspense fallback={<LoadingSuspense/>}>
				<CreateServer />
			</Suspense>
		</>
	)
}
