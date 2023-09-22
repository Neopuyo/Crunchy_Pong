import styles from "@/styles/profile/InfoCard.module.css";

type Props = {
  type: ChannelType;
};

export default function ResumeChannel({type}:Props) {

  const capitalizeFirstLetter = (word:string) => {
    if (word.length === 0)
      return word;
    return word[0].toUpperCase() + word.slice(1);
  }

  switch (type) {
    case "public":
    case "private":
    case "protected":
      return (
        <>
          <div className={`${styles.button} ${styles.displayingOnly}`}>{capitalizeFirstLetter(type)}</div>
        </>);

    default:
        return (<></>);
  }
}
