# Possible values: major, minor, patch or concrete version
VERSION = minor

# TODO remove --experimental-global-customevent when Node.js 18 must not be supported anymore
export NODE_OPTIONS=--experimental-global-customevent

all: dist check

clean:
	rm -rf build coverage screenshots

distclean: clean
	rm -rf dist
	rm -rf node_modules

dist: build sea-pkg

release: all
	npm version $(VERSION) -m "chore: create release v%s"
	git push
	git push --tags

start: build
	npm start

check: test
	npx eslint api src test
	npx prettier . --check

format:
	npx eslint --fix api src test
	npx prettier . --write

dev: build
	npm run dev

test: build
	npx vitest run

unit-tests: build
	npx vitest run --testPathPattern=".*\/unit\/.*"

integration-tests: build
	npx vitest run --testPathPattern=".*\/integration\/.*"

e2e-tests: build
	npx vitest run --testPathPattern=".*\/e2e\/.*"

watch: build
	npm test

coverage: build
	npx vitest --coverage

build: prepare
	npm run build

prepare: version
	@if [ -n "$(CI)" ] ; then \
		echo "CI detected, run npm ci"; \
		npm ci; \
	else \
		npm install; \
	fi
	mkdir -p screenshots

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
		api/main.js

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
	deno compile --target x86_64-unknown-linux-gnu --allow-env --allow-net --allow-read --allow-write --output dist/skillsharing-deno-linux api/main.js
	deno compile --target x86_64-apple-darwin --allow-env --allow-net --allow-read --allow-write --output dist/skillsharing-deno-macos api/main.js
	deno compile --target x86_64-pc-windows-msvc --allow-env --allow-net --allow-read --allow-write --output dist/skillsharing-deno-windows api/main.js

# SEA supports embedded static files, but it needs special JavaScript API to import each file
sea-bun: build
	bun build api/main.js --compile --target=bun-linux-x64 --outfile dist/skillsharing-bun-linux
	bun build api/main.js --compile --target=bun-darwin-x64 --outfile dist/skillsharing-bun-macos
	bun build api/main.js --compile --target=bun-windows-x64 --outfile dist/skillsharing-bun-windows

.PHONY: all clean distclean dist release start \
	check format \
	dev test unit-tests integration-tests e2e-tests watch coverage \
	build prepare version \
	bundle sea-linux sea-macos sea-windows sea-pkg sea-deno sea-bun
