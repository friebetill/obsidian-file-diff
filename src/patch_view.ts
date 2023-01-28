import { ItemView, TFile, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_PATCH = "patch-view";

export class PatchView extends ItemView {
	constructor(
		leaf: WorkspaceLeaf,
		public file1: TFile,
		public file2: TFile,
		public patch: string
	) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_PATCH;
	}

	getDisplayText() {
		return `Difference between ${this.file1.name} and ${this.file2.name}`;
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		this.contentEl.createDiv({ text: this.patch });
	}

	async onClose() {
		// Nothing to clean up.
	}
}
