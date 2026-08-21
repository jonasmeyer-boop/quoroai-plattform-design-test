# Die Website ausrollen

Diese Seiten sind statisch: reine Dateien, kein Bauschritt, kein Server-Code.
Wer sie ausliefert, kopiert den Ordner und setzt drei Regeln.

## Adressen

Auf dem Server müssen die Dateien als Verzeichnisse liegen, damit die
Adressen so aussehen wie bisher:

| Datei hier | Adresse live |
|---|---|
| `index.html` | `/` |
| `plattform.html` | `/plattform/` |
| `referenzen.html` | `/arbeiten/` |
| `impressum.html` | `/impressum/` |
| `datenschutz.html` | `/datenschutz/` |
| `agb.html` | `/agb/` |
| `404.html` | Fehlerseite |

Beim Kopieren also `plattform.html` nach `plattform/index.html` legen und so
weiter. `bilder/`, `schriften/`, `stil.css`, `recht.css` und die drei
Skriptdateien liegen flach daneben.

## Umleitungen

`umleitungen.caddy` enthält 42 dauerhafte Umleitungen für die Adressen des
alten Auftritts plus drei Sammelregeln. Ohne sie liefert der Server nach dem
Wechsel hunderte Fehlerseiten, und Google straft ab.

## Was der Server erlauben muss

Die Sicherheitsregel (CSP) auf der Box muss zwei Hosts kennen, sonst
funktionieren Analyse und Formular nicht:

- `https://www.googletagmanager.com` für Google Analytics (`script-src`),
  `https://*.google-analytics.com` für den Datenversand (`connect-src`),
- `https://uqfiodcqpssyflynzgoc.supabase.co` für das Kontaktformular
  (`connect-src`).

**Achtung:** Die Freischaltung des Formular-Hosts hängt am Supabase-Vertrag
(AVV), der noch nicht unterschrieben ist. Solange er fehlt, bleibt die Regel
bewusst zu; das Formular fällt dann sichtbar auf das Mailprogramm zurück.

## Prüfen nach dem Ausrollen

1. Startseite lädt, das Kino läuft beim Scrollen.
2. Cookie-Banner erscheint, **vor** der Zustimmung liegt kein
   `googletagmanager`-Skript im Quelltext.
3. Nach „Ablehnen" ist kein `_ga`-Cookie da.
4. `/impressum/`, `/datenschutz/`, `/agb/` erreichbar.
5. Eine alte Adresse aufrufen, etwa `/branchen/maschinenbau/`, muss mit 301
   auf `/` gehen.
6. Eine erfundene Adresse muss die 404-Seite zeigen, mit Impressum im Fuß.
