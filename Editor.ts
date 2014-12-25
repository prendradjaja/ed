/// <reference path="sync_prompt.ts" />
/// <reference path="Parser.ts" />
/// <reference path="Errors.ts" />

module Ed {
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
                this.command_handlers[name](range, args);
            } else {
                throw new CommandNotImplementedError(name);
            }
        }

        command_handlers: {[name: string]: (Range, Arguments) => void} = {
            'z': (range, args) => {
                // Example command
                console.log(range);
                console.log(args);
            },
        }
    }
}
