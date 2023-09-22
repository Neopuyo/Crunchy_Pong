import React, { ChangeEvent, Dispatch, SetStateAction, useRef, useState } from "react";
import styles from "@/styles/uploadImage/UploadButton.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { Avatar, Badge } from "@mui/material";
import { useForm } from "react-hook-form";
import fetchClientSide from "@/lib/fetch/fetchClientSide";
import { useRouter } from "next/navigation";
import disconnect from "@/lib/disconnect/disconnect";
import LoadingComponent from "../loading/Loading";

const badgeStyleRight = {
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

type FormInputs = {
	[key: string]: File | null;
};

export default function UploadButton({
	setAvatar,
	borderColor,
	backgroundColor,
	handleSelectAvatar,
	text,
}: {
	setAvatar: Dispatch<SetStateAction<ImageType[]>>;
	borderColor: string;
	backgroundColor: string;
	handleSelectAvatar: (key: string, avatar: Avatar) => void;
	text: string;
}) {

	const	[colorIcon, setColorIcon] = useState<string>('var(--tertiary1)');
  	const	[isFocused, setIsFocused] = useState<boolean>(false);
	const	[imageSrc, setImageSrc] = useState<string | undefined>(undefined);
	const	[loading, setLoading] = useState<boolean>(false);
	const	fileInputRef = useRef<HTMLInputElement>(null);
	const	formRef = useRef<HTMLDivElement>(null);
	const 	{ handleSubmit, setValue } = useForm<FormInputs>();
	const	avatarRef = useRef<HTMLDivElement | null>(null);
	const	router = useRouter();

	const handleFocusOn = () => {
		setIsFocused(true);
		setColorIcon('var(--accent1)');
	};

	const handleFocusOff = () => {
		setIsFocused(false);
		setColorIcon('var(--teritary1)');
	};

	const handleHover = () => {
		setIsFocused(true);
		setColorIcon('var(--accent1)');
	};

	const handleMouseLeave = () => {
		setIsFocused(false);
		setColorIcon('var(--teritary1)');
	};

	const	chooseImage = () => {
		if (fileInputRef.current)
			fileInputRef.current.click();
	}

	const	handleOnSubmit = async (data: FormInputs) => {

		if (!data.file)
			return ;
		
		setLoading(true);
		setValue('file', null);
		setImageSrc(undefined);

		try {
			if (!process.env.CLOUD_API_KEY || !process.env.CLOUD_SECRET || !process.env.CLOUD_FOLDER || !process.env.CLOUD_NAME)
				throw new Error('env var missing');
	
			const	getSignature = await fetchClientSide(`http://${process.env.HOST_IP}:3000/api/cloud`, {
				method: 'POST',
			});

			if (!getSignature.ok)
				throw new Error('no signature');
			
			const	{timestamp, signature} = await getSignature.json();

			if (!timestamp || !signature)
				throw new Error('no signature');

			const	formData = new FormData();
			formData.set('file', data.file);
			formData.append("api_key", process.env.CLOUD_API_KEY as string);
			formData.append("timestamp", timestamp.toString());
			formData.append('signature', signature);
			formData.append("eager", "c_pad,h_300,w_400|c_crop,h_200,w_260");
			formData.append("folder", process.env.CLOUD_FOLDER as string);

			const	res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/image/upload`, {
				method: "POST",
				body: formData,
			});

			if (!res.ok)
				throw new Error('fetch failed');
			
			const resJson = await res.json();

			// const	urlCrypted = await Crypto.encrypt(resJson.secure_url);
			// const	publicIdCrypted = await Crypto.encrypt(resJson.public_id);
			const	saveImage = await fetchClientSide(`http://${process.env.HOST_IP}:4000/api/users/addImage`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					imageUrl: resJson.secure_url,
					public_id: resJson.public_id,
				}),
			})

			if (!saveImage.ok)
				throw new Error('save image failed');

			const	imageSaved: ImageType = await saveImage.json();
			imageSaved.imageUrl = resJson.secure_url;
			imageSaved.publicId = resJson.public_id;
					
			setAvatar(prev => [...prev, imageSaved]);
			handleSelectAvatar(imageSaved.imageUrl, {
				image: imageSaved.imageUrl,
				variant: "circular",
				borderColor: borderColor,
				backgroundColor: backgroundColor,
				text: text,
				empty: false,
				isChannel: false,
				decrypt: true,
			});
			setLoading(false);
		}
		catch (error: any) {
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
				console.log(error.message);
			if (error.message === "disconnect") {
				await disconnect();
				router.refresh();
				return ;
			}
			toast.error("Oops, something went wrong, please try again!");
			setLoading(false);
		}
	}

	const	handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
		const	reader = new FileReader();

		reader.onload = (onLoadEvent) => {
			if (onLoadEvent.target?.result)
				setImageSrc(onLoadEvent.target.result as string);
		}

		if (e.target.files) {
			reader.readAsDataURL(e.target.files[0]);
			setValue("file", e.target.files[0]);
		}
	}

	const	deleteImage = (event: React.MouseEvent<HTMLSpanElement>) => {
		if (avatarRef.current && avatarRef.current.contains(event.target as Node)) {
			return ;
		}
		setValue('file', null);
		setImageSrc(undefined);
	}

	return (
		<div
			className={styles.form}
			onFocus={handleFocusOn}
			onBlur={handleFocusOff}
			onMouseEnter={handleHover}
			onMouseLeave={handleMouseLeave}
			onClick={chooseImage}
			ref={formRef}
		>
			{
				!imageSrc && !loading &&
				<div
					className={styles.upload}
					style={{border: isFocused ? "4px solid var(--accent3)" : "4px solid var(--accent1)"}}
				>
					<label htmlFor="fileImage" hidden></label>
					<input
						type="file"
						name=""
						defaultValue=""
						id="fileImage"
						multiple={false}
						accept=".png, .jpg, .jpeg, .webp"
						hidden
						title="choose a file"
						placeholder="choose a file"
						ref={fileInputRef}
						onChange={handleOnChange}
					/>
					<FontAwesomeIcon
						icon={faPlus}
						color={colorIcon}
					/>
				</div>
			}
			{
				imageSrc && !loading &&
				<Badge badgeContent={
					<FontAwesomeIcon
						icon={faCheck}
						className={styles.icon}
					/>} sx={badgeStyleRight}
					overlap="circular"
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					onClick={(event) => {
						if (avatarRef.current && avatarRef.current.contains(event.target as Node)) {
							return ;
						}
						handleSubmit(handleOnSubmit)();
					}}
				>
					<Badge badgeContent={
						<FontAwesomeIcon
							icon={faXmark}
							className={styles.icon}
						/>}
						overlap="circular"
						anchorOrigin={{
							vertical: 'top',
							horizontal: 'left',
						}}
						onClick={deleteImage}
					>
					
					<Avatar
						className={styles.avatar}
						key="uploadedAvatar"
						srcSet={imageSrc}
						alt="uploadedAvatar"
						variant="circular"
						sizes="cover"
						sx={{
							width: 'clamp(60px, 8vh, 150px)',
							height: 'clamp(60px, 8vh, 150px)',
							border: `4px solid ${borderColor}`,
							backgroundColor: {backgroundColor},
						}}
						ref={avatarRef}
					/>
					</Badge>
				</Badge>
			}

			{
				loading &&
				<div className={styles.avatar}>
					<LoadingComponent />
				</div>	
			}
		</div>
	);
}
