
test:
	@node_modules/.bin/mocha \
		--reporter spec \
		--slow 800

.PHONY: test
