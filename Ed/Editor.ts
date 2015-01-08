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
        var [range, name, args] = parse(command);
        if (name in this.command_handlers) {
            var evaluated_range = this.eval_range(range);
            var real_range = subtract_one(evaluated_range);
            this.command_handlers[name](real_range, args);
        } else {
            throw new NotImplementedError(name, 'command_handlers');
        }
    }

    eval_range(range: Range): EvaluatedRange {
        // TODO4 error handling for out-of-bounds?
        switch (range.type) {
            case 'DefaultRange':
                return [this.current_line, this.current_line];
            case 'OneLineRange':
                var address = this.eval_address((<OneLineRange> range).address);
                return [address, address];
            case 'FullRange':
                var start = this.eval_address((<FullRange> range).start);
                var end = this.eval_address((<FullRange> range).end);
                return [start, end];
            case 'WholeBufferRange':
                return [1, this.buffer.length];
            default:
                throw new NotImplementedError(range.type, 'eval_range');
        }
    }

    eval_address(address: AddressNode): number {
        if (address.type === 'NumberNode') {
            return (<NumberNode> address).value;
        } else {
            throw new NotImplementedError(address.type, 'eval_address');
        }
    }

    command_handlers: {[name: string]: CommandHandler} = {
        'e': (range, args) => {
            // after doing TODO2, args will have to be handled differently
            // TODO9: warn if buffer modified
            this.current_file = args.value.substring(1);
            var file_text = fs.readFileSync(this.current_file, 'utf8');
            this.buffer = file_text.split('\n').slice(0, -1);
            this.print(file_text.length.toString());
        },
        'Q': (range, args) => {
            this.running = false;
        },
        'n': (range, args) => {
            var start = range[0];
            var slice = this.buffer_range(range);
            for (var i in slice) {
                var line_num = +i + 1 + start;
                this.print(line_num + '\t' + slice[i]);
            }
        },
        'p': (range, args) => {
            var start = range[0];
            var slice = this.buffer_range(range);
            for (var i in slice) {
                this.print(slice[i]);
            }
        },
        'a': (range, args) => {
            if (this.buffer_empty()) {
                this.buffer = this.get_literal_input();
            } else {
                if (range[0] !== range[1]) {
                    throw new NotImplementedError('nontrivial ranges', 'command_handlers.a');
                }
                this.buffer_insert(range[0]+1, this.get_literal_input());
            }
        },
        'c': (range, args) => {
            this.buffer_replace(range, (_) => this.get_literal_input());
        },
        'd': (range, args) => {
            this.buffer_replace(range, (_) => []);
        },
    }

    buffer_empty(): boolean {
        return this.buffer.length === 0;
    }

    // Partition the buffer into three arrays based on the given range:
    // before, in, and after the range.
    buffer_thirds(range: EvaluatedRange): [string[], string[], string[]] {
        var first  = this.buffer.slice(0,        range[0]);
        var second = this.buffer.slice(range[0], range[1]+1);
        var third  = this.buffer.slice(range[1]+1);
        return [first, second, third];
    }

    // Return the given range.
    buffer_range(range: EvaluatedRange): string[] {
        return this.buffer_thirds(range)[1];
    }

    // Replace the given range with the result of calling a function on
    // the lines which are to be replaced.
    buffer_replace(range: EvaluatedRange, callback: LinesFunction): void {
        var [first, second, third] = this.buffer_thirds(range);
        second = callback(second);
        this.buffer = first
            .concat(second)
            .concat(third);
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
    return [range[0] - 1, range[1] - 1];
}
