import LoadingSuspense from "@/components/loading/LoadingSuspense";
import { Refresher } from "@/components/refresher/Refresher";
import { Suspense } from "react";
import SignupLocalhost from "@/components/welcome/signup/SignupLocalhost";
import SignupIp from "@/components/welcome/signup/SignupIp";
import ServerError from "@/components/error/ServerError";

export default async function SignUpPage() {
  if (
    !process.env.ENVIRONNEMENT || !process.env.HOST_IP ||
    (process.env.ENVIRONNEMENT !== "dev" &&
      process.env.ENVIRONNEMENT !== "build")
  )
    return <ServerError />;
  else if (process.env.ENVIRONNEMENT === "dev" && process.env.HOST_IP === "localhost")
    return (
      <>
        <Refresher />
        <Suspense fallback={<LoadingSuspense />}>
          <SignupLocalhost />
        </Suspense>
      </>
    );
  else
    return (
      <>
        <Refresher />
        <Suspense fallback={<LoadingSuspense />}>
          <SignupIp />
        </Suspense>
      </>
    );
}
