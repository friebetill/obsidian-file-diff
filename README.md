# Obsidian File Diff

<!-- [![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?color=7e6ad6&labelColor=34208c&label=Obsidian%20Downloads&query=$['file-diff'].downloads&url=https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugin-stats.json&)](obsidian://show-plugin?id=file-diff) -->
![GitHub stars](https://img.shields.io/github/stars/friebetill/obsidian-file-diff?style=flat)

## Purpose

This plugin adds a file difference command to [Obsidian](https://obsidian.md/),
allowing users to compare and merge changes between different versions of a
file.

## Compatibility

Compatible with all platforms (Windows, Linux, macOS, Android and iOS). TODO:
Test on Android and iOS. Tested with Obsidian v0.15.0 or higher.

## Installation

At the moment, the plugin is not yet available as an official plugin. Therefore, it must be installed manually:

1. Download the repository as a zip file
2. Unzip the file
3. Install node modules with `yarn install`
4. Build the plugin with `yarn build`
5. Copy `main.js`, `styles.css` and `manifest.json` in your plugin folder `VaultFolder/.obsidian/plugins/obsidian-file-diff/`

When the plugin is officially release you can follow these steps to install the plugin:

1. Open Obsidian
2. Click on the "Settings" icon in the bottom left corner
3. Click on "Community plugins"
4. Click on "Browse"
5. Search for "File Diff"
6. Click on "Install"
7. Click on "Enable"

## Usage

To use the plugin, follow these steps:

1. Open a file in Obsidian
2. Open the command palette (Ctrl/Cmd + P)
3. Search for "File Diff"
4. Select the file you want to compare with the current file

## Demo

<img
src="https://user-images.githubusercontent.com/10923085/216749496-27f0b241-c05b-4aec-ba88-a7c8c91938a6.gif"
alt="GIF of a demo show this plugin" width="900" />

## Contributing

If you have any issues or suggestions, please open an issue on the repository.
If you would like to contribute code, please fork the repository and submit a
pull request.

## Support

For support, please open an issue on the repository.

If you're interested in supporting me, it would mean a lot if you could buy me a coffee through GitHub Sponsors, located on the right side.
