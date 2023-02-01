import { ParsedDiff } from "diff";
import { describe, expect, it } from "vitest";
import { FileDifferences } from "./file_differences";

describe("FileDifferences.fromParsedDiff", () => {
	it("should work with files containing one line", () => {
		const test = JSON.parse(
			'{"oldFileName":"Hallo.md","newFileName":"Test.md","hunks":[{"oldStart":1,"oldLines":1,"newStart":1,"newLines":1,"lines":["-a","+b"]}]}'
		) as ParsedDiff;

		const fileDifferences = FileDifferences.fromParsedDiff(test);

		expect(JSON.stringify(fileDifferences)).toBe(
			'{"file1Name":"Hallo.md","file2Name":"Test.md","differences":[{"start":0,"lines":["-a","+b"]}]}'
		);
	});
});
