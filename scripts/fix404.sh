#!/usr/bin/env bash
set -e

echo ">>> Removing any custom 404/500 pages"
rm -rf src/pages/404 src/pages/500 src/app/404 src/app/500

echo ">>> Nuking node_modules and lockfiles"
rm -rf node_modules package-lock.json yarn.lock .next

echo ">>> Reinstalling clean with React 18"
yarn add react@18.2.0 react-dom@18.2.0 styled-jsx@5.1.1 --exact
yarn install --check-files

echo ">>> Verifying React version"
yarn list react react-dom | grep react

echo ">>> Building fresh"
yarn build
