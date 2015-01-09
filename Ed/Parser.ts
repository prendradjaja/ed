var PREFIX = /^((\d+)(,(\d+))?)?([A-Za-z])/;

function parse(raw_command: string): ParsedCommand {
    if (raw_command === ',n') {
        var range = new WholeBufferRange();
        var name = 'n';
        var suffix = '';
    } else if (raw_command === ',p') {
        var range = new WholeBufferRange();
        var name = 'p';
        var suffix = '';
    } else {
        var cmd = parse_prefix(raw_command);
        var range = cmd.range;
        var name = cmd.name;
        var suffix = cmd.suffix;

        // TODO2: parse suffix
    }
    return {range: range, name: name, args: new Arguments(suffix)};
}

function parse_prefix(raw_command: string): {range: Range; name: string; suffix: string} {
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
    return {range: range, name: name, suffix: suffix};
}
