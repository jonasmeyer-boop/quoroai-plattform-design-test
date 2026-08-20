# website/ — der öffentliche Auftritt von quoroAI

Eigener Bereich für die Marketing-Website. **Der Ordner ist bewusst
eigenständig:** eigene Schriften, eigenes CSS, eigene Zahlen. Er lässt sich im
Ganzen löschen, ohne dass an `entwuerfe/` etwas fehlt. Umgekehrt liest hier
nichts aus `entwuerfe/`.

## Was hier liegt

| Datei | Was es ist |
|---|---|
| `index.html` | **Die Startseite** (Jonas' Wahl: Entwurf A). Hero ist das Scroll-Kino: aus einer Wolke fliegender Belege setzt sich beim Scrollen ein Kopf aus Papier zusammen (61 Bilder unter `bilder/kino/`, fal.ai: FLUX-Motiv + Kling-Film, gescrubbt per Canvas mit Multiply). Danach Markenwechsel, Werkzeuge, Preisrechner, Daten. |
| `variante-a.html` | Entwurf A „Der weiße Raum", der Stand vor dem Kino. Kino-Moment ist der Markenwechsel. |
| `variante-b.html` | Entwurf B „Die Werkbank": laut, plakative Schauschrift. Kino-Moment ist der Aufbau eines Vermerks. Nicht gewählt, bleibt als Referenz. |
| `stil.css` | Marke und Bausteine. Tokens sind eine Kopie aus `entwuerfe/system.css` (Lila #6f63e8, Clash Display, General Sans). |
| `zahlen.js` | Die geteilten Zahlen des Auftritts. Werte aus `entwuerfe/preise.js` kopiert, keine Fläche tippt einen Betrag ins Markup. |
| `schriften/`, `bilder/` | Kopien der beiden Schriften und des Logos. |

## Woher die Angaben stammen

Zahlen aus `entwuerfe/preise.js` (149 € je Beratung und Monat, Zugänge 19 bis
149 €, Staffel 25/35/45 %). Anschrift, Register und Kontakt aus
`entwuerfe/quoro-impressum.html`. Die Aussagen zur Verarbeitung aus
`entwuerfe/quoro-datenschutz.html` (Supabase Frankfurt, Hetzner Falkenstein,
Sprachmodell über AWS Bedrock in der EU, kein Training mit Kundeninhalten).
Ändert sich dort etwas, wird es hier nachgezogen.

Die drei Beratungen im White-Label-Beispiel (Hellwig & Partner, Nordlicht
Consulting, Kanzlei Brehm) sind erfunden und auf der Seite als erfunden
gekennzeichnet.

## Vorschau

    python3 -m http.server 8099 --bind 127.0.0.1
    # http://127.0.0.1:8099/website/index.html

## Offen

Entschieden ist: nur die Startseite, richtig fertig (Chronik 2026-08-20).
Unterseiten gibt es nicht; die Rechtsverweise im Fuß sind bewusst tot, bis
dieser Umfang neu entschieden wird.
