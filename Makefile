# TODO remove --experimental-global-customevent when Node.js 18 must not be supported anymore
# TODO remove --experimental-vm-modules when Jest supports ESM
export NODE_OPTIONS=--experimental-global-customevent --experimental-vm-modules --no-warnings=ExperimentalWarning
export NPM_CONFIG_YES=true

# TODO remove if eslint-plugin-cypress supports ESLint 9.0.0 flat config
export ESLINT_USE_FLAT_CONFIG=false

all: dist check

clean:
	rm -rf build coverage public/vendor

distclean: clean
	rm -rf dist node_modules

dist: build

check: test e2e
	npx prettier . --check
	npx eslint public/js src test

format:
	npx prettier . --write
	npx eslint --fix public/js src test

start: build
	npm start

dev: build
	npx concurrently \
		"npx nodemon src/main.js" \
		"npx browser-sync 'http://localhost:3000' public -w --port 8080 --no-open"

dev-e2e: build
	npx cypress open

test: build
	npm test

unit-tests: build
	npx jest --testPathPattern=".*\/unit\/.*"

integration-tests: build
	npx jest --testPathPattern=".*\/integration\/.*"

e2e-tests: build e2e
	npx jest --testPathPattern=".*\/e2e\/.*"

e2e: build
	node src/main.js &
	npx cypress run
	kill `lsof -t -i:3000`

watch: build
	npx jest --watch

coverage: build
	npx jest --coverage

build: version
	@if [ -n "$(CI)" ] ; then \
		echo "CI detected, run npm ci"; \
		npm ci; \
	else \
		npm install; \
	fi
	npm run build

version:
	@echo "Use Node.js $(shell node --version)"
	@echo "Use NPM $(shell npm --version)"

# Pkg supports only Node.js 18.15.0
# Pkg does not support ESM so we must create a CommonJS bundle
# Path to embedded `public` folder must changed to snapshot filesystem
sea: build
	npx rollup --external express,node:fs,node:path --file build/index.js --format cjs src/main.js
	sed -i '' "s/publicPath = '\.\/public'/publicPath = path\.join\(__dirname, '\.\.\/public'\)/g" build/index.js
	npx pkg --no-bytecode .

# Bun supports embedded static files but needs a JavaScript to import each file
sea-bun: build
	npx bun build src/main.js --compile --target=bun-darwin-x64 --outfile build/skillsharing-macos
	npx bun build src/main.js --compile --target=bun-linux-x64 --outfile build/skillsharing-linux
	npx bun build src/main.js --compile --target=bun-windows-x64 --outfile build/skillsharing-windows

.PHONY: all clean distclean dist check format start dev dev-e2e \
	test unit-tests integration-tests e2e-tests e2e watch coverage \
	build version
