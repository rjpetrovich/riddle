# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A tiny static HTML/CSS/JS "riddle gate" page. There is no build system, no package manager, and no test suite — just static files served directly by a browser or any static file server.

## Running it

There are no build/lint/test commands. To view the site, open `index.html` directly in a browser or serve the directory with any static file server, e.g.:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000/index.html`.

## Architecture / flow

- `index.html` — the riddle form. Displays two German riddles (with a Spanish hint) as prompts for a username/password-style form (`name=login`, `name=password`). Submitting calls `ir()`.
- `inicio.js` — defines `ir()`, which checks `document.form.login.value` and `document.form.password.value` against two hardcoded Spanish answers. On a correct match it alerts success and redirects to `video.html`; otherwise it alerts a German failure message and the user retries.
- `video.html` — the "reward" page shown after solving the riddle, containing a single button linking out to a Google Drive file.
- `assets/` — vendored third-party static assets (Bootstrap CSS/JS, Font Awesome, OWL Carousel, custom fonts, images, `assets/css/style.css`) plus `assets/js/incio.js`, an unused duplicate/older copy of the root `inicio.js` (note the typo'd filename — the root `inicio.js` is the one actually referenced by `index.html`).

## Conventions to know

- The riddle answers live in plain text in `inicio.js` (`"la nariz"` and `"el corazon"`) — this is a novelty/personal page, not a security boundary. Don't "fix" this into a real auth system unless asked.
- Page copy mixes German and Spanish intentionally (per the on-page hint: "Todo se escribe en minuscula y SIN ACENTO" — answers must be lowercase, no accents). Preserve this bilingual style when editing riddle text.
- `assets/` is vendored third-party template code (originally a "Youtubers" Bootstrap template) — avoid modifying files under `assets/css`, `assets/js`, `assets/fonts` unless the task specifically requires changing vendored assets; prefer changes in `index.html`, `video.html`, `inicio.js`, and `assets/css/style.css` (the template's own override stylesheet).
