"use client"

import styles from "@/styles/loading/Loading.module.css";

export default function LoadingComponent() {

	return (
		<span className={styles.spanCircular}>
			<svg className={styles.svgCircular} viewBox="22 22 44 44">
				<circle
					className={styles.circleCircular}
					cx="44"
					cy="44"
					r="20.2"
					fill="none"
					strokeWidth={3.6}
				>
				</circle>
			</svg>
		</span>
	);
}
