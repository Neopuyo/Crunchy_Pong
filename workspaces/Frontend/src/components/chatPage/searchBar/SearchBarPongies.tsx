import { Socket } from "socket.io-client";
import React, { useEffect, useState } from "react";
import Search from "./Search";

export default function SearchBarPongies({ socket, setPongieSearched, pongieSearchedId, handleClickInvite, placeholder }: {
	socket: Socket | undefined;
	setPongieSearched?: React.Dispatch<React.SetStateAction<Pongie | undefined>>;
	pongieSearchedId?: React.MutableRefObject<number | undefined>;
	handleClickInvite?: (targetId: number) => Promise<void>;
	placeholder: string;
}) {
	const	[pongies, setPongies] = useState<Pongie []>([]);
	const	[list, setList] = useState<(Channel | Pongie | CreateOne) []>([]);
	const	[error, setError] = useState<ListError | null>(null);
	const	[text, setText] = useState<string>("");
	const	[isDropdownVisible, setDropdownVisible] = useState(false);

	const	verifyLogin = (text: string) => {
		if (text.includes(' ')) {
			return {
				id: -1,
				error: true,
				msg: "No space in the login please",
			};
		}

		if (!(/^(?!.*(?:'|\"|`))[!-~À-ÿ]+/.test(text))) {
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
	}

	const	getData = (event: React.MouseEvent<HTMLInputElement>) => {
		if (setPongieSearched)
			setPongieSearched(undefined);
		
		socket?.emit('getAllPongies', (pongies: Pongie[]) => {
			setPongies(pongies);
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
				pongies.filter(pongie => pongie?.login.toLowerCase().includes(textlowerCase))
			);
	
			if (list.length === 0) {
				const	err: ListError = verifyLogin(text);
	
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
					msg: "No pongie found...",
				};
				setError(error);
			}
	
			setList(list);
		}

		createList(text);
	}, [pongies, text]);

	const handleClick = (item: Display) => {
		setDropdownVisible(false);
		setList([]);
		setError(null);

		if (setPongieSearched && pongieSearchedId) {
			setPongieSearched(item);
			pongieSearchedId.current = item.id;
		}
		else if (handleClickInvite) {
			handleClickInvite(item.id);
		}
	};

	return <Search
				list={list}
				error={error}
				getData={getData}
				setText={setText}
				placeholder={placeholder}
				handleClick={handleClick}
				isDropdownVisible={isDropdownVisible}
				setDropdownVisible={setDropdownVisible}
			/>
}
