declare function require(name: string);

var _sync_prompt = require('sync-prompt').prompt;
function sync_prompt(question: string): string {
    if (!_sync_prompt.isEOF()) {
        return _sync_prompt(question);
    } else {
        throw new Error("sync-prompt EOF");
    }
}
