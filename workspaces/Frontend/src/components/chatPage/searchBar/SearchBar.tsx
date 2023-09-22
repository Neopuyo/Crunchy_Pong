import { Socket } from "socket.io-client";
import React, { useEffect, useState } from "react";
import Search from "./Search";

export default function SearchBar({ socket, openDisplay }: {
	socket: Socket | undefined;
	openDisplay: (display: Display) => void;
}) {
	const	[channels, setChannels] = useState<Channel []>([]);
	const	[pongies, setPongies] = useState<Pongie []>([]);
	const	[list, setList] = useState<(Channel | Pongie | CreateOne) []>([]);
	const	[error, setError] = useState<ListError | null>(null);
	const	[text, setText] = useState<string>("");
	const	[isDropdownVisible, setDropdownVisible] = useState(false);

	const	verifyChannel = (text: string) => {
		if (text.includes("'") || text.includes('"') || text.includes('`'))
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
	}

	const	getData = (event: React.MouseEvent<HTMLInputElement>) => {
		socket?.emit('getAllChannels', (channels: Channel[]) => {
			setChannels(channels);
		});
		socket?.emit('getAllPongies', (pongies: Pongie[]) => {
			setPongies(pongies);
		});

		setText(event.currentTarget.value);
	}

	useEffect(() => {
		const	createList = (text: string) => {
			let	hasChannel: boolean = false;
			setError(null);
			
			if (!text) {
				setList([]);
				return ;
			}
	
			const	textlowerCase: string = text.toLocaleLowerCase();
	
			let		list: (Channel | Pongie | CreateOne)[] = [];
			list = list.concat(
				channels.filter(channel => channel?.name.toLowerCase().includes(textlowerCase))
			);
	
			if (channels.find(channel => channel?.name === text))
				hasChannel = true;
	
			list = list.concat(
				pongies.filter(pongie => pongie?.login.toLowerCase().includes(textlowerCase))
			);
	
			if (list.length === 0) {
				const	err: ListError = verifyChannel(text);
	
				if (err.error) {
					setList([]);
					setError(err);
					return ;
				}
			}
	
			if (!hasChannel) {
				const	addChannel: CreateOne = {
					id: -1,
					avatar: {
						image: "",
						variant: "rounded",
						borderColor: "#22d3ee",
						backgroundColor: "#22d3ee",
						text: text,
						empty: true,
						isChannel: true,
						decrypt: false,
					},
					name: "Create channel " + text,
				}
				list = list.concat(addChannel);
			}
	
			setList(list);
		}

		createList(text);
	}, [channels, pongies, text]);

	const handleClick = (item: Display) => {
		setDropdownVisible(false);
		setList([]);
		setError(null);
  
		const name =
		  "joined" in item
			? item.name
			: "login" in item
			? item.login
			: item.name.slice(15, item.name.length);
  
		const type =
		  "joined" in item
			? item.type
			: "login" in item
			? "privateMsg"
			: "public";
  
		socket?.emit(
		  "join",
		  {
			id: item.id,
			channelName: name,
			channelType: type,
		  },
		  (payload: {
			success: boolean;
			exists: boolean;
			banned: boolean;
			private: boolean;
			channel: Channel;
		  }) => {
			if (payload.success) {
				if (payload.channel.type === "protected" && !payload.channel.joined && !payload.channel.isBoss)
					openDisplay({...payload.channel, needPassword: true});
				else
			  		openDisplay(payload.channel);
			} else if (payload.exists) {
			  setError({
				id: -1,
				error: true,
				msg: `${name} is private, please choose an other name`,
			  });
			  setDropdownVisible(true);
			} else if (payload.banned && type !== "privateMsg") {
			  setError({
				id: -1,
				error: true,
				msg: `You are banned from ${name}`,
			  });
			  setDropdownVisible(true);
			} else if (payload.banned && type === "privateMsg") {
			  setError({
				id: -1,
				error: true,
				msg: `You blacklisted ${name} or he has!`,
			  });
			} else if (payload.private) {
			  setError({
				id: -1,
				error: true,
				msg: `You cannot see this channel, sorry!`,
			  });
			  setDropdownVisible(true);
			}
		  }
		);
	};

	return <Search
				list={list}
				error={error}
				getData={getData}
				setText={setText}
				placeholder="Channels, pongies..."
				handleClick={handleClick}
				isDropdownVisible={isDropdownVisible}
				setDropdownVisible={setDropdownVisible}
			/>
}
