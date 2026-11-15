# Architecture

## Load order

`index.html` loads the scripts in this order. They are plain scripts that share one global scope, so the order matters.

`ui.js` then `engine.js` then `commands.js` then `chat.js` then `memory.js` then `system.js` then `voice.js` then `pwa.js`

Functions are only called after everything has loaded, so a file may use something defined in a later file at runtime. Do not run code at load time that needs a later file.

## How a message is handled

1. Text arrives from the chat box or from speech recognition.
2. `run(text)` in `engine.js` normalises it (lower case, no punctuation).
3. Your enabled commands and replies are checked first (exact phrase match).
4. If none match, built-in skills run in order: notes, calculator, converter, timer.
5. Otherwise a friendly "I don't have a command for that yet" reply is returned.
6. The reply is shown and spoken by `Voice.speak()`.

## Stored data (browser local storage)

| Key | Contents |
|---|---|
| `aria.cmds` | Commands and replies: `{t: [phrases], a: action, r: [replies], on: 0 or 1}` |
| `aria.notes` | Notes: `{text, ts}` |
| `aria.set` | Voice, speed, pitch, name, reduce motion, personality sliders |

Backups are one JSON file containing all three. Restore validates the file before replacing anything.

## Extending

- **New built-in action:** add a function to the `A` object in `engine.js` and a label to `LBL` in `commands.js`. Only actions in `A` can be assigned to commands.
- **New voice provider:** replace the `Voice` object in `voice.js`. It needs `speak(text)` and `listen({interim, final, end, error})`.
- **Online upgrade:** the single place to plug in is the fallback at the end of `run()`: when nothing offline matches, an online provider can answer. Offline features must never depend on it.
- **New file:** add it to `FILES` in `sw.js` and change `VERSION` so phones refresh their cache.

## Safety rules kept on purpose

- No `eval` or dynamic code: the calculator is a small hand-written parser.
- Custom commands can only use whitelisted actions.
- User text is escaped before it is shown, including text restored from a backup.
