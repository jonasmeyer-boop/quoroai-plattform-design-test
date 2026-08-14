/* quoroai-plattform-design · Die Glocke: was seit dem letzten Blick passiert
   ist, und der Weg dorthin (Paket 10, Systembausteine).
   Sie hängt im Chrom jeder Fläche, die eine Kopfzeile hat, und ist keine
   Ablage: jeder Eintrag führt an die Stelle, um die es geht. Wer sie öffnet,
   hat gelesen — kurz danach verlieren die Einträge ihr „neu" und die Zahl
   geht aus.
   Kein Deko-Punkt (Jonas' Regel): dass ein Eintrag neu ist, sagt das Wort
   „neu" vor der Zeit, nicht ein farbiger Kreis, der nichts erklärt.
   Markenneutral: alle Farben kommen aus den Tokens der jeweiligen Fläche —
   White-Label-Kundenflächen setzen --blau/--linie/--grau über marke.js,
   quoroAI-Flächen bringen --lila-600/--nebel-200/--nebel-500 aus system.css
   mit. Deshalb läuft dieser Baustein in beiden Welten.

   Aufruf: <span data-glocke></span> ins Chrom setzen, danach
   Glocke.baue({eintraege: [{titel, text, zeit, neu, tue}]}).

   Marker: GLOCKE-V1 */
window.Glocke = (function () {
  'use strict';

  var BELL = 'M6 17 L18 17 C16.8 15.6 16.4 14.6 16.2 12.2 C16 9.2 14.6 7 12 7 ' +
             'C9.4 7 8 9.2 7.8 12.2 C7.6 14.6 7.2 15.6 6 17 Z ' +
             'M10.4 19.5 a1.8 1.8 0 0 0 3.2 0';

  var stilDa = false;
  function stil() {
    if (stilDa) return;
    stilDa = true;
    var akzent = 'var(--blau, var(--lila-600, #6f63e8))';
    var linie  = 'var(--linie, var(--nebel-200, #e9e8f1))';
    var grau   = 'var(--grau, var(--nebel-500, #7f7d93))';
    var tinte  = 'var(--tinte, #18152f)';
    var s = document.createElement('style');
    s.textContent =
      '.glocke-halter{position:relative;display:inline-flex;pointer-events:auto}' +
      /* exakt Pillenhöhe, damit die Reihe im Chrom eine Linie bildet */
      '.glocke-knopf{position:relative;width:35px;height:35px;border-radius:999px;' +
        'border:0.5px solid ' + linie + ';background:#fff;cursor:pointer;padding:0;' +
        'display:inline-flex;align-items:center;justify-content:center}' +
      '.glocke-knopf svg{width:18px;height:18px}' +
      '.glocke-knopf svg path{fill:none;stroke:' + tinte + ';stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}' +
      '.glocke-knopf .zahl{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;padding:0 4px;' +
        'border-radius:999px;background:' + akzent + ';color:#fff;font-size:11px;font-weight:800;' +
        'display:inline-flex;align-items:center;justify-content:center}' +
      /* eigene Regel, weil display:inline-flex sonst [hidden] übertrumpft —
         nicht jede Fläche bringt ein globales [hidden]{display:none} mit */
      '.glocke-knopf .zahl[hidden],.glocke-fenster[hidden]{display:none}' +
      '.glocke-fenster{position:absolute;top:calc(100% + 10px);right:0;z-index:60;' +
        'width:min(340px,calc(100vw - 32px));text-align:left;' +
        'background:#fff;border:0.5px solid ' + linie + ';border-radius:16px;' +
        'box-shadow:0 18px 50px rgba(16,19,26,.16);padding:16px 18px}' +
      '.glocke-fenster h3{font-size:12px;font-weight:800;color:' + grau + ';margin:0}' +
      '.glocke-eintrag{display:block;width:100%;text-align:left;font:inherit;cursor:pointer;' +
        'background:none;border:0;border-top:0.5px solid ' + linie + ';padding:11px 0}' +
      '.glocke-eintraege .glocke-eintrag:first-child{border-top:none;margin-top:8px}' +
      /* eigener Fokusring, sonst zeichnet der Browser einen schwarzen Kasten */
      '.glocke-eintrag:focus-visible{outline:3px solid ' + akzent + ';outline-offset:-2px;border-radius:10px}' +
      '.glocke-eintrag .ge-titel{display:block;font-size:13.5px;font-weight:800;color:' + tinte + ';transition:color .4s ease}' +
      '.glocke-eintrag .ge-text{display:block;font-size:12.5px;color:' + grau + ';margin-top:2px}' +
      '.glocke-eintrag .ge-zeit{display:block;font-size:11px;color:' + grau + ';opacity:.8;margin-top:3px}' +
      /* „neu" ist ein Wort, kein Punkt — und es verschwindet, sobald gelesen */
      '.glocke-eintrag .ge-neu{color:' + akzent + ';font-weight:800;display:inline-block;' +
        'max-width:4em;overflow:hidden;white-space:nowrap;vertical-align:bottom;' +
        'transition:max-width .45s ease,opacity .35s ease}' +
      '.glocke-eintrag.gelesen .ge-titel{color:' + grau + '}' +
      '.glocke-eintrag.gelesen .ge-neu{max-width:0;opacity:0}' +
      '@media (prefers-reduced-motion:reduce){' +
        '.glocke-eintrag .ge-titel,.glocke-eintrag .ge-neu{transition-duration:.01ms}}';
    document.head.appendChild(s);
  }

  function baue(opts) {
    stil();
    opts = opts || {};
    var halter = opts.ziel || document.querySelector('[data-glocke]');
    if (!halter) return null;
    var eintraege = opts.eintraege || [];
    var titel = opts.titel || 'Neuigkeiten';

    halter.classList.add('glocke-halter');
    halter.textContent = '';

    var knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'glocke-knopf';
    knopf.setAttribute('aria-haspopup', 'dialog');
    knopf.setAttribute('aria-expanded', 'false');
    knopf.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + BELL + '"/></svg>' +
                      '<span class="zahl" aria-hidden="true"></span>';
    var zahl = knopf.querySelector('.zahl');

    var fenster = document.createElement('div');
    fenster.className = 'glocke-fenster';
    fenster.setAttribute('role', 'dialog');
    fenster.setAttribute('aria-label', titel);
    fenster.hidden = true;
    var ueberschrift = document.createElement('h3');
    ueberschrift.textContent = titel;
    var liste = document.createElement('div');
    liste.className = 'glocke-eintraege';
    fenster.appendChild(ueberschrift);
    fenster.appendChild(liste);

    halter.appendChild(knopf);
    halter.appendChild(fenster);

    var reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function neueZahl() {
      return eintraege.filter(function (e) { return e.neu; }).length;
    }
    function maleZahl() {
      var n = neueZahl();
      zahl.hidden = !n;
      zahl.textContent = String(n);
      knopf.setAttribute('aria-label', n ? titel + ', ' + n + ' neu' : titel + ', nichts Neues');
    }

    function male() {
      liste.textContent = '';
      eintraege.forEach(function (n) {
        var e = document.createElement('button');
        e.type = 'button';
        e.className = 'glocke-eintrag' + (n.neu ? '' : ' gelesen');
        e.innerHTML = '<span class="ge-titel"></span><span class="ge-text"></span>' +
                      '<span class="ge-zeit"><span class="ge-neu"></span></span>';
        e.querySelector('.ge-titel').textContent = n.titel;
        e.querySelector('.ge-text').textContent = n.text;
        /* „neu" steht als eigenes Stück vor der Zeit, damit es weichen kann,
           ohne die Zeile neu zu zeichnen. */
        e.querySelector('.ge-neu').textContent = 'neu, '; /* festes Leerzeichen, sonst frisst es der Zeilenumbruch */
        e.querySelector('.ge-zeit').appendChild(document.createTextNode(n.zeit));
        e.addEventListener('click', function () {
          schliesse();
          if (typeof n.tue === 'function') n.tue();
        });
        liste.appendChild(e);
      });
    }

    var alsGelesen = null;
    function schliesse() {
      if (fenster.hidden) return;
      if (alsGelesen) { clearTimeout(alsGelesen); alsGelesen = null; }
      fenster.hidden = true;
      knopf.setAttribute('aria-expanded', 'false');
      knopf.focus();
    }
    /* Das Fenster hängt an der Glocke, darf aber nie aus dem Bild laufen:
       auf schmalen Geräten steht die Glocke weit links, und 340 Pixel nach
       links wären dann halb draußen. */
    function platziere() {
      fenster.style.transform = '';
      var r = fenster.getBoundingClientRect();
      var schub = 0;
      if (r.left < 12) schub = 12 - r.left;
      else if (r.right > window.innerWidth - 12) schub = window.innerWidth - 12 - r.right;
      if (schub) fenster.style.transform = 'translateX(' + Math.round(schub) + 'px)';
    }

    function oeffne() {
      male();
      fenster.hidden = false;
      platziere();
      knopf.setAttribute('aria-expanded', 'true');
      var erster = liste.querySelector('.glocke-eintrag');
      if (erster) erster.focus();
      /* Geöffnet heißt gelesen — aber erst, nachdem das Auge die Zeile
         gesehen hat, sonst verschwindet das „neu" vor dem Lesen. */
      alsGelesen = setTimeout(function () {
        alsGelesen = null;
        eintraege.forEach(function (n) { n.neu = false; });
        liste.querySelectorAll('.glocke-eintrag').forEach(function (e) { e.classList.add('gelesen'); });
        maleZahl();
      }, reduziert ? 1600 : 900);
    }

    knopf.addEventListener('click', function (e) {
      e.stopPropagation();
      if (fenster.hidden) oeffne(); else schliesse();
    });
    document.addEventListener('click', function (e) {
      if (!fenster.hidden && !halter.contains(e.target)) schliesse();
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !fenster.hidden) schliesse();
    });
    window.addEventListener('resize', function () {
      if (!fenster.hidden) platziere();
    });

    maleZahl();

    return {
      knopf: knopf,
      oeffne: oeffne,
      schliesse: schliesse,
      /* Neue Lage von außen setzen (im Produkt: was der Server schickt). */
      setze: function (neue) {
        eintraege = neue || [];
        if (!fenster.hidden) male();
        maleZahl();
      }
    };
  }

  return { baue: baue };
})();
