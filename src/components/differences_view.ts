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
		this.file1Lines = this.file1Content.split('\n')

		this.file2Content = await this.app.vault.read(this.file2)
		this.fileDifferences = FileDifferences.fromParsedDiff(
			structuredPatch(
				this.file1.path,
				this.file2.path,
				// Streamline empty lines at the end as this remove edge cases
				this.file1Content.trimEnd().concat('\n'),
				this.file2Content.trimEnd().concat('\n')
			)
		)

		// Find the highest line number we need to go through. This can be the
		// highest number in the differences, because the second file can have
		// more lines than the first file.
		this.lineCount = Math.max(
			this.file1Lines.length,
			...this.fileDifferences.differences.map((d) => d.file1Start)
		)
	}

	private build(): void {
		this.contentEl.empty()

		const container = this.contentEl.createDiv({ cls: 'container' })

		for (let i = 0; i <= this.lineCount; i += 1) {
			const line = i in this.file1Lines ? this.file1Lines[i] : null
			const difference = this.fileDifferences.differences.find(
				(d) => d.file1Start === i
			)

			if (difference != null) {
				const differenceContainer = container.createDiv({
					cls: 'difference',
				})
				this.buildDifferenceVisualizer(differenceContainer, difference)
			}
			if (
				line != null &&
				(difference == null || !difference.hasChangesFromFile1())
			) {
				container.createDiv({
					// Necessary to give the line a height when it's empty.
					text: preventEmptyString(line),
					cls: 'line',
				})
			}
		}

		if (this.fileDifferences.differences.length > 0) {
			const containerRect = this.contentEl
				.getElementsByClassName('container')[0]
				.getBoundingClientRect()
			const elementRect = this.contentEl
				.getElementsByClassName('difference')[0]
				.getBoundingClientRect()
			this.contentEl.scrollTo({
				top: elementRect.top - containerRect.top - 100,
				behavior: 'smooth',
			})
		}

		if (
			this.fileDifferences.differences.length === 0 &&
			this.showMergeOption &&
			!this.wasDeleteModalShown
		) {
			this.showDeleteModal()
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

		difference.lines.forEach((line) => {
			if (line.startsWith('+')) {
				container.createDiv({
					// Necessary to give the line a height when it's empty.
					text: preventEmptyString(line.slice(1, line.length)),
					cls: 'line bg-turquoise-light',
				})
			} else if (line.startsWith('-')) {
				container.createDiv({
					// Necessary to give the line a height when it's empty.
					text: preventEmptyString(line.slice(1, line.length)),
					cls: 'line bg-blue-light',
				})
			}
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
