export class Difference {
	constructor(public start: number, public lines: string[]) {}

	hasChangesFromFile1(): boolean {
		return this.lines.some((l) => l.startsWith("-"));
	}
}
