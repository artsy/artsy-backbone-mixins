BIN = node_modules/.bin

test:
	$(BIN)/mocha

.PHONY: test