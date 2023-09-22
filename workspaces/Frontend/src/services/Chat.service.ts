import { Socket, io } from "socket.io-client";

export default class ChatService {
  public static instance: ChatService | null = null;

  public socket: Socket | undefined = undefined;
  public disconnectClient: boolean = false;
  public loading: boolean = false;
  public nbExceptions: number = 0;

  // Singleton
  constructor(token?: string) {
    if (token && ChatService.instance && !this.socket) {
      this.initializeSocket(token);
      ChatService.instance = this;
    }

    if (ChatService.instance) {
    	return ChatService.instance;
    }


    if (token) {
      this.initializeSocket(token);
      ChatService.instance = this;
    } else {
    	this.disconnect();
    }
  }

  // Create socket + listen errors & exceptions
  public initializeSocket(token: string) {
    while (this.loading) {}

    if (this.socket) return;

    this.loading = true;
    this.socket = io(`ws://${process.env.HOST_IP}:4000/chat`, {
      extraHeaders: {
        Authorization: "Bearer " + token,
      },
      path: "/chat/socket.io",
      reconnection: false,
    });

    this.socket.on("connect", () => {
      this.loading = false;
    });

    this.socket.on("disconnect", async () => {
      this.disconnect();
    });

    // Catching error or exception will force disconnect then reconnect
    this.socket.on("connect_error", async (error: any) => {
      this.loading = false;
      if (
        process.env &&
        process.env.ENVIRONNEMENT &&
        process.env.ENVIRONNEMENT === "dev"
      )
        console.log("Socket connection error:", error);
      this.disconnect();
      await this.refreshSocket();
    });

    this.socket.on("error", async (error: any) => {
      if (
        process.env &&
        process.env.ENVIRONNEMENT &&
        process.env.ENVIRONNEMENT === "dev"
      )
        console.log("Socket error:", error);
      await this.refreshSocket();
    });

    this.socket.on("exception", async (exception: any) => {
      if (
        process.env &&
        process.env.ENVIRONNEMENT &&
        process.env.ENVIRONNEMENT === "dev"
      )
        console.log("WsException:", exception);
      if (exception.message === "invalid token") this.disconnectClient = true;

      if (++this.nbExceptions >= 2) this.disconnectClient = true;

      if (this.nbExceptions === 1)
        setTimeout(() => {
          this.nbExceptions = 0;
        }, 2000);

      await this.refreshSocket();
    });
  }

  // Disconnect socket + stop listen errors & exceptions
  public disconnect() {
    if (this.socket) {
      this.socket.off("connect_error");
      this.socket.off("error");
      this.socket.off("exception");
      this.socket.off("refresh");
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  private async refreshSocket() {
    if (this.disconnectClient) return;

    try {

		const res = await fetch(
			`http://${process.env.HOST_IP}:4000/api/auth/refreshToken`,
			{
			method: "POST",
			credentials: "include",
			}
		);

      if (!res.ok) throw new Error("fetch failed");

      const data = await res.json();

      const resApi = await fetch(
        `http://${process.env.HOST_IP}:3000/api/auth/setCookies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          }),
        }
      );

      if (!resApi.ok) throw new Error("fetch api failed");

	    this.disconnect();
    } catch (error: any) {
      this.disconnectClient = true;
    }
  }
}
