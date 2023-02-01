import { ParsedDiff } from "diff";
import { Difference } from "./difference";

export class FileDifferences {
	constructor(args: {
		file1Name: string;
		file2Name: string;
		differences: Difference[];
	}) {
		this.file1Name = args.file1Name;
		this.file2Name = args.file2Name;
		this.differences = args.differences;
	}

	static fromParsedDiff(parsedDiff: ParsedDiff): FileDifferences {
		const differences: Difference[] = [];
		console.log(JSON.stringify(parsedDiff));

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
					differences.push({
						start: hunk.oldStart + start - 1,
						lines: hunk.lines.slice(start, end + 1),
					});
					i += end - start;
				}
			}
		});

		return new this({
			file1Name: parsedDiff.oldFileName!,
			file2Name: parsedDiff.newFileName!,
			differences: differences,
		});
	}

	file1Name: string;
	file2Name: string;
	differences: Difference[];
}
