#!/usr/bin/env bash

if [ -n "$CI" ] ; then
  echo "Build in CI environment"
  npm ci
elif [ ! -d "node_modules" ] ; then
  npm install
fi

task=$1
case $task in
  start) npm run start ;;
  clean) npm run clean ;;
  format) npm run format ;;
  test) npm run test ;;
  unit-tests) npm run test -- --testPathPattern=".*\/unit\/.*" ;;
  integration-tests) npm run test -- --testPathPattern=".*\/integration\/.*" ;;
  e2e-tests) npm run test -- --testPathPattern=".*\/e2e\/.*" ;;
  *) npm run build ;;
esac
