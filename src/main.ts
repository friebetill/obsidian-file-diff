import { Plugin, TFile } from 'obsidian'

import { DifferencesView } from './components/differences_view'
import { SelectFileModal } from './components/modals/select_file_modal'

export default class FileDiffPlugin extends Plugin {
	onload(): void {
		this.addCommand({
			id: 'file-diff',
			name: 'Compare',
			editorCallback: async () => {
				// Get current active file
				const activeFile = this.app.workspace.getActiveFile()
				if (activeFile == null) {
					return
				}

				// Get file to compare
				const compareFile = await this.getFileToCompare(activeFile)
				if (compareFile == null) {
					return
				}

				// Open differences view
				const workspaceLeaf = this.app.workspace.getLeaf()
				await workspaceLeaf.open(
					new DifferencesView({
						leaf: workspaceLeaf,
						file1: activeFile,
						file2: compareFile,
						showMergeOption: false,
					})
				)
			},
		})

		this.addCommand({
			id: 'file-diff-merge',
			name: 'Compare and merge',
			editorCallback: async () => {
				// TODO(tillf): Show warning when the user selects this option
				//              for the first time

				// Get current active file
				const activeFile = this.app.workspace.getActiveFile()
				if (activeFile == null) {
					return
				}

				// Get file to compare
				const compareFile = await this.getFileToCompare(activeFile)
				if (compareFile == null) {
					return
				}

				// Open differences view
				const workspaceLeaf = this.app.workspace.getLeaf()
				await workspaceLeaf.open(
					new DifferencesView({
						leaf: workspaceLeaf,
						file1: activeFile,
						file2: compareFile,
						showMergeOption: true,
					})
				)
			},
		})
	}

	getFileToCompare(activeFile: TFile): Promise<TFile | undefined> {
		const selectableFiles = this.app.vault.getFiles()
		selectableFiles.remove(activeFile)
		return this.showSelectOtherFileModal({
			selectableFiles,
		})
	}

	showSelectOtherFileModal(args: {
		selectableFiles: TFile[]
	}): Promise<TFile | undefined> {
		return new Promise((resolve, reject) => {
			new SelectFileModal({
				selectableFiles: args.selectableFiles,
				onChoose: (e, f) => (e ? reject(e) : resolve(f)),
			}).open()
		})
	}
}
