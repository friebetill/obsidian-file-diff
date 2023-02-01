import { Editor, Plugin, TFile } from "obsidian";

import { structuredPatch } from "diff";
import { FileDifferences } from "./data/file_differences";
import { DifferencesView } from "./differences_view";
import { SelectFileModal } from "./select_file_modal";

export default class FileDiffPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: "file-diff",
			name: "Show the difference between this file and another.",
			editorCallback: async (editor: Editor) => {
				// Get current active file
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile == null) {
					return;
				}

				// Get file to compare
				const selectableFiles = this.app.vault.getFiles();
				selectableFiles.remove(activeFile);
				const compareFile = await this.showSelectOtherFileModal({
					selectableFiles: selectableFiles,
				});
				if (compareFile == null) {
					return;
				}

				// Create difference between the files
				const activeFileContent = await this.app.vault.read(activeFile);
				const compareFileContent = await this.app.vault.read(
					compareFile
				);
				const fileDifferences = FileDifferences.fromParsedDiff(
					structuredPatch(
						activeFile.path,
						compareFile.path,
						activeFileContent,
						compareFileContent
					)
				);

				// Show difference
				const workspaceLeaf = this.app.workspace.getLeaf();
				await workspaceLeaf.open(
					new DifferencesView(
						workspaceLeaf,
						activeFileContent,
						compareFileContent,
						activeFile,
						compareFile,
						fileDifferences
					)
				);
			},
		});
	}

	async showSelectOtherFileModal(args: {
		selectableFiles: TFile[];
	}): Promise<TFile | undefined> {
		return new Promise((resolve, reject) => {
			return new SelectFileModal(
				this.app,
				args.selectableFiles,
				(error, selectedFile) =>
					error ? reject(error) : resolve(selectedFile)
			).open();
		});
	}
}
