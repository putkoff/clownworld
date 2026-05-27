#!/usr/bin/env bash
set -e

echo ">>> Forcing React 18 / React-DOM 18 / styled-jsx 5.1.1"
# Update package.json dependencies
npm pkg set dependencies.react="18.2.0"
npm pkg set dependencies.react-dom="18.2.0"
npm pkg set devDependencies.@types/react="18.2.21"
npm pkg set devDependencies.@types/react-dom="18.2.7"
npm pkg set dependencies.styled-jsx="5.1.1"

# Remove conflicting files
rm -rf node_modules package-lock.json yarn.lock .next

echo ">>> Installing clean"
yarn install --check-files

echo ">>> Building project"
yarn build