import styles from "@/styles/profile/AvatarCard.module.css";

export default function EditButton() {
  return (
    <div className={styles.editButtonFrame}>
      <div className={styles.editButtonBox}>
        <h3>Edit</h3>
      </div>
    </div>
  );
}
