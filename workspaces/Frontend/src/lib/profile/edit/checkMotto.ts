

export function checkMotto(motto: string): string {
	if (/[;]/.test(motto))
		return "Please don't use semicolon into your motto";
	if (motto.length > 35)
		return "Your motto can't exceed 35 character long"

	return "";
}
