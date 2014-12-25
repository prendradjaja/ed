/// <reference path="sync_prompt.ts" />
/// <reference path="Parser.ts" />
/// <reference path="Errors.ts" />

module Ed {

    type EvaluatedRange = [number, number];

    export class Editor {
        buffer: string[] = [];
        current_line: number = -1; // -1 when buffer is empty
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
                this.current_line = evaluated_range[1];
                this.command_handlers[name](evaluated_range, args);
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

        command_handlers: {[name: string]: (EvaluatedRange, Arguments) => void} = {
            'z': (range, args) => {
                // Example command
                console.log(range);
                console.log(args);
            },
        }
    }
}
