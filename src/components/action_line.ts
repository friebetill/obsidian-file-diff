import { TFile } from 'obsidian'
import { Difference } from '../data/difference'
import { deleteLines, replaceLine } from '../utils/string_utils'
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
				onClick: (e) => this.acceptTopClick(e, this.difference),
			}).build(actionLine)
			ActionLineDivider.build(actionLine)
			new ActionLineButton({
				text: 'Accept Bottom',
				onClick: (e) => this.acceptBottomClick(e, this.difference),
			}).build(actionLine)
			ActionLineDivider.build(actionLine)
			new ActionLineButton({
				text: 'Accept All',
				onClick: (e) => this.acceptAllClick(e, this.difference),
			}).build(actionLine)
		} else if (hasMinusLines) {
			new ActionLineButton({
				text: `Accept from ${this.file1.name}`,
				onClick: (e) => this.acceptTopClick(e, this.difference),
			}).build(actionLine)
			ActionLineDivider.build(actionLine)
			new ActionLineButton({
				text: 'Discard',
				onClick: (e) => this.discardFile1Difference(e, this.difference),
			}).build(actionLine)
		} else if (hasPlusLines) {
			new ActionLineButton({
				text: `Accept from ${this.file2.name}`,
				onClick: (e) => this.acceptTopClick(e, this.difference),
			}).build(actionLine)
			ActionLineDivider.build(actionLine)
			new ActionLineButton({
				text: 'Discard',
				onClick: (e) => this.discardFile2Difference(e, this.difference),
			}).build(actionLine)
		}
	}

	private async acceptTopClick(
		event: MouseEvent,
		difference: Difference
	): Promise<void> {
		event.preventDefault()

		const changedLines = difference.lines
			.filter((line) => line.startsWith('-'))
			.map((line) => line.slice(1, line.length))
			.join('\n')
		const newContent = replaceLine({
			fullText: this.file2Content,
			newLine: changedLines,
			position: difference.file2Start,
		})
		await app.vault.modify(this.file2, newContent)

		this.triggerRebuild()
	}

	private async acceptBottomClick(
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
			newLine: changedLines,
			position: difference.file1Start,
		})
		await app.vault.modify(this.file1, newContent)

		this.triggerRebuild()
	}

	private async acceptAllClick(
		event: MouseEvent,
		difference: Difference
	): Promise<void> {
		event.preventDefault()

		const changedLines = difference.lines
			.filter((line) => line.startsWith('-') || line.startsWith('+'))
			.map((line) => line.slice(1, line.length))
			.join('\n')

		const newFile1Content = replaceLine({
			fullText: this.file1Content,
			newLine: changedLines,
			position: difference.file1Start,
		})
		await app.vault.modify(this.file1, newFile1Content)

		const newFile2Content = replaceLine({
			fullText: this.file2Content,
			newLine: changedLines,
			position: difference.file2Start,
		})
		await app.vault.modify(this.file2, newFile2Content)

		this.triggerRebuild()
	}

	async discardFile1Difference(
		event: MouseEvent,
		difference: Difference
	): Promise<void> {
		event.preventDefault()

		const newContent = deleteLines({
			fullText: this.file1Content,
			position: difference.file1Start,
			count: difference.lines.length,
		})
		await app.vault.modify(this.file1, newContent)

		this.triggerRebuild()
	}

	async discardFile2Difference(
		event: MouseEvent,
		difference: Difference
	): Promise<void> {
		event.preventDefault()

		const newContent = deleteLines({
			fullText: this.file2Content,
			position: difference.file2Start,
			count: difference.lines.length,
		})
		await app.vault.modify(this.file2, newContent)

		this.triggerRebuild()
	}
}