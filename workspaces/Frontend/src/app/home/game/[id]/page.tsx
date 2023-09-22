//Server side rendering

// Import des composants react
import { Suspense } from "react";


// Import des composants projets
import LoadingSuspense from "@/components/loading/LoadingSuspense";
import { Refresher } from "@/components/refresher/Refresher";
import GameServer from "@/components/game/GameServer";

export default async function GamePage({ params }: any) {
  let gameId = params.id;

  return (
		<>
			<Refresher />
			<Suspense fallback={<LoadingSuspense/>}>
				<GameServer gameId={gameId} />
			</Suspense>
		</>
	);
}
