export class Difference {
	constructor(args: {
		file1Start: number;
		file2Start: number;
		file1Lines: string[];
		file2Lines: string[];
	}) {
		this.file1Start = args.file1Start;
		this.file2Start = args.file2Start;
		this.file1Lines = args.file1Lines;
		this.file2Lines = args.file2Lines;
	}

	public readonly file1Start: number;

	public readonly file2Start: number;

	public readonly file1Lines: string[];

	public readonly file2Lines: string[];
}
