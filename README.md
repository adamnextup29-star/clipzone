# ClipZone

Fan-made clip studio for **Jynxzi**, **Ron** (Stable Ronaldo), and **Los** (LosPollosTV).

Vanilla JS + Vite. No backend, no API keys, no fake clips. Saved clips live in `localStorage`. Share links encode the clip in the URL hash so anyone can open the same cut.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Drop this folder into [Bolt.new](https://bolt.new) as a Vite project. `base` is `./` so it also works on bolt.host and other static hosts.

## Edit the roster

All streamer names, platform handles, socials, and accent colors live in one file:

`src/data/streamers.js`

## Routes

Hash-based, so static hosting does not need rewrite rules:

- `#/` home
- `#/streamer/jynxzi` `#/streamer/ron` `#/streamer/los`
- `#/maker` clip maker
- `#/clips` my clips / local trending
- `#/watch/<payload>` shared clip

## Notes

- Twitch embeds set `parent` from `window.location.hostname`.
- Los’s live player uses Kick (`player.kick.com/lospollostv`); Jynxzi and Ron use Twitch.
- YouTube previews use `start` and `end` params. Twitch VOD previews use the `time` start param (Twitch has no end timestamp).
- View counts increment only for clips already saved in this browser.
