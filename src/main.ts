import { Plugin, TFile } from 'obsidian';

import { DifferencesView } from './components/differences_view';
import { RiskyActionModal } from './components/modals/risky_action_modal';
import { SelectFileModal } from './components/modals/select_file_modal';

export default class FileDiffPlugin extends Plugin {
	fileDiffMergeWarningKey = 'file-diff-merge-warning';

	onload(): void {
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
				const workspaceLeaf = this.app.workspace.getLeaf();
				await workspaceLeaf.open(
					new DifferencesView({
						leaf: workspaceLeaf,
						file1: activeFile,
						file2: compareFile,
						showMergeOption: false,
					})
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
				const workspaceLeaf = this.app.workspace.getMostRecentLeaf();
				if (workspaceLeaf != null) {
					await workspaceLeaf.open(
						new DifferencesView({
							leaf: workspaceLeaf,
							file1: activeFile,
							file2: compareFile,
							showMergeOption: true,
						})
					);
				}
			},
		});
	}

	getFileToCompare(activeFile: TFile): Promise<TFile | undefined> {
		const selectableFiles = this.app.vault.getFiles();
		selectableFiles.remove(activeFile);
		return this.showSelectOtherFileModal({ selectableFiles });
	}

	showSelectOtherFileModal(args: {
		selectableFiles: TFile[];
	}): Promise<TFile | undefined> {
		return new Promise((resolve, reject) => {
			new SelectFileModal({
				selectableFiles: args.selectableFiles,
				onChoose: (e, f) => (e ? reject(e) : resolve(f)),
			}).open();
		});
	}

	showRiskyActionModal(): Promise<void> {
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
