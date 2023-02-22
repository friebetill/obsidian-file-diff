/* eslint-disable import/no-extraneous-dependencies */
import { ParsedDiff } from 'diff';
import { describe, expect, it } from 'vitest';
import { FileDifferences } from './file_differences';

describe('FileDifferences.fromParsedDiff', () => {
	it('should work with files containing one line', () => {
		const test = JSON.parse(`
{"oldFileName": "1", "newFileName": "2", "hunks": [
{"oldStart": 1, "oldLines": 1, "newStart": 1, "newLines": 1,
	"lines": ["-a","+b"]
}]}
`) as ParsedDiff;

		const fileDifferences = FileDifferences.fromParsedDiff(test);

		expect(JSON.stringify(fileDifferences)).toBe(
			'{"file1Name":"1","file2Name":"2",' +
				'"differences":[{"file1Start":0,"file2Start":0,' +
				'"file1Lines":["a"],"file2Lines":["b"]}]}'
		);
	});
});
