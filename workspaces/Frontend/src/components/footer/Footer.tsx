import { Suspense } from "react";
import FooterFront from "./FooterFront";
import FooterServer from "./FooterServer";

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <FooterFront  profile={undefined} />
      }
    >
      <FooterServer />
    </Suspense>
  );
}
