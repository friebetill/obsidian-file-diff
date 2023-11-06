import { Plugin, TFile } from 'obsidian';

import {
	DifferencesView,
	VIEW_TYPE_DIFFERENCES,
	ViewState,
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
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile == null) {
					return;
				}

				const compareFile = await this.getFileToCompare(activeFile);
				if (compareFile == null) {
					return;
				}

				this.openDifferencesView({
					file1: activeFile,
					file2: compareFile,
					showMergeOption: false,
				});
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

				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile == null) {
					return;
				}

				const compareFile = await this.getFileToCompare(activeFile);
				if (compareFile == null) {
					return;
				}

				this.openDifferencesView({
					file1: activeFile,
					file2: compareFile,
					showMergeOption: true,
				});
			},
		});

		this.addCommand({
			id: 'find-sync-conflicts-and-merge',
			name: 'Find sync conflicts and merge',
			callback: async () => {
				// Show warning when this option is selected for the first time
				if (!localStorage.getItem(this.fileDiffMergeWarningKey)) {
					await this.showRiskyActionModal();
					if (!localStorage.getItem(this.fileDiffMergeWarningKey)) {
						return;
					}
				}

				const syncConflicts = this.findSyncConflicts();

				for await (const syncConflict of syncConflicts) {
					const continuePromise = new Promise<boolean>((resolve) => {
						this.openDifferencesView({
							file1: syncConflict.originalFile,
							file2: syncConflict.syncConflictFile,
							showMergeOption: true,
							continueCallback: async (shouldContinue: boolean) =>
								resolve(shouldContinue),
						});
					});

					const shouldContinue = await continuePromise;
					if (!shouldContinue) {
						break;
					}
				}
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

	async openDifferencesView(state: ViewState): Promise<void> {
		// Closes all leafs (views) of the type VIEW_TYPE_DIFFERENCES
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_DIFFERENCES);

		// Opens a new leaf (view) of the type VIEW_TYPE_DIFFERENCES
		const leaf = this.app.workspace.getLeaf(true);
		leaf.setViewState({
			type: VIEW_TYPE_DIFFERENCES,
			active: true,
			state,
		});
		this.app.workspace.revealLeaf(leaf);
	}

	findSyncConflicts(): { originalFile: TFile; syncConflictFile: TFile }[] {
		const syncConflicts: {
			originalFile: TFile;
			syncConflictFile: TFile;
		}[] = [];

		const files = app.vault.getMarkdownFiles();

		for (const file of files) {
			if (file.name.includes('sync-conflict')) {
				const originalFileName = file.name.replace(
					/\.sync-conflict-\d{8}-\d{6}-[A-Z0-9]+/,
					''
				);
				const originalFile = files.find(
					(f) => f.name === originalFileName
				);

				if (originalFile) {
					syncConflicts.push({
						originalFile,
						syncConflictFile: file,
					});
				}
			}
		}

		return syncConflicts;
	}
}
