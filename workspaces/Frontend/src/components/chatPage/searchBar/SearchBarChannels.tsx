import { Socket } from "socket.io-client";
import React, { useEffect, useState } from "react";
import Search from "./Search";

export default function SearchBarChannels({ socket, setChannelSearched, channelSearchedId }: {
	socket: Socket | undefined;
	setChannelSearched: React.Dispatch<React.SetStateAction<Channel | undefined>>;
	channelSearchedId: React.MutableRefObject<number | undefined>;
}) {
	const	[channels, setChannels] = useState<Channel []>([]);
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
		setChannelSearched(undefined);
		
		socket?.emit('getAllChannels', (channels: Channel[]) => {
			setChannels(channels);
		});

		setText(event.currentTarget.value);
	}

	useEffect(() => {
		const	createList = (text: string) => {
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
	
			if (list.length === 0) {
				const	err: ListError = verifyChannel(text);
	
				if (err.error) {
					setList([]);
					setError(err);
					return ;
				}
			}
	
			if (list.length === 0) {
				const	error: ListError = {
					id: -1,
					error: true,
					msg: "No channel found...",
				};
				setError(error);
			}
	
			setList(list);
		}

		createList(text);
	}, [channels, text]);

	const handleClick = (item: Display) => {
		setDropdownVisible(false);
		setList([]);
		setError(null);

		setChannelSearched(item);
		channelSearchedId.current = item.id;
	};

	return <Search
				list={list}
				error={error}
				getData={getData}
				setText={setText}
				placeholder="Find channels..."
				handleClick={handleClick}
				isDropdownVisible={isDropdownVisible}
				setDropdownVisible={setDropdownVisible}
			/>
}
