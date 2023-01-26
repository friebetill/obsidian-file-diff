#!/bin/bash

CURRENT_VERSION=""
NEW_VERSION=""
OBSIDIAN_MINIMUM_VERSION="0.15.0"

# This script is used to release a new version of the project.
main() {
    verifyDependencies

    # Version
    readCurrentVersion
    askForNewVersion

    # Update files
    updatePackageJson
    updateManifestJson
    updateVersionsJson

    # Git
    addUpdatedFiles
    commitChanges
    pushChanges

    buildRelease

    createGitHubRelease
}

verifyDependencies() {
    # Verify that GitHub CLI is installed
    if ! command -v gh &>/dev/null; then
        echo "GitHub CLI could not be found. Please install it from https://cli.github.com/."
        exit
    fi
}

readCurrentVersion() {
    CURRENT_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
}

askForNewVersion() {
    # Ask for new version number
    echo "What is the new version number? The current version is $CURRENT_VERSION."
    read -r NEW_VERSION

    # Check if version number is valid
    if [[ ! $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "Version number is not valid. Please use the format x.x.x."
        exit 1
    else
        echo ""
    fi
}

updatePackageJson() {
    echo "Update version in package.json. Press ENTER to update or ESC to skip."
    if askForEnter; then
        sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/g" package.json

        echo "Verify version in package.json is correct"
        echo ""
        git --no-pager diff package.json
        echo ""
        echo "Press ENTER if the version is correct or ESC to abort."
        if ! askForEnter; then
            echo "Aborting release"
            exit 1
        fi

        echo ""
    fi
}

updateManifestJson() {
    echo "Update version in manifest.json. Press ENTER to update or ESC to skip."
    if askForEnter; then
        sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/g" manifest.json

        echo "Verify version in manifest.json is correct."
        echo ""
        git --no-pager diff manifest.json
        echo ""
        echo "Press ENTER if the version is correct or ESC to abort."
        if ! askForEnter; then
            echo "Aborting release"
            exit 1
        fi

        echo ""
    fi
}

updateVersionsJson() {
    echo "Add version to versions.json. Press ENTER to update or ESC to skip."
    if askForEnter; then
        # Add new version after line with current version in versions.json on macOS
        sed -i "" -E "s/(\"$CURRENT_VERSION\":.*)/\1,\n\t\"$NEW_VERSION\": \"$OBSIDIAN_MINIMUM_VERSION\"/g" versions.json

        echo "Verify version in versions.json is correct."
        echo ""
        git --no-pager diff versions.json
        echo ""
        echo "Press ENTER if the version is correct or ESC to abort."
        if ! askForEnter; then
            echo "Aborting release"
            exit 1
        fi

        echo ""
    fi
}

addUpdatedFiles() {
    echo "Add package.json, manifest.json and versions.json to Git. Press ENTER to add or ESC to skip."
    if askForEnter; then
        git add package.json
        git add manifest.json
        git add versions.json
    fi

    echo ""
}

commitChanges() {
    echo "Commit changes. Press ENTER to commit or ESC to skip."
    if askForEnter; then
        git commit -m "Release version $NEW_VERSION"
    fi
    echo ""
}

pushChanges() {
    echo "Push changes. Press ENTER to push or ESC to skip."
    if askForEnter; then
        git push
    fi
    echo ""
}

buildRelease() {
    echo "Build release. Press ENTER to build or ESC to skip."
    if askForEnter; then
        npm run build
    fi
    echo ""
}

createGitHubRelease() {
    echo "Create GitHub release. Press ENTER to create or ESC to skip."
    if askForEnter; then
        gh release create "$NEW_VERSION" manifest.json main.js styles.css --generate-notes
    fi
    echo ""
}

askForEnter() {
    read -r -s -n 1 key
    # -s: do not echo input character.
    # -n 1: read only 1 character (separate with space)

    # double brackets to test, single equals sign, empty string for just 'enter' in this case...
    # if [[ ... ]] is followed by semicolon and 'then' keyword
    if [[ $key = "" ]]; then
        return 0
    else
        return 1
    fi
}

main
