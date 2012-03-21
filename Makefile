test:
	node t/test/node-test.js
test-setup:
	npm install qunit-tap
	npm install request 

.PHONY: test test-setup
