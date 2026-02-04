#!/bin/bash
# Creates release packages for GitHub and Thunderstore.
# Reads configuration from mod.config.json
#
# Usage:
#   ./scripts/create_release.sh              # Use version from manifest
#   ./scripts/create_release.sh 1.4.7        # Override version

set -e

# Get paths
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEV_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$DEV_DIR/mod.config.json"
RELEASE_DIR="$DEV_DIR/release"

# Check for config file
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "Error: mod.config.json not found in $DEV_DIR"
    exit 1
fi

# Check for jq
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required. Install with: brew install jq"
    exit 1
fi

# Read config
MOD_NAME=$(jq -r '.mod_name' "$CONFIG_FILE")
MOD_JSON=$(jq -r '.mod_json' "$CONFIG_FILE")

if [[ -z "$MOD_NAME" || "$MOD_NAME" == "null" ]]; then
    echo "Error: mod_name not found in mod.config.json"
    exit 1
fi

# Get version
if [[ -n "$1" ]]; then
    VERSION="$1"
else
    # Try to read from mod manifest
    if [[ -f "$DEV_DIR/$MOD_JSON" ]]; then
        VERSION=$(jq -r '.version' "$DEV_DIR/$MOD_JSON")
    else
        echo "Error: No version provided and $MOD_JSON not found"
        echo "Usage: $0 [version]"
        exit 1
    fi
fi

if [[ -z "$VERSION" || "$VERSION" == "null" ]]; then
    echo "Error: Could not determine version"
    exit 1
fi

echo "Creating release for $MOD_NAME v$VERSION"
echo ""

# Read file lists
readarray -t INCLUDE_LIST < <(jq -r '.include_files[]' "$CONFIG_FILE")
readarray -t THUNDERSTORE_ADDITIONS < <(jq -r '.thunderstore_additions[]? // empty' "$CONFIG_FILE")
readarray -t EXCLUDE_LIST < <(jq -r '.exclude_from_release[]? // empty' "$CONFIG_FILE")

# Create temp directory
TEMP_DIR=$(mktemp -d)
TEMP_MOD_DIR="$TEMP_DIR/$MOD_NAME"
mkdir -p "$TEMP_MOD_DIR"

# Build rsync args for include files
RSYNC_ARGS=()
for item in "${INCLUDE_LIST[@]}"; do
    RSYNC_ARGS+=("--include=$item")
done
RSYNC_ARGS+=("--exclude=*")

# Copy mod files
echo "Copying mod files..."
rsync -av "${RSYNC_ARGS[@]}" "$DEV_DIR/" "$TEMP_MOD_DIR/"

# Create release directory
mkdir -p "$RELEASE_DIR"

# Create GitHub release zip
GITHUB_ZIP="$RELEASE_DIR/$MOD_NAME-$VERSION.zip"
echo "Creating GitHub release: $GITHUB_ZIP"
(cd "$TEMP_DIR" && zip -r "$GITHUB_ZIP" "$MOD_NAME")

# Create Thunderstore release if additions exist
if [[ ${#THUNDERSTORE_ADDITIONS[@]} -gt 0 ]]; then
    echo "Adding Thunderstore files..."
    for file in "${THUNDERSTORE_ADDITIONS[@]}"; do
        if [[ -f "$DEV_DIR/$file" ]]; then
            cp "$DEV_DIR/$file" "$TEMP_MOD_DIR/"
        else
            echo "  Warning: $file not found"
        fi
    done
    
    THUNDERSTORE_ZIP="$RELEASE_DIR/$MOD_NAME-$VERSION-thunderstore.zip"
    echo "Creating Thunderstore release: $THUNDERSTORE_ZIP"
    (cd "$TEMP_DIR" && zip -r "$THUNDERSTORE_ZIP" "$MOD_NAME")
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "Release packages created in $RELEASE_DIR:"
ls -la "$RELEASE_DIR"/*.zip 2>/dev/null | grep "$VERSION" || true
echo ""
echo "Done!"
