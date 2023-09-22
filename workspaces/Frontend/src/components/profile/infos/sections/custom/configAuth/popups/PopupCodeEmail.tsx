import styles from "@/styles/profile/TfaComponent.module.css";
import { Dispatch, SetStateAction } from "react";

export default function PopupCodeEmail({ setCode }: {
	setCode: Dispatch<SetStateAction<string>>
}) {
	return (
		<div className={styles.popup1}>
			<p style={{marginTop: "20px"}}>
				Please enter the code you get by email to verify your identity:
			</p>
			<input
				type="text"
				name="code"
				maxLength={8}
				onChange={(e) => {
					setCode(e.target.value);
				}}
			/>
			<div className={styles.line}></div>
		</div>
	)
}
