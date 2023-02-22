/* eslint-disable import/no-extraneous-dependencies */
import { describe, expect, it } from 'vitest';
import { replaceLine } from './string_utils';

describe('replaceLine', () => {
	it('should replace fullText with newLine at given position', () => {
		const fullText = 'line1\nline2\nline3';
		const newFullText = replaceLine({
			fullText,
			newLine: 'newLine2',
			position: 1,
			linesToReplace: 1,
		});
		expect(newFullText).toBe('line1\nnewLine2\nline3');
	});

	it('should replacing with mutliple lines correctly', () => {
		const fullText = 'line1\nline2\nline3';
		const newFullText = replaceLine({
			fullText,
			newLine: 'newLine2\nnewLine3',
			position: 1,
			linesToReplace: 1,
		});
		expect(newFullText).toBe('line1\nnewLine2\nnewLine3\nline3');
	});

	it('should remove line when new line is empty', () => {
		const fullText = 'line1\nline2\nline3';
		const newFullText = replaceLine({
			fullText,
			newLine: '',
			position: 1,
			linesToReplace: 1,
		});
		expect(newFullText).toBe('line1\nline3');
	});

	it('should replace two lines', () => {
		const fullText = 'line1\nline2\nline3\nline4';
		const newFullText = replaceLine({
			fullText,
			newLine: 'line5',
			position: 1,
			linesToReplace: 2,
		});
		expect(newFullText).toBe('line1\nline5\nline4');
	});
});
