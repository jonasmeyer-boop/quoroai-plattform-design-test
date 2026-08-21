# Zwei Dinge, die nur du tun kannst — und warum

Stand: 21.08.2026. **Die Website ist live.** Was hier steht, sind die beiden
letzten Schritte: die dauerhaften Umleitungen der alten Adressen und die
Freischaltung der Formulare. Beide ändern `/etc/caddy/Caddyfile` und brauchen
eine Root-Shell.

## Warum nicht ich

Der Käfig auf der Box hat ein Verb `sync-caddy`, das Caddy-Konfiguration ohne
Root einspielt. Für diese Aufgabe greift es nicht, aus zwei gemessenen Gründen:

- Er **weist jedes Snippet ab, das den Hostnamen von quoroai.io nennt** —
  einfacher Textvergleich, absichtlich (`caddy_name_check`).
- Er lässt Snippets nur **hinzufügen**, nie ändern: Er baut die Konfiguration
  zweimal, einmal ohne und einmal mit dem Vorschlag, und verweigert alles, was
  die Box heute ausliefert und danach nicht mehr. Eine CSP-Zeile ändern ist
  genau das.

Und der Root-Notfallschlüssel gehört laut eurem eigenen Notfalldokument nicht
auf eine Agenten-Platte („Kein Privatteil liegt auf einer Agent-Platte"). Die
Rotation danach kann eine Sitzung ohnehin nicht abschließen: `escrow-export.sh`
verweigert ohne Terminal, und die Passphrase kennst nur du.

## Schritt 0 — Schlüssel holen

Vaultwarden öffnen, Item `prod/box-breakglass-root`, den Schlüssel als Datei
speichern, dann:

```bash
chmod 600 ~/breakglass-root
```

## Schritt 1 — erst lesen, nicht schreiben

```bash
ssh -i ~/breakglass-root root@167.233.120.5
```

Auf der Box:

```bash
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.vor-relaunch-20260821
grep -n "quoroai.io" /etc/caddy/Caddyfile | head -20
grep -n "Content-Security-Policy" /etc/caddy/Caddyfile
```

Die zweite Zeile zeigt, wie der Site-Block für quoroai.io aufgebaut ist. Die
`redir`-Zeilen müssen **in diesen Block**, nicht daneben. `caddy validate`
prüft Syntax, nicht Platzierung — eine syntaktisch gültige Regel am falschen
Ort tut nichts.

## Schritt 2 — die Umleitungen

Von deinem Rechner aus, in einem zweiten Fenster:

```bash
scp -i ~/breakglass-root \
  ~/projects/quoroai-plattform-design/website/umleitungen.caddy \
  root@167.233.120.5:/etc/caddy/quoroai-umleitungen.caddy
```

Auf der Box in den Site-Block von quoroai.io, **vor** allen anderen Regeln:

```
import /etc/caddy/quoroai-umleitungen.caddy
```

Die Datei enthält 92 Regeln: jede alte Adresse einmal mit und einmal ohne
Schrägstrich, weil der alte Export beide Formen ausgeliefert hat.

## Schritt 3 — die zwei Sicherheitszeilen

Im selben Site-Block, in der bestehenden `Content-Security-Policy`:

- an `script-src` anhängen: `https://www.googletagmanager.com`
- an `connect-src` anhängen: `https://*.google-analytics.com https://uqfiodcqpssyflynzgoc.supabase.co`

Mehr nicht. Gemessen: `img-src` steht schon auf `https:`, `form-action` wird
nicht gebraucht (das Formular sendet per `fetch`), `frame-src` auch nicht.

**Nebenbei, wenn du schon drin bist:** `connect-src` und `form-action` nennen
beide `https://app.quoroai.io`. Seit dem 21.08.2026 zeigt kein Verweis der
Website mehr dorthin — alle Knöpfe führen auf `https://whitelabel.quoroai.io`.
Der alte Host schadet in der Regel nicht, aber er beschreibt einen Zustand,
den es nicht mehr gibt. Ersetzen oder ergänzen, wie es zu den anderen Seiten
auf der Box passt; für unsere Website ist beides ohne Wirkung, weil ein
normaler Link weder unter `connect-src` noch unter `form-action` fällt.

**Eine Nebenwirkung, die du kennen solltest:** neben dem bereits vorhandenen
`'unsafe-eval'` bedeutet der Google-Host, dass jeder mit Zugang zum
GA4-Konto beliebiges JavaScript auf der Seite ausführen kann, die das
Kontaktformular trägt. Das ist der Preis von Analytics auf einer Seite mit
Formular, nicht ein Fehler dieser Anleitung.

## Schritt 4 — prüfen, dann erst weiter

```bash
caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy
```

**Auf der Box liegen sechs Hosts, nicht einer.** Nach dem Reload alle prüfen,
`vault` zuerst — aus ihm kommt der Schlüssel, mit dem du gerade angemeldet
bist:

```bash
for h in vault app crm www staging; do
  printf '%-10s %s\n' "$h" "$(curl -s -o /dev/null -w '%{http_code}' https://$h.quoroai.io/)"
done
curl -s -o /dev/null -w 'quoroai.io %{http_code}\n' https://quoroai.io/
```

`staging` antwortet schon vor dem Eingriff mit 502 — das ist kein Schaden von
dir. Alle anderen müssen antworten wie vorher.

## Schritt 5 — von deinem Rechner aus nachmessen

```bash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://quoroai.io/branchen/maschinenbau/
```

Muss **301** sagen und auf `/` zeigen. Vorher waren es 200 über eine
Weiterleitungsseite — die bleibt liegen und schadet nicht, der Server leitet
jetzt vorher um.

Dann das Formular auf https://quoroai.io/arbeiten/ wirklich ausfüllen und
abschicken. Kommt keine Mail an `webmaster@quoroai.io`, ist die
`connect-src`-Zeile nicht im richtigen Block gelandet.

## Achtung bei `web-rollback` ohne Stempel

**Das Verb handelt sofort, es berichtet nicht.** Am 21.08.2026 wurde es hier
aufgerufen, um zu sehen, welche Sicherungen es gibt — und es hat auf der Stelle
die neueste zurückgeholt und die Live-Seite auf einen fünf Minuten alten Stand
gesetzt. Kein Schaden, aber ein unnötiger Umweg.

Was es gibt, sagt `caddy-config` für Caddy; für den Docroot gibt es kein
lesendes Verb. Also **immer mit Stempel** aufrufen, nie ohne:

```bash
ssh -i ~/.ssh/quoro_deploy_restricted root@167.233.120.5 'web-rollback 20260821-162633'
```

Und wissen, welcher Stempel welcher ist: `web-backup` hält nur die **drei
neuesten** Sicherungen. `20260821-162633` ist der Stand vor dem Relaunch — nach
drei weiteren Sicherungen ist er weg.

## Schritt 6 — zurückdrehen, falls etwas klemmt

```bash
cp /etc/caddy/Caddyfile.vor-relaunch-20260821 /etc/caddy/Caddyfile
caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy
```

Die Website selbst ist davon nicht betroffen; ihr Rückweg ist ein anderer:

```bash
ssh -i ~/.ssh/quoro_deploy_restricted root@167.233.120.5 'web-rollback 20260821-162633'
```

## Schritt 7 — Schlüssel rotieren

**Zuletzt, und erst wenn `vault.quoroai.io` nachweislich wieder antwortet.**
Der Ablauf steht in `quoro-ops/docs/runbook-vault.md`; Schritt 5 ist
„Escrow neu ziehen" und braucht dich am Terminal, weil die Passphrase getippt
werden muss. Wird die Rotation heute nicht fertig, gehört sie als Issue
festgehalten — nicht als „machen wir gleich noch".

Danach die Schlüsseldatei löschen, nicht mit `rm`:

```bash
shred -u ~/breakglass-root
```
