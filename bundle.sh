#!/usr/bin/env bash

set -e

VENDOR_DIR=.aws-sam/build/SharpHEICLayer/nodejs/node_modules/sharp/vendor
SHARP_DIR=dist/nodejs/node_modules/sharp/

if [ ! -d "${VENDOR_DIR}" ]; then
  sam build --use-container
fi

if [ ! -d "${VENDOR_DIR}" ]; then
  echo "Please verify that the build completed successfully."
  exit 1
fi

rm -rf ./dist
node esbuild.mjs
echo
cp -R "${VENDOR_DIR}" "${SHARP_DIR}"
echo "Zipping layer..."
echo
cd dist && zip -9 -r sharp-heic-lambda-layer.zip .
echo
echo "Layer is available at: dist/sharp-heic-lambda-layer.zip"
