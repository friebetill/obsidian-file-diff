import { structuredPatch } from "diff";
import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { ActionLine } from "./action_line";
import { Difference } from "./data/difference";
import { FileDifferences } from "./data/file_differences";
import { preventEmptyString } from "./utils/string_utils";

export const VIEW_TYPE_PATCH = "patch-view";

export class DifferencesView extends ItemView {
	constructor(args: {
		leaf: WorkspaceLeaf;
		file1: TFile;
		file2: TFile;
		showMergeOption: boolean;
	}) {
		super(args.leaf);
		this.file1 = args.file1;
		this.file2 = args.file2;
		this.showMergeOption = args.showMergeOption;
	}

	private file1: TFile;
	private file2: TFile;
	private showMergeOption: boolean;

	private fileDifferences: FileDifferences;
	private file1Lines: string[];
	private lineCount: number;

	getViewType() {
		return VIEW_TYPE_PATCH;
	}

	getDisplayText() {
		return `Difference between ${this.file1.name} and ${this.file2.name}`;
	}

	async onOpen() {
		await this.updateState();
		this.build();
	}

	private async updateState() {
		const file1Content = await this.app.vault.read(this.file1);
		this.file1Lines = file1Content.split("\n");

		const file2Content = await this.app.vault.read(this.file2);
		this.fileDifferences = FileDifferences.fromParsedDiff(
			structuredPatch(
				this.file1.path,
				this.file2.path,
				file1Content,
				file2Content
			)
		);

		// Find the highest line number we need to go through. This can be the
		// highest number in the differences, because the second file can have
		// more lines than the first file.
		this.lineCount = Math.max(
			this.file1Lines.length,
			...this.fileDifferences.differences.map((d) => d.start)
		);
	}

	private build() {
		this.contentEl.empty();

		const container = this.contentEl.createDiv({ cls: "container" });

		for (let i = 0; i <= this.lineCount; i++) {
			let line = i in this.file1Lines ? this.file1Lines[i] : null;
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
		const triggerRebuild = () => this.onOpen();

		if (this.showMergeOption) {
			new ActionLine({
				difference: difference,
				file1: this.file1,
				file2: this.file2,
				triggerRebuild: triggerRebuild,
			}).build(container);
		}

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
}
