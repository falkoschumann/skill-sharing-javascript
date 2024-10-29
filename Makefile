export PORT=3000
export DEV_PORT=8080

# TODO remove --experimental-global-customevent when Node.js 18 must not be supported anymore
# TODO remove --experimental-vm-modules when Jest supports ESM
export NODE_OPTIONS=--experimental-global-customevent --experimental-vm-modules
export NPM_CONFIG_YES=true

all: dist check

clean:
	rm -rf build coverage public/vendor screenshots

distclean: clean
	rm -rf dist node_modules

dist: build sea-pkg

check: test
	npx prettier . --check
	npx eslint public/js lib test

format:
	npx prettier . --write
	npx eslint --fix public/js lib test

start: build
	npm start

dev: build
	npx concurrently \
		"npx nodemon lib/main.js" \
		"npx browser-sync 'http://localhost:$(PORT)' public -w --port $(DEV_PORT) --no-open"

test: build
	npm test

unit-tests: build
	npx jest --testPathPattern=".*\/unit\/.*"

integration-tests: build
	npx jest --testPathPattern=".*\/integration\/.*"

e2e-tests: build
	npx jest --testPathPattern=".*\/e2e\/.*"

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

bundle: build
	npx rollup \
		--failAfterWarnings \
		--plugin commonjs \
		--plugin json \
		--plugin 'node-resolve={preferBuiltins: true}' \
		--file build/index.js \
		--format cjs \
		lib/main.js

# SEA does not support cross-compilation
# SEA supports embedded static files, but it needs special JavaScript API to import each file
sea-linux: bundle
	node --experimental-sea-config sea-config.json
	cp $(shell command -v node) build/skillsharing
	chmod 777 build/skillsharing
	npx postject build/skillsharing NODE_SEA_BLOB build/sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

sea-macos: bundle
	node --experimental-sea-config sea-config.json
	cp $(shell command -v node) build/skillsharing
	chmod 777 build/skillsharing
	codesign --remove-signature build/skillsharing
	npx postject build/skillsharing NODE_SEA_BLOB build/sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --macho-segment-name NODE_SEA
	codesign --sign - build/skillsharing

sea-windows: bundle
	node --experimental-sea-config sea-config.json
	node -e "require('fs').copyFileSync(process.execPath, 'build/skillsharing.exe')"
	signtool remove /s build/skillsharing.exe
	npx postject build/skillsharing.exe NODE_SEA_BLOB build/sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
	signtool sign /fd SHA256 build/skillsharing.exe

# Pkg supports only Node.js 18.15.0
# Pkg does not support ESM so we must create a CommonJS bundle
# Path to embedded `public` folder must changed to snapshot filesystem
sea-pkg: bundle
	sed -i.bak -r "s/path\.join\('\.\//path\.join\(__dirname, '\.\.\//g" build/index.js
	npx pkg --no-bytecode .

# Deno does not support embedded static files
sea-deno: build
	deno compile --target x86_64-unknown-linux-gnu --allow-env --allow-net --allow-read --allow-write --output dist/skillsharing-deno-linux lib/main.js
	deno compile --target x86_64-apple-darwin --allow-env --allow-net --allow-read --allow-write --output dist/skillsharing-deno-macos lib/main.js
	deno compile --target x86_64-pc-windows-msvc --allow-env --allow-net --allow-read --allow-write --output dist/skillsharing-deno-windows lib/main.js

# SEA supports embedded static files, but it needs special JavaScript API to import each file
sea-bun: build
	bun build lib/main.js --compile --target=bun-linux-x64 --outfile dist/skillsharing-bun-linux
	bun build lib/main.js --compile --target=bun-darwin-x64 --outfile dist/skillsharing-bun-macos
	bun build lib/main.js --compile --target=bun-windows-x64 --outfile dist/skillsharing-bun-windows

.PHONY: all clean distclean dist check format start \
	dev test unit-tests integration-tests e2e-tests watch coverage \
	build version \
	bundle sea-linux sea-macos sea-windows sea-pkg sea-deno sea-bun
