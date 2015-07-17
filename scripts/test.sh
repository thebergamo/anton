#!/bin/bash

export NODE_ENV=test
export BLUEBIRD_DEBUG=1

# Die on any error
set -e

echo "Clear temp logs"

echo "Run unit tests"

# Run unit tests
node ./node_modules/.bin/istanbul cover --root "./lib" _mocha -- -R spec -t 35000 $MOCHA_ARGS "./test/**/*.spec.js"
if [ ! -z "$EXPORT_COVERAGE" ]; then
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

	rm -rf ./coverage
fi

echo "Kill test process"

echo "Done"


