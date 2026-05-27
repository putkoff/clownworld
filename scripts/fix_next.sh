#!/usr/bin/env bash
set -euo pipefail

PKG=./../package.json

echo ">>> Detecting React version from $PKG"
REACT_VER=$(jq -r '.dependencies.react' "$PKG" | sed 's/^[^0-9]*//')
REACTDOM_VER=$(jq -r '.dependencies["react-dom"]' "$PKG" | sed 's/^[^0-9]*//')
STYLEDJSX_VER=$(jq -r '.dependencies["styled-jsx"] // "5.1.1"' "$PKG")

echo "   - react: $REACT_VER"
echo "   - react-dom: $REACTDOM_VER"
echo "   - styled-jsx: $STYLEDJSX_VER"

# Nuke problematic files
echo ">>> Removing custom error pages and build cache"
rm -rf src/pages/404 src/pages/500 src/app/404 src/app/500
rm -rf node_modules package-lock.json yarn.lock .next

# Sync package.json
echo ">>> Forcing consistent dependency versions"
npm pkg set dependencies.react="$REACT_VER"
npm pkg set dependencies.react-dom="$REACTDOM_VER"
npm pkg set dependencies.styled-jsx="$STYLEDJSX_VER"

# Types should match React major version
if [[ "$REACT_VER" =~ ^18 ]]; then
  npm pkg set devDependencies.@types/react="18.2.21"
  npm pkg set devDependencies.@types/react-dom="18.2.7"
elif [[ "$REACT_VER" =~ ^19 ]]; then
  npm pkg set devDependencies.@types/react="19.0.0"
  npm pkg set devDependencies.@types/react-dom="19.0.0"
fi

echo ">>> Installing clean"
yarn install --check-files

echo ">>> Verifying installed React versions"
yarn list react react-dom | grep react

echo ">>> Building project"
yarn build
