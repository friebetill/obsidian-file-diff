import { SuggestModal, TFile } from 'obsidian'

export class SelectFileModal extends SuggestModal<TFile> {
	constructor(args: {
		selectableFiles: TFile[]
		onChoose: (error: Error | null, result?: TFile) => void
	}) {
		super(app)
		this.selectableFiles = args.selectableFiles
		this.onChoose = args.onChoose
	}

	private readonly selectableFiles: TFile[]

	private readonly onChoose: (error: Error | null, result?: TFile) => void

	getSuggestions(query: string): TFile[] {
		return this.selectableFiles.filter((file) => {
			const searchQuery = query?.toLowerCase()
			return file.name?.toLowerCase().includes(searchQuery)
		})
	}

	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.createEl('div', { text: file.name })
	}

	onChooseSuggestion(file: TFile): void {
		this.onChoose(null, file)
	}
}
