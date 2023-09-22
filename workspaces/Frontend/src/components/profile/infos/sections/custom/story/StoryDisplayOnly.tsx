import styles from "@/styles/profile/InfoCard.module.css";

type Props = {
  profile: Profile;
};

export default function StoryDisplayOnly({ profile }: Props) {
  const rowMax = 6;
  const numberOfLineBreaks = profile.story ? (profile.story.match(/\n/g) || []).length : 0;

  return (
    <>
      {profile.story !== "" && <p className={styles.tinyTitle}>Crunchy story</p>}
      {profile.story !== "" && (
        <div className={styles.story}>
          {numberOfLineBreaks > 0 && <textarea value={profile.story} rows={rowMax} readOnly />}
          {numberOfLineBreaks === 0 && <p className={styles.storyOneLine}>{profile.story}</p>}
        </div>
      )}
    </>
  );
}
