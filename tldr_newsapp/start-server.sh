#!/bin/bash

cd "$(dirname "$0")/server"
npx tsc
npx concurrently "npx tsc -w" "nodemon dist/index.js"
