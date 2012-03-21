test:
	node t/001_basic.js
test-setup:
	npm install qunit-tap
	npm install request 

.PHONY: test test-setup
