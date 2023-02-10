export class ActionLineButton {
	constructor(args: { text: string; onClick: (e: MouseEvent) => void }) {
		this.text = args.text
		this.onClick = args.onClick
	}

	public text: string

	public onClick: (e: MouseEvent) => void

	build(actionLine: HTMLDivElement): void {
		actionLine
			.createEl('a', {
				text: this.text,
				cls: 'no-decoration text-xxs file-diff__action-line',
			})
			.onClickEvent(this.onClick)
	}
}
