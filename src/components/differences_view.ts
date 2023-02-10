import { structuredPatch } from 'diff'
import { ItemView, TFile, WorkspaceLeaf } from 'obsidian'
import { delay } from 'src/utils/delay'
import { Difference } from '../data/difference'
import { FileDifferences } from '../data/file_differences'
import { preventEmptyString } from '../utils/string_utils'
import { ActionLine } from './action_line'
import { DeleteFileModal } from './modals/delete_file_modal'

export const VIEW_TYPE_PATCH = 'patch-view'

export class DifferencesView extends ItemView {
	constructor(args: {
		leaf: WorkspaceLeaf
		file1: TFile
		file2: TFile
		showMergeOption: boolean
	}) {
		super(args.leaf)
		this.file1 = args.file1
		this.file2 = args.file2
		this.showMergeOption = args.showMergeOption
	}

	private file1: TFile

	private file2: TFile

	private file1Content: string

	private file2Content: string

	private showMergeOption: boolean

	private fileDifferences: FileDifferences

	private file1Lines: string[]

	private file2Lines: string[]

	private lineCount: number

	private wasDeleteModalShown = false

	getViewType(): string {
		return VIEW_TYPE_PATCH
	}

	getDisplayText(): string {
		return `Difference between ${this.file1.name} and ${this.file2.name}`
	}

	async onOpen(): Promise<void> {
		await this.updateState()
		this.build()
	}

	private async updateState(): Promise<void> {
		// TODO(tillf): Find way to refresh state when one of the files changes

		this.file1Content = await this.app.vault.read(this.file1)
		this.file2Content = await this.app.vault.read(this.file2)

		const parsedDiff = structuredPatch(
			this.file1.path,
			this.file2.path,
			// Streamline empty lines at the end as this remove edge cases
			this.file1Content.trimEnd().concat('\n'),
			this.file2Content.trimEnd().concat('\n')
		)
		this.fileDifferences = FileDifferences.fromParsedDiff(parsedDiff)

		this.file1Lines = this.file1Content.split('\n')
		this.file2Lines = this.file2Content.split('\n')

		this.lineCount = Math.max(
			this.file1Lines.length,
			this.file2Lines.length
		)
	}

	private build(): void {
		this.contentEl.empty()

		const container = this.contentEl.createDiv({
			cls: 'file-diff__container',
		})

		this.buildLines(container)

		this.scrollToFirstDifference()
		if (
			this.fileDifferences.differences.length === 0 &&
			this.showMergeOption &&
			!this.wasDeleteModalShown
		) {
			this.showDeleteModal()
		}
	}

	private buildLines(container: HTMLDivElement): void {
		let i = 0
		while (i <= this.lineCount) {
			const line =
				i in this.file1Lines ? this.file1Lines[i] : this.file2Lines[i]

			const difference = this.fileDifferences.differences.find(
				// eslint-disable-next-line no-loop-func
				(d) => d.file1Start === i
			)

			if (difference != null) {
				const differenceContainer = container.createDiv({
					cls: 'difference',
				})
				this.buildDifferenceVisualizer(differenceContainer, difference)
				i += Math.max(difference.file1Lines.length, 1)
			} else {
				container.createDiv({
					// Necessary to give the line a height when it's empty.
					text: preventEmptyString(line),
					cls: 'file-diff__line',
				})
				i += 1
			}
		}
	}

	private buildDifferenceVisualizer(
		container: HTMLDivElement,
		difference: Difference
	): void {
		const triggerRebuild = async (): Promise<void> => {
			await this.updateState()
			this.build()
		}

		if (this.showMergeOption) {
			new ActionLine({
				difference,
				file1: this.file1,
				file2: this.file2,
				file1Content: this.file1Content,
				file2Content: this.file2Content,
				triggerRebuild,
			}).build(container)
		}

		for (let i = 0; i < difference.file1Lines.length; i += 1) {
			const line = difference.file1Lines[i]
			container.createDiv({
				// Necessary to give the line a height when it's empty.
				text: preventEmptyString(line),
				cls: 'file-diff__line file-diff__top-line__bg',
			})
		}

		for (let i = 0; i < difference.file2Lines.length; i += 1) {
			const line = difference.file2Lines[i]
			container.createDiv({
				// Necessary to give the line a height when it's empty.
				text: preventEmptyString(line),
				cls: 'file-diff__line file-diff__bottom-line__bg',
			})
		}
	}

	private scrollToFirstDifference(): void {
		if (this.fileDifferences.differences.length === 0) {
			return
		}

		const containerRect = this.contentEl
			.getElementsByClassName('file-diff__container')[0]
			.getBoundingClientRect()
		const elementRect = this.contentEl
			.getElementsByClassName('difference')[0]
			.getBoundingClientRect()
		this.contentEl.scrollTo({
			top: elementRect.top - containerRect.top - 100,
			behavior: 'smooth',
		})
	}

	async showDeleteModal(): Promise<void> {
		// Wait a moment to avoid appearing overly aggressive with the modal
		await delay(200)

		return new Promise((resolve, reject) => {
			new DeleteFileModal({
				file1: this.file1,
				file2: this.file2,
				onDone: (e) => (e ? reject(e) : resolve()),
			}).open()
		})
	}
}
