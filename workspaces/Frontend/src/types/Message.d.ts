
type Message = {
    content: string;
    sender?: User;
    date: Date;
    isServerNotif: boolean;
    join?: string;
    opponentId?: number;
}

type GroupedMsgType = {
    user: Profile & { avatar: Avatar };
    date: Date;
    messages: Message[];
    isServerNotif: boolean;
    join?: string;
};
