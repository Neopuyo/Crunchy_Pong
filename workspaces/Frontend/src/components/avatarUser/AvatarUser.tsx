import Avatar from "@mui/material/Avatar";

export default function AvatarUser({
  avatar,
  borderSize,
  backgroundColor,
  borderColor,
  fontSize,
}: {
  avatar: Avatar;
  borderSize: string;
  backgroundColor: string;
  borderColor: string;
  fontSize: string;
}) {
  return (
    <>
      {avatar.empty ? (
        <Avatar
          variant={avatar.variant as "circular" | "rounded"}
          sx={{
            width: "100%",
            height: "100%",
            borderWidth: borderSize,
            borderStyle: "solid",
            borderColor: `${borderColor}`,
            backgroundColor: `${backgroundColor}`,
			      borderRadius: `${avatar.variant === "rounded" ? "15%" : "50%"}`,
          }}
        ></Avatar>
      ) : (
        <Avatar
          src={avatar.image}
          variant={avatar.variant as "circular" | "rounded"}
          sizes="cover"
          sx={{
            width: "100%",
            height: "100%",
            borderWidth: borderSize,
            borderStyle: "solid",
            borderColor: `${borderColor}`,
            backgroundColor: `${backgroundColor}`,
			      borderRadius: `${avatar.variant === "rounded" ? "15%" : "50%"}`,
            fontSize: fontSize,
          }}
        >
          {avatar.text}
        </Avatar>
      )}
    </>
  );
}
