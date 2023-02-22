import { Modal } from 'obsidian';

export class RiskyActionModal extends Modal {
	constructor(args: { onAccept: (error: Error | null) => void }) {
		super(app);
		this.onAccept = args.onAccept;
	}

	private readonly onAccept: (error: Error | null) => void;

	onOpen(): void {
		// Counteract gravity pull by moving box up for balanced composition
		this.modalEl.addClass('mb-20');

		this.contentEl.createEl('h3', { text: `Do you accept the risk?` });
		this.contentEl.createEl('p', {
			text:
				`The merging options alter the files irreversibly. ` +
				`Proceed with caution and only if you are aware and ` +
				`accepting of the associated risks.`,
		});

		const buttonContainer = this.contentEl.createDiv(
			'file-diff__button-container'
		);

		const deleteButton = buttonContainer.createEl('button', {
			text: 'Accept Risk',
			cls: 'mod-warning mr-2',
		});
		const cancelButton = buttonContainer.createEl('button', {
			text: 'Cancel',
		});

		cancelButton.addEventListener('click', () => this.close());
		deleteButton.addEventListener('click', () => {
			this.close();
			this.onAccept(null);
		});
	}
}
