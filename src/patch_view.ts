import { Hunk, ParsedDiff } from "diff";
import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { replaceLine } from "./line_replacer/replace_line";

export const VIEW_TYPE_PATCH = "patch-view";

export class PatchView extends ItemView {
	constructor(
		leaf: WorkspaceLeaf,
		public file1Content: string,
		public file2Content: string,
		public file1: TFile,
		public file2: TFile,
		public patch: ParsedDiff
	) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_PATCH;
	}

	getDisplayText() {
		return `Difference between ${this.patch.oldFileName} and ${this.patch.newFileName}`;
	}

	async onOpen() {
		this.contentEl.empty();
		const container = this.contentEl.createDiv({ cls: "container" });
		const lines = this.file1Content.split("\n");

		lines.forEach((line, lineIndex) => {
			const activeHunk = this.patch.hunks.find((hunk) => {
				const lineWithMinusIndex = hunk.lines.findIndex((line) =>
					line.startsWith("-")
				);
				return lineIndex === hunk.oldStart - 1 + lineWithMinusIndex;
			});
			if (activeHunk != null) {
				this.buildHunkVisualizer(container, activeHunk);
			} else {
				container.createDiv({ text: line, cls: "line" });
			}
		});
	}

	private buildHunkVisualizer(container: HTMLDivElement, hunk: Hunk) {
		this.buildActionLine(container, hunk);

		hunk.lines.forEach((line) => {
			if (line.startsWith("+")) {
				container.createDiv({
					text: `${line.slice(1, line.length)}`,
					cls: "line bg-turquoise-light",
				});
			} else if (line.startsWith("-")) {
				container.createDiv({
					text: `${line.slice(1, line.length)}`,
					cls: "line bg-blue-light",
				});
			}
		});
	}


	private buildActionLine(container: HTMLDivElement, hunk: Hunk) {
		const actionLine = container.createDiv({ cls: "flex-row gap-2 py-2" });

		this.buildActionLineButton(actionLine, "Accept Top", (e) =>
			this.handleAcceptTopClick(e, hunk)
		);
		this.buildActionLineDivider(actionLine);
		this.buildActionLineButton(actionLine, "Accept Bottom", (e) =>
			this.handleAcceptBottomClick(e, hunk)
		);
		this.buildActionLineDivider(actionLine);
		this.buildActionLineButton(actionLine, "Accept All", (e) =>
			this.handleAcceptAllClick(e, hunk)
		);
	}

	private buildActionLineButton(
		hunkActionsLine: HTMLDivElement,
		text: string,
		onClick: (event: MouseEvent) => void
	) {
		hunkActionsLine
			.createEl("a", { text, cls: "no-decoration text-xxs text-gray" })
			.onClickEvent(onClick);
	}

	private buildActionLineDivider(hunkActionsLine: HTMLDivElement) {
		hunkActionsLine.createEl("span", {
			text: "|",
			cls: "text-xxs text-gray",
		});
	}

	private async handleAcceptTopClick(
		event: MouseEvent,
		hunk: Hunk
	): Promise<void> {
		event.preventDefault();
		const file1Content = await this.app.vault.read(this.file1);
		const changedLines = hunk.lines
			.filter((line) => line.startsWith("-"))
			.map((line) => line.slice(1, line.length))
			.join("\n");
		const lineWithMinusIndex = hunk.lines.findIndex(
			(line) => line.startsWith("-") || line.startsWith("+")
		);
		const newContent = replaceLine(
			file1Content,
			hunk.oldStart - 1 + lineWithMinusIndex,
			changedLines
		);
		await this.app.vault.modify(this.file1, newContent);

		this.patch.hunks.remove(hunk);

		this.file1Content = newContent;

		this.triggerRebuild();
	}

	private async handleAcceptBottomClick(
		event: MouseEvent,
		hunk: Hunk
	): Promise<void> {
		event.preventDefault();
		event.preventDefault();
		const file1Content = await this.app.vault.read(this.file1);
		const changedLines = hunk.lines
			.filter((line) => line.startsWith("+"))
			.map((line) => line.slice(1, line.length))
			.join("\n");
		const lineWithMinusIndex = hunk.lines.findIndex(
			(line) => line.startsWith("-") || line.startsWith("+")
		);
		const newContent = replaceLine(
			file1Content,
			hunk.oldStart - 1 + lineWithMinusIndex,
			changedLines
		);
		await this.app.vault.modify(this.file1, newContent);

		this.patch.hunks.remove(hunk);

		this.file1Content = newContent;

		this.triggerRebuild();
	}

	private async handleAcceptAllClick(
		event: MouseEvent,
		hunk: Hunk
	): Promise<void> {
		event.preventDefault();
		const file1Content = await this.app.vault.read(this.file1);
		const changedLines = hunk.lines
			.filter((line) => line.startsWith("-") || line.startsWith("+"))
			.map((line) => line.slice(1, line.length))
			.join("\n");

		const lineWithMinusIndex = hunk.lines.findIndex(
			(line) => line.startsWith("-") || line.startsWith("+")
		);
		const newContent = replaceLine(
			file1Content,
			hunk.oldStart - 1 + lineWithMinusIndex,
			changedLines
		);
		await this.app.vault.modify(this.file1, newContent);

		this.patch.hunks.remove(hunk);

		this.file1Content = newContent;

		this.triggerRebuild();
	}

	private triggerRebuild() {
		this.onOpen();
	}
}
