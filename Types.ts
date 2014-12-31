module Ed {
    export type EvaluatedRange = [number, number];

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

    export class WholeBufferRange extends Range {
        type = 'WholeBufferRange';
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

    export type CommandHandler =
        (range: EvaluatedRange, args: Arguments) => void;

    export type LinesFunction =
        (lines: string[]) => string[];
}
