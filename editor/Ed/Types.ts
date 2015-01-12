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
}

class EmptyArgs extends Arguments {
}

class FilenameArg extends Arguments {
    value: string;
    constructor(filename: string) {
        super();
        this.value = filename;
    }
}

class LineNumArg extends Arguments {
    value: number;
    constructor(line_num: number) {
        super();
        this.value = line_num;
    }
}

class Range {
}

class DefaultRange extends Range {
}

class OneLineRange extends Range {
    address: Address;
    constructor (address) {
        super();
        this.address = address;
    }
}

class FullRange extends Range {
    start: Address;
    end: Address;
    constructor (start, end) {
        super();
        this.start = start;
        this.end = end;
    }
}

class WholeBufferRange extends Range {
}

class Address {
    offset: number;
}

class NumberAddress extends Address {
    value: number;
    constructor(value, offset) {
        super();
        this.value = value;
        this.offset = offset;
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
