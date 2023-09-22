"use client";

import styles from "@/styles/profile/AvatarCard.module.css";
import AvatarUser from "../../avatarUser/AvatarUser";
import { Badge } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import { ChangeEvent, Dispatch, SetStateAction, useRef, useState } from "react";
import Avatar from "@mui/material/Avatar";
import { faCheck, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import fetchClientSide from "@/lib/fetch/fetchClientSide";
import { CryptoService } from "@/services/Crypto.service";
import disconnect from "@/lib/disconnect/disconnect";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import LoadingComponent from "@/components/loading/Loading";

type Props = {
  avatar: Avatar;
  isOwner: boolean;
  onClick: () => void;
  previewBorder: string;
  previewBackground: string;
  displaySettings: boolean;
  uploadButton: boolean;
  setuploadButton?: Dispatch<SetStateAction<boolean>>;
  avatarsList?: Avatar[];
  setAvatarsList?: Dispatch<SetStateAction<Avatar[]>>;
  setAvatarChosen?: Dispatch<SetStateAction<Avatar>>;
  cloudList?: ImageType[];
  setCloudList?: Dispatch<SetStateAction<ImageType[]>>;
  saveColorChanges?: (avatar: Avatar) => void;
};

const badgeStylePhoto = {
	"& .MuiBadge-badge": {
	  color: 'var(--tertiary1)',
	  backgroundColor: 'var(--primary1)',
	  border: "2px solid var(--accent1)",
    width: "20%",
    height: "20%",
	},
	"& .MuiBadge-badge:hover": {
    width: "23%",
    height: "23%",
    border: "2px solid var(--accent3)",
	},
}

const badgeStyleRight = {
	"& .MuiBadge-badge": {
	  color: 'var(--tertiary1)',
	  backgroundColor: 'var(--primary1)',
	  border: "2px solid var(--accent1)",
	  cursor: "pointer",
    width: "20%",
    height: "20%",
	},
	"& .MuiBadge-badge:hover": {
    width: "23%",
    height: "23%",
    border: "2px solid var(--accent3)",
	},
}

const badgeStyleLeft = {
	"& .MuiBadge-badge": {
		color: 'var(--tertiary1)',
		backgroundColor: 'var(--primary1)',
		border: "2px solid var(--accent1)",
		cursor: "pointer",
    width: "20%",
    height: "20%",
	},
	"& .MuiBadge-badge:hover": {
    width: "23%",
    height: "23%",
    border: "2px solid var(--accent3)",
	},
}

type FormInputs = {
	[key: string]: File | null;
};

const Crypto = new CryptoService();

export default function AvatarProfile({
  avatar,
  isOwner,
  onClick,
  previewBorder,
  previewBackground,
  displaySettings,
  uploadButton,
  setuploadButton,
  avatarsList,
  setAvatarsList,
  setAvatarChosen,
  cloudList,
  setCloudList,
  saveColorChanges,
}: Props) {

  const	avatarRef = useRef<HTMLDivElement | null>(null);
	const	fileInputRef = useRef<HTMLInputElement>(null);
	const	[imageSrc, setImageSrc] = useState<string>(avatar.image);
	const	[loading, setLoading] = useState<boolean>(false);
	const	[invisible, setInvisible] = useState<boolean>(true);
	const { handleSubmit, setValue } = useForm<FormInputs>();
  const router = useRouter();

  if (invisible && cloudList?.find(image => image.imageUrl === avatar.image))
    setInvisible(false);
  else if (!invisible && !cloudList?.find(image => image.imageUrl === avatar.image))
    setInvisible(true);

  const	handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
		const	reader = new FileReader();

		reader.onload = (onLoadEvent) => {
			if (onLoadEvent.target?.result) {
				setImageSrc(onLoadEvent.target.result as string);
        if (setuploadButton)
          setuploadButton(true);
      }
		}

		if (e.target.files) {
			reader.readAsDataURL(e.target.files[0]);
			setValue("file", e.target.files[0]);
		}
	}

  const	deleteImage = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    event.preventDefault();
		if (avatarRef.current && avatarRef.current.contains(event.target as Node)) {
			return ;
		}
		setValue('file', null);
		setImageSrc(avatar.image);
    if (setuploadButton)
      setuploadButton(false);
	}

  const	handleOnSubmit = async (data: FormInputs) => {

		if (!data.file)
			return ;
		
		setLoading(true);
		setValue('file', null);
		setImageSrc(avatar.image);
    if (setuploadButton)
      setuploadButton(false);

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
	
      // add new avatar to the list
      if (setAvatarsList && setAvatarChosen && setCloudList) {
        const newAvatar = {
            image: resJson.secure_url,
            variant: "circular",
            borderColor: previewBorder,
            backgroundColor: previewBackground,
            text: avatar.text,
            empty: false,
            isChannel: false,
            decrypt: true,
        };
        
        setAvatarsList(prev => [...prev, newAvatar]);
        setAvatarChosen(newAvatar);
        setCloudList(prev => [...prev, imageSaved]);
      }

			setLoading(false);
      if (setuploadButton)
        setuploadButton(false);
		}
		catch (error: any) {
      if (error.message === "disconnect") {
        await disconnect();
				router.refresh();
				return ;
			}
			if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
        console.log(error.message);
			toast.error("Oops, something went wrong, please try again!");
			setLoading(false);
		}
	}

  const deleteCloudImage = async (imageUrl: string) => {
		setLoading(true);

    try {
        const imageType = cloudList?.find(image => image.imageUrl === imageUrl);
        if (!imageType)
          throw new Error('no image found');

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
            imageId: imageType.id,
          }),
        })

        if (!res.ok)
          throw new Error('fetch failed');
      
        if (cloudList && setCloudList) {
          const	cloudListUpdates = cloudList.filter(
            image => image.id !== imageType.id,
          );
          setCloudList(cloudListUpdates);
        }

        if (avatarsList && setAvatarsList && setAvatarChosen) {
          const	avatarsListUpdates = avatarsList.filter(
            avatar => avatar.image !== imageType.imageUrl,
          );
          setAvatarsList(avatarsListUpdates);

          if (avatarsList.length > 0) {
            const currentAvatar = {...avatar};
            setAvatarChosen(avatarsList[0]);
            if (currentAvatar.image === imageType.imageUrl && saveColorChanges)
              saveColorChanges(avatarsList[0]);
          }
        }

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
      <div className={styles.avatar}>
        <div
          className={`${styles[avatar.variant]} 
          ${styles.disabled}`}
          style={{
            backgroundColor: previewBorder,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <LoadingComponent />
        </div>
      </div>
  );

  // normal, no change of settings
  if (!displaySettings)
    return (
      <div className={styles.avatar}>
        <div
          className={`${styles[avatar.variant]} 
          ${!isOwner || uploadButton ? styles.disabled : ""}`}
          onClick={onClick}
          style={{ backgroundColor: previewBorder }}
        >
            <AvatarUser
              avatar={avatar}
              borderSize="6px"
              backgroundColor={previewBackground}
              borderColor={previewBorder}
              fontSize="3rem"
            />
        </div>
      </div>
    );

  // changing settings for user or channel avatar
  else
  return (
    <div className={styles.avatar}>
      <div
        className={`${styles[avatar.variant]} 
        ${!isOwner || uploadButton ? styles.disabled : ""}`}
        style={{ backgroundColor: previewBorder }}
      >

        {/* user avatar settings, no cloud call */}
        {/* two badges, one for upload photon one for delete */}
        {
          !uploadButton && avatar.variant === "circular" &&
            <Badge badgeContent={
              <FontAwesomeIcon
                icon={faImage}
                className={styles.iconPhoto}
                />}
              sx={badgeStylePhoto}
              overlap="circular"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              className={styles.avatarUser}
              onClick={(event) => {
                if (avatarRef.current && avatarRef.current.contains(event.target as Node)) {
                  return ;
                }
                if (fileInputRef.current)
                  fileInputRef.current.click();
                event.stopPropagation();
                event.preventDefault();
              }}
            >
            <Badge badgeContent={
              <FontAwesomeIcon
                icon={faTrash}
                className={styles.iconPhoto}
                />}
              sx={badgeStylePhoto}
              overlap="circular"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              className={styles.avatarUser}
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                if (avatarRef.current && avatarRef.current.contains(event.target as Node)) {
                  return ;
                }
                deleteCloudImage(avatar.image);
              }}
              invisible={invisible}
            >
              <input
                type="file"
                name=""
                defaultValue=""
                id="fileImage"
                multiple={false}
                accept=".png, .jpg, .jpeg, .webp"
                hidden
                ref={fileInputRef}
                onChange={handleOnChange}
                onClick={(e) => e.stopPropagation()}
              />
              <div
                ref={avatarRef}
                onClick={onClick}
                className={styles.avatarUser}
              >
                <AvatarUser
                  avatar={avatar}
                  borderSize="6px"
                  backgroundColor={previewBackground}
                  borderColor={previewBorder}
                  fontSize="3rem"
                />
              </div>
            </Badge>
          </Badge>
        }

        {/* channel avatar */}
        {
          avatar.variant === "rounded" &&
          <AvatarUser
            avatar={avatar}
            borderSize="6px"
            backgroundColor={previewBackground}
            borderColor={previewBorder}
            fontSize="3rem"
          />
        }

        {/* user avatar, cloud called */}
        {
          uploadButton &&
          <Badge badgeContent={
            <FontAwesomeIcon
              icon={faCheck}
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
              event.stopPropagation();
              event.preventDefault();
              handleSubmit(handleOnSubmit)();
            }}
            className={styles.avatarUser}
          >
            <Badge badgeContent={
              <FontAwesomeIcon
                icon={faXmark}
              />} sx={badgeStyleLeft}
              overlap="circular"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              className={styles.avatarUser}
              onClick={deleteImage}
            >
            <div
              ref={avatarRef}
              onClick={onClick}
              className={styles.avatarUser}
            >
              <Avatar
                src={imageSrc}
                variant="circular"
                sizes="cover"
                sx={{
                  width: "100%",
                  height: "100%",
                  borderWidth: "6px",
                  borderStyle: "solid",
                  borderColor: previewBorder,
                  backgroundColor: previewBackground,
                  borderRadius: `${avatar.variant === "rounded" ? "15%" : "50%"}`,
                  fontSize: "3rem",
                }}
              >
                {avatar.text}
              </Avatar>
            </div>
          </Badge>
        </Badge>
        }
      </div>
    </div>
  );
}
