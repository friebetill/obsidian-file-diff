import { Modal, TFile } from 'obsidian'
import { DifferencesView } from '../differences_view'

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
		this.modalEl.addClass('mb-16')

		this.contentEl.createEl('h2', {
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
		const cancelButton = buttonContainer.createEl('button', {
			text: 'Cancel',
			cls: 'mr-8',
		})
		cancelButton.addEventListener('click', () => this.close())
		const deleteButton = buttonContainer.createEl('button', {
			text: 'Delete',
			cls: 'button-danger',
		})
		deleteButton.addEventListener('click', () => {
			this.app.vault.delete(this.file2)

			this.close()
			// Close currently active file
			this.app.workspace
				.getActiveViewOfType(DifferencesView)
				?.leaf.detach()
			this.onDone(null)
		})
	}
}
