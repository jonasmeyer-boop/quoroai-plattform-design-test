/* quoroai-plattform-design · Die Uhr: der Baustein, der über allen Flächen
   des Cockpits liegt (Häppchen B1, Issue #29).

   Warum ein Baustein und kein Raum: Zeit entsteht nicht auf der Zeiten-Seite,
   sondern während man woanders arbeitet. Eine Uhr, die man erst suchen muss,
   läuft nicht mit. Deshalb hängt sie als Dock unten im Bild — auf dem Handy
   über die ganze Breite, am großen Fenster rechts unten — und überlebt den
   Seitenwechsel (im Entwurf über sessionStorage, im Produkt über den Server).

   Die drei Regeln, die das Produkt gesetzt hat, stecken hier drin:
   - Höchstens EINE Uhr je Mensch. Ein Start bei laufender Uhr ist deshalb
     kein zweiter Lauf, sondern ein Wechsel: die alte wird in derselben
     Sekunde gebucht, in der die neue anfängt. Keine Minute fällt in den Spalt.
   - Fremde Uhren hält niemand an. Der Baustein kennt nur die eigene.
   - Der Daumen führt: jede Tippfläche ≥ 44px, alles Wichtige liegt unten.

   Kein Deko-Punkt (Jonas' Regel): dass die Uhr läuft, sagen die laufenden
   Sekunden und das gefüllte Glas — kein farbiger Kreis daneben.

   Aufruf: <script src="uhr.js"></script> ans Ende der Fläche. Der Baustein
   setzt sich selbst; ein Marker im HTML ist nicht nötig. Wer die Buchungen
   braucht (die Zeiten-Fläche), hört auf das Ereignis `uhr:gebucht` und liest
   `Uhr.buchungen()`.

   Marker: UHR-V1 */
window.Uhr = (function () {
  'use strict';

  var SCHLUESSEL_LAUF = 'quoro-uhr-lauf';
  var SCHLUESSEL_BUCH = 'quoro-uhr-buchungen';

  /* Die Mandate der Beispielberatung. Im Produkt kommt die Liste vom Server;
     hier steht sie fest, damit jede Fläche dieselben Namen zeigt. */
  var MANDATE = [
    { id: 'petersen', name: 'Petersen Stahlbau' },
    { id: 'cordes',   name: 'Cordes Logistik' },
    { id: 'freitag',  name: 'Bäckerei Freitag' },
    { id: 'intern',   name: 'Eigene Beratung, nicht abrechenbar' }
  ];

  var reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ablage ---------- */
  function lies(schluessel, ersatz) {
    try {
      var roh = sessionStorage.getItem(schluessel);
      return roh ? JSON.parse(roh) : ersatz;
    } catch (e) { return ersatz; }
  }
  function schreib(schluessel, wert) {
    try {
      if (wert === null) sessionStorage.removeItem(schluessel);
      else sessionStorage.setItem(schluessel, JSON.stringify(wert));
    } catch (e) { /* privater Modus: die Uhr läuft dann nur auf dieser Seite */ }
  }

  var lauf = lies(SCHLUESSEL_LAUF, null);
  var buchungen = lies(SCHLUESSEL_BUCH, null);
  if (!buchungen) {
    /* Was der Vormittag schon gebracht hat — damit die Fläche nicht leer
       startet und man den Wochenstand glauben kann. */
    buchungen = [
      { name: 'Cordes Logistik',   was: 'Fuhrpark und Finanzierung',      von: '8:15',  bis: '9:05',  dauer: 3000, quelle: 'uhr' },
      { name: 'Petersen Stahlbau', was: 'Marge, Vorbereitung des Termins', von: '9:20',  bis: '10:12', dauer: 3120, quelle: 'uhr' }
    ];
    schreib(SCHLUESSEL_BUCH, buchungen);
  }

  /* ---------- Zeit in Worten und Ziffern ---------- */
  function zweistellig(n) { return (n < 10 ? '0' : '') + n; }

  /* Die laufende Anzeige: unter einer Stunde mm:ss, darüber h:mm:ss. Die
     Sekunden bleiben stehen, auch nach der Stunde — sie sind der Beweis,
     dass die Uhr wirklich läuft. */
  function ziffern(sek) {
    var h = Math.floor(sek / 3600), m = Math.floor((sek % 3600) / 60), s = sek % 60;
    return h ? h + ':' + zweistellig(m) + ':' + zweistellig(s)
             : m + ':' + zweistellig(s);
  }
  /* Das gebuchte Maß: Stunden und Minuten, so wie es auf der Rechnung steht. */
  function dauerWort(sek) {
    var m = Math.round(sek / 60);
    var h = Math.floor(m / 60);
    m = m % 60;
    if (!h) return m + ' Min';
    return h + ':' + zweistellig(m) + ' Std';
  }
  function vorlesen(sek) {
    var m = Math.round(sek / 60);
    var h = Math.floor(m / 60);
    m = m % 60;
    if (!h) return m + ' Minuten';
    return h + (h === 1 ? ' Stunde ' : ' Stunden ') + m + ' Minuten';
  }
  function uhrzeit(ms) {
    var d = new Date(ms);
    return d.getHours() + ':' + zweistellig(d.getMinutes());
  }

  /* ---------- Stil ---------- */
  var stilDa = false;
  function stil() {
    if (stilDa) return;
    stilDa = true;
    var s = document.createElement('style');
    s.textContent =
      /* Am großen Fenster wächst das Dock mit dem Namen, statt ihn zu
         beschneiden — „Petersen Stahl…" ist kein Mandat. */
      '.uhr-dock{position:fixed;z-index:95;right:24px;bottom:calc(20px + env(safe-area-inset-bottom));' +
        'width:min(400px,calc(100vw - 36px));' +
        'border-radius:22px;padding:10px 12px;' +
        /* Dichter als die Kopfzeilen: unter dem Dock läuft Fließtext durch,
           und ein Mandatsname, durch den fremde Wörter schimmern, ist keiner. */
        'background:rgba(255,255,255,.82);' +
        'backdrop-filter:blur(40px) saturate(200%);-webkit-backdrop-filter:blur(40px) saturate(200%);' +
        'border:1px solid rgba(255,255,255,.6);' +
        'box-shadow:inset 0 1px 0 rgba(255,255,255,.8), 0 18px 46px rgba(59,52,134,.22);' +
        'font-family:var(--schrift-text,system-ui,sans-serif);color:var(--tinte,#18152f);' +
        'transition:transform .3s var(--kurve,cubic-bezier(.16,1,.3,1))}' +
      '@supports not (backdrop-filter: blur(1px)){.uhr-dock{background:rgba(255,255,255,.95)}}' +
      '@media (prefers-reduced-transparency: reduce){' +
        '.uhr-dock{background:#fff;backdrop-filter:none;-webkit-backdrop-filter:none}}' +

      /* Die Ruhelage: eine Kapsel, sonst nichts. Sie soll nicht mit dem
         Inhalt um Aufmerksamkeit streiten, solange keine Zeit läuft. */
      '.uhr-dock.ruht{width:auto;padding:6px}' +
      /* Auch die Liste: sie hängt am Body, nicht im Dock — ohne diese Zeile
         zeichnet der Browser jeder Zeile seinen grauen Knopfgrund. */
      '.uhr-dock button,.uhr-liste button{font-family:inherit;cursor:pointer;border:0;background:none;color:inherit}' +
      '.uhr-dock [hidden]{display:none!important}' +

      '.uhr-reihe{display:flex;align-items:center;gap:10px}' +

      /* Der linke Griff: wer läuft. Ein Tippen öffnet die Mandatsliste — das
         ist zugleich der Wechsel, weil ein zweiter Lauf nicht vorgesehen ist. */
      '.uhr-wer{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:11px;' +
        'min-height:48px;padding:0 8px 0 10px;border-radius:16px;text-align:left;' +
        'transition:background .18s ease}' +
      '@media (hover:hover){.uhr-wer:hover{background:rgba(255,255,255,.6)}}' +
      '.uhr-wer:focus-visible{outline:3px solid var(--lila-400,#9d93f1);outline-offset:2px}' +
      '.uhr-glas{position:relative;width:44px;height:20px;flex-shrink:0;border-radius:999px;overflow:hidden;' +
        'background:linear-gradient(180deg, rgba(24,21,47,.05), rgba(255,255,255,.4) 55%);' +
        'border:1px solid rgba(255,255,255,.8);' +
        'box-shadow:inset 0 1.5px 3px rgba(24,21,47,.18), inset 0 -1px 1px rgba(255,255,255,.7), 0 1px 0 rgba(255,255,255,.9)}' +
      /* Der Füllstand zeigt die angebrochene Viertelstunde: er läuft in
         fünfzehn Minuten einmal voll und fängt von vorn an. So sieht man
         ohne Ziffern, wie weit der laufende Block ist. */
      '.uhr-glas::before{content:"";position:absolute;inset:2.5px auto 2.5px 2.5px;' +
        'width:calc((100% - 5px) * var(--stand,0));min-width:10px;border-radius:999px;' +
        'background:linear-gradient(180deg,#7de0b6 0%,#43b384 45%,#1e8a63 100%);' +
        'box-shadow:inset 0 1px 1px rgba(255,255,255,.55);' +
        'transition:width 1s linear}' +
      '.uhr-glas.aus::before{background:linear-gradient(180deg,#e9e8f1,#d6d5e2);width:10px}' +
      '.uhr-namen{min-width:0}' +
      '.uhr-name{display:block;font-size:14px;font-weight:600;letter-spacing:-.01em;' +
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.uhr-seit{display:block;font-size:11.5px;color:var(--nebel-500,#7f7d93);margin-top:1px;' +
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +

      /* Die Ziffern: das Herz. Tabellarisch, damit nichts springt. */
      '.uhr-zeit{font-size:21px;font-weight:600;letter-spacing:-.02em;' +
        'font-variant-numeric:tabular-nums;font-feature-settings:"tnum";flex-shrink:0;padding-right:2px}' +

      /* Der Knopf: anhalten ist die einzige Handlung, die immer sichtbar ist. */
      '.uhr-tat{flex-shrink:0;min-height:48px;min-width:48px;padding:0 20px;border-radius:999px;' +
        'font-size:15px;font-weight:600;position:relative;overflow:hidden;' +
        'transition:transform .12s var(--kurve,cubic-bezier(.16,1,.3,1)),box-shadow .2s ease}' +
      '.uhr-tat:active{transform:scale(.96)}' +
      '.uhr-tat.primaer{color:#fff;background:linear-gradient(180deg,var(--lila-500,#8478ec),var(--lila-700,#5a4cd6));' +
        'box-shadow:inset 0 1px 0 rgba(255,255,255,.55), 0 8px 20px rgba(111,99,232,.36)}' +
      '.uhr-tat.halt{color:var(--tinte,#18152f);background:rgba(255,255,255,.72);' +
        'box-shadow:inset 0 0 0 1px var(--nebel-200,#e9e8f1), 0 4px 12px rgba(59,52,134,.1)}' +
      '.uhr-tat:focus-visible{outline:3px solid var(--lila-400,#9d93f1);outline-offset:2px}' +

      /* Der Beleg nach dem Anhalten: er sagt, was gebucht wurde, und
         verschwindet von selbst. Beim Wechsel sagt er beide Hälften. */
      '.uhr-beleg{font-size:12.5px;line-height:1.45;color:var(--nebel-600,#5d5b71);' +
        'padding:8px 10px 2px;overflow:hidden;max-height:0;opacity:0;' +
        'transition:max-height .35s var(--kurve,cubic-bezier(.16,1,.3,1)),opacity .3s ease,padding .35s ease}' +
      '.uhr-beleg.da{max-height:60px;opacity:1}' +
      '.uhr-beleg b{color:var(--tinte,#18152f);font-weight:600}' +

      /* Die Mandatsliste: fährt über dem Dock auf, Zeilen für den Daumen. */
      '.uhr-liste{position:fixed;z-index:96;right:24px;width:min(390px,calc(100vw - 36px));' +
        'bottom:calc(20px + env(safe-area-inset-bottom));' +
        'border-radius:22px;padding:8px;' +
        'background:rgba(255,255,255,.78);' +
        'backdrop-filter:blur(40px) saturate(200%);-webkit-backdrop-filter:blur(40px) saturate(200%);' +
        'border:1px solid rgba(255,255,255,.65);' +
        'box-shadow:inset 0 1px 0 rgba(255,255,255,.8), 0 22px 60px rgba(59,52,134,.26);' +
        'font-family:var(--schrift-text,system-ui,sans-serif);color:var(--tinte,#18152f);' +
        'transform-origin:bottom center}' +
      '@supports not (backdrop-filter: blur(1px)){.uhr-liste{background:rgba(255,255,255,.97)}}' +
      '@media (prefers-reduced-transparency: reduce){' +
        '.uhr-liste{background:#fff;backdrop-filter:none;-webkit-backdrop-filter:none}}' +
      '.uhr-liste h3{font-size:11.5px;font-weight:600;color:var(--nebel-500,#7f7d93);' +
        'margin:0;padding:8px 12px 6px;letter-spacing:.02em}' +
      '.uhr-wahl{display:flex;align-items:center;gap:10px;width:100%;min-height:52px;' +
        'padding:0 12px;border-radius:16px;font-size:15.5px;font-weight:500;text-align:left;' +
        'transition:background .15s ease}' +
      '@media (hover:hover){.uhr-wahl:hover{background:var(--lila-050,#f5f4fe)}}' +
      '.uhr-wahl:focus-visible{outline:3px solid var(--lila-400,#9d93f1);outline-offset:-2px}' +
      '.uhr-wahl .laeuft{margin-left:auto;font-size:12px;font-weight:600;color:var(--gruen,#177452);flex-shrink:0}' +
      '.uhr-wahl span.erster{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.uhr-auf{animation:uhr-auf .26s var(--kurve,cubic-bezier(.16,1,.3,1))}' +
      '@keyframes uhr-auf{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}' +

      /* Auf dem Handy nimmt das Dock die volle Breite: der Daumen erreicht
         alles, ohne dass die Hand wandert. */
      '@media (max-width:700px){' +
        '.uhr-dock,.uhr-liste{right:12px;left:12px;width:auto;bottom:calc(12px + env(safe-area-inset-bottom))}' +
        '.uhr-dock.ruht{left:auto}' +
        '.uhr-liste{bottom:calc(84px + env(safe-area-inset-bottom))}' +
        '.uhr-zeit{font-size:20px}' +
        '.uhr-tat{padding:0 16px}' +
      '}' +
      /* Unter 520px konkurrieren Glas, Name, Ziffern und Knopf um dieselbe
         Zeile — und der Mandatsname verliert. Das Glas geht als Erstes: dass
         die Uhr läuft, sagen die Ziffern ohnehin. */
      '@media (max-width:519px){' +
        '.uhr-glas{display:none}' +
        '.uhr-wer{gap:0;padding-left:6px}' +
        '.uhr-reihe{gap:8px}' +
      '}' +
      '@media (prefers-reduced-motion:reduce){' +
        '.uhr-auf{animation:none}.uhr-glas::before{transition:none}' +
        '.uhr-beleg{transition-duration:.01ms}}';
    document.head.appendChild(s);
  }

  /* ---------- Der Aufbau ---------- */
  var dock, reihe, werKnopf, glas, nameEl, seitEl, zeitEl, tatKnopf, belegEl, ruf;
  var liste = null, ticker = null, belegTimer = null;

  function baue() {
    stil();

    dock = document.createElement('div');
    dock.className = 'uhr-dock';
    dock.innerHTML =
      '<div class="uhr-reihe">' +
        '<button class="uhr-wer" type="button">' +
          '<span class="uhr-glas" aria-hidden="true"></span>' +
          '<span class="uhr-namen"><b class="uhr-name"></b><span class="uhr-seit"></span></span>' +
        '</button>' +
        '<span class="uhr-zeit" role="timer" aria-live="off"></span>' +
        '<button class="uhr-tat" type="button"></button>' +
      '</div>' +
      '<div class="uhr-beleg" aria-hidden="true"></div>';

    reihe    = dock.querySelector('.uhr-reihe');
    werKnopf = dock.querySelector('.uhr-wer');
    glas     = dock.querySelector('.uhr-glas');
    nameEl   = dock.querySelector('.uhr-name');
    seitEl   = dock.querySelector('.uhr-seit');
    zeitEl   = dock.querySelector('.uhr-zeit');
    tatKnopf = dock.querySelector('.uhr-tat');
    belegEl  = dock.querySelector('.uhr-beleg');

    /* Ein eigener Ausrufer, weil das Dock die Ziffern jede Sekunde neu
       schreibt: würde die Zeit selbst vorgelesen, redete der Screenreader
       ununterbrochen. Angesagt wird nur, was jemand ausgelöst hat. */
    ruf = document.createElement('span');
    ruf.setAttribute('aria-live', 'polite');
    ruf.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
    dock.appendChild(ruf);

    document.body.appendChild(dock);
    machPlatz();

    werKnopf.addEventListener('click', function (e) { e.stopPropagation(); listeUm(); });
    tatKnopf.addEventListener('click', function (e) {
      e.stopPropagation();
      if (lauf) halte(); else listeUm();
    });
    document.addEventListener('click', function (e) {
      if (liste && !liste.contains(e.target) && !dock.contains(e.target)) listeZu();
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && liste) { listeZu(); werKnopf.focus(); }
    });
    /* Kommt der Rechner aus dem Schlaf, ist die Anzeige alt — die Rechnung
       hängt am Startzeitpunkt, nicht am Zähler, also genügt ein Neumalen. */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) male();
    });

    male();
  }

  /* Das Dock schwebt über der Fläche — die letzten Zeilen einer scrollenden
     Seite lägen sonst darunter begraben. Wer selbst genug Polster mitbringt
     (die Zeiten-Fläche), behält seines; alle anderen bekommen den Rest
     dazugelegt. Flächen ohne <main> (das Modell) bauen ihr Unten selbst. */
  function machPlatz() {
    var m = document.querySelector('main');
    if (!m) return;
    var da = parseFloat(getComputedStyle(m).paddingBottom) || 0;
    if (da < 118) m.style.paddingBottom = 'calc(118px + env(safe-area-inset-bottom))';
  }

  /* ---------- Anzeige ---------- */
  function sekunden() {
    return lauf ? Math.max(0, Math.floor((Date.now() - lauf.start) / 1000)) : 0;
  }

  function male() {
    if (lauf) {
      var sek = sekunden();
      dock.classList.remove('ruht');
      werKnopf.hidden = false;
      zeitEl.hidden = false;
      glas.classList.remove('aus');
      /* Der Füllstand läuft in der angebrochenen Viertelstunde einmal voll. */
      glas.style.setProperty('--stand', ((sek % 900) / 900).toFixed(3));
      nameEl.textContent = lauf.name;
      /* Nur die Uhrzeit: der Platz gehört dem Mandatsnamen. Wie man wechselt,
         sagt der Beleg beim Start einmal — und danach das aria-label. */
      seitEl.textContent = 'seit ' + uhrzeit(lauf.start);
      zeitEl.textContent = ziffern(sek);
      zeitEl.setAttribute('aria-label', 'Läuft auf ' + lauf.name + ', ' + vorlesen(sek));
      werKnopf.setAttribute('aria-label', 'Auf ein anderes Mandat wechseln, gerade läuft ' + lauf.name);
      tatKnopf.textContent = 'Anhalten';
      tatKnopf.className = 'uhr-tat halt';
      tatKnopf.setAttribute('aria-label', 'Uhr anhalten und ' + vorlesen(sek) + ' auf ' + lauf.name + ' buchen');
      starteTicker();
    } else {
      dock.classList.add('ruht');
      werKnopf.hidden = true;
      zeitEl.hidden = true;
      zeitEl.textContent = '';
      tatKnopf.textContent = 'Uhr starten';
      tatKnopf.className = 'uhr-tat primaer';
      tatKnopf.setAttribute('aria-label', 'Uhr starten, es läuft gerade keine');
      stoppeTicker();
    }
  }

  function starteTicker() {
    if (ticker) return;
    ticker = setInterval(function () { if (lauf) male(); }, 1000);
  }
  function stoppeTicker() {
    if (ticker) { clearInterval(ticker); ticker = null; }
  }

  function beleg(html) {
    belegEl.innerHTML = html;
    belegEl.classList.add('da');
    clearTimeout(belegTimer);
    belegTimer = setTimeout(function () { belegEl.classList.remove('da'); }, 5000);
  }

  /* ---------- Die Mandatsliste ---------- */
  function listeUm() { if (liste) listeZu(); else listeAuf(); }

  function listeAuf() {
    liste = document.createElement('div');
    liste.className = 'uhr-liste uhr-auf';
    liste.setAttribute('role', 'dialog');
    liste.setAttribute('aria-label', lauf ? 'Mandat wechseln' : 'Uhr starten');
    var h = document.createElement('h3');
    h.textContent = lauf ? 'Wechseln — die laufende Zeit wird in derselben Sekunde gebucht' : 'Woran arbeitest du?';
    liste.appendChild(h);

    MANDATE.forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'uhr-wahl';
      var laeuftHier = lauf && lauf.id === m.id;
      b.innerHTML = '<span class="erster"></span>' + (laeuftHier ? '<span class="laeuft">läuft</span>' : '');
      b.querySelector('.erster').textContent = m.name;
      b.disabled = !!laeuftHier;
      if (laeuftHier) b.style.opacity = '.55';
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        listeZu();
        starte(m);
      });
      liste.appendChild(b);
    });

    document.body.appendChild(liste);
    var erster = liste.querySelector('.uhr-wahl:not([disabled])');
    if (erster) erster.focus();
    werKnopf.setAttribute('aria-expanded', 'true');
  }

  function listeZu() {
    if (!liste) return;
    liste.remove();
    liste = null;
    werKnopf.setAttribute('aria-expanded', 'false');
  }

  /* ---------- Starten, Wechseln, Anhalten ----------
     Ein Start bei laufender Uhr ist ein Wechsel: derselbe Zeitpunkt beendet
     den einen Lauf und beginnt den nächsten. Deshalb wird `jetzt` einmal
     genommen und beiden gegeben — sonst fiele der Bruchteil dazwischen weg. */
  function starte(mandat) {
    var jetzt = Date.now();
    var vorher = null;
    if (lauf) vorher = buche(jetzt);
    lauf = { id: mandat.id, name: mandat.name, start: jetzt };
    schreib(SCHLUESSEL_LAUF, lauf);
    male();
    lageGeaendert();
    if (vorher && vorher.gebucht) {
      beleg('<b>' + vorher.dauerWort + '</b> auf ' + vorher.name + ' gebucht, ' +
            'ohne Lücke geht es auf <b>' + mandat.name + '</b> weiter.');
      ruf.textContent = vorher.dauerWort + ' auf ' + vorher.name + ' gebucht. ' +
                        'Die Uhr läuft jetzt auf ' + mandat.name + '.';
    } else if (vorher) {
      beleg('Der Lauf auf ' + vorher.name + ' war kürzer als eine halbe Minute und fällt weg. ' +
            'Die Uhr läuft jetzt auf <b>' + mandat.name + '</b>.');
      ruf.textContent = 'Zu kurz, nichts gebucht. Die Uhr läuft jetzt auf ' + mandat.name + '.';
    } else {
      beleg('Die Uhr läuft auf <b>' + mandat.name + '</b>. Sie bleibt sichtbar, auch wenn du die Fläche wechselst — ' +
            'zum Wechseln des Mandats tippst du auf den Namen.');
      ruf.textContent = 'Uhr gestartet auf ' + mandat.name + '.';
    }
  }

  function halte() {
    if (!lauf) return;
    var eintrag = buche(Date.now());
    lauf = null;
    schreib(SCHLUESSEL_LAUF, null);
    male();
    lageGeaendert();
    if (eintrag.gebucht) {
      beleg('<b>' + eintrag.dauerWort + '</b> auf ' + eintrag.name + ' gebucht, ' +
            eintrag.von + ' bis ' + eintrag.bis + '.');
      ruf.textContent = eintrag.dauerWort + ' auf ' + eintrag.name + ' gebucht.';
    } else {
      beleg('Kürzer als eine halbe Minute — nichts gebucht.');
      ruf.textContent = 'Zu kurz, nichts gebucht.';
    }
  }

  /* Die Fläche darunter (Zeiten) zeichnet ihre Liste neu, sobald sich Start
     oder Halt ändern — sonst stünde die laufende Zeile dort noch eine
     Sekunde weiter, nachdem die Uhr schon steht. */
  function lageGeaendert() {
    window.dispatchEvent(new CustomEvent('uhr:lage', { detail: lauf ? { id: lauf.id, name: lauf.name } : null }));
  }

  /* Schreibt den laufenden Lauf als Eintrag fort und meldet ihn der Fläche.
     Unter einer halben Minute entsteht kein Eintrag — sonst füllt ein
     Fehlgriff die Liste mit Nullen. */
  function buche(bis) {
    var dauer = Math.max(0, Math.round((bis - lauf.start) / 1000));
    var eintrag = {
      name: lauf.name,
      was: 'mit der Uhr erfasst',
      von: uhrzeit(lauf.start),
      bis: uhrzeit(bis),
      dauer: dauer,
      quelle: 'uhr',
      sortier: bis
    };
    eintrag.dauerWort = dauerWort(dauer);
    eintrag.gebucht = dauer >= 30;
    if (eintrag.gebucht) {
      buchungen.unshift(eintrag);
      schreib(SCHLUESSEL_BUCH, buchungen);
      window.dispatchEvent(new CustomEvent('uhr:gebucht', { detail: eintrag }));
    }
    return eintrag;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', baue);
  } else {
    baue();
  }

  return {
    mandate: function () { return MANDATE.slice(); },
    buchungen: function () { return buchungen.slice(); },
    laeuft: function () { return lauf ? { id: lauf.id, name: lauf.name, start: lauf.start, dauer: sekunden() } : null; },
    starte: function (id) {
      var m = MANDATE.filter(function (x) { return x.id === id; })[0];
      if (m) starte(m);
    },
    halte: halte,
    /* Ein Eintrag, der nicht von der Uhr kommt: übernommener Vorschlag oder
       Nachtrag von Hand. Die Fläche schreibt ihn, der Baustein verwahrt ihn. */
    trage: function (eintrag) {
      eintrag.dauerWort = dauerWort(eintrag.dauer);
      if (!eintrag.sortier) eintrag.sortier = Date.now();
      buchungen.unshift(eintrag);
      schreib(SCHLUESSEL_BUCH, buchungen);
      window.dispatchEvent(new CustomEvent('uhr:gebucht', { detail: eintrag }));
      return eintrag;
    },
    dauerWort: dauerWort,
    ziffern: ziffern
  };
})();
