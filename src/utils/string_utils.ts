/** Method to replace line in a string */
export function replaceLine(args: {
	fullText: string
	newLine: string
	position: number
}): string {
	const lines = args.fullText.split('\n')
	lines[args.position] = args.newLine
	return lines.join('\n')
}

/** Returns an invisible character when the text is empty. */
export function preventEmptyString(text: string): string {
	return text !== '' ? text : '‎'
}
