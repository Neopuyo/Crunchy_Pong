import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Badge } from "@mui/material";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import styles from "@/styles/uploadImage/UploadButton.module.css";
import stylesAvatar from "@/styles/createLogin/ChooseAvatar.module.css";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";
import fetchClientSide from "@/lib/fetch/fetchClientSide";
import { toast } from "react-toastify";
import LoadingComponent from "../loading/Loading";

const badgeStyle = {
	"& .MuiBadge-badge": {
	  color: 'var(--tertiary1)',
	  backgroundColor: 'var(--primary1)',
	  border: "2px solid var(--accent1)",
	  cursor: "pointer",
	  width: "30%",
	  height: "30%",
	  top: "1px",
	  borderRadius: "100%",
	}
}

export default function AvatarCloud({
	imageType,
	selectedAvatar,
	text,
	handleSelectAvatar,
	colorBorder,
	backgroundColor,
	avatarsAdded,
	setAvatarsAdded,
}: {
	imageType: ImageType;
	selectedAvatar: string;
	text: string;
	handleSelectAvatar: (key: string, avatar: Avatar) => void;
	colorBorder: string;
	backgroundColor: string;
	avatarsAdded: ImageType[];
	setAvatarsAdded: Dispatch<SetStateAction<ImageType[]>>;
}) {

	const	avatarRef = useRef<HTMLDivElement | null>(null);
	const	[loading, setLoading] = useState<boolean>(false);
	const	router = useRouter();

	const deleteImageCloud = async (image: ImageType) => {
		setLoading(true);

		handleSelectAvatar("empty", {
			image: "",
			variant: "circular",
			borderColor: colorBorder,
			backgroundColor: backgroundColor,
			text: text,
			empty: true,
			isChannel: false,
			decrypt: false,
		});

	  	try {

			if (!process.env.CLOUD_API_KEY || !process.env.CLOUD_SECRET || !process.env.CLOUD_FOLDER || !process.env.CLOUD_NAME)
				throw new Error('env var missing');
	
			const	getSignature = await fetchClientSide(`http://${process.env.HOST_IP}:3000/api/cloud`, {
				method: 'POST',
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					publicId: imageType.publicId,
				}),
			});

			if (!getSignature.ok)
				throw new Error('no signature');
			
			const	{timestamp, signature} = await getSignature.json();

			if (!timestamp || !signature)
				throw new Error('no signature');

			//delete image from cloud
			const	formData = new FormData();
			formData.set('public_id', imageType.publicId);
			formData.append("api_key", process.env.CLOUD_API_KEY as string);
			formData.append("timestamp", timestamp.toString());
			formData.append('signature', signature);

			const	resCloud = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/image/destroy`, {
				method: "POST",
				body: formData,
			});

			if (!resCloud.ok)
				throw new Error('fetch failed');
			
			const resJson = await resCloud.json();
			
			if (!resJson.result || resJson.result !== 'ok')
				throw new Error('cloud result not ok');

			// delete image from db
			const	res = await fetchClientSide(`http://${process.env.HOST_IP}:4000/api/users/deleteImage`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					imageId: image.id,
				}),
			})

			if (!res.ok)
				throw new Error('fetch failed');
		
			const	avatarsAddedUpdated = avatarsAdded.filter(
				imageType => imageType.id !== image.id,
			);

			setAvatarsAdded(avatarsAddedUpdated);
			setLoading(false);

		}
		catch (err: any) {
			if (err.message === "disconnect") {
				await disconnect();
				router.refresh();
				return ;
			}
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
				console.log(err.message);
			toast.error("Oops, something went wrong, please try again!");
			setLoading(false);
		}
	}

	if (loading)
		return (
			<div className={styles.loading}>
				<LoadingComponent />
			</div>
		);

	return (
		<Badge badgeContent={
		  <FontAwesomeIcon
			icon={faTrash}
			className={styles.icon}
		  />} sx={badgeStyle}
		  overlap="circular"
		  anchorOrigin={{
			vertical: 'top',
			horizontal: 'right',
		  }}
		  onClick={(event) => {
			if (avatarRef.current && avatarRef.current.contains(event.target as Node)) {
				return ;
			}
			deleteImageCloud(imageType);
		  }}
		>
		  <Avatar
			className={`${styles.avatar} ${
				imageType.imageUrl === selectedAvatar ? stylesAvatar.selected : ""
			}`}
			src={imageType.imageUrl}
			alt={text}
			variant="circular"
			ref={avatarRef}
			onClick={() =>
			  handleSelectAvatar(imageType.imageUrl, {
				image: imageType.imageUrl,
				variant: "circular",
				borderColor: colorBorder,
				backgroundColor: backgroundColor,
				text: text,
				empty: false,
				isChannel: false,
				decrypt: true,
			  })
			}
			sx={{
				width: 'clamp(60px, 8vh, 150px)',
				height: 'clamp(60px, 8vh, 150px)',
				border: `4px solid ${colorBorder}`,
				backgroundColor: `${backgroundColor}`,
			}}
		  />
		</Badge>
	  );
}
