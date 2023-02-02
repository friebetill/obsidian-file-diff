/** Method to replace line in a string */
export function replaceLine(args: {
	fullText: string
	position: number
	newLine: string
}): string {
	const lines = this.fullText.split('\n')
	lines[this.position] = this.newLine
	return lines.join('\n')
}

/** Returns an invisible character when the text is empty. */
export function preventEmptyString(text: string): string {
	return text != '' ? text : '‎'
}
