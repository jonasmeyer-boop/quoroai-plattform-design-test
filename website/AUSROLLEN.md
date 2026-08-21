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

Die Sicherheitsregel (CSP) kommt aus `/etc/caddy/Caddyfile` auf der Box. Am
21.08.2026 gemessen, was sie heute sendet:

```
default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;
media-src 'self'; font-src 'self';
connect-src 'self' https://app.quoroai.io; …
```

**Die gute Nachricht: die Seite läuft darunter vollständig.** Nachgestellt mit
genau diesem Header über dem gebauten Docroot: Schriften, Gestaltung,
Scroll-Kino, alle Bilder, null Fehler in der Konsole. `'unsafe-inline'` steht
für Stile und Skripte schon drin, die Seiten brauchen keine Lockerung dafür.

Zwei Dinge sind trotzdem tot, und beide fallen sichtbar zurück:

**1. Google Analytics lädt nicht.** `script-src` kennt den Google-Host nicht.
Gemessen: nach „Einverstanden" hängt das Banner das Skript ein, der Browser
blockt es, kein `_ga`-Cookie entsteht, die Seite läuft weiter. Nötig wäre

```
script-src … https://www.googletagmanager.com
connect-src … https://*.google-analytics.com
```

Das ist derselbe Zustand wie beim alten Auftritt: dort ist GA4 seit jeher tot,
und es steht dort ausdrücklich, dass die Lockerung bewusst nicht geschrieben
wurde. **Vor dem Schalten also: Vertrag mit Google prüfen, dann den Header.**

**2. Das Kontaktformular sendet nicht.** `connect-src` kennt den
Supabase-Host nicht. Gemessen: der Dialog zeigt „Der Versand hakt gerade",
nennt `webmaster@quoroai.io` im Klartext, lässt den getippten Text stehen und
öffnet zusätzlich das Mailprogramm. Nötig wäre

```
connect-src 'self' https://app.quoroai.io https://uqfiodcqpssyflynzgoc.supabase.co
```

> **SPERRE — diese Zeile erst setzen, wenn der AVV mit Supabase angenommen
> ist.** Vertragspartner ist die Supabase Pte. Ltd., Singapur: kein
> Angemessenheitsbeschluss, und die Standardvertragsklauseln stecken in genau
> diesem Vertrag. Wird die Zeile vorher gesetzt, läuft die Verarbeitung ohne
> Vertrag nach Art. 28 DSGVO und ohne Transfergrundlage nach Kapitel V — für
> jede Anfrage, die danach eintrifft. Zuerst der Vertrag, dann der Header.
> Dieselbe Sperre steht wörtlich im Repo `quoroai-website` unter
> `deploy/live/README.md`.

Beide Änderungen brauchen root auf `167.233.120.5` und danach
`caddy validate` und `systemctl reload caddy`. Der Schlüssel, der hier
vorliegt, öffnet nur einen Käfig ohne Verb dafür. `~/.ssh/quoro_hr_deploy`
ist zwar eine echte root-Shell, aber auf einer **anderen** Box.

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
