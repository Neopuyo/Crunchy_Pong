interface League {
	Top10: PlayerLeaderBoard[];
	AllRanked: GameRanked[];
}

interface PlayerLeaderBoard {
	login: string;
	score: number;
	rank: number;
	avatar: string;
  user:User;
}

interface GameRanked {
	uuid: string,
	Name: string
	Host: string,
	Opponent: string,
	Avatar_Host: string,
	Avatar_Opponent: string,
	Mode: string,
	Color_Host: string,
	Color_Opponent: string,
}