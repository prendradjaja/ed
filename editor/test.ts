/// <reference path="/home/pandu/c/dtyped/node/node.d.ts" />
/// <reference path="/home/pandu/c/dtyped/underscore/underscore.d.ts" />

import _ = require('underscore');
import fs = require('fs');
import Ed = require('./Ed');

interface Line {
    mode:Mode;
    text:string;
}

interface TestResult {
    success: boolean;
    info: string;
}

enum Mode { LoadFile, Command, Input, Output }

var TEST_DIR = 'tests';
var TEST_DATA_DIR = 'test-data';
var VERBOSE = false;

var SUCCESS = {};

class Test {
    line_num: number;
    lines: Line[];
    editor: Ed.Editor;

    constructor(path: string) {
        var test_case = fs.readFileSync(path, 'utf8');
        this.line_num = 0;
        this.lines = _.map(to_lines(test_case), parse_line);
        this.editor = new Ed.Editor({
            debug: true,
            print: this.print.bind(this),
            input: this.input.bind(this)
        });
    }

    run(): TestResult {
        this.maybe_loadfile();
        try {
            this.editor.main_loop();
        } catch (e) {
            if (e === SUCCESS) {
                return {success: true, info: ""};
            } else if (typeof e === 'string') {
                return {success: false, info: e};
            } else {
                throw e;
            }
        }
    }

    expected_mode(): Mode {
        return this.lines[this.line_num].mode;
    }

    expected_text(): string {
        return this.lines[this.line_num].text;
    }

    input(question:string): string {
        if (this.line_num === this.lines.length) {
            throw SUCCESS;
        }

        var input_mode:Mode = parse_question(question);
        if (this.expected_mode() !== input_mode) {
            this.fail("mode", Mode[input_mode], Mode[this.expected_mode()]);
        } else {
            var text = this.expected_text();
            this.line_num++;
            return text;
        }
    }

    print(text:string): void {
        if (this.expected_mode() !== Mode.Output)
            this.fail("mode", "Output", Mode[this.expected_mode()]);
        else if (text !== this.expected_text()) {
            this.fail("output text", text, this.expected_text());
        } else {
            this.line_num++;
        }
    }

    fail(value_name:string, actual:string, expected): void {
        throw "  at line " + this.line_num + " (" + this.expected_text() + ")\n  " +
            value_name + ' was "' + actual + '", expected "' + expected + '"';
    }

    maybe_loadfile(): void {
        var mode = this.lines[0].mode;
        var text = this.lines[0].text;
        if (mode === Mode.LoadFile) {
            var file_text = fs.readFileSync(TEST_DATA_DIR + '/' + text, 'utf8');
            this.editor.buffer = to_lines(file_text);
            this.line_num++;
        }
    }
}

function parse_line(line:string): Line {
    var mode = parse_mode_prefix(line.substring(0, 1));
    var text = line.substring(1);
    return {mode:mode, text:text};
}

function parse_mode_prefix(prefix:string): Mode {
    switch (prefix) {
        case '~': return Mode.LoadFile;
        case '?': return Mode.Command;
        case '>': return Mode.Input;
        case '<': return Mode.Output;
        default: throw "bad mode prefix";
    }
}

function parse_question(question:string): Mode {
    switch (question) {
        case '?': return Mode.Command;
        case '':  return Mode.Input;
        default: throw "bad question";
    }
}

function to_lines(file_text:string): string[] {
    return file_text.split('\n').slice(0, -1);
}

function main() {
    var categories = fs.readdirSync(TEST_DIR);

    var tests_run: number = 0;
    var tests_failed: string[] = [];

    for (var i in categories) {
        var category = categories[i];
        var tests = fs.readdirSync(TEST_DIR + '/' + category);

        for (var j in tests) {
            var test_path = TEST_DIR + '/' + category + '/' + tests[j];
            var result = new Test(test_path).run();
            tests_run++;

            if (!result.success) {
                tests_failed.push(test_path);
                console.log('=========================================================');
                console.log('FAILED: ' + test_path);
                console.log(result.info);
                console.log('=========================================================');
            } else if (VERBOSE) {
                console.log('PASSED: ' + test_path);
            }
        }
    }

    console.log('\nSummary:');
    console.log(tests_run + " tests run.");
    if (tests_failed.length > 0) {
        console.log(tests_failed.length + " failed.");
    } else {
        console.log('All passed!');
    }
}

main();
