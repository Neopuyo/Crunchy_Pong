import { Socket } from "socket.io-client";
import React, { useEffect, useState } from "react";
import Search from "@/components/chatPage/searchBar/Search";

type Props = {
  socket: Socket;
  profile: Profile;
  selectInvite: (item: Display) => void;

};

export default function SearchInvite({ socket, profile, selectInvite }: Props) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [pongies, setPongies] = useState<Pongie[]>([]);
  const [list, setList] = useState<(Channel | Pongie | CreateOne)[]>([]);
  const [error, setError] = useState<ListError | null>(null);
  const [text, setText] = useState<string>("");
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const verifyChannel = (text: string) => {
    if (text.includes("'") || text.includes('"') || text.includes("`"))
      return {
        id: -1,
        error: true,
        msg: "No quotes in the name please",
      };

    return {
      id: -1,
      error: false,
      msg: "",
    };
  };

  const verifyLogin = (text: string) => {
    if (text.includes(" ")) {
      return {
        id: -1,
        error: true,
        msg: "No channel found or no space in the login please",
      };
    }

    if (!/^(?!.*(?:'|\"|`))[!-~À-ÿ]+/.test(text)) {
      return {
        id: -1,
        error: true,
        msg: "No quotes in the login please",
      };
    }

    return {
      id: -1,
      error: false,
      msg: "",
    };
  };

  const getData = (event: React.MouseEvent<HTMLInputElement>) => {
    socket?.emit("getChannelsProfile", profile.id, (channels: Channel[]) => {
      setChannels(channels);
    });
    socket?.emit("getMyFriends", profile.id, (pongies: Pongie[]) => {
      setPongies(pongies);
    });

    setText(event.currentTarget.value);
  };

  useEffect(() => {
    const createList = (text: string) => {
      setError(null);

      if (!text) {
        setList([]);
        return;
      }

      const textlowerCase: string = text.toLocaleLowerCase();

      let list: (Channel | Pongie | CreateOne)[] = [];
      list = list.concat(
        channels.filter(
          (channel) => channel?.name.toLowerCase().includes(textlowerCase)
        )
      );

      list = list.concat(
        pongies.filter(
          (pongie) => pongie?.login.toLowerCase().includes(textlowerCase)
        )
      );

      if (list.length === 0) {
        const err: ListError = verifyChannel(text);

        if (err.error) {
          setList([]);
          setError(err);
          return;
        }
      }

      if (list.length === 0) {
        const err: ListError = verifyLogin(text);

        if (err.error) {
          setList([]);
          setError(err);
          return;
        }
      }

      if (list.length === 0) {
        const error: ListError = {
          id: -1,
          error: true,
          msg: "Nothing found...",
        };
        setError(error);
      }

      setList(list);
    };

    createList(text);
  }, [channels, pongies, text]);

  const handleClick = (item: Display) => {
    setDropdownVisible(false);
    setList([]);
    setError(null);
    
    selectInvite(item);
  };

  return (
    <Search
      list={list}
      error={error}
      getData={getData}
      setText={setText}
      placeholder="Channels, pongies..."
      handleClick={handleClick}
      isDropdownVisible={isDropdownVisible}
      setDropdownVisible={setDropdownVisible}
    />
  );
}
