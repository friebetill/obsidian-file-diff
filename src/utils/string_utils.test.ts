import { describe, expect, it } from 'vitest'
import { replaceLine } from './string_utils'

describe('replaceLine', () => {
	it('should replace the line at the given line number with the new content', () => {
		const content = 'line1\nline2\nline3'
		const newContent = replaceLine({
			fullText: content,
			position: 1,
			newLine: 'newLine2',
		})
		expect(newContent).toBe('line1\nnewLine2\nline3')
	})

	it('should replace the line at the given line number with multiple lines', () => {
		const content = 'line1\nline2\nline3'
		const newContent = replaceLine({
			fullText: content,
			position: 1,
			newLine: 'newLine2\nnewLine3',
		})
		expect(newContent).toBe('line1\nnewLine2\nnewLine3\nline3')
	})
})
