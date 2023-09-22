import { Refresher } from "@/components/refresher/Refresher";
import TwoFactorAuthClient from "@/components/twoFactorAuthPage/TwoFactorAuthClient";
import { Suspense } from "react";
import LoadingSuspense from "@/components/loading/LoadingSuspense";

export default function TwoFactorAuthPage() {
  return (
    <>
      <Refresher />
      <Suspense fallback={<LoadingSuspense />}>
        <TwoFactorAuthClient />
      </Suspense>
    </>
  );
}
