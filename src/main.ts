import { Plugin, TFile } from 'obsidian'

import { DifferencesView } from './components/differences_view'
import { SelectFileModal } from './components/select_file_modal'

export default class FileDiffPlugin extends Plugin {
	onload(): void {
		this.addCommand({
			id: 'file-diff',
			name: 'Show differences to another file',
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
			name: 'Show differences and merge options to another file',
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
			new SelectFileModal(
				this.app,
				args.selectableFiles,
				(error, selectedFile) =>
					error ? reject(error) : resolve(selectedFile)
			).open()
		})
	}
}
