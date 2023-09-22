type ChannelLists = {
  setBoss: Dispatch<SetStateAction<UserRelation[]>>;
  setOperators: Dispatch<SetStateAction<UserRelation[]>>;
  setPongers: Dispatch<SetStateAction<UserRelation[]>>;
  setInvited: Dispatch<SetStateAction<UserRelation[]>>;
  setBanned: Dispatch<SetStateAction<UserRelation[]>>;
  setLeavers: Dispatch<SetStateAction<UserRelation[]>>;
  setNotif: Dispatch<SetStateAction<string>>;
};
