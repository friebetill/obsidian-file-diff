import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { Difference } from "./data/difference";
import { FileDifferences } from "./data/file_differences";
import { preventEmptyString, replaceLine } from "./utils/string_utils";

export const VIEW_TYPE_PATCH = "patch-view";

export class DifferencesView extends ItemView {
	constructor(
		leaf: WorkspaceLeaf,
		public file1Content: string,
		public file2Content: string,
		public file1: TFile,
		public file2: TFile,
		public fileDifferences: FileDifferences
	) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_PATCH;
	}

	getDisplayText() {
		return `Difference between ${this.fileDifferences.file1Name} and ${this.fileDifferences.file2Name}`;
	}

	async onOpen() {
		this.contentEl.empty();
		const container = this.contentEl.createDiv({ cls: "container" });
		const lines = this.file1Content.split("\n");

		const lineCount = Math.max(
			lines.length,
			...this.fileDifferences.differences.map((d) => d.start)
		);

		for (let i = 0; i <= lineCount; i++) {
			let line = i in lines ? lines[i] : null;
			const difference = this.fileDifferences.differences.find(
				(d) => d.start === i
			);

			if (difference != null) {
				this.buildDifferenceVisualizer(container, difference);
			}
			if (
				line != null &&
				(difference == null || !difference.hasChangesFromFile1())
			) {
				container.createDiv({
					// Necessary to give the line a height when it's empty.
					text: preventEmptyString(line),
					cls: "line",
				});
			}
		}
	}

	private buildDifferenceVisualizer(
		container: HTMLDivElement,
		difference: Difference
	) {
		this.buildActionLine(container, difference);

		difference.lines.forEach((line) => {
			if (line.startsWith("+")) {
				container.createDiv({
					// Necessary to give the line a height when it's empty.
					text: preventEmptyString(line.slice(1, line.length)),
					cls: "line bg-turquoise-light",
				});
			} else if (line.startsWith("-")) {
				container.createDiv({
					// Necessary to give the line a height when it's empty.
					text: preventEmptyString(line.slice(1, line.length)),
					cls: "line bg-blue-light",
				});
			}
		});
	}

	private buildActionLine(container: HTMLDivElement, difference: Difference) {
		const actionLine = container.createDiv({ cls: "flex-row gap-2 py-2" });

		const hasPlusLines = difference.lines.some((l) => l.startsWith("+"));
		const hasMinusLines = difference.lines.some((l) => l.startsWith("-"));

		if (hasPlusLines && hasMinusLines) {
			this.buildActionLineButton(actionLine, "Accept Top", (e) =>
				this.handleAcceptTopClick(e, difference)
			);
			this.buildActionLineDivider(actionLine);
			this.buildActionLineButton(actionLine, "Accept Bottom", (e) =>
				this.handleAcceptBottomClick(e, difference)
			);
			this.buildActionLineDivider(actionLine);
			this.buildActionLineButton(actionLine, "Accept All", (e) =>
				this.handleAcceptAllClick(e, difference)
			);
		} else if (hasMinusLines) {
			this.buildActionLineButton(
				actionLine,
				`Accept from ${this.fileDifferences.file1Name}`,
				(e) => this.handleAcceptTopClick(e, difference)
			);
			this.buildActionLineDivider(actionLine);
			this.buildActionLineButton(actionLine, `Discard`, (e) =>
				this.handleDiscardClick(e, difference)
			);
		} else if (hasPlusLines) {
			this.buildActionLineButton(
				actionLine,
				`Accept from ${this.fileDifferences.file2Name}`,
				(e) => this.handleAcceptTopClick(e, difference)
			);
			this.buildActionLineDivider(actionLine);
			this.buildActionLineButton(actionLine, `Discard`, (e) =>
				this.handleDiscardClick(e, difference)
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

		const file1Content = await this.app.vault.read(this.file1);
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
		await this.app.vault.modify(this.file1, newContent);

		this.fileDifferences.differences.remove(difference);

		this.file1Content = newContent;

		this.triggerRebuild();
	}

	private async handleAcceptBottomClick(
		event: MouseEvent,
		difference: Difference
	): Promise<void> {
		event.preventDefault();

		const file1Content = await this.app.vault.read(this.file1);
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
		await this.app.vault.modify(this.file1, newContent);

		this.fileDifferences.differences.remove(difference);

		this.file1Content = newContent;

		this.triggerRebuild();
	}

	private async handleAcceptAllClick(
		event: MouseEvent,
		difference: Difference
	): Promise<void> {
		event.preventDefault();

		const file1Content = await this.app.vault.read(this.file1);
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
		await this.app.vault.modify(this.file1, newContent);

		this.fileDifferences.differences.remove(difference);

		this.file1Content = newContent;

		this.triggerRebuild();
	}

	async handleDiscardClick(
		event: MouseEvent,
		difference: Difference
	): Promise<void> {
		event.preventDefault();

		const file1Content = await this.app.vault.read(this.file1);

		const minusPlusLinesCount = difference.lines.findIndex(
			(line) => line.startsWith("-") || line.startsWith("+")
		);
		const newContent = replaceLine(
			file1Content,
			difference.start - 1 + minusPlusLinesCount,
			""
		);
		await this.app.vault.modify(this.file1, newContent);

		this.fileDifferences.differences.remove(difference);

		this.file1Content = newContent;

		this.triggerRebuild();
	}

	private triggerRebuild() {
		this.onOpen();
	}
}
