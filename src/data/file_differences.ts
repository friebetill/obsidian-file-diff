import { ParsedDiff } from "diff";
import { Difference } from "./difference";

/**
 * A class that contains the differences between two files.
 */
export class FileDifferences {
	constructor(
		public file1Name: string,
		public file2Name: string,
		public differences: Difference[]
	) {}

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
			for (let i = 0; i < hunk.lines.length; i++) {
				const line = hunk.lines[i];

				if (line.startsWith("+") || line.startsWith("-")) {
					let start = i;

					// Find the end of the contiguous lines
					let end = i;
					while (
						end < hunk.lines.length - 1 &&
						(hunk.lines[end + 1].startsWith("+") ||
							hunk.lines[end + 1].startsWith("-"))
					) {
						end++;
					}

					// Add the contiguous lines to the differences
					differences.push(
						new Difference(
							hunk.oldStart + start - 1,
							hunk.lines.slice(start, end + 1)
						)
					);
					i += end - start;
				}
			}
		});

		return new this(
			parsedDiff.oldFileName!,
			parsedDiff.newFileName!,
			differences
		);
	}
}
