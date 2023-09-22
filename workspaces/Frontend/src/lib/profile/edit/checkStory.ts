export function checkStory(story: string): string {
	if (/[;]/.test(story))
		return "Please don't use semicolon into your story";
	if (story.length > 350)
		return "Your story can't exceed 350 character long"

	return "";
}