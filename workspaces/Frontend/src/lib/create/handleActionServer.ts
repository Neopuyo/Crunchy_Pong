"use client";

import { CryptoService } from "@/services/Crypto.service";
import { getDoubleLogin } from "./checkLogin";
import fetchClientSide from "../fetch/fetchClientSide";

const Crypto = new CryptoService();

export async function handleActionServer(
  login: string,
  avatarChosen: Avatar,
  token: string
): Promise<{
  exists: string;
  access_token: string;
  refresh_token: string;
}> {
  try {
    const res = await getDoubleLogin(login);

    if (res.length > 0)
      return {
        exists: res,
        access_token: "",
        refresh_token: "",
      };

    const register = await fetchClientSide(
      `http://${process.env.HOST_IP}:4000/api/auth/firstLogin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          login,
          avatarChosen,
        }),
      }
    );

    const data = await register.json();

    if (data.error) throw new Error(data.message);

    return {
      exists: res,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  } catch (err: any) {
    if (err.message)
      throw new Error('disconnect');
    return {
      exists: "Something went wrong, please try again!",
      access_token: "",
      refresh_token: "",
    };
  }
}
