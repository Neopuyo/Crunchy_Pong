import Disconnect from "@/components/disconnect/Disconnect";
import { Refresher } from "@/components/refresher/Refresher";
import WelcomeContainer from "@/components/welcome/Welcome";

export default function Home() {

  return (
    <main>
      <Refresher />
      <Disconnect />
      <WelcomeContainer />
    </main>
  );
}
