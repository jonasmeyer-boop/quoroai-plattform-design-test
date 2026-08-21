#!/usr/bin/env bash
# quoroai-plattform-design · website/ · Aus den Entwurfsdateien den Docroot bauen.
#
# Warum ein Skript und kein Handgriff: beim Umzug ändern sich drei Dinge,
# und jedes einzelne bricht die Seite still, wenn es vergessen wird.
#   1. Aus flachen Dateien werden Verzeichnisse (/plattform/ statt plattform.html),
#      damit die Adressen so aussehen wie bisher.
#   2. Verweise zwischen den Seiten zeigen auf die Adressen, nicht auf Dateinamen.
#   3. Relative Pfade werden absolut. Sonst sucht /plattform/ seine Bilder unter
#      /plattform/bilder/ — das gilt auch für die Pfade, die JavaScript baut.
#
# Aufruf:  bash website/ausrollen.sh <zielordner>
# Danach:  rsync des Zielordners in den Docroot (siehe AUSROLLEN.md).
set -euo pipefail

quelle="$(cd "$(dirname "$0")" && pwd)"
ziel="${1:?Zielordner angeben}"

# Gebaut wird IMMER daneben, nie im Ziel. Bricht die Nachprüfung ab, bleibt ein
# vorhandener Ordner unberührt — sonst stünde nach einem roten Lauf ein halb
# fertiger Docroot da: Seiten vorhanden, Weiterleitungen fehlen. Getauscht wird
# erst in der letzten Zeile, wenn alles geprüft ist.
case "$ziel" in
  /|/bin|/boot|/dev|/etc|/home|/lib*|/opt|/proc|/root|/run|/sbin|/srv|/sys|/usr|/var)
    echo "Zielordner $ziel ist ein Systemverzeichnis. Abbruch." >&2; exit 1;;
esac
bau="$ziel.bau"
rm -rf "$bau"
mkdir -p "$bau"

cp -r "$quelle"/bilder "$quelle"/schriften "$bau"/
cp "$quelle"/stil.css "$quelle"/recht.css "$bau"/
cp "$quelle"/chrom.js "$quelle"/kontakt.js "$quelle"/einwilligung.js "$quelle"/zahlen.js "$bau"/
cp "$quelle"/robots.txt "$quelle"/sitemap.xml "$quelle"/manifest.webmanifest "$quelle"/llms.txt "$bau"/
# Nachweisdateien, die der Server schon trägt: ohne sie bricht die
# Google-Search-Console-Bestätigung und IndexNow weist die Meldung ab.
cp "$quelle"/googlefb0080e3f9d15d81.html "$quelle"/50ce7df4a14c418306e7037f455b3d04.txt "$bau"/
# Wurzel-Dateien, die von außen unter genau dieser Adresse abgefragt werden:
# Symbole, das Vorschaubild bereits geteilter Links, die Logos. Sie stehen in
# keinem Verweis unserer Seiten und wären beim ersten `rsync --delete` weg —
# der Trockenlauf am 21.08.2026 hatte alle zehn in der Löschliste.
# Warum welche: website/wurzel/LIESMICH.md
# alles aus wurzel/ außer der Erklärung, die nur hier gilt
find "$quelle"/wurzel -maxdepth 1 -type f ! -name 'LIESMICH.md' -exec cp {} "$bau"/ \;
cp "$quelle"/index.html "$quelle"/404.html "$bau"/

for paar in "plattform.html:plattform" "referenzen.html:arbeiten" \
            "impressum.html:impressum" "datenschutz.html:datenschutz" "agb.html:agb"; do
  datei="${paar%%:*}"; ordner="${paar##*:}"
  mkdir -p "$bau/$ordner"
  cp "$quelle/$datei" "$bau/$ordner/index.html"
done

python3 - "$bau" <<'PY'
import glob, os, re, sys
ziel = sys.argv[1]
adressen = {'index.html': '/', 'plattform.html': '/plattform/', 'referenzen.html': '/arbeiten/',
            'impressum.html': '/impressum/', 'datenschutz.html': '/datenschutz/', 'agb.html': '/agb/'}

# --- Seiten ---
for p in glob.glob(ziel + '/*/index.html') + [ziel + '/index.html', ziel + '/404.html']:
    s = open(p).read()
    for datei, adresse in adressen.items():
        s = s.replace('href="' + datei + '"', 'href="' + adresse + '"')
    # Alles Relative wird absolut, auf jeder Ebene: die Startseite darf dieselben
    # Pfade tragen wie die Unterseiten, sonst driften sie auseinander.
    s = re.sub(r'(href|src|poster)="(?!https?:|mailto:|tel:|data:|#|/)([^"]+)"', r'\1="/\2"', s)
    # srcset trägt mehrere Pfade in einem Wert, durch Komma getrennt
    s = re.sub(r'srcset="([^"]+)"',
               lambda m: 'srcset="' + ','.join(
                   (' ' + t.strip() if t.strip().startswith(('http', '/')) else ' /' + t.strip())
                   for t in m.group(1).split(',')).strip() + '"', s)
    s = s.replace('href="/index.html#schluss"', 'href="/#schluss"')
    s = s.replace('href="index.html#schluss"', 'href="/#schluss"')
    # Pfade, die JavaScript im Text zusammensetzt
    s = s.replace("'bilder/kino/", "'/bilder/kino/")
    # Pfade in CSS-Regeln (url('bilder/…')) — die fängt kein href/src-Muster
    s = s.replace("url('bilder/", "url('/bilder/")
    open(p, 'w').write(s)

# --- Bausteine, die selbst Pfade bauen ---
for p in [ziel + '/kontakt.js', ziel + '/einwilligung.js']:
    s = open(p).read()
    s = s.replace('src="bilder/', 'src="/bilder/')
    s = s.replace('href="datenschutz.html"', 'href="/datenschutz/"')
    open(p, 'w').write(s)
print('Pfade umgeschrieben')
PY

# --- Weiterleitungen der alten Adressen ---
# Der Schlüssel für den Server erlaubt nur Dateien, keine Serverbefehle: echte
# 301-Regeln kann nur jemand mit Zugang zur Caddy-Konfiguration setzen
# (umleitungen.caddy). Bis dahin liegt an jeder alten Adresse eine Seite, die
# sofort weiterschickt — schwächer als ein 301, aber es verhindert, dass
# hunderte Links ins Leere laufen. Sobald die Serverregeln stehen, greifen
# diese Seiten nicht mehr, weil der Server vorher umleitet.
python3 - "$bau" "$quelle" <<'PY'
import os, sys
ziel, quelle = sys.argv[1], sys.argv[2]
vorlage = """<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Umgezogen</title>
<!-- Kein noindex neben einem fremden Canonical: zwei widersprüchliche
     Signale lassen Google die Adresse verwerfen statt zusammenführen.
     Hier steht nur das Canonical, damit die Kraft der alten Adresse auf die
     neue übergeht. Sobald echte 301-Regeln stehen, greift diese Seite nicht
     mehr, weil der Server vorher umleitet. -->
<link rel="canonical" href="https://quoroai.io{zielpfad}">
<meta http-equiv="refresh" content="0; url={zielpfad}">
<link rel="stylesheet" href="/stil.css">
</head>
<body style="display:grid;place-items:center;min-height:100svh;text-align:center;padding:24px">
  <div>
    <p style="font-family:var(--schrift-schau);font-weight:600;font-size:clamp(24px,3vw,34px)">Diese Seite ist umgezogen.</p>
    <p style="margin-top:12px;color:var(--nebel-600)">Wir schicken dich weiter. Falls nichts passiert:</p>
    <p style="margin-top:18px"><a class="knopf primaer" href="{zielpfad}">Weiter zu quoroAI</a></p>
    <!-- § 5 DDG verlangt das Impressum auf JEDER ausgelieferten Seite, auch
         auf einer Weiterleitung. -->
    <p style="margin-top:28px;font-size:14px;color:var(--nebel-500)"><a href="/impressum/">Impressum</a> und <a href="/datenschutz/">Datenschutz</a></p>
  </div>
</body>
</html>
"""
gezaehlt = 0
with open(os.path.join(quelle, 'umleitungen.caddy')) as f:
    for zeile in f:
        zeile = zeile.strip()
        if not zeile.startswith('redir ') or '*' in zeile:
            continue
        teile = zeile.split()
        von, nach = teile[1], teile[2]
        ordner = os.path.join(ziel, von.strip('/'))
        if not von.strip('/'):
            continue
        # Adressen mit Dateiendung bekommen KEINE Weiterleitungsseite: ein Ordner
        # namens `llms-full.txt` mit index.html darin ersetzt die Textdatei durch
        # HTML, und eine Maschine, die Text erwartet, bekommt Markup. Für solche
        # Adressen liefern wir die echte Datei aus (siehe wurzel/) und lassen die
        # 301-Regel des Servers die Arbeit machen.
        if os.path.splitext(von.rstrip('/'))[1]:
            continue
        os.makedirs(ordner, exist_ok=True)
        datei = os.path.join(ordner, 'index.html')
        if os.path.exists(datei):
            continue            # neue Seiten überschreiben wir nie
        with open(datei, 'w') as g:
            g.write(vorlage.replace('{zielpfad}', nach))
        gezaehlt += 1
print('%d Weiterleitungsseiten gelegt' % gezaehlt)
PY

# --- Nachweis: kein relativer Pfad darf uebrig bleiben ---
# Laeuft NACH den Weiterleitungsseiten, damit auch die geprueft sind.
python3 - "$bau" <<'PY'
import glob, os, re, sys
ziel = sys.argv[1]

# Attribute, die Fliesstext tragen: dort ist "Angebot.html" ein Wort, kein Pfad.
TEXT = {'content', 'alt', 'title', 'aria-label', 'placeholder', 'value', 'lang'}
# Alles andere wird streng geprueft, auch Attribute, die es heute noch nicht
# gibt (srcset, poster, data-...). Kommt eines dazu, das Pfade traegt, bricht
# der Lauf ab, statt still eine kaputte Seite auszuliefern.
PFAD = re.compile(r'^(?!https?:|mailto:|tel:|data:|#|/)(bilder/|schriften/|[\w-]+\.(?:css|js|html|webp|svg|png|ico|xml|txt))')
# Und Pfade, die JavaScript im Text zusammensetzt, in jeder Anfuehrungsart.
TEXTPFAD = re.compile(r"""["'`]((?:bilder|schriften)/[^"'`\s]*)["'`]""")

rest = []
for p in glob.glob(ziel + '/**/*.html', recursive=True) + glob.glob(ziel + '/*.js'):
    s = open(p).read()
    kurz = os.path.relpath(p, ziel)
    for attr, wert in re.findall(r'([a-zA-Z-]+)="([^"]*)"', s):
        if attr.lower() in TEXT:
            continue
        for teil in re.split(r'[,\s]+', wert):
            if PFAD.match(teil):
                rest.append(kurz + ' -> ' + attr + '="' + teil + '"')
    for m in TEXTPFAD.findall(s):
        rest.append(kurz + ' -> Zeichenkette "' + m + '"')
if rest:
    print('RELATIVE PFADE UEBRIG:')
    print('\n'.join(sorted(set(rest))[:20]))
    raise SystemExit(1)
print('alle Pfade absolut')
PY

# Erst jetzt, nachdem jede Prüfung grün war, tritt der neue Ordner an die Stelle
# des alten. Der alte wird nach dem Tausch gelöscht, nicht davor.
if [ -e "$ziel" ]; then
  rm -rf "$ziel.alt"
  mv "$ziel" "$ziel.alt"
fi
mv "$bau" "$ziel"
rm -rf "$ziel.alt"
echo "Docroot gebaut: $ziel"
