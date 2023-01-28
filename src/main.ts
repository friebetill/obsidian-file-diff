import { Editor, Plugin, TFile } from "obsidian";
import { SelectFileModal } from "./select_file_modal";

export default class FileDiffPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: "file-diff",
			name: "Show the difference between this file and another.",
			editorCallback: async (editor: Editor) => {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile == null) {
					return;
				}

				await this.showSelectOtherFileModal({
					selectableFiles: this.app.vault.getFiles(),
				});

				// Install library to calculate the difference between two files
				// Open new file where the differences are shown
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
