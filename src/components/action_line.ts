import { TFile } from 'obsidian'
import { Difference } from '../data/difference'
import { replaceLine } from '../utils/string_utils'
import { ActionLineButton } from './action_line_button'
import { ActionLineDivider } from './action_line_divider'

type VoidCallback = () => void

export class ActionLine {
	constructor(args: {
		difference: Difference
		file1: TFile
		file2: TFile
		file1Content: string
		file2Content: string
		triggerRebuild: VoidCallback
	}) {
		this.difference = args.difference
		this.file1 = args.file1
		this.file2 = args.file2
		this.file1Content = args.file1Content
		this.file2Content = args.file2Content
		this.triggerRebuild = args.triggerRebuild
	}

	private difference: Difference

	private file1: TFile

	private file2: TFile

	private file1Content: string

	private file2Content: string

	private triggerRebuild: VoidCallback

	build(container: HTMLDivElement): void {
		const actionLine = container.createDiv({ cls: 'flex-row gap-2 py-2' })

		const hasPlusLines = this.difference.lines.some((l) =>
			l.startsWith('+')
		)
		const hasMinusLines = this.difference.lines.some((l) =>
			l.startsWith('-')
		)

		if (hasPlusLines && hasMinusLines) {
			new ActionLineButton({
				text: 'Accept Top',
				onClick: (e) => this.handleAcceptTopClick(e, this.difference),
			}).build(actionLine)
			ActionLineDivider.build(actionLine)
			new ActionLineButton({
				text: 'Accept Bottom',
				onClick: (e) =>
					this.handleAcceptBottomClick(e, this.difference),
			}).build(actionLine)
			ActionLineDivider.build(actionLine)
			new ActionLineButton({
				text: 'Accept All',
				onClick: (e) => this.handleAcceptAllClick(e, this.difference),
			}).build(actionLine)
		} else if (hasMinusLines) {
			new ActionLineButton({
				text: `Accept from ${this.file1.name}`,
				onClick: (e) => this.handleAcceptTopClick(e, this.difference),
			}).build(actionLine)
			ActionLineDivider.build(actionLine)
			new ActionLineButton({
				text: 'Discard',
				onClick: (e) => this.handleDiscardClick(e, this.difference),
			}).build(actionLine)
		} else if (hasPlusLines) {
			new ActionLineButton({
				text: `Accept from ${this.file2.name}`,
				onClick: (e) => this.handleAcceptTopClick(e, this.difference),
			}).build(actionLine)
			ActionLineDivider.build(actionLine)
			new ActionLineButton({
				text: 'Discard',
				onClick: (e) => this.handleDiscardClick(e, this.difference),
			}).build(actionLine)
		}
	}

	private async handleAcceptTopClick(
		event: MouseEvent,
		difference: Difference
	): Promise<void> {
		event.preventDefault()

		const changedLines = difference.lines
			.filter((line) => line.startsWith('-'))
			.map((line) => line.slice(1, line.length))
			.join('\n')
		const minusPlusLinesCount = difference.lines.findIndex(
			(line) => line.startsWith('-') || line.startsWith('+')
		)
		const newContent = replaceLine({
			fullText: this.file1Content,
			position: difference.start - 1 + minusPlusLinesCount,
			newLine: changedLines,
		})
		await app.vault.modify(this.file1, newContent)

		this.triggerRebuild()
	}

	private async handleAcceptBottomClick(
		event: MouseEvent,
		difference: Difference
	): Promise<void> {
		event.preventDefault()

		const changedLines = difference.lines
			.filter((line) => line.startsWith('+'))
			.map((line) => line.slice(1, line.length))
			.join('\n')
		const newContent = replaceLine({
			fullText: this.file1Content,
			position: difference.start - 1,
			newLine: changedLines,
		})
		await app.vault.modify(this.file1, newContent)

		this.triggerRebuild()
	}

	private async handleAcceptAllClick(
		event: MouseEvent,
		difference: Difference
	): Promise<void> {
		event.preventDefault()

		const changedLines = difference.lines
			.filter((line) => line.startsWith('-') || line.startsWith('+'))
			.map((line) => line.slice(1, line.length))
			.join('\n')

		const minusPlusLinesCount = difference.lines.findIndex(
			(line) => line.startsWith('-') || line.startsWith('+')
		)
		const newContent = replaceLine({
			fullText: this.file1Content,
			position: difference.start - 1 + minusPlusLinesCount,
			newLine: changedLines,
		})
		await app.vault.modify(this.file1, newContent)

		this.triggerRebuild()
	}

	async handleDiscardClick(
		event: MouseEvent,
		difference: Difference
	): Promise<void> {
		event.preventDefault()

		const minusPlusLinesCount = difference.lines.findIndex(
			(line) => line.startsWith('-') || line.startsWith('+')
		)
		const newContent = replaceLine({
			fullText: this.file1Content,
			position: difference.start - 1 + minusPlusLinesCount,
			newLine: '',
		})
		await app.vault.modify(this.file1, newContent)

		this.triggerRebuild()
	}
}
