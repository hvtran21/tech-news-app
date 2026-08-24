#!/bin/bash

cd "$(dirname "$0")/server"

npm run migrate:up || { echo "Database migration failed. Aborting startup." >&2; exit 1; }

rm -rf ./dist/*
npx tsc
npx concurrently "npx tsc -w" "nodemon dist/src/index.js"
