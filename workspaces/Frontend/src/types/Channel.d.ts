type Channel = {
  id: number;
  name: string;
  avatar: Avatar;
  type: ChannelType;
  password:string;
  isBoss: boolean;
  isChanOp: boolean;
  joined: boolean;
  invited: boolean;
  isBanned: boolean;
  muted: boolean;
  lastMessage?: {
    user: User;
    content: string;
    createdAt: Date;
  };
  statusPongieId?: number;
};
