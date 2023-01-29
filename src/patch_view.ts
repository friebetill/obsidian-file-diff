import { Hunk, ParsedDiff } from "diff";
import { ItemView, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_PATCH = "patch-view";

export class PatchView extends ItemView {
	constructor(
		leaf: WorkspaceLeaf,
		public file1Content: string,
		public file2Content: string,
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

	async onClose() {
		// Nothing to clean up.
	}

	private buildHunkVisualizer(container: HTMLDivElement, hunk: Hunk) {
		this.buildActionLine(container);

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

	private buildActionLine(container: HTMLDivElement) {
		const actionLine = container.createDiv({ cls: "flex-row gap-2 py-2" });

		this.buildActionLineButton(
			actionLine,
			"Accept Top",
			this.handleAcceptTopClick
		);
		this.buildActionLineDivider(actionLine);
		this.buildActionLineButton(
			actionLine,
			"Accept Bottom",
			this.handleAcceptBottomClick
		);
		this.buildActionLineDivider(actionLine);
		this.buildActionLineButton(
			actionLine,
			"Accept All",
			this.handleAcceptAllClick
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

	private handleAcceptTopClick(event: MouseEvent): void {
		event.preventDefault();
		console.log("Accept top");
	}

	private handleAcceptBottomClick(event: MouseEvent): void {
		event.preventDefault();
		console.log("Accept bottom");
	}

	private handleAcceptAllClick(event: MouseEvent): void {
		event.preventDefault();
		console.log("Accept all");
	}
}
