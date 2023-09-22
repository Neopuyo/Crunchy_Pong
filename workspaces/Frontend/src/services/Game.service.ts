import { Socket, io } from "socket.io-client";

export default class GameService {
  private static instance: GameService | null = null;

  public socket: Socket | undefined = undefined;
  public reconnect: boolean = false;
  public token: string | undefined;

  // Singleton
  constructor(token: string) {
    if (
      GameService.instance &&
      !GameService.instance.reconnect &&
      GameService.instance.token === token
    ) {
      return GameService.instance;
    }

    this.initializeSocket(token);
    GameService.instance = this;
  }

  // Create socket + listen errors & exceptions
  private initializeSocket(token: string) {
    if (this.socket) this.disconnect(false);

    this.token = token;

    this.socket = io(`ws://${process.env.HOST_IP}:4000/game`, {
      extraHeaders: {
        Authorization: "Bearer " + token,
      },
      path: "/game/socket.io",
    });

    // Catching error or exception will force disconnect then reconnect
    this.socket.on("connect_error", (error: any) => {
      this.disconnect(true);
    });

    this.socket.on("error", (error: any) => {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log("Socket error:", error);
      this.disconnect(true);
    });

    this.socket.on("exception", (exception: any) => {
      if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log("WsException:", exception);
      this.disconnect(true);
    });
  }

  // Disconnect socket + stop listen errors & exceptions
  public disconnect(reconnect: boolean) {
    if (this.socket) {
      this.socket.off("connect_error");
      this.socket.off("error");
      this.socket.off("exception");
      this.socket.disconnect();
      this.socket = undefined;
    }
    this.reconnect = reconnect;
  }
}
