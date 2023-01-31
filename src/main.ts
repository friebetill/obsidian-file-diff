import { Editor, Plugin, TFile } from "obsidian";

import { structuredPatch } from "diff";
import { PatchView } from "./patch_view";
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
				const fileToCompare = await this.showSelectOtherFileModal({
					selectableFiles: selectableFiles,
				});
				if (fileToCompare == null) {
					return;
				}

				// Create difference between the files
				const activeFileContent = await this.app.vault.read(activeFile);
				const fileToCompareContent = await this.app.vault.read(
					fileToCompare
				);
				const patch = structuredPatch(
					activeFile.path,
					fileToCompare.path,
					activeFileContent,
					fileToCompareContent
				);

				// Show difference
				const workspaceLeaf = this.app.workspace.getLeaf();
				await workspaceLeaf.open(
					new PatchView(
						workspaceLeaf,
						activeFileContent,
						fileToCompareContent,
						activeFile,
						fileToCompare,
						patch
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
