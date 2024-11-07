[![Build](https://github.com/falkoschumann/skill-sharing-javascript/actions/workflows/build.yml/badge.svg)](https://github.com/falkoschumann/skill-sharing-javascript/actions/workflows/build.yml)

# Skill Sharing

Implementation of the final example project from the book
[Eloquent JavaScript](https://eloquentjavascript.net).

## Installation

## Usage

Start the server with `npm start` and open http://localhost:3000 in the browser.

## Contributing

The `Makefile` runs the build as default task. Other tasks are

-   `start`: start the server
-   `test`: run all tests,
-   `format`: format source code

## Credits

## Open issues

-   [ ] Migrate Makefile to Deno
-   [ ] Use supertest with URL instead of Express.js app:
        `request('http://localhost:3333');`
-   [ ] Replace Prettier with `deno fmt`
-   [ ] Replace ESLint with `deno lint`
-   [ ] Add copyright header to all source files
        `// Copyright (c) 2024 Falko Schumann. All rights reserved. MIT license.`
