#!/bin/bash
# Creates release packages for GitHub and Thunderstore.
# Reads all configuration from mod.config.json (single source of truth)
#
# Config Version: 2.0.0
#
# Usage:
#   ./scripts/create_release.sh              # Use version from manifest
#   ./scripts/create_release.sh 1.4.7        # Override version

set -e

# Get paths
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEV_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$DEV_DIR/mod.config.json"

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

# ============================================
# Read all config from mod.config.json
# ============================================
MOD_NAME=$(jq -r '.mod_name' "$CONFIG_FILE")
MOD_JSON=$(jq -r '.mod_json' "$CONFIG_FILE")
RELEASE_DIR=$(jq -r '.paths.release_dir // "release"' "$CONFIG_FILE")

# Expand relative paths
if [[ "$RELEASE_DIR" != /* ]]; then
    RELEASE_DIR="$DEV_DIR/$RELEASE_DIR"
fi

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

# Read include_files (for sync and GitHub release)
readarray -t INCLUDE_LIST < <(jq -r '.include_files[]' "$CONFIG_FILE")

# Read thunderstore_additions (additional files for Thunderstore only)
readarray -t THUNDERSTORE_ADDITIONS < <(jq -r '.thunderstore_additions[]? // empty' "$CONFIG_FILE")

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