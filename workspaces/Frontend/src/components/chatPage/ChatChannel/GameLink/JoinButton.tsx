import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LobbyService from "@/services/Lobby.service";
import { toast } from "react-toastify";
import disconnect from "@/lib/disconnect/disconnect";
import { Socket } from "socket.io-client";

type Props = {
  socket: Socket | undefined;
  gameId: string;
  group: GroupedMsgType;
};

export default function JoinButton({ socket, gameId, group }: Props) {
  const router = useRouter();
  const lobbyService = new LobbyService();
  const [visible, setVisible] = useState<boolean>(false);

  async function joinGame() {
    if (!gameId) return;

    try {
      const res: ReturnData = await lobbyService.joinGame(gameId);
      await toast.promise(new Promise((resolve) => resolve(res)), {
        pending: "Joining game...",
      });
      if (!res.success) {
        if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === 'dev') {
          console.log(res.message);
          console.log(res.error);
        }
        if (res.message && res.message === "Game is full") {
          toast.info('Someone already joined this game!');
          setVisible(false);
          return ;
        }
        throw new Error("join failed");
      }
      toast.success("Good Luck!");
      setVisible(false);
      const url = "/home/game/" + res.data;
      router.push(url);
    }
    catch (err: any) {
      if (err.message === 'disconnect') {
        await disconnect();
        router.refresh();
        return ;
      }
      toast.error("Something went wrong, please try again!");
    }
  }

  useEffect(() => {

    const joinButton = (payload: {
      active: boolean;
      gameId: string;
    }) => {
      if (!payload || !payload.gameId)
        return ;
      if (payload.gameId !== gameId)
        return ;
      if (payload.active)
        setVisible(true);
      else
        setVisible(false);
    };

    socket?.emit('joinButton', gameId, (payload:any) => {
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log("emit", gameId);
      joinButton(payload);});

    socket?.on('joinButton', joinButton);

    return () => {
      socket?.off('joinButton', joinButton);
    }

  }, [socket, group]);

  if (!gameId || !visible) return <></>;

  return (
    <button onClick={joinGame} type="button">
      Join
    </button>
  );
}
