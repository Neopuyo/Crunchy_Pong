import NavbarFront from "./NavbarFront";
import { Suspense } from "react";
import NavbarServ from "./NavbarServ";

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <NavbarFront avatar={undefined} profile={undefined} token={undefined} />
      }
    >
      <NavbarServ />
    </Suspense>
  );
}
