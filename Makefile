export NODE_OPTIONS=--experimental-vm-modules --no-warnings=ExperimentalWarning
export NPM_CONFIG_YES=true

all: dist check

clean:
	rm -rf coverage
	rm -rf packages/*/dist

distclean: clean
	rm -rf node_modules
	rm -rf packages/*/node_modules

dist: build

check: test
	npx prettier . --check
	npx eslint packages/*/src packages/*/test

format:
	npx prettier . --write
	npx eslint --fix packages/*/src packages/*/test

start: build
	node src/main.js

dev: build
	npx concurrently "npx nodemon src/main.js" "npx browser-sync 'http://localhost:3000' public -w --port 8080"

dev-e2e: build
	npx cypress open

test: build e2e
	npx jest

unit-tests: build
	npx jest --testPathPattern=".*\/unit\/.*"

integration-tests: build
	npx jest --testPathPattern=".*\/integration\/.*"

e2e-tests: build e2e
	npx jest --testPathPattern=".*\/e2e\/.*"

e2e: build
#	node src/main.js &
#	npx cypress run
#	kill `lsof -t -i:3000`

watch: build
	npx jest --watch

coverage: build
	npx jest --coverage

build:
	@if [ -n "$(CI)" ] ; then \
		echo "CI detected, run npm ci"; \
		npm ci; \
	elif [ ! -d "node_modules" ] ; then \
		echo "No node_modules detected, run npm install"; \
		npm install; \
	fi
	npm run build --workspaces --if-present

.PHONY: all clean distclean dist check start dev dev-e2e \
	test unit-tests integration-tests e2e-tests e2e watch coverage \
	build
