type NewRelation = {
  isChanOp?: boolean;
  isBanned?: boolean;
  joined?: boolean;
  invited?: boolean;
  isBoss?: boolean;
  muted?: boolean;
};

export type EditChannelRelation = {
  channelId: number,
  userId: number,
  senderId: number,
  newRelation: NewRelation;
};
