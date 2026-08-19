/* quoroai-plattform-design · Die Krume ist die Navigation der Beratung
   (Issue #49).

   Ein Menü über allen Flächen gibt es bewusst nicht — man geht durch die Räume.
   Damit das trägt, muss die Krume zwei Dinge können, die sie hand­geschrieben auf
   einundzwanzig Flächen nie zuverlässig konnte: **ihren Raum nennen** und **in
   ihren Raum führen**, nicht auf die Vogelperspektive davor. Wer aus den Zeiten
   auf „← Modell" drückte, landete auf der Modellstadt — und beim ersten Mal in
   der neun Sekunden langen Aufbau-Fahrt, weil das Modell ohne Raute den Film
   spielt. Von dort waren es bis zur nächsten Tür noch zwei Schritte.

   Deshalb kennt dieser Baustein das Register der Räume und baut die Krume selbst.
   Die Fläche sagt nur, wo sie steht:

     <body data-krume-raum="zentrale" data-krume-hier="Zeiten">

   Liegt eine Fläche hinter einer anderen, kommt die Zwischenstufe dazu — dann
   trägt die Krume alle drei Stufen und nicht nur den Rückweg um eine:

     data-krume-ueber="beratung-termine.html|Termine und Übergaben"

   Wechselt der Raum erst zur Laufzeit (die Kundenakte liest ihn aus der Adresse),
   sagt es die Fläche nach dem Laden: Krume.setzeRaum('cordes').

   Nur für die quoroAI-Flächen der Beratung. Die Kundenflächen sind White-Label
   und haben keine Räume; das Modell selbst bringt seine eigene Krume mit, weil
   sie dort keinen Weg geht, sondern den Zoom schließt.
   Marker: KRUME-V2 (das Modell heißt beratung-cockpit.html) */
window.Krume = (function () {
  'use strict';

  /* Das Register der Räume. Dieselben fünf, die das Modell als Zonen kennt —
     die Namen stehen hier ein zweites Mal, aber der Zusammenhang ist geprüft:
     eine Krume, deren Raum das Modell nicht kennt, meldet sich in der Konsole. */
  var RAEUME = {
    zentrale: 'Zentrale',
    petersen: 'Petersen Stahlbau',
    cordes:   'Cordes Logistik',
    freitag:  'Bäckerei Freitag',
    mts:      'MTS Maschinenbau'
  };

  var MODELL = 'beratung-cockpit.html';

  var el = null;

  function tok(name, ersatz) { return 'var(' + name + ', ' + ersatz + ')'; }

  var stilDa = false;
  function stil() {
    if (stilDa) return;
    stilDa = true;
    /* Die Tokens kommen aus der Fläche, nicht aus diesem Baustein: quoroAI-Flächen
       bringen sie aus system.css mit. Die Ersatzwerte sind nur dafür da, dass eine
       Krume nie unsichtbar wird, wenn eine Fläche ein Token nicht setzt. */
    var linie  = tok('--nebel-200', '#e9e8f1');
    /* Der Schrägstrich ist kein Rand, sondern Text: er trägt den Bau des Wegs.
       In der Randfarbe war er auf dem Glas praktisch unsichtbar, und gerade auf
       den dreistufigen Krumen ist er die Gliederung. */
    var strich = tok('--nebel-400', '#a8a6bb');
    var leise  = tok('--nebel-600', '#5f5d75');
    var akzent = tok('--lila-600', '#6f63e8');
    var tinte  = tok('--tinte', '#18152f');
    var s = document.createElement('style');
    s.textContent =
      '#krume{' +
        /* Über dem Kopfband, immer. Es steht bei 80 und ist 60px hoch, die Krume
           beginnt bei 72 — bei breitem Fenster berühren sie sich nie. Wird das
           Fenster schmal, wächst das Kopfband auf 118px und die Krume wird seine
           zweite Zeile (Entscheidung 2026-08-14); dann muss sie darüber liegen.
           Ab welcher Breite das passiert, weiß jede Fläche für sich — die eine
           bei 1320, die Kundenakte bei 1420. Deshalb keine Medienabfrage hier,
           sondern ein Wert, der in beiden Lagen stimmt. */
        /* left kommt nicht von hier, sondern vom Kopfband der Fläche (siehe
           richteAus) — die Flächen wechseln bei 700, 760 und 820 Pixeln auf den
           schmalen Rand, und eine geratene Medienabfrage hätte auf zweien von
           dreien danebengelegen. */
        'position:fixed;top:72px;z-index:90;' +
        'display:inline-flex;align-items:center;gap:8px;' +
        /* 100% und nicht 100vw: vw zählt den klassischen Rollbalken mit, und
           dann läge eine lange Krume 15px unter ihm, statt sich zu kürzen. */
        'max-width:calc(100% - 2 * var(--krume-rand, 24px));' +
        'padding:9px 16px;border-radius:999px;border:0.5px solid ' + linie + ';' +
        'background:rgba(255,255,255,.82);' +
        'backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);' +
        'font-size:13px;color:' + tinte + ';text-decoration:none;' +
        'box-shadow:0 10px 30px rgba(16,19,26,.1);' +
      '}' +
      /* Jede Stufe ist ihr eigener Weg. Die letzte ist kein Weg — man steht darauf. */
      '#krume a{color:' + leise + ';font-weight:600;text-decoration:none;white-space:nowrap;' +
        'border-radius:6px;transition:color .2s ease;' +
        /* Der Daumen führt: die Stufen sind Text, das Trefferfeld ist es nicht
           (docs/wissen/handy-durchgang.md). Der Rand wächst nach außen, damit
           die Pille ihre Höhe behält. */
        'display:inline-block;padding:10px 0;margin:-10px 0}' +
      '@media (pointer:coarse){#krume a{padding:13px 0;margin:-13px 0}}' +
      '@media (hover:hover){#krume a:hover{color:' + akzent + '}}' +
      '#krume a:focus-visible{outline:2px solid ' + akzent + ';outline-offset:3px}' +
      '#krume .trenner{color:' + strich + ';flex:none}' +
      /* Ein langer Titel kürzt sich selbst, statt die Pille aus dem Bild zu
         schieben — min-width:0, sonst schrumpft ein Flex-Kind nie. */
      '#krume b{font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}';
    document.head.appendChild(s);
  }

  function stufe(ziel, text) {
    var a = document.createElement('a');
    a.href = ziel;
    a.textContent = text;
    return a;
  }

  function trenner() {
    var s = document.createElement('span');
    s.className = 'trenner';
    s.textContent = '/';
    return s;
  }

  /* hasOwnProperty, nicht die Wahrheitsprüfung: der Raum kommt bei der
     Kundenakte aus der Adresse, und „?mandat=toString" fände sonst die
     Prototyp-Kette — die Krume hieße dann „← function toString() { [native
     code] }" und führte auf eine Raute, die es nicht gibt. Dieselbe Falle hat
     die Kundenakte in V14 schon einmal gekostet. */
  function raumName(id) {
    return Object.prototype.hasOwnProperty.call(RAEUME, id) ? RAEUME[id] : null;
  }

  function zeichne(raumId) {
    var name = raumName(raumId);
    if (!name) return;
    el.textContent = '';
    el.appendChild(stufe(MODELL + '#' + raumId, '← ' + name));

    var ueber = document.body.getAttribute('data-krume-ueber');
    if (ueber) {
      var teile = ueber.split('|');
      if (teile.length === 2 && teile[0] && teile[1]) {
        el.appendChild(trenner());
        el.appendChild(stufe(teile[0].trim(), teile[1].trim()));
      }
    }

    var hier = document.body.getAttribute('data-krume-hier') || document.title;
    el.appendChild(trenner());
    var b = document.createElement('b');
    b.setAttribute('aria-current', 'page');
    b.textContent = hier;
    el.appendChild(b);
  }

  /* Die Krume steht auf derselben Linie wie das Kopfband darüber. Welchen Rand
     die Fläche gerade hält, sagt sie selbst — gemessen statt geraten. */
  function richteAus() {
    if (!el) return;
    var band = document.querySelector('nav');
    var rand = 24;
    if (band) {
      var gemessen = parseFloat(getComputedStyle(band).paddingLeft);
      if (gemessen >= 0) rand = gemessen;
    }
    el.style.left = rand + 'px';
    el.style.setProperty('--krume-rand', rand + 'px');
  }

  var messLauf = false;
  function richteBald() {
    if (messLauf) return;
    messLauf = true;
    requestAnimationFrame(function () { messLauf = false; richteAus(); });
  }

  function setzeRaum(id) {
    if (!raumName(id)) {
      if (window.console) console.warn('Krume: unbekannter Raum „' + id + '"');
      return;
    }
    document.body.setAttribute('data-krume-raum', id);
    if (el) zeichne(id);
  }

  function baue() {
    var raumId = document.body.getAttribute('data-krume-raum');
    if (!raumId || el) return;
    if (!raumName(raumId)) {
      if (window.console) console.warn('Krume: unbekannter Raum „' + raumId + '"');
      return;
    }
    stil();
    /* Ein div mit Rolle, kein <nav>: jede Fläche formt ihr Kopfband über den
       nackten Wähler `nav`, und ein zweites nav auf der Seite hätte sich
       dessen right:0 und Höhe eingefangen — die Krume lief einmal quer über
       den ganzen Schirm. */
    el = document.createElement('div');
    el.id = 'krume';
    el.setAttribute('role', 'navigation');
    el.setAttribute('aria-label', 'Wo du bist');
    zeichne(raumId);
    /* Hinter das Kopfband, nicht ans Ende des Dokuments. Die Krume IST die
       Navigation dieser Flächen — am Ende angehängt wäre sie mit der Tabtaste
       erst nach jedem Feld und jedem Knopf der Seite erreichbar (auf den Zeiten
       als 34. von 37 Stellen), und der Orientierungspunkt stünde in der
       Vorlesereihenfolge hinter dem Inhalt. */
    var band = document.querySelector('nav');
    if (band && band.parentNode) band.insertAdjacentElement('afterend', el);
    else document.body.appendChild(el);
    richteAus();
    window.addEventListener('resize', richteBald);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', baue);
  else baue();

  return { baue: baue, setzeRaum: setzeRaum, raeume: RAEUME };
})();
