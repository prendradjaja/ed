interface EvaluatedRange {
    start: number;
    end: number;
}

interface ParsedCommand {
    range: Range;
    name: string;
    args: Arguments;
}

class Arguments {
    value: string;
    constructor(value) {
        this.value = value;
    }
}

class Range {
}

class DefaultRange extends Range {
}

class OneLineRange extends Range {
    address: AddressNode;
    constructor (address) {
        super();
        this.address = address;
    }
}

class FullRange extends Range {
    start: AddressNode;
    end: AddressNode;
    constructor (start, end) {
        super();
        this.start = start;
        this.end = end;
    }
}

class WholeBufferRange extends Range {
}

class AddressNode {
}

class NumberNode extends AddressNode {
    value: number;
    constructor(value) {
        super();
        this.value = value;
    }
}

interface CommandHandler {
    (range: EvaluatedRange, args: Arguments): void;
}

interface LinesFunction {
    (lines: string[]): string[];
}

interface BufferThirds {
    first: string[];
    second: string[];
    third: string[];
}
