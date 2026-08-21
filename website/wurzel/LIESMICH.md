# Was hier liegt und warum

Diese Dateien liegen live in der **Wurzel** von quoroai.io und werden von
außen unter genau dieser Adresse abgefragt — nicht von unseren Seiten, deshalb
findet sie kein Verweis im Markup:

- **Symbole** (`favicon.ico`, `apple-icon.png`, `icon*.png`, `icon.svg`):
  Browser fragen `/favicon.ico` blind ab, ohne dass es irgendwo verlinkt ist.
- **`opengraph-image.png`**: das Vorschaubild aller Links, die bisher geteilt
  wurden. Slack, LinkedIn und WhatsApp haben die Adresse gespeichert; fehlt die
  Datei, zeigen alte Beiträge eine leere Karte. Unsere Seiten verweisen auf
  `bilder/teilen.jpg` — das ist das neue Bild, dieses hier ist das alte.
- **Logos** (`quoro-logo.png`, `quoro-mark*.svg`): von außen einbindbar.

Am 21.08.2026 aus dem laufenden Auftritt gezogen, bevor ein `rsync --delete`
sie entfernt hätte. Der Trockenlauf hatte alle zehn in der Löschliste.

`ausrollen.sh` kopiert diesen Ordner flach in die Docroot-Wurzel.

**Nicht übernommen** wurden die Next.js-Innereien, die daneben lagen
(`__next.*.txt`, `index.txt`, `file.svg`, `globe.svg`, `next.svg`,
`vercel.svg`, `window.svg`): Bauwerk des alten Gerüsts, kein Besucher und
keine Maschine fragt sie. `llms-full.txt` fällt ebenfalls weg, weil sie den
alten Inhalt beschreibt — die Adresse bekommt stattdessen eine Weiterleitung
auf `/llms.txt`.
