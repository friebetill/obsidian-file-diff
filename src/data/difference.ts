export class Difference {
	constructor(args: {
		file1Start: number
		file2Start: number
		lines: string[]
	}) {
		this.file1Start = args.file1Start
		this.file2Start = args.file2Start
		this.lines = args.lines
	}

	public readonly file1Start: number

	public readonly file2Start: number

	public readonly lines: string[]

	hasChangesFromFile1(): boolean {
		return this.lines.some((l) => l.startsWith('-'))
	}
}
