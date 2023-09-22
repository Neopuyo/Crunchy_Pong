type Profile = {
  id: number;
  login: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  image: string;
  provider: string;
  motto: string;
  story: string;
  isTwoFactorAuthenticationEnabled?: boolean;
  gameKey: "Arrow" | "ZQSD" | "WASD";
};
