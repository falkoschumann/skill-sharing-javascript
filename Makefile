# TODO remove --experimental-global-customevent when Node.js 18 must not be supported anymore
# TODO remove --experimental-vm-modules when Jest supports ESM
export NODE_OPTIONS=--experimental-global-customevent --experimental-vm-modules --no-warnings=ExperimentalWarning
export NPM_CONFIG_YES=true

# TODO remove if eslint-plugin-cypress supports ESLit 9.0.0 flat config
export ESLINT_USE_FLAT_CONFIG=false

all: dist check

clean:
	rm -rf coverage public/vendor

distclean: clean
	rm -rf node_modules

dist: build

check: test e2e
	npx prettier . --check
	npx eslint public/js src tests

format:
	npx prettier . --write
	npx eslint --fix public/js src tests

start: build
	node src/main.js

dev: build
	npx concurrently "npx nodemon src/main.js" "npx browser-sync 'http://localhost:3000' public -w --port 8080"

dev-e2e: build
	npx cypress open

test: build
	npx jest

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

build:
	@if [ -n "$(CI)" ] ; then \
		echo "CI detected, run npm ci"; \
		npm ci; \
	else \
		npm install; \
	fi
	npx rollup -c

.PHONY: all clean distclean dist check start dev dev-e2e \
	test unit-tests integration-tests e2e-tests e2e watch coverage \
	build
