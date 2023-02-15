import { Modal, TFile } from 'obsidian'

export class DeleteFileModal extends Modal {
	constructor(args: {
		file1: TFile
		file2: TFile
		onDone: (error: Error | null) => void
	}) {
		super(app)
		this.file1 = args.file1
		this.file2 = args.file2
		this.onDone = args.onDone
	}

	private readonly file1: TFile

	private readonly file2: TFile

	private readonly onDone: (error: Error | null) => void

	onOpen(): void {
		// Counteract gravity pull by moving box up for balanced composition
		this.modalEl.addClass('mb-20')

		this.contentEl.createEl('h3', {
			text: `Delete "${this.file2.name}"?`,
		})
		this.contentEl.createEl('p', {
			text:
				`The contents of "${this.file1.name}" and ` +
				`"${this.file2.name}" are identical. Would you like to ` +
				`delete the duplicate file? Please note that this action is ` +
				`irreversible.`,
		})

		const buttonContainer = this.contentEl.createDiv('button-container')

		const deleteButton = buttonContainer.createEl('button', {
			text: 'Delete',
			cls: 'mod-warning mr-2',
		})
		const cancelButton = buttonContainer.createEl('button', {
			text: 'Cancel',
		})

		deleteButton.addEventListener('click', () => this.handleDeleteClick())
		cancelButton.addEventListener('click', () => this.close())
	}

	handleDeleteClick(): void {
		this.app.vault.delete(this.file2)

		this.close()

		const leaf = this.app.workspace.getMostRecentLeaf()
		if (leaf != null) {
			leaf.openFile(this.file1)
		}

		this.onDone(null)
	}
}
