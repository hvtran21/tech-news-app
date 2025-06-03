#!/bin/bash

cd "$(dirname "$0")/server"
npx tsc
npx tsc -w & 
npx nodemon dist/index.js
