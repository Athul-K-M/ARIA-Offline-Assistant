# A.R.I.A.

**Athul's Responsive Intelligent Assistant.** A personal assistant for iPhone with a Jarvis-style holographic interface, a female voice, custom commands and local memory. The first version is fully **offline-first**: no accounts, no servers, no paid services.

## Features

- **Offline command engine:** calculator (`what is 12 plus 5 times 3`), unit conversion (`convert 5 km to miles`, `100 f in c`), time and date, system status, timers.
- **Your own commands and replies:** create, edit, delete, enable and disable them inside the app. Add alternate trigger phrases, several random replies per command, and pick from a safe list of built-in actions. No custom code can run.
- **Memory:** notes you can add by typing or by saying `remember that my dentist is on Thursday`, then search, edit and delete.
- **Voice:** text-to-speech with voice selection (Premium and Enhanced voices first, optional female-only filter), speed, pitch, preview and an on/off switch. Speech input by tapping the core.
- **Backup and restore:** save everything to a file in Files and restore it later.
- **Works offline and installs like an app:** service worker, manifest and icons included.

## Run it

It must be served over `https://` so iOS allows the microphone. The easiest way is free GitHub Pages: see [docs/IPHONE_SETUP.md](docs/IPHONE_SETUP.md) (no computer needed).

On a computer: `python3 -m http.server 8000` in this folder, then open `http://localhost:8000`.

## Repository layout

| Path | Purpose |
|---|---|
| `index.html` | App shell: every screen's markup, loads the scripts in order |
| `css/style.css` | All styling (black background, cyan HUD) |
| `js/ui.js` | Screen navigation and shared helpers |
| `js/engine.js` | Offline command engine and built-in actions |
| `js/commands.js` | Command and reply manager (storage and editor) |
| `js/chat.js` | Chat screen |
| `js/memory.js` | Notes, saved settings, backup and restore |
| `js/system.js` | Voice settings screen and system status |
| `js/voice.js` | Voice engine (speech out, speech in, tap-to-talk) |
| `js/pwa.js`, `sw.js` | Offline cache |
| `manifest.webmanifest`, `icons/` | Home-screen install details and icons |
| `tests/integration.py` | 45 automated end-to-end checks (needs a computer) |
| `docs/` | Architecture notes and iPhone setup guide |

## Honest limits

- **Speech input may need internet.** iOS decides whether recognition runs on the device. Typing always works offline.
- **No "Hey ARIA" wake word.** Web apps cannot listen in the background, so you tap the core to talk.
- **Timers only ring while the app is open.**
- **Voices are the ones installed on your iPhone.** iOS does not label gender, so the female filter is a name-based guess.
- **Data lives in the browser's storage.** iOS can clear it if the site is unused for a long time, so use Back up data.

## Roadmap

Stage 10 plans the optional online upgrade (AI providers, search, neural voices). The offline engine is kept separate so it keeps working without them. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Licence

MIT. See [LICENSE](LICENSE).
