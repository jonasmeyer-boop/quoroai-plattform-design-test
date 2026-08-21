#!/usr/bin/env bash
# Läuft die Website, die in diesem Ordner liegt, wirklich auf quoroai.io?
#
# rc 0 = ja · rc 1 = Abweichung
#
# WARUM ES DIESEN NACHWEIS BRAUCHT: quoroai.io wurde bis zum 21.08.2026 aus dem
# Repo `quoroai-website` bedient, und dessen Deploy-Rezept liefert mit
# `rsync -a --delete` aus. Ein einziger Lauf dort stellt die alte Website
# vollständig wieder her — ohne Warnung, ohne Fehler, ohne dass jemand es
# merkt. Beide Dateien dort tragen seit dem Wechsel eine STOPP-Zeile, aber eine
# Warnung im Text ist keine Messung. Dieser Nachweis ist die Messung.
#
# Er vergleicht BYTES, nicht Marker: ein Marker überlebt eine kaputte Datei
# (2026-08-16 im Spiegel gemessen), ein Prüfsummenvergleich nicht.
set -u
BASIS="${QUORO_LIVE_BASIS:-https://quoroai.io}"
HIER="$(cd "$(dirname "$0")" && pwd)"
fehler=0

# Der ausgelieferte Stand ist NICHT dieser Ordner, sondern was ausrollen.sh
# daraus baut: Pfade werden absolut, aus Dateien werden Verzeichnisse. Also
# bauen wir ihn hier neu und vergleichen gegen das Gebaute.
BAU="$(mktemp -d)"
trap 'rm -rf "$BAU"' EXIT
if ! bash "$HIER/ausrollen.sh" "$BAU/docroot" >/dev/null 2>&1; then
  echo "ABBRUCH ausrollen.sh läuft nicht durch — ohne gebauten Stand gibt es keinen Maßstab."
  exit 1
fi

adresse_fuer() { # Dateipfad im Docroot -> Adresse
  local rel="$1"
  case "$rel" in
    index.html) printf '/' ;;
    */index.html) printf '/%s/' "${rel%/index.html}" ;;
    *) printf '/%s' "$rel" ;;
  esac
}

ungleich=0 geprueft=0 fehlend=0
while IFS= read -r datei; do
  rel="${datei#$BAU/docroot/}"
  # Die Einzelbilder des Scroll-Kinos sind 187 Stück. Davon prüft dieser
  # Nachweis drei als Stichprobe — und sagt es, statt sie stumm zu übergehen.
  case "$rel" in
    bilder/kino/*)
      case "$rel" in
        bilder/kino/flug-001.webp|bilder/kino/kopf-001.webp|bilder/kino/dreh-001.webp) ;;
        *) continue ;;
      esac ;;
  esac
  adr="$BASIS$(adresse_fuer "$rel")"
  lokal="$(sha256sum "$datei" | cut -d' ' -f1)"
  live="$(curl -sf --max-redirs 0 --max-time 25 "$adr" | sha256sum | cut -d' ' -f1)"
  LEER="$(printf '' | sha256sum | cut -d' ' -f1)"
  if [ "$live" = "$LEER" ]; then
    sleep 2
    live="$(curl -sf --max-redirs 0 --max-time 25 "$adr" | sha256sum | cut -d' ' -f1)"
  fi
  geprueft=$((geprueft+1))
  if [ "$live" = "$LEER" ]; then
    echo "FEHLT     $adr — antwortet nicht oder ist leer"
    fehlend=$((fehlend+1)); ungleich=1
  elif [ "$lokal" != "$live" ]; then
    echo "ANDERS    $adr — live liegt etwas anderes als $rel"
    ungleich=1
  fi
done < <(find "$BAU/docroot" -type f | sort)

# Die Gegenprobe: liegt noch etwas vom ALTEN Auftritt da? Wenn ja, hat jemand
# aus quoroai-website deployt, und die Prüfsummen oben sagen es womöglich nicht,
# weil rsync --delete beide Stände mischen kann.
for alt in /_next/static/media/icon.3fzihqxpg9i5a.svg /team/hannes.jpg /index.txt; do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$BASIS$alt")"
  if [ "$code" = "200" ]; then
    echo "ALTBESTAND $BASIS$alt antwortet mit 200 — der alte Auftritt ist zurück"
    ungleich=1
  fi
done

if [ "$ungleich" = 1 ]; then
  echo "-- $geprueft Adressen geprüft, davon $fehlend ohne Antwort."
  echo "-- Rückweg auf den Stand vor dem Wechsel:"
  echo "   ssh -i ~/.ssh/quoro_deploy_restricted root@167.233.120.5 'web-rollback 20260821-162633'"
  fehler=1
else
  echo "OK   $geprueft Adressen liegen live Byte für Byte so wie hier; 184 Kino-Bilder als Stichprobe ausgenommen."
  echo "OK   Vom alten Auftritt ist nichts zurückgekehrt."
fi
exit $fehler
