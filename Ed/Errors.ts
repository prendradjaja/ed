class NotImplementedError {
    name = 'NotImplementedError';
    message: string;
    constructor(feature, component) {
        this.message = feature + ' not implemented in ' + component;
    }
}

class ParsingError {
    name = 'ParsingError';
    message: string;
    constructor(message = '') {
        this.message = message;
    }
}
