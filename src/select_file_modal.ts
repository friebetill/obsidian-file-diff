import { App, SuggestModal, TFile } from "obsidian";

export class SelectFileModal extends SuggestModal<TFile> {
	constructor(
		app: App,
		private readonly selectableFiles: TFile[],
		private onChoose: (error: Error | null, result?: TFile) => void
	) {
		super(app);
	}

	getSuggestions(query: string): TFile[] {
		return this.selectableFiles.filter((file) => {
			const searchQuery = query?.toLowerCase();
			return file.name?.toLowerCase().includes(searchQuery);
		});
	}

	renderSuggestion(file: TFile, el: HTMLElement) {
		el.createEl("div", { text: file.name });
	}

	onChooseSuggestion(file: TFile) {
		this.onChoose(null, file);
	}
}
