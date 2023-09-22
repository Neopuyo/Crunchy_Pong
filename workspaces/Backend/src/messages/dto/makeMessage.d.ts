export type MakeMessage = {
  content: string;
  user?: User;
  channel: Channel;
  isServerNotif: boolean;
  join?: string;
};
