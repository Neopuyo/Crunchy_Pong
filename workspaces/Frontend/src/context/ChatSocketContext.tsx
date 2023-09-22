import { createContext } from "react";
import { Socket } from "socket.io-client";

export const	ChatSocketContext = createContext<Socket | null>(null);

export const	ChatSocketProvider = ChatSocketContext.Provider;
