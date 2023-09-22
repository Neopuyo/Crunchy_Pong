import styles from "@/styles/profile/InfoCard.module.css";
import { ChangeEvent, useState } from "react";
import { checkMotto } from "@/lib/profile/edit/checkMotto";
import { filterBadWords } from "@/lib/bad-words/filterBadWords";
import Profile_Service from "@/services/Profile.service";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";

type Props = {
  profile: Profile;
};

export default function MottoEditable({ profile }: Props) {
  const profileService = new Profile_Service();
  const router = useRouter();

  const [editMode, setEditMode] = useState<boolean>(false);
  const [motto, setMotto] = useState<string>(
    profile.motto === null ? "" : profile.motto
  );
  const [editedMotto, setEditedMotto] = useState<string>(motto);
  const [notif, setNotif] = useState<string>("");

  const handleClickEdit = () => {
    setEditMode(true);
  };

  const handleEditedMottoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEditedMotto(event.target.value);
  };

  const handleSubmitMotto = async (e: any) => {
    e.preventDefault();
    const submitedMotto = e.target.motto.value;

    if (typeof submitedMotto === "string") {
      if (submitedMotto === motto) {
        setEditMode(false);
        return;
      }

      const checkedMotto = checkMotto(submitedMotto);
      setNotif(checkedMotto);

      if (checkedMotto.length === 0) {

        const rep:Rep = await profileService.editUser({
          motto: submitedMotto,
        });

        if (rep.success) {
          const updatedProfile = profile;
          updatedProfile.motto = filterBadWords(submitedMotto);

          setMotto(updatedProfile.motto);
          setEditMode(false);
        } else {
          if (rep.message === 'disconnect') {
            await disconnect();
            router.refresh();
            return ;
          }
          setNotif(rep.message);
          setEditMode(false);
        }
      }
    }
  };

  if (!editMode && motto === "") {
    return (
      <>
        {<p className={styles.tinyTitle}>Crunchy motto</p>}
        <div onClick={handleClickEdit}>
          <p className={styles.motto + " " + styles.placeholder}>
            {" "}
            set here your crunchy motto{" "}
          </p>
        </div>
      </>
    );
  } else if (!editMode && motto !== "") {
    return (
      <>
        {<p className={styles.tinyTitle}>Crunchy motto</p>}
        <div onClick={handleClickEdit}>
          <p className={styles.motto}> {motto} </p>
        </div>
      </>
    );
  } else {
    return (
      <>
        {<p className={styles.tinyTitle}>Crunchy motto</p>}
        <form onSubmit={handleSubmitMotto}>
          <p className={styles.motto}>
            {" "}
            <input
              type="text"
              name="motto"
              value={editedMotto}
              placeholder="set here your crunchy motto"
              onChange={handleEditedMottoChange}
              autoFocus
              id="mottoInput"
            />
          </p>
          <div className={styles.notif}>{notif}</div>

          <button className={styles.button_type1} type="submit">
            confirm changes
          </button>
        </form>
      </>
    );
  }
}
