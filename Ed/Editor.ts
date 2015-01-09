/// <reference path="/home/pandu/c/dtyped/node/node.d.ts" />

import fs = require('fs');

export class Editor {
    buffer: string[] = [];
    current_line: number = -1; // value not defined when buffer is empty
    verbose_help: boolean = true; // TODO1 false
    prompt_string: string = "> "; // TODO1 ""
    current_file: string = '';
        // current_file corresponds to the "default filename" referred to in
        // the ed manpage. If there is no default filename, the value is the
        // empty string ''.
    running: boolean = true;
    input: (s: string) => string = sync_prompt;
    print: (s: string) => void = console.log;

    constructor(options = {}) {
        if ('debug' in options && options['debug'] === true) {
            this.prompt_string = "?";
            this.print = options['print'] || this.print;
            this.input = options['input'] || this.input;
        } else {
            for (var key in options) {
                throw new NotImplementedError('options', 'Editor constructor');
            }
        }
    }

    main_loop(): void {
        while (this.running) {
            var command = this.input(this.prompt_string);
            this.process_command(command);
        }
    }

    process_command(command: string): void {
        var cmd = parse(command);
        if (cmd.name in this.command_handlers) {
            var evaluated_range = this.eval_range(cmd.range);
            var real_range = subtract_one(evaluated_range);
            this.command_handlers[cmd.name](real_range, cmd.args);
        } else {
            throw new NotImplementedError(cmd.name, 'command_handlers');
        }
    }

    eval_range(range: Range): EvaluatedRange {
        // TODO4 error handling for out-of-bounds?
        if (range instanceof DefaultRange) {
            return {start: this.current_line, end: this.current_line};
        } else if (range instanceof OneLineRange) {
            var address = this.eval_address((<OneLineRange> range).address);
            return {start: address, end: address};
        } else if (range instanceof FullRange) {
            var start = this.eval_address((<FullRange> range).start);
            var end = this.eval_address((<FullRange> range).end);
            return {start: start, end: end};
        } else if (range instanceof WholeBufferRange) {
            return {start: 1, end: this.buffer.length};
        } else {
            throw new NotImplementedError('some Range subclass', 'eval_range');
        }
    }

    eval_address(address: Address): number {
        if (address instanceof NumberAddress) {
            return (<NumberAddress> address).value;
        } else {
            throw new NotImplementedError('some Address subclass', 'eval_address');
        }
    }

    command_handlers: {[name: string]: CommandHandler} = {
        'e': (range, args) => {
            // TODO9: warn if buffer modified
            this.current_file = (<FilenameArg> args).value;
            var file_text = fs.readFileSync(this.current_file, 'utf8');
            this.buffer = file_text.split('\n').slice(0, -1);
            this.print(file_text.length.toString());
        },
        'Q': (range, args) => {
            this.running = false;
        },
        'n': (range, args) => {
            var start = range.start;
            var slice = this.buffer_range(range);
            for (var i in slice) {
                var line_num = +i + 1 + start;
                this.print(line_num + '\t' + slice[i]);
            }
        },
        'p': (range, args) => {
            var start = range.start;
            var slice = this.buffer_range(range);
            for (var i in slice) {
                this.print(slice[i]);
            }
        },
        'a': (range, args) => {
            if (this.buffer_empty()) {
                this.buffer = this.get_literal_input();
            } else {
                if (range.start !== range.end) {
                    throw new NotImplementedError('nontrivial ranges', 'command_handlers.a');
                }
                this.buffer_insert(range.start+1, this.get_literal_input());
            }
        },
        'c': (range, args) => {
            this.buffer_replace(range, (_) => this.get_literal_input());
        },
        'd': (range, args) => {
            this.buffer_replace(range, (_) => []);
        },
        't': (range, args) => {
            var copied_lines = this.buffer_range(range);
            var index = (<LineNumArg> args).value - 1;
            this.buffer_insert(index + 1, copied_lines);
        },
    }

    buffer_empty(): boolean {
        return this.buffer.length === 0;
    }

    // Partition the buffer into three arrays based on the given range:
    // before, in, and after the range.
    buffer_thirds(range: EvaluatedRange): BufferThirds {
        var first  = this.buffer.slice(0,        range.start);
        var second = this.buffer.slice(range.start, range.end+1);
        var third  = this.buffer.slice(range.end+1);
        return {first: first, second: second, third: third};
    }

    // Return the given range.
    buffer_range(range: EvaluatedRange): string[] {
        return this.buffer_thirds(range).second;
    }

    // Replace the given range with the result of calling a function on
    // the lines which are to be replaced.
    buffer_replace(range: EvaluatedRange, callback: LinesFunction): void {
        var x = this.buffer_thirds(range);
        x.second = callback(x.second);
        this.buffer = x.first
            .concat(x.second)
            .concat(x.third);
    }

    // Insert some lines into the buffer before the given index.
    buffer_insert(index: number, lines: string[]) {
        var first_half = this.buffer.slice(0, index);
        var second_half = this.buffer.slice(index);
        this.buffer = first_half
            .concat(lines)
            .concat(second_half);
    }

    get_literal_input(): string[] {
        var line = this.input('');
        var result = [];
        while (line !== '.') {
            result.push(line);
            line = this.input('');
        }
        return result;
    }
}

function subtract_one(range: EvaluatedRange): EvaluatedRange {
    return {start: range.start - 1, end: range.end - 1};
}
