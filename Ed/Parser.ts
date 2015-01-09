var PREFIX = /^((\d+)(,(\d+))?)?([A-Za-z])/;

function parse(raw_command: string): ParsedCommand {
    if (raw_command === ',n') {
        var range = new WholeBufferRange();
        var name = 'n';
        var args = new EmptyArgs();
    } else if (raw_command === ',p') {
        var range = new WholeBufferRange();
        var name = 'p';
        var args = new EmptyArgs();
    } else {
        var cmd = parse_prefix(raw_command);
        var range = cmd.range;
        var name = cmd.name;
        var suffix = cmd.suffix;
        var args = parse_suffix(suffix, name);
    }
    return {range: range, name: name, args: args};
}

function parse_prefix(raw_command: string): {range: Range; name: string; suffix: string} {
    var match = raw_command.match(PREFIX);
    var range: Range;
    if (match === null) {
        throw new ParsingError();
    } else if (typeof match[1] === 'undefined') { // p
        range = new DefaultRange();
    } else if (typeof match[3] === 'undefined') { // 1p
        range = new OneLineRange(new NumberAddress(Number(match[2]), 0));
    } else {                                      // 1,2p
        range = new FullRange(new NumberAddress(Number(match[2]), 0),
                              new NumberAddress(Number(match[4]), 0));
    }
    var name: string = match[5];
    var suffix: string = raw_command.slice(match[0].length);
    return {range: range, name: name, suffix: suffix};
}

function parse_suffix(suffix: string, cmd_name: string): Arguments {
    switch (cmd_name) {
        case 'a':
        case 'c':
        case 'd':
        case 'h':
        case 'H':
        case 'i':
        case 'l':
        case 'p':
        case 'n':
        case 'P':
        case 'q':
        case 'Q':
            return parse_suffix_empty(suffix);
        case 'e':
        case 'r':
        case 'w':
            return parse_suffix_filename(suffix);
        case 'm':
        case 't':
            return parse_suffix_line_num(suffix);
    }
}

function parse_suffix_empty(suffix: string) {
    if (suffix === "") {
        return new EmptyArgs();
    } else {
        throw "no suffix allowed"; // depends on TODO13
    }
}

function parse_suffix_filename(suffix: string) {
    // TODO14 this is more complicated
    return new FilenameArg(suffix.substring(1));
}

function parse_suffix_line_num(suffix: string) {
    // TODO14 so is this
    return new LineNumArg(+suffix);
}
