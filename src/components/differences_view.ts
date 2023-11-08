import { structuredPatch, diffWords } from 'diff';
import { ItemView, TFile, ViewStateResult, WorkspaceLeaf } from 'obsidian';
import { Difference } from '../data/difference';
import { FileDifferences } from '../data/file_differences';
import { preventEmptyString } from '../utils/string_utils';
import { ActionLine } from './action_line';
import { DeleteFileModal } from './modals/delete_file_modal';

export const VIEW_TYPE_DIFFERENCES = 'differences-view';

export interface ViewState {
	file1: TFile;
	file2: TFile;
	showMergeOption: boolean;
	continueCallback?: (shouldContinue: boolean) => Promise<void>;
}

export class DifferencesView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);

		this.registerEvent(
			this.app.vault.on('modify', async (file) => {
				if (file !== this.state.file1 && file !== this.state.file2) {
					return;
				}

				await this.updateState();
				this.build();
			})
		);
	}

	private state: ViewState;

	private file1Content: string;

	private file2Content: string;

	private fileDifferences: FileDifferences;

	private file1Lines: string[];

	private file2Lines: string[];

	private wasDeleteModalShown = false;

	override getViewType(): string {
		return VIEW_TYPE_DIFFERENCES;
	}

	override getDisplayText(): string {
		if (this.state?.file1 && this.state?.file2) {
			return (
				`File Diff: ${this.state.file1.name} ` +
				`and ${this.state.file2.name}`
			);
		}
		return `File Diff`;
	}

	override async setState(
		state: ViewState,
		result: ViewStateResult
	): Promise<void> {
		super.setState(state, result);
		this.state = state;

		await this.updateState();
		this.build();
	}

	async onunload(): Promise<void> {
		this.state.continueCallback?.(false);
	}

	private async updateState(): Promise<void> {
		if (this.state.file1 == null || this.state.file2 == null) {
			return;
		}

		this.file1Content = await this.app.vault.cachedRead(this.state.file1);
		this.file2Content = await this.app.vault.cachedRead(this.state.file2);

		this.file1Lines = this.file1Content
			// Add trailing new line as this removes edge cases
			.concat('\n')
			.split('\n')
			// Streamline empty spaces at the end as this remove edge cases
			.map((line) => line.trimEnd());

		this.file2Lines = this.file2Content
			// Add trailing new spaces as this removes edge cases
			.concat('\n')
			.split('\n')
			// Streamline empty lines at the end as this remove edge cases
			.map((line) => line.trimEnd());

		const parsedDiff = structuredPatch(
			this.state.file1.path,
			this.state.file2.path,
			this.file1Lines.join('\n'),
			this.file2Lines.join('\n')
		);
		this.fileDifferences = FileDifferences.fromParsedDiff(parsedDiff);

	}

	private build(): void {
		this.contentEl.empty();

		const container = this.contentEl.createDiv({
			cls: 'file-diff__container',
		});

		this.buildLines(container);

		this.scrollToFirstDifference();
		if (
			this.fileDifferences.differences.length === 0 &&
			this.state.showMergeOption &&
			!this.wasDeleteModalShown
		) {
			this.wasDeleteModalShown = true;
			this.showDeleteModal();
		}
	}

	private buildLines(container: HTMLDivElement): void {
		let lineCount1 = 0;
		let lineCount2 = 0;
		const maxLineCount = Math.max(this.file1Lines.length, this.file2Lines.length)
		while (lineCount1 <= maxLineCount || lineCount2 <= maxLineCount) {
			const difference = this.fileDifferences.differences.find(
				// eslint-disable-next-line no-loop-func
				(d) =>
					d.file1Start === lineCount1 && d.file2Start === lineCount2
			);

			if (difference != null) {
				const differenceContainer = container.createDiv({
					cls: 'difference',
				});
				this.buildDifferenceVisualizer(differenceContainer, difference);
				lineCount1 += difference.file1Lines.length;
				lineCount2 += difference.file2Lines.length;
			} else {
				const line =
					lineCount1 <= lineCount2
						? this.file1Lines[lineCount1]
						: this.file2Lines[lineCount2];
				container.createDiv({
					// Necessary to give the line a height when it's empty.
					text: preventEmptyString(line),
					cls: 'file-diff__line',
				});
				lineCount1 += 1;
				lineCount2 += 1;
			}
		}
	}

	private buildDifferenceVisualizer(
		container: HTMLDivElement,
		difference: Difference
	): void {
		if (this.state.showMergeOption) {
			new ActionLine({
				difference,
				file1: this.state.file1,
				file2: this.state.file2,
				file1Content: this.file1Content,
				file2Content: this.file2Content,
				triggerRebuild: async (): Promise<void> => {
					await this.updateState();
					this.build();
				},
			}).build(container);
		}

		// Draw top diff
		for (let i = 0; i < difference.file1Lines.length; i += 1) {
			const line1 = difference.file1Lines[i];
			const line2 = difference.file2Lines[i];

			const lineDiv = container.createDiv({ cls: 'file-diff__line file-diff__top-line__bg' });
			const diffSpans = this.buildDiffLine(line1, line2, 'file-diff_top-line__character');

			// Remove border radius if applicable
			if (i < difference.file1Lines.length - 1 || difference.file2Lines.length !== 0) {
				lineDiv.classList.add('file-diff__no-bottom-border');
			}
			if (i !== 0) {
				lineDiv.classList.add('file-diff__no-top-border');
			}

			lineDiv.appendChild(diffSpans);
		}

		// Draw bottom diff
		for (let i = 0; i < difference.file2Lines.length; i += 1) {
			const line1 = difference.file1Lines[i];
			const line2 = difference.file2Lines[i];

			const lineDiv = container.createDiv({ cls: 'file-diff__line file-diff__bottom-line__bg' });
			const diffSpans = this.buildDiffLine(line2, line1, 'file-diff_bottom-line__character');

			// Remove border radius if applicable
			if ((i == 0 && difference.file1Lines.length > 0) || i > 0) {
				lineDiv.classList.add('file-diff__no-top-border');
			}
			if (i < difference.file2Lines.length - 1) {
				lineDiv.classList.add('file-diff__no-bottom-border');
			}

			lineDiv.appendChild(diffSpans);
		}
	}

	private buildDiffLine(line1: string, line2: string, charClass: string) {
		const fragment = document.createElement('div');

		if (line1 != undefined && line1.length === 0) {
			fragment.textContent = preventEmptyString(line1);
		} else if (line1 != undefined && line2 != undefined) {
			const differences = diffWords(line2, line1);

			for (const difference of differences) {
				if (difference.removed) {
					continue;
				}

				const span = document.createElement('span');
				// Necessary to give the line a height when it's empty.
				span.textContent = preventEmptyString(difference.value);
				if (difference.added) {
					span.classList.add(charClass);
				}
				fragment.appendChild(span);
			}
		} else if(line1 != undefined && line2 == undefined) {
			const span = document.createElement('span');
			// Necessary to give the line a height when it's empty.
			span.textContent = preventEmptyString(line1);
			span.classList.add(charClass);
			fragment.appendChild(span);
		} else {
			fragment.textContent = preventEmptyString(line1);
		}

		return fragment;
	}

	private scrollToFirstDifference(): void {
		if (this.fileDifferences.differences.length === 0) {
			return;
		}

		const containerRect = this.contentEl
			.getElementsByClassName('file-diff__container')[0]
			.getBoundingClientRect();
		const elementRect = this.contentEl
			.getElementsByClassName('difference')[0]
			.getBoundingClientRect();
		this.contentEl.scrollTo({
			top: elementRect.top - containerRect.top - 100,
			behavior: 'smooth',
		});
	}

	async showDeleteModal(): Promise<void> {
		// Wait a moment to avoid appearing overly aggressive with the modal
		await sleep(200);

		return new Promise((resolve, reject) => {
			new DeleteFileModal({
				file1: this.state.file1,
				file2: this.state.file2,
				onDone: (e) => {
					if (e) {
						return reject(e);
					}
					this.state.continueCallback?.(true);
					this.leaf.detach();
					return resolve();
				},
			}).open();
		});
	}
}
