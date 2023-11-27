export NODE_OPTIONS=--experimental-vm-modules --no-warnings=ExperimentalWarning
export NPM_CONFIG_YES=true

all: dist test e2e check

clean:
	@rm -rf coverage public/vendor

start: prepare
	@node src/main.js

dev: prepare
	@npx nodemon src/main.js

e2e: prepare
	@node src/main.js &
	@npx cypress run
	@kill `lsof -t -i:3000`

dist: prepare
	@npx rollup -c

test: prepare
	@npx jest

unit-tests: prepare
	@npx jest --testPathPattern=".*\/unit\/.*"

integration-tests: prepare
	@npx jest --testPathPattern=".*\/integration\/.*"

e2e-tests: prepare
	@npx jest --testPathPattern=".*\/e2e\/.*"

watch: prepare
	@npx jest --watch

coverage: prepare
	@npx jest --coverage

check:
	@npx prettier . --check
	@npx eslint public/js src tests

format:
	@npx prettier . --write
	@npx eslint --fix public/js src tests

prepare:
	@if [ -n "$(CI)" ] ; then \
		npm ci; \
	elif [ ! -d "node_modules" ] ; then \
		npm install; \
	fi

.PHONY: all \
	clean \
	start \
	dev \
	e2e \
	dist \
	test \
	unit-tests \
	integration-tests \
	e2e-tests \
	watch \
	coverage \
	check \
	format \
	prepare
