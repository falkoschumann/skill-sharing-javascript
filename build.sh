#!/usr/bin/env bash

if [ -n "$CI" ] ; then
  echo "Build in CI environment"
  npm ci
elif [ ! -d "node_modules" ] ; then
  npm install
fi

task=$1
case $task in
  start) npm start ;;
  clean) npm run clean ;;
  format) npm run format ;;
  test) npm test ;;
  unit-tests) npm test -- --testPathPattern=".*\/unit\/.*" ;;
  integration-tests) npm test -- --testPathPattern=".*\/integration\/.*" ;;
  e2e-tests) npm test -- --testPathPattern=".*\/e2e\/.*" ;;
  *) npm run build ;;
esac
