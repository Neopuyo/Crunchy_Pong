import { Refresher } from "@/components/refresher/Refresher";
import ConfirmCode from "@/components/welcome/auth/ConfirmCode";

export default function ConfirmPage({ params: { id } }: {
  params: {
    id: string;
  }
}) {
  const userId = parseInt(id);

  return (
    <div>
      <Refresher />
      <ConfirmCode userId={userId} />
    </div>
  );
}
