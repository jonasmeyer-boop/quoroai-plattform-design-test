/* quoroai-plattform-design · Der Rechts-Fuß: Impressum und Datenschutz auf
   jeder Fläche (Issue #46, Systembaustein wie glocke.js und vermerk.js).

   § 5 DDG verlangt beide Seiten „leicht erkennbar, unmittelbar erreichbar,
   ständig verfügbar" — zwei Klicks von JEDER Seite, auch aus der angemeldeten
   Anwendung. Bis hierher standen sie nur im Fuß der Wurzel und der Startseite;
   die Innenflächen trugen gar keinen Fuß.

   Welche zwei Seiten es sind, entscheidet die Welt, nicht die Fläche
   (Chronik 2026-08-14, „Recht steht zweimal"): unter der Adresse einer
   Beratung gilt ihr Recht, unter der Adresse von quoroAI unseres. Erkannt
   wird das an `system.css` — genau das ist der Unterschied zwischen den
   beiden Welten (CLAUDE.md: Kundenflächen binden es NICHT ein). Wer es
   anders braucht, schreibt `data-welt="kunde"` oder `"quoro"` ans Script.

   Platz: standardmäßig ans Ende der Seite. Flächen, die nicht scrollen,
   setzen sich einen Anker `[data-rechtsfuss]` an die Stelle, wo er hingehört:
   `"fix"` klebt als Glaszeile unten am Fenster (die Tür), `"kopf"` reiht
   sich als zwei leise Wörter ins Kopfband (die Bühne, wo unten rechts schon
   das Uhr-Dock steht und zwei Glasflächen übereinander lägen).
   Marker: RECHTSFUSS-V1 */
(function () {
  'use strict';

  var script = document.currentScript;

  function start() {
    var welt = (script && script.dataset.welt) ||
      (document.querySelector('link[rel="stylesheet"][href*="system.css"]') ? 'quoro' : 'kunde');
    var quoro = welt === 'quoro';

    /* Steht der Fuß schon von Hand auf der Seite (Wurzel, Startseite,
       Sackgasse), bauen wir keinen zweiten. Gefragt wird nach dem Fuß, nicht
       nach irgendeinem Impressum-Link: die Marke-Fläche verweist im Inhalt
       auf das Impressum der Beratung und hätte sonst gar keinen eigenen
       bekommen — ausgerechnet dort, wo quoroAI-Recht gilt. */
    if (document.querySelector('.fuss a[href$="impressum.html"], .rechtsfuss')) return;

    stil();

    var fuss = document.createElement('div');
    fuss.className = 'rechtsfuss';

    var wer = document.createElement('span');
    wer.className = 'rechtsfuss-wer';
    if (quoro) {
      wer.textContent = 'quoroAI';
    } else {
      /* Der Name steht direkt drin: der Fuß entsteht erst nach dem
         `anwenden()` seiner Fläche, `data-marke-name` käme also zu spät.
         Beim Markenwechsel lädt marke.js die Seite ohnehin neu.
         Ohne Marken-Kern bleibt die Stelle leer statt falsch. */
      wer.textContent = (window.Marke && window.Marke.daten && window.Marke.daten.name) || '';
    }
    /* Ohne Namen keine leere Stelle mit ihrem Abstand */
    if (wer.textContent) fuss.appendChild(wer);

    fuss.appendChild(weg(quoro ? 'quoro-impressum.html' : 'impressum.html', 'Impressum'));
    fuss.appendChild(weg(quoro ? 'quoro-datenschutz.html' : 'datenschutz.html', 'Datenschutz'));

    var anker = document.querySelector('[data-rechtsfuss]');
    if (anker) {
      var art = anker.dataset.rechtsfuss;
      if (art === 'fix') fuss.classList.add('rechtsfuss-fix');
      if (art === 'kopf') fuss.classList.add('rechtsfuss-kopf');
      anker.appendChild(fuss);
    } else {
      document.body.appendChild(fuss);
    }
  }

  function weg(ziel, wort) {
    var a = document.createElement('a');
    a.href = ziel;
    a.textContent = wort;
    return a;
  }

  /* Eigene Tokens bringt der Baustein nicht mit: er nimmt die der Fläche und
     fällt auf die der anderen Welt zurück, damit er in beiden Welten leise
     bleibt statt überall gleich laut zu sein. */
  function stil() {
    var s = document.createElement('style');
    s.textContent =
      '.rechtsfuss{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;' +
      /* Zwei Polster, beide gegen dasselbe: was fest unten am Fenster hängt,
         darf nicht auf dem Fuß liegen — erreichbar wäre er dann nicht mehr,
         und genau darum geht es hier. `--uhr-hoehe` meldet das Uhr-Dock
         selbst (uhr.js), `--rechtsfuss-luft` setzt die Fläche für ihre
         eigene Leiste (die Eingabe im Gespräch, das Dock im Schaufenster). */
      'gap:6px 18px;padding:34px 22px calc(20px + var(--rechtsfuss-luft, 0px) + var(--uhr-hoehe, 0px) + env(safe-area-inset-bottom));' +
      'font-size:12.5px;line-height:1.5;color:var(--nebel-600, var(--grau, #636c7d))}' +
      '.rechtsfuss a{color:inherit;text-decoration:none;border-bottom:0.5px solid transparent}' +
      '.rechtsfuss a:hover{color:var(--lila-600, var(--blau, #2b5fe3));' +
      'border-bottom-color:currentColor}' +
      /* Am Finger braucht ein Wort seine 44px, ohne dass die Zeile auseinanderfällt */
      '@media (pointer:coarse){.rechtsfuss a{display:inline-flex;align-items:center;min-height:44px}' +
      '.rechtsfuss{padding-top:24px}}' +
      /* Die fixe Zeile: für Flächen, die nicht scrollen. Glas, damit sie über
         der Bühne liegen kann, ohne etwas zu verdecken. */
      '.rechtsfuss-fix{position:fixed;right:0;bottom:0;z-index:60;justify-content:flex-end;' +
      'gap:6px 14px;padding:7px 18px calc(7px + var(--uhr-hoehe, 0px) + env(safe-area-inset-bottom));' +
      'font-size:11.5px;border-top-left-radius:14px;' +
      'background:rgba(255,255,255,.7);' +
      'backdrop-filter:blur(14px) saturate(160%);-webkit-backdrop-filter:blur(14px) saturate(160%);' +
      'border-top:0.5px solid var(--nebel-200, rgba(16,19,26,.1));' +
      'border-left:0.5px solid var(--nebel-200, rgba(16,19,26,.1))}' +
      '@media (pointer:coarse){.rechtsfuss-fix a{min-height:32px}}' +
      /* Im Kopfband trägt die Zeile nichts Eigenes: die Marke steht schon
         daneben, und Glas auf Glas wäre eine Fläche zu viel. */
      '.rechtsfuss-kopf{padding:0;gap:4px 16px;font-size:12.5px}' +
      '.rechtsfuss-kopf .rechtsfuss-wer{display:none}' +
      '@media (pointer:coarse){.rechtsfuss-kopf a{min-height:0}}' +
      /* Schmal bleibt die Zeile eine Zeile: umgebrochen schiebt sie das
         Kopfband auseinander und die Wortmarke an den Rand. */
      '@media (max-width:640px){.rechtsfuss-kopf{font-size:11px;gap:10px;flex-wrap:nowrap}}';
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
