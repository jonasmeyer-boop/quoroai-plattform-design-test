# website/ — der öffentliche Auftritt von quoroAI

Eigener Bereich für die Website. **Der Ordner ist bewusst eigenständig:**
eigene Schriften, eigenes CSS, eigene Zahlen. Er lässt sich im Ganzen
löschen, ohne dass an `entwuerfe/` etwas fehlt. Umgekehrt liest hier nichts
aus `entwuerfe/`.

Stand 2026-08-21: **go-live-fertig**, bis auf die zwei Sperren am Ende.

## Die Seiten

| Datei | Adresse live | Was es ist |
|---|---|---|
| `index.html` | `/` | Startseite. Vier Akte: weißer Nullpunkt mit dem Firmenspruch, die Belege fliegen ein, der Kopf entsteht und dreht sich, dann der Tag von 06:12 bis 23:04 und der Abend-Aufruf. |
| `plattform.html` | `/plattform/` | Das Produkt im Detail: fünf echte Flächen als Scroll-Kino, Preise mit Rechner, die Fragen. |
| `referenzen.html` | `/arbeiten/` | Die Arbeiten als laufende Bänder; wer eines anhält, bekommt ein Popup. |
| `impressum.html` | `/impressum/` | Anbieterkennzeichnung, Stand 8. Juli 2026. |
| `datenschutz.html` | `/datenschutz/` | Datenschutzerklärung, Stand 21. August 2026. |
| `agb.html` | `/agb/` | Weiterleitung in die Anwendung. |
| `404.html` | Fehlerseite | Mit Weg zurück und Impressum im Fuß. |

## Die Bausteine

| Datei | Rolle |
|---|---|
| `stil.css` | Marke, Kopf, Fuß, Knöpfe, Glas. Tokens sind eine Kopie aus `entwuerfe/system.css`. |
| `recht.css` | Leseflächen der Rechtsseiten. |
| `chrom.js` | Kante an der Kopfzeile, Menü am Telefon. |
| `kontakt.js` | Der Kontakt-Dialog samt Versand an die bestehende Edge Function. |
| `einwilligung.js` | Cookie-Banner und Google Analytics, portiert aus dem alten Auftritt. |
| `zahlen.js` | Tarife, Staffel, Gebühr. Kopie aus `entwuerfe/preise.js`. |
| `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, `llms.txt` | Für Suchmaschinen und KI-Antwortmaschinen. |
| `umleitungen.caddy` | Dauerhafte Umleitungen der alten Adressen, jede mit und ohne Schrägstrich. |
| `ausrollen.sh` | Baut den Server-Ordner. Zieht alle Pfade absolut und prüft sich selbst nach. |
| `AUSROLLEN.md` | Wie die Seiten auf den Server kommen und was danach zu prüfen ist. |

## Woher die Angaben stammen

Beträge aus `entwuerfe/preise.js`, Fragen-Kontingente aus dem Produkt-Repo
(`src/lib/plans.ts`). Anschrift, Register und Kontakt aus dem Impressum des
bestehenden Auftritts. Die Aussagen zur Verarbeitung aus dessen
Datenschutzerklärung, angepasst an das, was diese Seite wirklich tut.
Ändert sich dort etwas, wird es hier nachgezogen.

Die drei Beratungen im Beispiel (Hellwig & Partner, Nordlicht Consulting,
Kanzlei Brehm) sind erfunden und auf der Seite als erfunden gekennzeichnet.

## Bilder

Alles in WebP, zusammen 13 MB (vorher 26 MB als JPEG, bei gleicher Optik).
Einzige Ausnahme ist `bilder/teilen.jpg`, das Vorschaubild fürs Teilen.

## Vorschau

    python3 -m http.server 8099 --bind 127.0.0.1
    # http://127.0.0.1:8099/website/index.html

## Zwei Sperren vor dem Go-Live

1. **Das Formular sendet erst, wenn die Server-Regel den Supabase-Host
   kennt** — und die hängt am Supabase-Vertrag (AVV), der noch nicht
   unterschrieben ist. Bis dahin fällt der Dialog sichtbar auf das
   Mailprogramm zurück.
2. **Google Analytics braucht dieselbe Regel** für
   `googletagmanager.com` und `google-analytics.com`.

Beides steht in `AUSROLLEN.md` mit den konkreten Zeilen.
