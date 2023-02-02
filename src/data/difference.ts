export class Difference {
	constructor(args: { start: number; lines: string[] }) {
		this.start = args.start
		this.lines = args.lines
	}

	public readonly start: number

	public readonly lines: string[]

	hasChangesFromFile1(): boolean {
		return this.lines.some((l) => l.startsWith('-'))
	}
}
