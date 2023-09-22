"use client"

import styles from "@/styles/loading/Loading.module.css";
import LoadingComponent from "./Loading";

export default function LoadingSuspense() {
	return (
		<div className={styles.main}>
			<LoadingComponent />
			<h2>Loading...</h2>
		</div>
	);
}
