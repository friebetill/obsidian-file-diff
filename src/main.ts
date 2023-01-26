import { Plugin } from "obsidian";

export default class FileDiffPlugin extends Plugin {

	async onload() {
		this.addCommand({
			id: "file-diff",
			name: "Show the difference between this file and another.",
			callback: () => {
				console.log('Hello world!');
			}
		});
	}

}
