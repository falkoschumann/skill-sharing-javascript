#!/usr/bin/env bash

task=$1
case $task in
  clean) npm run clean ;;
  format) npm run format ;;
  test) npm run test ;;
  unit-tests) npm run test -- --testPathPattern=".*\/unit\/.*" ;;
  integration-tests) npm run test -- --testPathPattern=".*\/integration\/.*" ;;
  e2e-tests) npm run test -- --testPathPattern=".*\/e2e\/.*" ;;
  *) npm run build ;;
esac
