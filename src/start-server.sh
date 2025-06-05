#!/bin/bash

cd "$(dirname "$0")/server"
rm -rf ./dist/*
npx tsc
npx concurrently "npx tsc -w" "nodemon dist/src/index.js"
