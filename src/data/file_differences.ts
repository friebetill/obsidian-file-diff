import { ParsedDiff } from 'diff';
import { Difference } from './difference';

/**
 * A class that contains the differences between two files.
 */
export class FileDifferences {
	private constructor(args: {
		file1Name?: string;
		file2Name?: string;
		differences: Difference[];
	}) {
		this.file1Name = args.file1Name;
		this.file2Name = args.file2Name;
		this.differences = args.differences;
	}

	public readonly file1Name?: string;

	public readonly file2Name?: string;

	public readonly differences: Difference[];

	/**
	 * Returns a FileDifferences object from the given ParsedDiff instance.
	 *
	 * Why create a new data structure if parsedDiff already exists?
	 *
	 * The FileDifferences class was created because there was a limitation in
	 * the existing ParsedDiff class from the diff library for my use case. The
	 * hunk object in the ParsedDiff class can contain multiple separated line
	 * differences, which is problematic because I wanted to display a separate
	 * action line for each contiguous change and thus allow for more precise
	 * selection of changes. Additionally, the user needs to be able to apply
	 * the changes one by one and so I have to keep a state where only one
	 * contiguous change but is applied. To solve this, I considered two
	 * options: removing the contiguous change directly in the hunk object or
	 * introducing a new data structure with a finer granularity. I ultimately
	 * chose the latter option as it seemed simpler.
	 */
	static fromParsedDiff(parsedDiff: ParsedDiff): FileDifferences {
		const differences: Difference[] = [];

		parsedDiff.hunks.forEach((hunk) => {
			let line1Count = 0;
			let line2Count = 0;
			for (let i = 0; i < hunk.lines.length; i += 1) {
				const line = hunk.lines[i];

				if (line.startsWith('+') || line.startsWith('-')) {
					const start = i;

					// Find the end of the contiguous lines
					let end = start;
					while (
						end < hunk.lines.length - 1 &&
						(hunk.lines[end + 1].startsWith('+') ||
							hunk.lines[end + 1].startsWith('-'))
					) {
						end += 1;
					}

					// Add the contiguous lines to the differences
					const file1Lines = hunk.lines
						.slice(start, end + 1)
						.filter((l) => l.startsWith('-'))
						.map((l) => l.slice(1));
					const file2Lines = hunk.lines
						.slice(start, end + 1)
						.filter((l) => l.startsWith('+'))
						.map((l) => l.slice(1));
					differences.push(
						new Difference({
							file1Start: hunk.oldStart + start - line2Count - 1,
							file2Start: hunk.newStart + start - line1Count - 1,
							file1Lines,
							file2Lines,
						})
					);

					line1Count += file1Lines.length;
					line2Count += file2Lines.length;
					i += end - start;
				}
			}
		});

		return new this({
			file1Name: parsedDiff.oldFileName,
			file2Name: parsedDiff.newFileName,
			differences,
		});
	}
}
