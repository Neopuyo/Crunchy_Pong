import { Tooltip } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { faGamepad, faXmark } from "@fortawesome/free-solid-svg-icons";
import { MdStar, Md3GMobiledata, Md5G, MdQuestionMark } from "react-icons/md";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "@/styles/chatPage/ChatChannel/ChatChannel.module.css";
import {
  confirmBackground,
  confirmBall,
  randomMaxPoint,
  randomMaxRound,
} from "@transcendence/shared/game/random";
import { useRouter } from "next/navigation";
import LobbyService from "@/services/Lobby.service";
import { toast } from "react-toastify";
import disconnect from "@/lib/disconnect/disconnect";

export default function InviteButton({
  setLoading,
  myself,
  opponentLogin,
  opponentId,
  addMsg,
  isChannel,
}: {
  setLoading: Dispatch<SetStateAction<boolean>>;
  myself: Profile & { avatar: Avatar };
  opponentLogin: string;
  opponentId: number;
  addMsg: (msg: Message) => void;
  isChannel: boolean;
}) {
  const [inviteGame, setInviteGame] = useState<boolean>(false);
  const router = useRouter();
  const lobbyService = new LobbyService();

  async function sendInvitation(
    gameType: "Classic" | "Best3" | "Best5" | "Custom"
  ) {
    try {
      setLoading(true);
      const settings: GameDTO = {
        name: `${myself.login} vs ${opponentLogin}`,
        type: gameType,
        mode: "Party",
        host: myself.id,
        opponent: -1,
        invite: opponentId,
        channel: isChannel,
        hostSide: "Left",
        maxPoint: 3,
        maxRound: 1,
        difficulty: 2,
        pause: true,
        push: true,
        background: confirmBackground("Random"),
        ball: confirmBall("Random"),
      };

      if (gameType === "Classic") {
        settings.maxPoint = 9;
        settings.maxRound = 1;
        settings.pause = false;
        settings.push = false;
        settings.background = "Classic";
        settings.ball = "Classic";
      } else if (gameType === "Best3") {
        settings.maxPoint = 7;
        settings.maxRound = 3;
      } else if (gameType === "Best5") {
        settings.maxPoint = 5;
        settings.maxRound = 5;
      } else if (gameType === "Custom") {
        settings.maxPoint = randomMaxPoint();
        settings.maxRound = randomMaxRound();
        settings.push = Math.random() < 0.5;
        settings.pause = Math.random() < 0.5;
      }

      //Creer la game
      const res = await lobbyService.createGame(settings);
      await toast.promise(
        new Promise((resolve) => resolve(res)), // Resolve the Promise with 'res'
        {
          pending: "Creating game...",
          success: "Game created",
          error: "Error creating game",
        }
      );
      if (!res.success) {
        if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === 'dev')
          console.log(res.message);
        return;
      }

      // send message
      const newMsg: Message = {
        content: `I invite you to play a ${gameType} Pong Game!`,
        sender: myself,
        date: new Date(),
        isServerNotif: false,
        opponentId: isChannel ? undefined : opponentId,
        join: res.data,
      };

      addMsg(newMsg);
      setLoading(false);

      router.push("/home/game/" + res.data);
    }
    catch (err: any) {
      if (err.message === 'disconnect') {
        await disconnect();
        router.refresh();
        return ;
      }
    }
  }

  return (
    <div className={styles.mainInviteButton}>
      {!inviteGame && (
        <Tooltip title={"game invitation"} arrow placement="top">
          <div
            className={styles.flexButtons}
            onClick={() => setInviteGame(!inviteGame)}
          >
            <FontAwesomeIcon
              icon={faGamepad}
              className={styles.iconInviteGame}
            />
          </div>
        </Tooltip>
      )}
      {inviteGame && (
        <div className={styles.flexButtons}>
          <Tooltip title={"Classic"} arrow placement="top">
            <span>
              <MdStar
                className={styles.iconInviteGame}
                onClick={() => sendInvitation("Classic")}
              />
            </span>
          </Tooltip>

          <Tooltip title={"Best 3"} arrow placement="top">
            <span>
              <Md3GMobiledata
                className={styles.iconInviteGame}
                onClick={() => sendInvitation("Best3")}
              />
            </span>
          </Tooltip>

          <Tooltip title={"Best 5"} arrow placement="top">
            <span>
              <Md5G
                className={styles.iconInviteGame}
                onClick={() => sendInvitation("Best5")}
              />
            </span>
          </Tooltip>

          <Tooltip title={"Random"} arrow placement="top">
            <span>
              <MdQuestionMark
                className={styles.iconInviteGame}
                onClick={() => sendInvitation("Custom")}
              />
            </span>
          </Tooltip>

          <Tooltip title={"cancel"} arrow placement="top">
            <FontAwesomeIcon
              icon={faXmark}
              className={styles.iconInviteGame}
              onClick={() => setInviteGame(!inviteGame)}
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
}
