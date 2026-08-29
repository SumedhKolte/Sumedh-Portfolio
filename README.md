# Sumedh-Portfolio

Personal portfolio for **Sumedh Kolte** — Full Stack Developer (MERN) & AI application builder — built as a working code editor: file tree, tabs, command palette, terminal, architecture diff view and an in-page assistant.

**Live:** _add your URL after deploying_

## Features

- **IDE shell** — activity rail, explorer, tab strip, breadcrumb, status bar
- **Boot / compile sequence** on load
- **Project-wide search** (`⇧⌘F`, the `⌕` rail button, or `grep <term>` in the terminal) — searches the text of every file, groups hits by file with match counts and highlighted snippets, click to jump
- **Live GitHub commit graph** in the sidebar — real contributions, with an offline fallback (see below)
- **Working terminal** — `help`, `whoami`, `ls`, `open <file>`, `grep <term>`, `projects`, `skills`, `stats`, `gh`, `resume`, `theme <name>`, `ask <question>`, `hire`, `clear`. Arrow keys walk command history.
- **Command palette** — `⌘K` / `Ctrl+K`, with `↑` `↓` `↵` navigation over files, themes, links and actions
- **Three themes** — obsidian, paper, high contrast. The choice persists in `localStorage`.
- **Zen mode** (`⌥Z`), tab cycling (`⌥←` / `⌥→`), terminal toggle (`⌃\``), search (`⇧⌘F`), copy-email from the status bar
- **Architecture diff view** — HarmoCare monolith → 5 domain services
- **Assistant panel** answering from a local fact base built out of the résumé — no API key, works offline
- **Deep links** — `#contact.tsx`, `#daysly.ts` etc. open that file directly
- **Responsive** — the layout reflows on the *editor's* width via container queries, so opening the assistant reflows the pane instead of squashing it; below 900px the explorer becomes an overlay
- Respects `prefers-reduced-motion`; usable with the keyboard alone; readable with JavaScript off (`<noscript>` fallback carries the contact details)

## Run locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. No build step and no dependencies — fonts are served from `assets/fonts/`, so the site also works fully offline.

## Layout

```
index.html                  markup + shell
assets/css/styles.css       theme tokens, layout, responsive rules
assets/js/data.js           content: files, pane markup, assistant fact base
assets/js/app.js            behaviour: tabs, terminal, palette, assistant
assets/fonts/               IBM Plex Mono + Space Grotesk (woff2, self-hosted)
Sumedh_Resume__2026.pdf     linked from the title bar and `resume`
```

## Editing content

Everything visible lives in `assets/js/data.js`:

- **Add a file to the editor** — add an entry to `FILES` (id, icon, colour, meta, group) and a matching key in `PANES`. Nothing in `app.js` needs to change.
- **Teach the assistant a new answer** — add `{ k: [...tokens], a: 'answer' }` to `KB`. The longest matching token wins, so use distinctive words; if nothing matches, the assistant says so and points at the email address rather than guessing.
- **Change the terminal output** — the commands are in `runCommand()` in `app.js`.

## Connecting GitHub

The sidebar commit graph is live. GitHub's own API cannot be called from a static site — the contributions calendar is GraphQL-only and needs a personal access token, which you must never ship in public JavaScript. So the graph reads a **keyless public mirror** of that calendar.

Configure it in `assets/js/data.js`:

```js
const GITHUB = {
  user: 'sumedhkolte',
  live: true,
  endpoint: 'https://github-contributions-api.jogruber.de/v4/{user}?y=last'
};
```

- `live: false` reverts to the illustrative pattern.
- The page paints the placeholder first, then swaps in real data when it arrives. If the service is down, slow (>6s), or the visitor is offline, the placeholder stays and the caption says so — the graph is never blank and never claims to be live when it isn't.
- Hovering a cell shows the date and count.

**If you would rather not depend on a third party**, the robust alternative is a GitHub Action that queries the GraphQL API on a schedule with a token held in repo secrets, writes `contributions.json` into the repo, and points `endpoint` at that file. Same graph, no external service, token never public.

## Deploy

**GitHub Pages:** Settings → Pages → Deploy from branch → `main` / root.

**Vercel / Netlify:** import the repo, no build command, output directory `.`.

## Push this to GitHub

```bash
git init && git add . && git commit -m "IDE portfolio" && git branch -M main
```

```bash
git remote add origin https://github.com/SumedhKolte/Sumedh-Portfolio.git && git push -u origin main
```

Create the empty repo first at <https://github.com/new> named `Sumedh-Portfolio`.

## Notes

- The assistant runs entirely in the browser off the fact base in `KB` — no network call, no key, no hallucinated figures.
- The résumé download expects `Sumedh_Resume__2026.pdf` next to `index.html`.
- **The phone number is deliberately not published.** No page, terminal command, assistant answer or `tel:` link exposes it; the contact panel says it is shared on request. Note that the linked résumé PDF is a separate file and still contains it — re-export the PDF without the number if that matters to you.

## Contact

sumedhkolte19@gmail.com · [LinkedIn](https://linkedin.com/in/sumedh-kolte) · [GitHub](https://github.com/sumedhkolte) · [LeetCode](https://leetcode.com/u/igdarksy/)
