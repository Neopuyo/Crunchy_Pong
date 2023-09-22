import { PongColors } from "../enums/PongColors.enum";

export default function chooseColorStatus(text: string): string {
	if (text === "connected")
		return PongColors.appleGreen;
	else if (text === "in game")
		return PongColors.mauve;
	else
		return "#edf0f0";
}
