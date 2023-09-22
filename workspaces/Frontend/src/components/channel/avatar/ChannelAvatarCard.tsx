"use client";
import AvatarProfile from "@/components/profile/avatar/Avatar";
import SettingsCard from "@/components/profile/avatar/SettingsCard";
import disconnect from "@/lib/disconnect/disconnect";
import Avatar_Service from "@/services/Avatar.service";
import styles from "@/styles/profile/AvatarCard.module.css";
import { useRouter } from "next/navigation";
import { CSSProperties, useState } from "react";
import { Color } from "react-color";
import { toast } from "react-toastify";

type Props = {
  channelAndUsersRelation: ChannelUsersRelation;
  myRelation: UserRelation;
  token: string;
};

export default function ChannelAvatarCard({
  channelAndUsersRelation,
  myRelation,
  token,
}: Props) {
  const [displaySettings, setDisplaySettings] = useState<boolean>(false);
  const [topColor, setTopColor] = useState<Color>(
    channelAndUsersRelation.channel.avatar.borderColor
  );
  const [botColor, setBotColor] = useState<Color>(
    channelAndUsersRelation.channel.avatar.backgroundColor
  );
  const [selectedArea, setSelectedArea] = useState<"border" | "background">(
    "border"
  );
  const router = useRouter();

  const avatarService = new Avatar_Service(token);

  const handleArea = (newArea: "border" | "background" | null) => {
    if (newArea) setSelectedArea(newArea);
  };

  const toogleDisplaySettings = () => {
    if (!myRelation.isChanOp && !myRelation.isBoss) return;
    if (displaySettings === true) cancelColorChange();
    setDisplaySettings(!displaySettings);
  };

  const saveColorChanges = async () => {
    if (!myRelation.isChanOp && !myRelation.isBoss) return;

    try {
      const rep = await avatarService.submitAvatarColors(
        topColor.toString(),
        botColor.toString(),
        channelAndUsersRelation.channel.id
      );

      if (!rep.success) throw new Error(rep.message);

      channelAndUsersRelation.channel.avatar.borderColor = topColor.toString();
      channelAndUsersRelation.channel.avatar.backgroundColor =
        botColor.toString();
    } catch (e: any) {
      if (e.message === "disconnect") {
        await disconnect();
        router.refresh();
        return;
      }
      toast.error("Something went wrong, please try again!");
    }
    setDisplaySettings(false);
  };

  const colorAddedStyle: CSSProperties = {
    background: `linear-gradient(to bottom, ${topColor.toString()} 60%, var(--primary1) 40%)`,
  };

  const previewChangeTopColor = (color: string) => {
    setTopColor(color);
  };

  const previewChangeBotColor = (color: string) => {
    setBotColor(color);
  };

  const cancelColorChange = () => {
    setTopColor(channelAndUsersRelation.channel.avatar.borderColor);
    setBotColor(channelAndUsersRelation.channel.avatar.backgroundColor);
  };

  return (
    <div className={styles.avatarFrame}>
      <div className={styles.avatarCard}>
        <div className={styles.rectangle} style={colorAddedStyle}>
          {/*   <div className={styles.top} style={colorAddedStyle}></div>
          <div className={styles.bot}></div> */}
          <AvatarProfile
            avatar={channelAndUsersRelation.channel.avatar}
            isOwner={myRelation.isChanOp || myRelation.isBoss}
            onClick={toogleDisplaySettings}
            displaySettings={displaySettings}
            previewBorder={topColor.toString()}
            previewBackground={botColor.toString()}
            uploadButton={false}
          />
        </div>
      </div>
      <h2 className={styles.login}>{channelAndUsersRelation.channel.name}</h2>
      {displaySettings && (
        <SettingsCard
          previewChangeTopColor={previewChangeTopColor}
          previewChangeBotColor={previewChangeBotColor}
          handleArea={handleArea}
          selectedArea={selectedArea}
          toogleDisplaySettings={toogleDisplaySettings}
          saveColorChanges={saveColorChanges}
        />
      )}
    </div>
  );
}
