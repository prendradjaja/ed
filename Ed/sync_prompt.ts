import _sync_prompt = require('sync-prompt');

function sync_prompt(question: string): string {
    if (!_sync_prompt.prompt.isEOF()) {
        return _sync_prompt.prompt(question);
    } else {
        throw new Error("sync-prompt EOF");
    }
}
