"use client";

import { useState, useEffect, useRef } from "react";
import styles from "@/styles/lobby/party/CreateParty.module.css";

import LobbyService from "@/services/Lobby.service";
import DefineType from "@/components/lobby/party/DefineType";
import DefineField from "@/components/lobby/party/DefineField";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  randomMaxPoint,
  randomMaxRound,
  confirmBackground,
  confirmBall,
} from "@transcendence/shared/game/random";
import GeneralSettings from "./GeneralSettings";
import DefineName from "./DefineName";
import Invite from "./Invite";
import { Socket } from "socket.io-client";
import LoadingComponent from "@/components/loading/Loading";
import disconnect from "@/lib/disconnect/disconnect";

type Props = {
  lobbyService: LobbyService;
  userId: number;
  socket: Socket;
  profile: Profile;
  avatar: Avatar;
};

export default function CreateParty({
  lobbyService,
  userId,
  socket,
  profile,
  avatar,
}: Props) {
  // ------------------------------------  CREATE  ------------------------------------ //
  //Pong Settings
  const [name, setName] = useState<string>("");
  const [enterName, setEnterName] = useState<boolean>(false);
  const [maxPoint, setMaxPoint] = useState<3 | 5 | 7 | 9>(9);
  const [maxRound, setMaxRound] = useState<1 | 3 | 5 | 7 | 9>(1);
  const [side, setSide] = useState<"Left" | "Right">("Left");
  const [push, setPush] = useState<boolean>(false);
  const [pause, setPause] = useState<boolean>(false);
  const [speed, setSpeed] = useState<-2 | -1 | 0 | 1 | 2>(0);
  const [background, setBackground] = useState<string>("Classic");
  const [ball, setBall] = useState<string>("Classic");
  const [selected, setSelected] = useState<
    "Classic" | "Best3" | "Best5" | "Random" | "Custom"
  >("Classic");
  const [type, setType] = useState<
    "Classic" | "Best3" | "Best5" | "Custom" | "Story"
  >("Classic");
  const router = useRouter();
  const [creatingParty, setCreatingParty] = useState<boolean>(false);
  const defineNameRef = useRef<HTMLDivElement>(null);
  const inviteId = useRef<number>(-1);
  const channelId = useRef<number>(-1);
  const connected = useRef<boolean>(false);

  async function createGame() {

    try {
      // if name is empty, show error message
      if (name.trim() === "") {
        setName("");
        setEnterName(true);
        defineNameRef.current!.scrollIntoView({ behavior: "smooth" });
        return;
      }

      if (inviteId.current !== -1 && !connected.current) {
        toast.info("This pongie is not connected, you cannot invite him right now!");
        return ;
      }

      //Creer un objet avec les settings
      const settings: GameDTO = {
        name: name,
        type: type,
        mode: "Party",
        host: userId,
        opponent: -1,
        invite: inviteId.current,
        channel: channelId.current !== -1 ? true : false,
        hostSide: side,
        maxPoint: maxPoint,
        maxRound: maxRound,
        difficulty: speed,
        pause: pause,
        push: push,
        background: confirmBackground(background),
        ball: confirmBall(ball),
      };

      setCreatingParty(true);
      const res = await lobbyService.createGame(settings);
      await toast.promise(new Promise((resolve) => resolve(res)), {
        pending: "Creating game...",
        success: "Game created",
        error: "Error creating game",
      });
      if (!res.success) {
        if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === 'disconnect')
          console.log(res.message);
        setCreatingParty(false);
        return;
      }

      if (inviteId.current !== -1 || channelId.current !== -1) {
        // send message

        const newMsg: Message = {
          content: `I invite you to play a ${type} Pong Game!`,
          sender: { ...profile, avatar: avatar },
          date: new Date(),
          isServerNotif: false,
          opponentId: channelId.current !== -1 ? undefined : inviteId.current,
          join: res.data,
        };

        if (process.env && process.env.ENVIRONNEMENT &&  process.env.ENVIRONNEMENT === "dev")
          console.log("Message : ", newMsg);
        
        // send message to privateMsg, find channel with pongie Id and join him inside if needed
        if (newMsg.opponentId && newMsg.opponentId !== -1) {
          socket?.emit('getChannelId', newMsg.opponentId, (payload: number) => {
            if (payload) {
              socket?.emit("forceJoinPrivateMsgChannel", 
              {channelId: payload, createIfNeeded:true, source:"forceJoinPrivateMsgChannel"},
              (rep:ReturnData) => {
                if (rep.success) {
                  socket?.emit("newMsg", {
                    content: newMsg.content,
                    channelId: payload,
                    join: newMsg.join ? newMsg.join : undefined,
                    source: "newMsg",
                  });
                } else {
                  toast.error("The invitation could not be sent, please close the game!");
                }
              });
            }
            else {
              toast.info("Could not send the invitation message...");
            }
          });
        }

        // send message to all channel
        else
          socket?.emit("newMsg", {
            content: newMsg.content,
            channelId: channelId.current,
            join: newMsg.join ? newMsg.join : undefined,
            source: "newMsg",
          });
      }

      router.push("/home/game/" + res.data);
    }
    catch (error: any) {
      if (error.message === 'disconnect') {
        await disconnect();
        router.refresh();
        return ;
      }
    }
  }

  useEffect(() => {
    if (selected === "Classic") {
      setMaxPoint(9);
      setMaxRound(1);
      setType("Classic");
      setPush(false);
      setPause(false);
      setBackground("Classic");
      setBall("Classic");
    } else if (selected === "Best3") {
      setMaxPoint(7);
      setMaxRound(3);
      setType("Best3");
      setPush(true);
      setPause(true);
      setBackground("Earth");
      setBall("Classic");
    } else if (selected === "Best5") {
      setMaxPoint(5);
      setMaxRound(5);
      setType("Best5");
      setPush(true);
      setPause(true);
      setBackground("Island");
      setBall("Classic");
    } else if (selected === "Random") {
      setMaxPoint(randomMaxPoint());
      setMaxRound(randomMaxRound());
      setType("Custom");
      setPush(Math.random() < 0.5);
      setPause(Math.random() < 0.5);
      setBackground("Random");
      setBall("Random");
    } else if (selected === "Custom") {
      setType("Custom");
    }
  }, [selected]);

  // -------------------------------------  RENDU  ------------------------------------ //
  return (
    <div className={styles.createParty} ref={defineNameRef}>
      <h2>Define Your Party</h2>
      <DefineName
        name={name}
        setName={setName}
        enterName={enterName}
        setEnterName={setEnterName}
      />

      <h3 className={styles.section}>Party Settings</h3>
      <DefineType
        selected={selected}
        setSelected={setSelected}
        maxPoint={maxPoint}
        setMaxPoint={setMaxPoint}
        maxRound={maxRound}
        setMaxRound={setMaxRound}
        push={push}
        setPush={setPush}
        pause={pause}
        setPause={setPause}
      />
      <GeneralSettings
        side={side}
        setSide={setSide}
        speed={speed}
        setSpeed={setSpeed}
      />
      <DefineField
        background={background}
        setBackground={setBackground}
        ball={ball}
        setBall={setBall}
        selected={selected}
      />
      <Invite
        inviteId={inviteId}
        isChannel={channelId}
        connected={connected}
        socket={socket}
        profile={profile}
      />
      <div className={styles.confirm}>
        <button
          className={styles.save}
          type="button"
          onClick={createGame}
          disabled={creatingParty}
        >
          {!creatingParty && "Create Party"}
          {creatingParty && <LoadingComponent />}
        </button>
      </div>
    </div>
  );
}
