test:
	prove -lv --ext=.js --exec=node t/*
test-setup:
	npm install qunit-tap
	npm install request 

.PHONY: test test-setup
