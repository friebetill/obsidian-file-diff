/** Method to replace line in a string */
export function replaceLine(args: {
	fullText: string
	newLine: string
	position: number
}): string {
	const lines = args.fullText.split('\n')

	if (args.newLine.length === 0) {
		lines.splice(args.position, 1)
	} else {
		lines[args.position] = args.newLine
	}

	return lines.join('\n')
}

/** Returns an invisible character when the text is empty. */
export function preventEmptyString(text: string): string {
	return text !== '' ? text : '‎'
}
