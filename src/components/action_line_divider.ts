export class ActionLineDivider {
	static build(actionLine: HTMLDivElement): void {
		actionLine.createEl('span', { text: '|', cls: 'text-xxs text-gray' })
	}
}
