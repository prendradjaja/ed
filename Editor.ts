/// <reference path="sync_prompt.ts" />
/// <reference path="Parser.ts" />
/// <reference path="Errors.ts" />
/// <reference path="Types.ts" />

module Ed {
    export class Editor {
        buffer: string[] = [];
        current_line: number = -1; // value not defined when buffer is empty
        verbose_help: boolean = true; // TODO1 false
        prompt_string: string = "> "; // TODO1 ""

        main_loop(): void {
            while (true) {
                var command = sync_prompt(this.prompt_string);
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

        eval_range(range): EvaluatedRange {
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

        command_handlers: {[name: string]: (range: EvaluatedRange, args: Arguments) => void} = {
            'z': (range, args) => {
                // Example command
                console.log(range);
                console.log(args);
            },
            'Z': (range, args) => {
                // Another example command. This is an implementation of ,n
                for (var i in this.buffer) {
                    console.log((+i + 1) + '\t' + this.buffer[i]);
                }
            },
            'a': (range, args) => {
                if (this.buffer_empty()) {
                    this.buffer = get_literal_input();
                } else {
                    if (range[0] !== range[1]) {
                        throw new NotImplementedError('nontrivial ranges', 'command_handlers.a');
                    }
                    var first_half = this.buffer.slice(0, range[0]+1);
                    var second_half = this.buffer.slice(range[0]+1);
                    this.buffer = first_half
                        .concat(get_literal_input())
                        .concat(second_half);
                }
            },
        }

        buffer_empty(): boolean {
            return this.buffer.length === 0;
        }
    }

    function subtract_one(range: EvaluatedRange): EvaluatedRange {
        return [range[0] - 1, range[1] - 1];
    }

    function get_literal_input(): string[] {
        var line = sync_prompt('');
        var result = [];
        while (line !== '.') {
            result.push(line);
            line = sync_prompt('');
        }
        return result;
    }
}
