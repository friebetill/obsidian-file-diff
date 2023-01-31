// Method to replace line in a string
export function replaceLine(
	content: string,
	lineNumber: number,
	contentToInsert: string
) {
	const lines = content.split("\n");
	lines[lineNumber] = contentToInsert;
	return lines.join("\n");
}
