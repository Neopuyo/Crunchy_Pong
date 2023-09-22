import { checkStory } from "@/lib/profile/edit/checkStory";
import styles from "@/styles/profile/InfoCard.module.css";
import { ChangeEvent, useState } from "react";
import { filterBadWords } from "@/lib/bad-words/filterBadWords";
import Profile_Service from "@/services/Profile.service";
import disconnect from "@/lib/disconnect/disconnect";
import { useRouter } from "next/navigation";

type Props = {
  profile: Profile;
};

export default function StoryEditable({ profile }: Props) {
  const profileService = new Profile_Service();

  const [editMode, setEditMode] = useState<boolean>(false);
  const [story, setStory] = useState<string>(
    profile.story === null ? "" : profile.story
  );
  const [editedStory, setEditedStory] = useState<string>(story);
  const [notif, setNotif] = useState<string>("");
  const [prof, setProf] = useState<Profile>(profile);
  const router = useRouter();

  const handleClickEdit = () => {
    setEditMode(true);
  };

  const handleEditedStoryChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setEditedStory(event.target.value);
  };

  const handleSubmitStory = async (e: any) => {
    e.preventDefault();

    const submitedStory = e.target.story.value;

    if (typeof submitedStory === "string") {
      if (submitedStory === story) {
        setEditMode(false);
        return;
      }

      const checkedStory = checkStory(submitedStory);
      setNotif(checkedStory);

      if (checkedStory.length == 0) {
        const rep: Rep = await profileService.editUser({
          story: submitedStory,
        });

        if (rep.success) {
          const updatedProfile = profile;
          updatedProfile.story = filterBadWords(submitedStory);

          setProf(updatedProfile);
          setStory(updatedProfile.story);
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

  const doesStoryhasLineBreaks = (story:string) => {
    const numberOfLineBreaks = (story.match(/\n/g) || []).length;
    return numberOfLineBreaks > 0;
  }

  return (
    <>
      <p className={styles.tinyTitle}>Crunchy story</p>

      {!editMode && story !== "" && (
        <div
          className={styles.story}
          onClick={handleClickEdit}
        >
          {doesStoryhasLineBreaks(story) && <textarea value={story} rows={6} readOnly />}
          {!doesStoryhasLineBreaks(story) && <p className={styles.storyOneLine}>{story}</p>}
        </div>
      )}

      {!editMode && story === "" && (
        <div onClick={handleClickEdit}>
          <p className={styles.story + " " + styles.placeholder}>
            {" "}
            set here your crunchy story{" "}
          </p>
        </div>
      )}

      {editMode && (
        <>
          <form onSubmit={handleSubmitStory}>
            <div className={styles.story}>
              <textarea
                name="story"
                value={editedStory}
                placeholder="set here your crunchy story"
                onChange={handleEditedStoryChange}
                autoFocus
                rows={6}
                maxLength={350}
                spellCheck="false"
                id="storyInput"
              />
            </div>
            <div className={styles.notif}>{notif}</div>
            <button className={styles.button_type1} type="submit">
              confirm changes
            </button>
          </form>
        </>
      )}
    </>
  );
}
