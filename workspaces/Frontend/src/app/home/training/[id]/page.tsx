//Server side rendering

// //Import des composants react
import { Suspense } from "react";

import { Refresher } from "@/components/refresher/Refresher";
import LoadingSuspense from "@/components/loading/LoadingSuspense";
import TrainingServer from "@/components/gameSolo/TrainingServer";

export default async function TrainingPage({ params }: any) {
  let trainingId = params.id;

  return (
		<>
			<Refresher />
			<Suspense fallback={<LoadingSuspense/>}>
				<TrainingServer trainingId={trainingId} />
			</Suspense>
		</>
	);
}
