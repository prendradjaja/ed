/// <reference path="Errors.ts" />
/// <reference path="Types.ts" />

module Ed {
    var PREFIX = /^((\d+)(,(\d+))?)?([A-Za-z])/;

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
