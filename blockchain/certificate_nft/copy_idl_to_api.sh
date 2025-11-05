#!/usr/bin/env bash
set -e

IDL_NAME="certificate_nft.json"
IDL_SRC="./target/idl/$IDL_NAME"
API_DEST="../../apps/api/certificates/utils/$IDL_NAME"
UI_DEST="../../apps/cognify-ui/src/lib/$IDL_NAME"

echo "🔁 Copying IDL from $IDL_SRC → $API_DEST"
mkdir -p "$(dirname "$API_DEST")"
cp "$IDL_SRC" "$API_DEST"

echo "🔁 Copying IDL from $IDL_SRC → $UI_DEST"
mkdir -p "$(dirname "$UI_DEST")"
cp "$IDL_SRC" "$UI_DEST"

echo "✅ IDL copied to both API and UI directories"
