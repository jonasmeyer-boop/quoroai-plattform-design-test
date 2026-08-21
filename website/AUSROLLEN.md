# Die Website ausrollen

Diese Seiten sind statisch: reine Dateien, kein Bauschritt, kein Server-Code.
Wer sie ausliefert, lässt das Skript den Ordner bauen und setzt drei Regeln.

## So entsteht der Docroot

**Nicht von Hand kopieren.** Beim Umzug ändern sich Pfade an Stellen, die man
beim Durchsehen nicht findet: in CSS-Regeln und in Pfaden, die JavaScript
zusammensetzt. Eine Handkopie liefert eine Seite ohne Gestaltung, ohne
Skripte und mit toter Navigation aus. Deshalb baut ein Skript den Ordner:

    bash website/ausrollen.sh /pfad/zum/docroot

Es legt die Verzeichnisstruktur an, zieht alle Pfade absolut, prüft danach
selbst nach (und bricht ab, solange irgendwo ein relativer Pfad steht) und
legt an jede alte Adresse eine Weiterleitungsseite.

| Datei hier | Adresse live |
|---|---|
| `index.html` | `/` |
| `plattform.html` | `/plattform/` |
| `referenzen.html` | `/arbeiten/` |
| `impressum.html` | `/impressum/` |
| `datenschutz.html` | `/datenschutz/` |
| `agb.html` | `/agb/` |
| `404.html` | Fehlerseite |

Mitgeliefert werden außerdem die beiden Nachweisdateien, die der Server schon
trägt und die ein `rsync --delete` sonst entfernen würde: die
Google-Bestätigung und der IndexNow-Schlüssel. `favicon.ico` und die
PNG-Icons für das Manifest liegen neu unter `bilder/` und kommen mit dem
Bilderordner.

## Umleitungen

`umleitungen.caddy` führt jede Adresse des alten Auftritts zweimal auf, mit
und ohne abschließenden Schrägstrich, weil der alte Export beide Formen
ausgeliefert hat. Ohne diese Datei liefert der Server nach dem Wechsel
hunderte Fehlerseiten, und Google straft ab.

**Diese Datei kann nur jemand mit root-Zugang auf der Box einspielen.** Der
Zugang, der hier zur Verfügung steht, ist ein Schreibschlüssel auf den
Docroot ohne Konsole. Deshalb legt `ausrollen.sh` zusätzlich an jede alte
Adresse eine Weiterleitungsseite: sie bringt Besucher ans Ziel, ist aber
keine 301. Für Google zählt nur die Serverregel. Die Weiterleitungsseiten
sind also die Brücke, nicht der Ersatz.

## Hochladen, sichern, zurückdrehen

Der Wechsel überschreibt einen laufenden Auftritt. Deshalb in dieser
Reihenfolge:

1. **Sicherung ziehen**, bevor irgendetwas geschrieben wird:
   `rsync -a --delete <server>:<docroot>/ ./sicherung-<datum>/`
   Ohne diese Kopie gibt es keinen Rückweg.
2. **Anker merken:** eine Datei des alten Auftritts notieren, die es nachher
   nicht mehr geben darf, und eine neue, die es nachher geben muss.
3. **Trockenlauf:** `rsync -avn --delete ./docroot/ <server>:<docroot>/`
   Die Liste lesen. Steht dort etwas Unerwartetes zum Löschen, abbrechen.
4. **Schreiben:** derselbe Befehl ohne `-n`.
5. **Vergleichen:** die beiden Anker aus Schritt 2 mit `curl` abfragen. Erst
   wenn der alte weg und der neue da ist, ist der Wechsel vollzogen.
6. **Rückweg:** `rsync -a --delete ./sicherung-<datum>/ <server>:<docroot>/`
   stellt den alten Stand her. Ein Wechsel ohne geprüften Rückweg wird nicht
   gemacht.

## Was der Server erlauben muss

Die Sicherheitsregel (CSP) auf der Box muss zwei Hosts kennen, sonst
funktionieren Analyse und Formular nicht:

- `https://www.googletagmanager.com` für Google Analytics (`script-src`),
  `https://*.google-analytics.com` für den Datenversand (`connect-src`),
- `https://uqfiodcqpssyflynzgoc.supabase.co` für das Kontaktformular
  (`connect-src`).

Dazu kommt, was die Seiten selbst brauchen: **`style-src 'unsafe-inline'`** und
**`script-src 'unsafe-inline'`**. Die Seiten tragen Stil- und Skriptblöcke
direkt im Dokument (unter anderem die strukturierten Daten auf der Startseite
und die Stile, die Kontakt-Dialog und Einwilligungs-Banner zur Laufzeit
einhängen). Steht auf der Box eine strenge Regel ohne diese beiden Werte, ist
die Seite live ohne Gestaltung und ohne Kino. Im Repo liegt keine
CSP-Datei — den Ist-Stand kennt nur, wer auf die Box sieht. **Vor dem Wechsel
also den geltenden CSP-Header abfragen, nicht annehmen.**

**Achtung:** Die Freischaltung des Formular-Hosts hängt am Supabase-Vertrag
(AVV), der noch nicht unterschrieben ist. Solange er fehlt, bleibt die Regel
bewusst zu; das Formular fällt dann sichtbar auf das Mailprogramm zurück.

## Prüfen nach dem Ausrollen

1. Startseite lädt, das Kino läuft beim Scrollen.
2. Cookie-Banner erscheint, **vor** der Zustimmung liegt kein
   `googletagmanager`-Skript im Quelltext.
3. Nach „Ablehnen" ist kein `_ga`-Cookie da.
4. `/impressum/`, `/datenschutz/`, `/agb/` erreichbar.
5. Eine alte Adresse aufrufen, etwa `/branchen/maschinenbau/`. Sie muss auf
   `/` führen. **Solange `umleitungen.caddy` nicht eingespielt ist, antwortet
   sie mit 200 und schickt per Weiterleitungsseite weiter — das ist der
   erwartete Zustand, kein Fehler.** Erst nach dem Einspielen der Serverregeln
   muss dort eine 301 stehen; dann ist dieser Schritt erneut zu prüfen.
6. Eine erfundene Adresse muss die 404-Seite zeigen, mit Impressum im Fuß.
