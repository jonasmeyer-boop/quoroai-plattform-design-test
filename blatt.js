/* quoroai-plattform-design · Der Blatt-Blick ist ein Baustein und zeigt Seiten
   (Häppchen D4 Teil 1 „Ansehen", Issue #41).

   Es gab ihn schon einmal, aber nur an einer Stelle: im Kunden-Gespräch zog
   sich eine Dokument-Karte zu einem „Bogen" auf, in dem drei Absätze standen
   und darunter ehrlich „Seite 1 von 12". Überall sonst endete eine
   Dokumentzeile in einem Pfeil nach unten — wer wissen wollte, was drinsteht,
   musste die Datei aus der Software heraustragen und in einem fremden Programm
   öffnen. Die Akte war ein Regal, kein Arbeitsraum.

   Jetzt ist der Blatt-Blick ein Baustein, wie die Glocke und die Hilfe, und er
   zeigt das Dokument als das, was es ist: Papier. Seiten im Format DIN A4,
   untereinander zum Blättern, links die Miniaturen, unten die Seitenzahl.

   Drei Dinge, die ein Download nicht kann:
   1. Das Blatt schlägt aus SEINER Zeile auf und kehrt dorthin zurück — man
      verliert nie, welches Dokument man vor sich hat.
   2. Die Fundstelle ist eine Stelle, kein Wort: zitiert der KI-Berater aus
      Abschnitt 3, öffnet der Blick auf der Seite, wo dieser Satz steht, und
      der Satz leuchtet auf.
   3. Ein Scan ohne Textebene sagt es hier selbst — man sieht die leere Seite,
      statt in der Liste ein rotes Wort zu lesen.

   Aufruf aus der Fläche:
     Blatt.zeige({
       titel: 'Rahmenvertrag Stahl',
       meta:  '14 Seiten, vom Kunden, 12. Juni',
       seiten: [ [ {h:'…'}, {p:'…'}, {tab:[[…],[…]]}, {liste:[…]}, {klein:'…'},
                   {bild:'…url…', bildtext:'…'} ] ],
       seitenGesamt: 14,                             // wenn mehr existieren als gesetzt
       fund: {seite: 2, wort: 'Preisgleitklausel'},   // optional
       ohneText: true,                               // gescannt, nichts zu lesen
       randnotiz: 'die 4 % halten!',                 // optional, Handschrift am Rand
       griffe: [{wort:'Laden', tat:fn}],             // optional, unten in der Leiste
       fuss: 'Liegt in deiner Akte.',                // optional, unten links
       aus: element                                   // Zeile, aus der es aufschlägt
     });

   Markenneutral: alle Farben kommen aus den Tokens der Fläche — Kundenflächen
   setzen --blau/--linie/--grau über marke.js, quoroAI-Flächen bringen
   --lila-600/--nebel-200 aus system.css mit. Das Blatt selbst ist immer weißes
   Papier mit Serifen-Satz: ein Dokument ist kein Bildschirm, und dass man den
   Unterschied zwischen „das ist die Software" und „das ist mein Vertrag" sieht,
   ist der halbe Sinn der Sache.

   Alle Klassen tragen bb- (Blatt-Blick): blatt- ist auf mehreren Flächen schon
   für anderes vergeben, unter anderem für das Blatt-Symbol in den Zeilen.
   Marker: BLATT-V1 */
window.Blatt = (function () {
  'use strict';

  var BREIT = 720;          /* Satzbreite einer Seite, in Pixeln gedacht wie DIN A4 */
  var HOCH = Math.round(BREIT * 1.414);
  var MINI = 96;            /* Breite der Seiten-Miniatur in der Leiste */

  var offen = false;
  var schicht = null, lauf = null, leiste = null, kopfTitel = null, kopfMeta = null;
  var zaehler = null, zurueckKnopf = null, weiterKnopf = null, griffeKasten = null, fussWort = null;
  var seitenEl = [], miniEl = [];
  var jetzt = 0, gesamtDok = 0;
  var faehrtSelbst = 0, faehrtEnde = null;
  var vorherFokus = null, herkunft = null;
  var reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function tok(name, ersatz) { return 'var(' + name + ', ' + ersatz + ')'; }

  var stilDa = false;
  function stil() {
    if (stilDa) return;
    stilDa = true;
    var akzent = tok('--blau', tok('--lila-600', '#6f63e8'));
    var linie  = tok('--linie', tok('--nebel-200', '#e9e8f1'));
    var grau   = tok('--grau', tok('--nebel-500', '#7f7d93'));
    var tinte  = tok('--tinte', '#18152f');
    var kurve  = tok('--kurve', tok('--feder', 'cubic-bezier(.16,1,.3,1)'));
    var karte  = tok('--flaeche', tok('--karte', '#ffffff'));
    var papier = tok('--papier', tok('--grund', '#fdfdfe'));
    var s = document.createElement('style');
    s.textContent =
      /* ---- die Ebene ---- */
      '.bb-schicht{position:fixed;inset:0;z-index:940;display:flex;flex-direction:column}' +
      '.bb-schicht[hidden]{display:none}' +
      '.bb-veil{position:absolute;inset:0;background:' + papier + ';opacity:.92;' +
        'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}' +

      /* ---- Band oben: welches Dokument, und der Weg hinaus ---- */
      '.bb-band{position:relative;z-index:2;display:flex;align-items:center;gap:14px;' +
        'padding:11px 16px;border-bottom:0.5px solid ' + linie + ';background:' + karte + ';color:' + tinte + '}' +
      '.bb-band .wer{min-width:0;flex:1}' +
      '.bb-band .titel{display:block;font-family:' + tok('--schrift-schau', 'inherit') + ';font-weight:600;' +
        'word-spacing:1.5px;font-size:17px;line-height:1.25;letter-spacing:-.01em;' +
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.bb-band .meta{display:block;font-size:12.5px;color:' + grau + ';margin-top:1px;' +
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.bb-zu{flex-shrink:0;min-height:44px;padding:0 16px;border-radius:999px;' +
        'border:0.5px solid ' + linie + ';background:' + karte + ';color:' + tinte + ';' +
        'font:inherit;font-size:13.5px;font-weight:600;cursor:pointer}' +
      '@media (hover:hover){.bb-zu:hover{border-color:' + akzent + ';color:' + akzent + '}}' +

      /* ---- der Leseraum: Miniaturen links, Papier in der Mitte ---- */
      '.bb-raum{position:relative;z-index:2;flex:1;min-height:0;display:flex;justify-content:center;gap:22px;padding:0 16px}' +
      '.bb-leiste{width:' + (MINI + 20) + 'px;flex-shrink:0;overflow-y:auto;padding:20px 0 40px;' +
        'display:flex;flex-direction:column;align-items:center;gap:12px}' +
      '.bb-mini{border:0;background:none;padding:0;cursor:pointer;display:block;width:' + MINI + 'px;flex-shrink:0}' +
      '.bb-mini .rahmen{width:' + MINI + 'px;height:' + Math.round(MINI * 1.414) + 'px;overflow:hidden;' +
        'background:#fff;border-radius:3px;box-shadow:0 0 0 1px ' + linie + ', 0 4px 12px rgba(16,19,26,.08);' +
        'transition:box-shadow .18s ' + kurve + '}' +
      '.bb-mini .nr{display:block;font:inherit;font-size:11px;font-weight:600;color:' + grau + ';' +
        'margin-top:5px;font-variant-numeric:tabular-nums}' +
      '@media (hover:hover){.bb-mini:hover .rahmen{box-shadow:0 0 0 1px ' + akzent + ', 0 6px 18px rgba(16,19,26,.12)}}' +
      '.bb-mini.hier .rahmen{box-shadow:0 0 0 2px ' + akzent + ', 0 6px 18px rgba(16,19,26,.14)}' +
      '.bb-mini.hier .nr{color:' + akzent + '}' +
      '.bb-lauf{flex:1;min-width:0;max-width:' + (BREIT + 40) + 'px;overflow-y:auto;overscroll-behavior:contain;' +
        'padding:20px 0 40px;display:flex;flex-direction:column;align-items:center;gap:18px}' +

      /* ---- das Papier ---- */
      /* Eine Seite ist eine Seite: sie passt ganz ins Fenster, sonst zählt die
         Seitenzahl unten etwas, das man nie am Stück sieht. Also führt die
         Höhe die Breite — nicht umgekehrt. */
      '.bb-seite{width:min(100%, calc((100vh - 210px) / 1.414));max-width:' + BREIT + 'px;' +
        'aspect-ratio:1 / 1.414;flex-shrink:0;position:relative;' +
        'background:#fff;border-radius:2px;' +
        'box-shadow:0 0 0 0.5px rgba(16,19,26,.10), 0 18px 50px rgba(16,19,26,.14);' +
        /* Der Rand wächst mit dem Blatt: ein fester Zentimeter sähe auf einer
           halb so breiten Seite doppelt so breit aus. */
        'padding:9.3% 10.4%;overflow:hidden;' +
        'font-family:Georgia,"Iowan Old Style","Times New Roman",serif;' +
        'color:#1b1b1f;font-size:15px;line-height:1.62;' +
        /* Der Satz schrumpft mit dem Blatt: sonst stünde am Handy die halbe
           Seite über den Rand hinaus und der Beschnitt fräße den Text. */
        'container-type:inline-size}' +
      '.bb-seite > * + *{margin-top:11px}' +
      '.bb-seite h4{font-family:inherit;font-size:17px;font-weight:700;line-height:1.3;margin-top:22px;letter-spacing:0}' +
      '.bb-seite > h4:first-child{margin-top:0}' +
      '.bb-seite .bb-klein{font-size:12.5px;color:#6b6b74;line-height:1.5}' +
      '.bb-seite ul{margin-left:18px}' +
      '.bb-seite li{margin-top:5px}' +
      '.bb-seite table{width:100%;border-collapse:collapse;font-size:14px;font-variant-numeric:tabular-nums}' +
      '.bb-seite th{text-align:left;font-weight:700;border-bottom:1px solid #1b1b1f;padding:5px 8px 5px 0}' +
      '.bb-seite td{border-bottom:0.5px solid #dcdce2;padding:5px 8px 5px 0}' +
      '.bb-seite td + td,.bb-seite th + th{text-align:right;padding-right:0}' +
      '.bb-seite figure img{display:block;width:100%;border-radius:3px}' +
      '.bb-seite figcaption{font-size:12px;color:#6b6b74;margin-top:6px}' +
      '.bb-nr{position:absolute;left:0;right:0;bottom:4.2%;' +
        'text-align:center;font-size:11.5px;color:#8d8d97;font-variant-numeric:tabular-nums}' +
      '@container (max-width:520px){' +
        '.bb-seite{font-size:13px}.bb-seite h4{font-size:15px}.bb-seite table{font-size:12px}' +
      '}' +

      /* Die Fundstelle: erst leuchtet sie auf, dann bleibt sie markiert. */
      '.bb-seite mark{background:color-mix(in srgb, ' + akzent + ' 20%, transparent);' +
        'color:inherit;border-radius:3px;padding:0 2px}' +
      '.bb-seite mark.frisch{animation:bb-fund 1.6s ' + kurve + ' 1}' +
      '@keyframes bb-fund{0%,15%{background:color-mix(in srgb, ' + akzent + ' 62%, transparent)}' +
        '100%{background:color-mix(in srgb, ' + akzent + ' 20%, transparent)}}' +

      /* Eine Seite ohne Textebene: man sieht, dass da nichts zu holen ist. */
      '.bb-seite.leer{display:flex;align-items:center;justify-content:center;text-align:center;' +
        'background:repeating-linear-gradient(-45deg,#fff 0 13px,#fafafa 13px 26px)}' +
      '.bb-seite.leer .bb-nix{max-width:34ch;font-size:14px;color:#6b6b74;line-height:1.6}' +
      /* Die Seiten, die in der Vorführung nicht gesetzt sind — ehrlich statt erfunden. */
      '.bb-rest{width:100%;max-width:' + BREIT + 'px;padding:15px 18px;border-radius:12px;' +
        'border:1px dashed ' + linie + ';background:' + karte + ';color:' + grau + ';' +
        'font-size:13px;line-height:1.55;text-align:center}' +

      /* Die Handschrift am Rand: der Gedanke, den jemand daneben geschrieben hat */
      '.bb-notiz{position:absolute;right:14px;top:12px;max-width:40%;text-align:right;rotate:-3deg;' +
        'font-family:Caveat,cursive;font-size:22px;font-weight:700;line-height:1.2;color:' + akzent + ';opacity:.92}' +

      /* ---- Steuerleiste unten: blättern und die Griffe der Fläche ---- */
      '.bb-steuer{position:relative;z-index:2;display:flex;align-items:center;gap:10px;flex-wrap:wrap;' +
        'padding:10px 16px calc(10px + env(safe-area-inset-bottom));' +
        'border-top:0.5px solid ' + linie + ';background:' + karte + ';color:' + tinte + '}' +
      '.bb-steuer .zaehler{font-size:13px;color:' + grau + ';font-variant-numeric:tabular-nums}' +
      '.bb-steuer .fusswort{font-size:12.5px;color:' + grau + ';line-height:1.4;flex:1 1 12ch;min-width:0}' +
      '.bb-steuer button{font:inherit;font-size:13.5px;font-weight:600;min-height:44px;padding:0 15px;' +
        'border-radius:999px;cursor:pointer;border:0.5px solid ' + linie + ';background:' + karte + ';color:' + tinte + '}' +
      '@media (hover:hover){.bb-steuer button:hover:not([disabled]){border-color:' + akzent + '}}' +
      '.bb-steuer button[disabled]{opacity:.4;cursor:default}' +
      '.bb-steuer .griffe{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}' +

      /* ---- das Aufschlagen: aus der Zeile heraus ---- */
      '.bb-schicht .bb-band,.bb-schicht .bb-steuer,.bb-schicht .bb-leiste,' +
        '.bb-schicht .bb-veil{transition:opacity .28s ' + kurve + '}' +
      '.bb-schicht.faehrt .bb-band,.bb-schicht.faehrt .bb-steuer,' +
        '.bb-schicht.faehrt .bb-leiste,.bb-schicht.faehrt .bb-veil{opacity:0}' +

      '@supports (height:100dvh){.bb-seite{width:min(100%, calc((100dvh - 210px) / 1.414))}}' +
      '@media (max-width:900px){' +
        /* Am Handy führt die Breite: eine Seite, die in die Höhe passt, wäre
           dort so schmal, dass niemand mehr etwas läse. Dann scrollt man eben
           innerhalb der Seite. */
        /* Und sie darf mitwachsen: in ein A4-Verhältnis von 340 Pixeln Breite
           passt kein Vertragsabschnitt, der Rest wäre abgeschnitten. Die
           Seitenzahl unten bleibt trotzdem ehrlich, sie zählt Seiten des
           Dokuments und nicht Bildschirme. */
        '.bb-seite{width:100%;aspect-ratio:auto;padding-bottom:56px}' +
        /* Eine Seite ohne Text hat auch keine Höhe — ohne Mindestmaß wären drei
           leere Seiten drei Streifen, und niemand sähe, dass es Seiten sind. */
        '.bb-seite.leer{min-height:52vh}' +
        '.bb-leiste{display:none}' +
        '.bb-raum{padding:0 12px;gap:0}' +
        '.bb-lauf{padding:14px 0 28px}' +
        '.bb-notiz{font-size:19px}' +
      '}' +
      '@media (prefers-reduced-motion:reduce){' +
        '.bb-seite mark.frisch{animation:none}' +
        '.bb-schicht *{transition:none!important}' +
      '}';
    document.head.appendChild(s);
  }

  /* ---------- Bauen ---------- */
  function baueSchicht() {
    stil();
    schicht = document.createElement('div');
    schicht.className = 'bb-schicht';
    schicht.hidden = true;
    schicht.setAttribute('role', 'dialog');
    schicht.setAttribute('aria-modal', 'true');

    var veil = document.createElement('div');
    veil.className = 'bb-veil';
    veil.addEventListener('click', function () { schliesse(); });

    var band = document.createElement('div');
    band.className = 'bb-band';
    band.innerHTML = '<span class="wer"><span class="titel"></span><span class="meta"></span></span>' +
      '<button type="button" class="bb-zu">Schließen</button>';
    kopfTitel = band.querySelector('.titel');
    kopfMeta = band.querySelector('.meta');
    band.querySelector('.bb-zu').addEventListener('click', function () { schliesse(); });

    var raum = document.createElement('div');
    raum.className = 'bb-raum';
    leiste = document.createElement('div');
    leiste.className = 'bb-leiste';
    leiste.setAttribute('aria-label', 'Seiten');
    lauf = document.createElement('div');
    lauf.className = 'bb-lauf';
    raum.append(leiste, lauf);

    var steuer = document.createElement('div');
    steuer.className = 'bb-steuer';
    steuer.innerHTML = '<button type="button" class="vor">Zurück</button>' +
      '<button type="button" class="nach">Weiter</button>' +
      '<span class="zaehler" aria-live="polite"></span>' +
      '<span class="fusswort"></span>' +
      '<span class="griffe"></span>';
    zaehler = steuer.querySelector('.zaehler');
    fussWort = steuer.querySelector('.fusswort');
    zurueckKnopf = steuer.querySelector('.vor');
    weiterKnopf = steuer.querySelector('.nach');
    griffeKasten = steuer.querySelector('.griffe');
    zurueckKnopf.addEventListener('click', function () { zuSeite(jetzt - 1); });
    weiterKnopf.addEventListener('click', function () { zuSeite(jetzt + 1); });

    schicht.append(veil, band, raum, steuer);
    document.body.appendChild(schicht);

    lauf.addEventListener('scroll', merkeSeite, { passive: true });
    if ('onscrollend' in lauf) lauf.addEventListener('scrollend', fahrtEnde, { passive: true });
  }

  /* ---------- Eine Seite setzen ---------- */
  function zahm(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  /* Erst im Rohtext merken, dann entschärfen, dann die Merkzeichen zu einer
     Markierung machen — derselbe Kniff wie in der Suche der Unterlagen. Wer
     zuerst entschärft und dann sucht, schneidet mit einem Treffer auf „amp"
     mitten in ein &amp; hinein; und „Nordholm & Partner" fände er gar nicht,
     weil im entschärften Text kein & mehr steht. */
  function mitFund(text, wort, treffer) {
    if (!wort || treffer.getroffen) return zahm(text);
    var w = String(wort).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var re = new RegExp('(' + w + ')', 'i');
    var roh = String(text);
    if (!re.test(roh)) return zahm(roh);
    treffer.getroffen = true;
    var merk = roh.replace(re, '\u0001$1\u0002');
    return zahm(merk).replace('\u0001', '<mark class="frisch">').replace('\u0002', '</mark>');
  }

  function baueSeite(bloecke, nr, gesamt, fundWort) {
    var seite = document.createElement('div');
    seite.className = 'bb-seite';
    var treffer = { getroffen: false };
    bloecke.forEach(function (b) {
      var el;
      if (b.bild) {
        el = document.createElement('figure');
        var im = document.createElement('img');
        im.src = b.bild;
        im.alt = b.bildtext || '';
        el.appendChild(im);
        if (b.bildtext) {
          var cap = document.createElement('figcaption');
          cap.textContent = b.bildtext;
          el.appendChild(cap);
        }
      } else if (b.h) {
        el = document.createElement('h4');
        el.innerHTML = mitFund(b.h, fundWort, treffer);
      } else if (b.klein) {
        el = document.createElement('div');
        el.className = 'bb-klein';
        el.innerHTML = mitFund(b.klein, fundWort, treffer);
      } else if (b.liste) {
        el = document.createElement('ul');
        b.liste.forEach(function (z) {
          var li = document.createElement('li');
          li.innerHTML = mitFund(z, fundWort, treffer);
          el.appendChild(li);
        });
      } else if (b.tab) {
        el = document.createElement('table');
        b.tab.forEach(function (reihe, i) {
          var tr = document.createElement('tr');
          reihe.forEach(function (zelle) {
            var td = document.createElement(i === 0 ? 'th' : 'td');
            td.innerHTML = mitFund(zelle, fundWort, treffer);
            tr.appendChild(td);
          });
          el.appendChild(tr);
        });
      } else {
        el = document.createElement('p');
        el.innerHTML = mitFund(b.p || '', fundWort, treffer);
      }
      seite.appendChild(el);
    });
    seite.appendChild(seitenzahl(nr, gesamt));
    return seite;
  }

  function seitenzahl(nr, gesamt) {
    var f = document.createElement('div');
    f.className = 'bb-nr';
    f.textContent = gesamt ? nr + ' von ' + gesamt : String(nr);
    return f;
  }

  function baueLeereSeite(satz, nr, gesamt) {
    var seite = document.createElement('div');
    seite.className = 'bb-seite leer';
    var t = document.createElement('div');
    t.className = 'bb-nix';
    t.textContent = satz;
    seite.append(t, seitenzahl(nr, gesamt));
    return seite;
  }

  /* Die Miniatur ist die Seite selbst, kleingerechnet — kein zweites Bild, das
     mit dem ersten auseinanderlaufen kann. */
  function baueMini(seite, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bb-mini';
    b.setAttribute('aria-label', 'Seite ' + (i + 1));
    var rahmen = document.createElement('div');
    rahmen.className = 'rahmen';
    var klon = seite.cloneNode(true);
    klon.style.width = BREIT + 'px';
    klon.style.height = HOCH + 'px';
    klon.style.maxWidth = 'none';
    klon.style.aspectRatio = 'auto';
    klon.style.transform = 'scale(' + (MINI / BREIT) + ')';
    klon.style.transformOrigin = '0 0';
    klon.style.boxShadow = 'none';
    klon.setAttribute('aria-hidden', 'true');
    rahmen.appendChild(klon);
    var nr = document.createElement('span');
    nr.className = 'nr';
    nr.textContent = String(i + 1);
    b.append(rahmen, nr);
    b.addEventListener('click', function () { zuSeite(i); });
    return b;
  }

  /* ---------- Blättern ---------- */
  function zuSeite(i, sofort) {
    i = Math.max(0, Math.min(seitenEl.length - 1, i));
    jetzt = i;
    var el = seitenEl[i];
    if (el) {
      var weich = !sofort && !reduziert;
      /* Solange das Blatt selbst gefahren wird, darf der Scroll-Horcher die
         Seitenzahl nicht mitzählen: sonst läse ein zweiter Druck auf „Weiter"
         mitten in der Fahrt eine Seite, an der man gerade nur vorbeikommt —
         und spränge zurück. Das Ende meldet der Browser (scrollend); die Uhr
         ist nur der Ersatz, wo er das nicht kann. Sie muss länger laufen als
         die längste Fahrt — von Seite 1 auf Seite 30 dauert es. */
      haltAn();
      if (weich) { faehrtSelbst = 1;
        faehrtEnde = setTimeout(fahrtEnde, 'onscrollend' in lauf ? 2600 : 560); }
      lauf.scrollTo({ top: el.offsetTop - lauf.offsetTop - 14, behavior: weich ? 'smooth' : 'auto' });
    }
    zeigeStand();
  }

  /* Die Fahrt endet, wenn sie endet — oder spätestens, wenn die Uhr abläuft. */
  function fahrtEnde() {
    haltAn();
    if (offen) merkeSeite();
  }
  function haltAn() {
    faehrtSelbst = 0;
    clearTimeout(faehrtEnde);
    faehrtEnde = null;
  }

  function merkeSeite() {
    if (faehrtSelbst) return;
    /* Welche Seite man liest, entscheidet die Mitte des Fensters, nicht der
       obere Rand: sonst gilt eine Seite schon als „hier", wenn nur ihr letzter
       Zentimeter zu sehen ist. */
    var mitte = lauf.scrollTop + lauf.clientHeight / 2;
    var beste = 0;
    seitenEl.forEach(function (el, i) {
      if (el.offsetTop - lauf.offsetTop <= mitte) beste = i;
    });
    if (beste !== jetzt) { jetzt = beste; zeigeStand(); }
  }

  function zeigeStand() {
    var gesamt = seitenEl.length;
    /* Gezählt wird das Dokument, nicht die Vorführung: unten steht dieselbe
       Zahl wie auf dem Blatt selbst, sonst widersprächen sich zwei Zähler auf
       einem Bildschirm. */
    zaehler.textContent = gesamtDok > 1 ? 'Seite ' + (jetzt + 1) + ' von ' + gesamtDok : '';
    zurueckKnopf.disabled = jetzt <= 0;
    weiterKnopf.disabled = jetzt >= gesamt - 1;
    miniEl.forEach(function (m, i) {
      m.classList.toggle('hier', i === jetzt);
      if (i === jetzt) m.setAttribute('aria-current', 'true');
      else m.removeAttribute('aria-current');
    });
    var m = miniEl[jetzt];
    if (m && leiste.scrollHeight > leiste.clientHeight) {
      var oben = m.offsetTop - leiste.offsetTop;
      if (oben < leiste.scrollTop || oben + m.offsetHeight > leiste.scrollTop + leiste.clientHeight) {
        leiste.scrollTo({ top: oben - 20, behavior: reduziert ? 'auto' : 'smooth' });
      }
    }
  }

  /* ---------- Auf und zu ---------- */
  function zeige(dok) {
    if (!schicht) baueSchicht();
    offen = true;
    vorherFokus = document.activeElement;
    herkunft = dok.aus || null;

    kopfTitel.textContent = dok.titel || 'Dokument';
    kopfMeta.textContent = dok.meta || '';
    /* Nicht über hidden: die eigene Regel .bb-band .meta{display:block} kommt
       aus dem Papier des Autors und schlägt das display:none des Browsers.
       Ohne Meta-Zeile stünde sonst eine leere Zeile unter dem Titel. */
    kopfMeta.style.display = dok.meta ? '' : 'none';
    schicht.setAttribute('aria-label', (dok.titel || 'Dokument') + ', angesehen');

    lauf.textContent = '';
    leiste.textContent = '';
    seitenEl = [];
    miniEl = [];

    var seiten = dok.seiten || [];
    var gesamt = dok.seitenGesamt || seiten.length || 1;
    gesamtDok = gesamt;
    var fund = dok.fund || null;

    if (dok.ohneText) {
      /* ohneText: true nimmt den Satz für den gescannten Stapel; wer einen
         eigenen Grund hat — Fotos etwa —, schreibt ihn selbst hinein. */
      var satz = typeof dok.ohneText === 'string' ? dok.ohneText :
        'Diese Seite ist ein Bild. Aus dem Scan kam kein Text heraus — weder kannst du hier suchen, noch kann der KI-Berater daraus zitieren.';
      var n = Math.min(gesamt, 3);
      for (var k = 0; k < n; k++) seitenEl.push(baueLeereSeite(satz, k + 1, gesamt));
    } else {
      seiten.forEach(function (bloecke, i) {
        seitenEl.push(baueSeite(bloecke, i + 1, gesamt,
          (fund && fund.seite === i + 1) ? fund.wort : null));
      });
    }

    /* Ein Dokument ohne eine einzige Seite gibt es nicht — sonst stünde man
       vor einer leeren Ebene und wüsste nicht, ob sie kaputt oder leer ist. */
    if (!seitenEl.length) {
      seitenEl.push(baueLeereSeite('Zu diesem Dokument liegt in der Vorführung keine Seite vor.', 1, gesamt));
    }

    seitenEl.forEach(function (el, i) {
      lauf.appendChild(el);
      var m = baueMini(el, i);
      miniEl.push(m);
      leiste.appendChild(m);
    });

    if (gesamt > seitenEl.length) {
      var rest = document.createElement('div');
      rest.className = 'bb-rest';
      rest.textContent = (gesamt - seitenEl.length === 1
        ? 'Seite ' + gesamt + ' ist'
        : 'Seite ' + (seitenEl.length + 1) + ' bis ' + gesamt + ' sind') +
        ' in dieser Vorführung nicht gesetzt. Im Produkt blätterst du hier weiter.';
      lauf.appendChild(rest);
    }

    var alteNotiz = schicht.querySelector('.bb-notiz');
    if (alteNotiz) alteNotiz.remove();
    if (dok.randnotiz && seitenEl.length) {
      var notiz = document.createElement('div');
      notiz.className = 'bb-notiz';
      notiz.textContent = dok.randnotiz;
      seitenEl[0].appendChild(notiz);
      /* Auch die Miniatur der ersten Seite trägt sie — sie ist ein Klon, der
         vor der Notiz entstanden ist. */
      var mk = miniEl[0] && miniEl[0].querySelector('.bb-seite');
      if (mk) mk.appendChild(notiz.cloneNode(true));
    }

    fussWort.textContent = dok.fuss || '';
    griffeKasten.textContent = '';
    (dok.griffe || []).forEach(function (g) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = g.wort;
      b.addEventListener('click', function () { g.tat(dok); });
      griffeKasten.appendChild(b);
    });

    schicht.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    haltAn();

    jetzt = fund && fund.seite ? Math.min(fund.seite, seitenEl.length) - 1 : 0;
    zuSeite(jetzt, true);

    aufschlagen();
    schicht.querySelector('.bb-zu').focus();
  }

  /* Der Moment: das Blatt wächst aus seiner Zeile auf die volle Seite. Gemessen
     wird die Zeile, aus der geklickt wurde — nicht geraten, sonst käme das
     Dokument aus dem Nichts, und man verlöre, wovon man kommt. */
  function aufschlagen() {
    var erste = seitenEl[jetzt] || seitenEl[0];
    if (reduziert || !herkunft || !erste || !herkunft.getBoundingClientRect) return;
    var von = herkunft.getBoundingClientRect();
    var zu = erste.getBoundingClientRect();
    if (!von.width || !von.height || !zu.width || !zu.height) return;
    var sx = von.width / zu.width, sy = von.height / zu.height;
    var dx = (von.left + von.width / 2) - (zu.left + zu.width / 2);
    var dy = (von.top + von.height / 2) - (zu.top + zu.height / 2);
    schicht.classList.add('faehrt');
    erste.style.transition = 'none';
    erste.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
    erste.style.opacity = '.35';
    /* Zwei Bilder warten, nicht eines: im selben Bild gesetzt und gelöst hätte
       der Browser den Startzustand nie gezeichnet, und Band, Leiste und
       Steuerleiste wären ohne Übergang einfach da. */
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      erste.style.transition = 'transform .44s ' + 'var(--kurve, cubic-bezier(.16,1,.3,1))' + ', opacity .3s ease';
      erste.style.transform = 'none';
      erste.style.opacity = '1';
      schicht.classList.remove('faehrt');
      setTimeout(function () {
        erste.style.transition = ''; erste.style.transform = ''; erste.style.opacity = '';
      }, 500);
    }); });
  }

  function schliesse() {
    if (!offen) return;
    offen = false;
    /* Keine Fahrt läuft in eine geschlossene Ebene hinein: dort sind alle
       Maße null, und der Zähler stünde beim Wiederaufschlagen auf der
       letzten Seite. */
    haltAn();
    schicht.hidden = true;
    document.documentElement.style.overflow = '';
    /* Zurück auf den Knopf, der aufgeschlagen hat. Nicht auf die Zeile: die ist
       ein div und trägt zwar ein focus(), nimmt den Fokus aber nicht an — der
       Fokus bliebe dann auf „Schließen" in einer Ebene, die schon weg ist. */
    var ziel = (vorherFokus && document.contains(vorherFokus) && !schicht.contains(vorherFokus))
      ? vorherFokus
      : (herkunft && document.contains(herkunft) ? herkunft : null);
    if (ziel && ziel.focus) ziel.focus();
    if (document.activeElement === document.body && herkunft && herkunft.scrollIntoView) {
      /* Wenn nichts den Fokus nimmt, wenigstens die Zeile im Blick behalten. */
      herkunft.scrollIntoView({block: 'nearest'});
    }
  }

  /* ---------- Tastatur: Esc hinaus, Pfeile blättern, Tab bleibt drin ---------- */
  document.addEventListener('keydown', function (e) {
    if (!offen) return;
    /* Die Ebene fängt Escape ab und gibt ihn nicht weiter: unter ihr steht auf
       manchen Flächen ein Regal oder eine Liste, die auf denselben Druck
       zumacht — ein Escape darf nicht zwei Dinge schließen. */
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); schliesse(); return; }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); zuSeite(jetzt + 1); return; }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); zuSeite(jetzt - 1); return; }
    if (e.key !== 'Tab') return;
    /* Modal heißt modal: der Fokus verlässt die Ebene nicht, sonst tippt man
       blind in der Fläche darunter herum. */
    /* Nur, was auch dasteht: die Seiten-Miniaturen sind am Handy display:none,
       und ein unsichtbarer letzter Halt hieße, dass Tab aus der Ebene heraus
       in die Fläche dahinter fällt. */
    var greifbar = Array.prototype.filter.call(
      schicht.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.offsetParent !== null || el === document.activeElement; });
    if (!greifbar.length) return;
    var erster = greifbar[0], letzter = greifbar[greifbar.length - 1];
    if (!schicht.contains(document.activeElement)) { e.preventDefault(); erster.focus(); return; }
    if (e.shiftKey && document.activeElement === erster) { e.preventDefault(); letzter.focus(); }
    else if (!e.shiftKey && document.activeElement === letzter) { e.preventDefault(); erster.focus(); }
  });

  return { zeige: zeige, schliesse: schliesse, offen: function () { return offen; } };
})();
