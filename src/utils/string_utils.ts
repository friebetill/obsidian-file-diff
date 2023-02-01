/** Method to replace line in a string */
export function replaceLine(
	text: string,
	lineNumber: number,
	contentToInsert: string
): string {
	const lines = text.split("\n");
	lines[lineNumber] = contentToInsert;
	return lines.join("\n");
}

/** Returns an invisible character when the text is empty. */
export function preventEmptyString(text: string): string {
	return text != "" ? text : "‎";
}
