# website/ — der öffentliche Auftritt von quoroAI

Eigener Bereich für die Marketing-Website. **Der Ordner ist bewusst
eigenständig:** eigene Schriften, eigenes CSS, eigene Zahlen. Er lässt sich im
Ganzen löschen, ohne dass an `entwuerfe/` etwas fehlt. Umgekehrt liest hier
nichts aus `entwuerfe/`.

## Was hier liegt

| Datei | Was es ist |
|---|---|
| `variante-a.html` | Entwurf A „Der weiße Raum": ruhig, editorial. Kino-Moment ist der Markenwechsel, dasselbe Kundenportal wandert beim Scrollen durch drei Beratungsmarken. |
| `variante-b.html` | Entwurf B „Die Werkbank": laut, plakative Schauschrift. Kino-Moment ist der Aufbau, aus einer Mandantenfrage entsteht gescrubbt ein fertiger Vermerk. |
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
    # http://127.0.0.1:8099/website/variante-a.html

## Offen

Noch nicht entschieden: welche Variante es wird. Danach kommen die
Unterseiten und das Bildmaterial. Rechtsseiten sind im Fuß noch tote Verweise.
