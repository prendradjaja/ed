/// <reference path="Errors.ts" />

module Ed {
    var PREFIX = /^((\d+)(,(\d+))?)?([A-Za-z])/;

    export type ParsedCommand = [
        Range,
        string, // command name
        Arguments
    ]

    export class Arguments {
        value: string;
        constructor(value) {
            this.value = value;
        }
    }

    export class Range {
        type: string;
    }

    export class DefaultRange extends Range {
        type = 'DefaultRange';
    }

    export class OneLineRange extends Range {
        type = 'OneLineRange';
        address: AddressNode;
        constructor (address) {
            super();
            this.address = address;
        }
    }

    export class FullRange extends Range {
        type = 'FullRange';
        start: AddressNode;
        end: AddressNode;
        constructor (start, end) {
            super();
            this.start = start;
            this.end = end;
        }
    }

    export class AddressNode {
        type: string;
    }

    export class NumberNode extends AddressNode {
        type = 'NumberNode';
        value: number;
        constructor(value) {
            super();
            this.value = value;
        }
    }

    export function parse(raw_command: string): ParsedCommand {
        var [range, name, suffix] = parse_prefix(raw_command);

        // TODO2: parse suffix

        return [range, name, new Arguments(suffix)];
    }

    function parse_prefix(raw_command: string): [Range, string, string] {
        var match = raw_command.match(PREFIX);
        var range: Range;
        if (match === null) {
            throw new ParsingError();
        } else if (typeof match[1] === 'undefined') { // p
            range = new DefaultRange();
        } else if (typeof match[3] === 'undefined') { // 1p
            range = new OneLineRange(new NumberNode(Number(match[2])));
        } else {                                      // 1,2p
            range = new FullRange(new NumberNode(Number(match[2])),
                                  new NumberNode(Number(match[4])));
        }
        var name: string = match[5];
        var suffix: string = raw_command.slice(match[0].length);
        return [range, name, suffix];
    }
}
