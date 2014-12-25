module Ed {
    export class CommandNotImplementedError {
        name = 'CommandNotImplementedError';
        message: string;
        constructor(message) {
            this.message = message;
        }
    }

    export class ParsingError {
        name = 'ParsingError';
        message: string;
        constructor(message = '') {
            this.message = message;
        }
    }
}
