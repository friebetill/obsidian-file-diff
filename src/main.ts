import { Plugin, TFile } from 'obsidian';

import {
	DifferencesView,
	VIEW_TYPE_DIFFERENCES,
} from './components/differences_view';
import { RiskyActionModal } from './components/modals/risky_action_modal';
import { SelectFileModal } from './components/modals/select_file_modal';

export default class FileDiffPlugin extends Plugin {
	fileDiffMergeWarningKey = 'file-diff-merge-warning';

	override onload(): void {
		this.registerView(
			VIEW_TYPE_DIFFERENCES,
			(leaf) => new DifferencesView(leaf)
		);

		this.addCommand({
			id: 'compare',
			name: 'Compare',
			editorCallback: async () => {
				// Get current active file
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile == null) {
					return;
				}

				// Get file to compare
				const compareFile = await this.getFileToCompare(activeFile);
				if (compareFile == null) {
					return;
				}

				// Open differences view
				this.app.workspace.detachLeavesOfType(VIEW_TYPE_DIFFERENCES);

				await this.app.workspace.getLeaf(true).setViewState({
					type: VIEW_TYPE_DIFFERENCES,
					active: true,
					state: {
						file1: activeFile,
						file2: compareFile,
						showMergeOption: false,
					},
				});

				this.app.workspace.revealLeaf(
					this.app.workspace.getLeavesOfType(VIEW_TYPE_DIFFERENCES)[0]
				);
			},
		});

		this.addCommand({
			id: 'compare-and-merge',
			name: 'Compare and merge',
			editorCallback: async () => {
				// Show warning when this option is selected for the first time
				if (!localStorage.getItem(this.fileDiffMergeWarningKey)) {
					await this.showRiskyActionModal();
					if (!localStorage.getItem(this.fileDiffMergeWarningKey)) {
						return;
					}
				}

				// Get current active file
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile == null) {
					return;
				}

				// Get file to compare
				const compareFile = await this.getFileToCompare(activeFile);
				if (compareFile == null) {
					return;
				}

				// Open differences view
				this.app.workspace.detachLeavesOfType(VIEW_TYPE_DIFFERENCES);

				await this.app.workspace.getLeaf(true).setViewState({
					type: VIEW_TYPE_DIFFERENCES,
					active: true,
					state: {
						file1: activeFile,
						file2: compareFile,
						showMergeOption: true,
					},
				});

				this.app.workspace.revealLeaf(
					this.app.workspace.getLeavesOfType(VIEW_TYPE_DIFFERENCES)[0]
				);
			},
		});
	}

	override async onunload(): Promise<void> {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_DIFFERENCES);
	}

	private getFileToCompare(activeFile: TFile): Promise<TFile | undefined> {
		const selectableFiles = this.app.vault.getFiles();
		selectableFiles.remove(activeFile);
		return this.showSelectOtherFileModal({ selectableFiles });
	}

	private showSelectOtherFileModal(args: {
		selectableFiles: TFile[];
	}): Promise<TFile | undefined> {
		return new Promise((resolve, reject) => {
			new SelectFileModal({
				selectableFiles: args.selectableFiles,
				onChoose: (e, f) => (e ? reject(e) : resolve(f)),
			}).open();
		});
	}

	private showRiskyActionModal(): Promise<void> {
		return new Promise((resolve, reject) => {
			new RiskyActionModal({
				onAccept: async (e: Error | null) => {
					if (e) {
						reject(e);
					} else {
						localStorage.setItem(
							this.fileDiffMergeWarningKey,
							'true'
						);
						// Wait for the set item dispatch event to be processed
						await sleep(50);

						resolve();
					}
				},
			}).open();
		});
	}
}
