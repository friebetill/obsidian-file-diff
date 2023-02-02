import { TFile } from "obsidian";
import { Difference } from "./data/difference";
import { replaceLine } from "./utils/string_utils";

type VoidCallback = () => void;

export class ActionLine {
	constructor(args: {
		difference: Difference;
		file1: TFile;
		file2: TFile;
		triggerRebuild: VoidCallback;
	}) {
		this.difference = args.difference;
		this.file1 = args.file1;
		this.file2 = args.file2;
		this.triggerRebuild = args.triggerRebuild;
	}

	private difference: Difference;
	private file1: TFile;
	private file2: TFile;
	private triggerRebuild: VoidCallback;

	build(container: HTMLDivElement) {
		const actionLine = container.createDiv({ cls: "flex-row gap-2 py-2" });

		const hasPlusLines = this.difference.lines.some((l) =>
			l.startsWith("+")
		);
		const hasMinusLines = this.difference.lines.some((l) =>
			l.startsWith("-")
		);

		if (hasPlusLines && hasMinusLines) {
			this.buildActionLineButton(actionLine, "Accept Top", (e) =>
				this.handleAcceptTopClick(e, this.difference)
			);
			this.buildActionLineDivider(actionLine);
			this.buildActionLineButton(actionLine, "Accept Bottom", (e) =>
				this.handleAcceptBottomClick(e, this.difference)
			);
			this.buildActionLineDivider(actionLine);
			this.buildActionLineButton(actionLine, "Accept All", (e) =>
				this.handleAcceptAllClick(e, this.difference)
			);
		} else if (hasMinusLines) {
			this.buildActionLineButton(
				actionLine,
				`Accept from ${this.file1.name}`,
				(e) => this.handleAcceptTopClick(e, this.difference)
			);
			this.buildActionLineDivider(actionLine);
			this.buildActionLineButton(actionLine, `Discard`, (e) =>
				this.handleDiscardClick(e, this.difference)
			);
		} else if (hasPlusLines) {
			this.buildActionLineButton(
				actionLine,
				`Accept from ${this.file2.name}`,
				(e) => this.handleAcceptTopClick(e, this.difference)
			);
			this.buildActionLineDivider(actionLine);
			this.buildActionLineButton(actionLine, `Discard`, (e) =>
				this.handleDiscardClick(e, this.difference)
			);
		}
	}

	private buildActionLineButton(
		actionLine: HTMLDivElement,
		text: string,
		onClick: (event: MouseEvent) => void
	) {
		actionLine
			.createEl("a", { text, cls: "no-decoration text-xxs text-gray" })
			.onClickEvent(onClick);
	}

	private buildActionLineDivider(actionLine: HTMLDivElement) {
		actionLine.createEl("span", { text: "|", cls: "text-xxs text-gray" });
	}

	private async handleAcceptTopClick(
		event: MouseEvent,
		difference: Difference
	): Promise<void> {
		event.preventDefault();

		const file1Content = await app.vault.read(this.file1);
		const changedLines = difference.lines
			.filter((line) => line.startsWith("-"))
			.map((line) => line.slice(1, line.length))
			.join("\n");
		const minusPlusLinesCount = difference.lines.findIndex(
			(line) => line.startsWith("-") || line.startsWith("+")
		);
		const newContent = replaceLine(
			file1Content,
			difference.start - 1 + minusPlusLinesCount,
			changedLines
		);
		await app.vault.modify(this.file1, newContent);

		this.triggerRebuild();
	}

	private async handleAcceptBottomClick(
		event: MouseEvent,
		difference: Difference
	): Promise<void> {
		event.preventDefault();

		const file1Content = await app.vault.read(this.file1);
		const changedLines = difference.lines
			.filter((line) => line.startsWith("+"))
			.map((line) => line.slice(1, line.length))
			.join("\n");
		const minusPlusLinesCount = difference.lines.findIndex(
			(line) => line.startsWith("-") || line.startsWith("+")
		);
		const newContent = replaceLine(
			file1Content,
			difference.start - 1 + minusPlusLinesCount,
			changedLines
		);
		await app.vault.modify(this.file1, newContent);

		this.triggerRebuild();
	}

	private async handleAcceptAllClick(
		event: MouseEvent,
		difference: Difference
	): Promise<void> {
		event.preventDefault();

		const file1Content = await app.vault.read(this.file1);
		const changedLines = difference.lines
			.filter((line) => line.startsWith("-") || line.startsWith("+"))
			.map((line) => line.slice(1, line.length))
			.join("\n");

		const minusPlusLinesCount = difference.lines.findIndex(
			(line) => line.startsWith("-") || line.startsWith("+")
		);
		const newContent = replaceLine(
			file1Content,
			difference.start - 1 + minusPlusLinesCount,
			changedLines
		);
		await app.vault.modify(this.file1, newContent);

		this.triggerRebuild();
	}

	async handleDiscardClick(
		event: MouseEvent,
		difference: Difference
	): Promise<void> {
		event.preventDefault();

		const file1Content = await app.vault.read(this.file1);

		const minusPlusLinesCount = difference.lines.findIndex(
			(line) => line.startsWith("-") || line.startsWith("+")
		);
		const newContent = replaceLine(
			file1Content,
			difference.start - 1 + minusPlusLinesCount,
			""
		);
		await app.vault.modify(this.file1, newContent);

		this.triggerRebuild();
	}
}
