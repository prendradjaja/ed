type EvaluatedRange = [number, number];

type ParsedCommand = [
    Range,
    string, // command name
    Arguments
]

class Arguments {
    value: string;
    constructor(value) {
        this.value = value;
    }
}

class Range {
    type: string;
}

class DefaultRange extends Range {
    type = 'DefaultRange';
}

class OneLineRange extends Range {
    type = 'OneLineRange';
    address: AddressNode;
    constructor (address) {
        super();
        this.address = address;
    }
}

class FullRange extends Range {
    type = 'FullRange';
    start: AddressNode;
    end: AddressNode;
    constructor (start, end) {
        super();
        this.start = start;
        this.end = end;
    }
}

class WholeBufferRange extends Range {
    type = 'WholeBufferRange';
}

class AddressNode {
    type: string;
}

class NumberNode extends AddressNode {
    type = 'NumberNode';
    value: number;
    constructor(value) {
        super();
        this.value = value;
    }
}

type CommandHandler =
    (range: EvaluatedRange, args: Arguments) => void;

type LinesFunction =
    (lines: string[]) => string[];
