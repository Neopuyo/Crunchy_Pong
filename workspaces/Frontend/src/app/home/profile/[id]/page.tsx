import { Refresher } from "@/components/refresher/Refresher";
import { Suspense } from "react";
import LoadingSuspense from "@/components/loading/LoadingSuspense";
import ProfileServer from "@/components/profile/ProfileServer";

type Params = {
  params: {
    id: number;
  };
};

export default async function ProfilByIdPage({ params: { id } }: Params) {

  return (
    <>
			<Refresher />
			<Suspense fallback={<LoadingSuspense/>}>
				<ProfileServer id={id} />
			</Suspense>
		</>
  )
}
