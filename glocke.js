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
   Glocke.baue({lage: 'laufend', ziele: {...}, rede: rede}) — oder, für den
   Schaukasten, weiterhin Glocke.baue({eintraege: [{titel, text, zeit, neu, tue}]}).

   V2 (Review): das Fenster erbt kein nowrap mehr aus der Kopfzeile (im
   Gespräch lief der Text sonst aus der Karte); ein Klick auf einen Eintrag
   gibt den Fokus an das ab, wohin er führt, statt ihn auf die Glocke hinter
   der neuen Fläche zurückzuholen; ein Klick daneben lässt den Fokus, wo er
   hingeht; gelesene Einträge sagen dem Screenreader nicht mehr „neu“; eine
   frische Lage über setze() räumt den laufenden Gelesen-Timer ab.

   V3 (Issue #57): die Einträge stehen nicht mehr in der Fläche, sondern in
   der Lage (siehe unten). Vorher schrieb jede Fläche ihre eigene Liste ab —
   die Übersicht sechs Einträge, das Gespräch fünf, mit anderer Reihenfolge,
   anderen Zeiten und einem Termin, der hier schon angenommen war und dort
   noch offen lag. Die Fläche sagt jetzt nur noch, WOHIN ein Eintrag führt.
   Auch die Zahl an der Glocke wird nirgends nachgerechnet: sie kommt aus
   der Lage (Lage.neueMeldungen), bis der Blick sie auf null setzt.

   V4: Die Lage wohnt in ihrer eigenen Datei, lage.js — sie trug hier nur
   deshalb, weil eine Regel dieser Runde neue Dateien verbot. **lage.js muss
   VOR glocke.js geladen werden.** Am Finger ist die Glocke 44px statt 35px
   (Issue #51); die Pillenhöhe von 35px trifft ein Daumen nicht zuverlässig.
   Marker: GLOCKE-V4 */


window.Glocke = (function () {
  'use strict';

  var BELL = 'M6 17 L18 17 C16.8 15.6 16.4 14.6 16.2 12.2 C16 9.2 14.6 7 12 7 ' +
             'C9.4 7 8 9.2 7.8 12.2 C7.6 14.6 7.2 15.6 6 17 Z ' +
             'M10.4 19.5 a1.8 1.8 0 0 0 3.2 0';

  /* Titel und Text dürfen Funktionen sein: auf Kundenflächen hängt der
     Wortlaut an der Anrede der Beratung (du/Sie), und die kann sich ändern,
     während die Seite steht. */
  function wert(x) { return typeof x === 'function' ? x() : x; }

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
      '@media (hover:hover){.glocke-knopf:hover{border-color:' + akzent + '}}' +
      '.glocke-knopf svg{width:18px;height:18px}' +
      '.glocke-knopf svg path{fill:none;stroke:' + tinte + ';stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}' +
      '.glocke-knopf .zahl{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;padding:0 4px;' +
        'border-radius:999px;background:' + akzent + ';color:#fff;font-size:11px;font-weight:800;' +
        'display:inline-flex;align-items:center;justify-content:center}' +
      /* eigene Regel, weil display:inline-flex sonst [hidden] übertrumpft —
         nicht jede Fläche bringt ein globales [hidden]{display:none} mit */
      '.glocke-knopf .zahl[hidden],.glocke-fenster[hidden]{display:none}' +
      /* Am Finger 44px: die Pillenhöhe von 35px trifft ein Daumen nicht
         zuverlässig (Issue #51). Breite Geräte mit Touch bekommen sie
         ebenfalls — dort steht die Glocke in keiner engen Pillenreihe. */
      '@media (pointer:coarse),(max-width:700px){' +
        '.glocke-knopf{width:44px;height:44px}' +
        '.glocke-knopf svg{width:20px;height:20px}}' +
      '.glocke-fenster{position:absolute;top:calc(100% + 10px);right:0;z-index:60;' +
        /* eigene Zeilenführung: die Kopfzeilen, in denen die Glocke hängt,
           setzen oft white-space:nowrap — geerbt liefe der Text aus der Karte */
        'width:min(340px,calc(100vw - 32px));text-align:left;white-space:normal;' +
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

  /* Aus der Lage werden Einträge: Wortlaut nach der Anrede der Beratung,
     Zeit datiert aus der Quelle, Ziel aus der Fläche. Kennt die Fläche ein
     Ziel nicht (im Gespräch gibt es am ersten Tag keine Termin-Antwort),
     führt der Eintrag auf die Übersicht statt ins Leere — verschwinden darf
     er nicht, sonst fehlt er wieder genau dort, wo man ihn braucht. */
  function ausLage(lageId, opts) {
    var ziele = opts.ziele || {};
    var rede = opts.rede || function (du) { return du; };
    var ersatz = opts.ersatz || 'uebersicht.html';
    return window.Lage.meldungen(lageId).map(function (m) {
      return {
        titel: function () { return rede(Lage.wortlaut(m.titel, false), Lage.wortlaut(m.titel, true)); },
        text:  function () { return rede(Lage.wortlaut(m.text, false), Lage.wortlaut(m.text, true)); },
        zeit: m.zeit,
        neu: m.neu,
        tue: typeof ziele[m.ziel] === 'function'
          ? ziele[m.ziel]
          : function () { location.href = ersatz; }
      };
    });
  }

  function baue(opts) {
    stil();
    opts = opts || {};
    var halter = opts.ziel || document.querySelector('[data-glocke]');
    if (!halter) return null;
    var titel = opts.titel || 'Neuigkeiten';

    /* Zwei Wege herein. Der eine ist der richtige: die Fläche nennt ihre Lage
       und sagt, wohin ein Ziel führt — die Einträge selbst kommen aus der
       Quelle, damit keine Fläche mehr ihre eigene Liste schreibt (Issue #57).
       Der andere ist für den Schaukasten (system.html), der Beispieleinträge
       zeigt und keine Lage hat. */
    var quelle = opts.lage || null;
    var eintraege = quelle ? ausLage(quelle, opts) : (opts.eintraege || []);
    var gelesen = false;

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

    /* Die Zahl wird nicht nachgerechnet, sie kommt aus der Quelle — sonst
       stand auf der einen Fläche 5 und auf der anderen 3. Erst der Blick
       setzt sie auf null, und das weiß nur diese Glocke. */
    function neueZahl() {
      if (quelle) return gelesen ? 0 : window.Lage.neueMeldungen(quelle);
      return eintraege.filter(function (e) { return e.neu; }).length;
    }
    function maleZahl() {
      var n = neueZahl();
      zahl.hidden = !n;
      /* Über neun bleibt die Kapsel rund: die genaue Zahl steht im aria-label */
      zahl.textContent = n > 9 ? '9+' : String(n);
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
        e.querySelector('.ge-titel').textContent = wert(n.titel);
        e.querySelector('.ge-text').textContent = wert(n.text);
        /* „neu“ steht als eigenes Stück vor der Zeit, damit es weichen kann,
           ohne die Zeile neu zu zeichnen. Wer schon gelesen hat, bekommt es
           gar nicht erst — sonst liest ein Screenreader es weiter vor,
           während das Auge es längst nicht mehr sieht. Festes Leerzeichen,
           sonst frisst es der Zeilenumbruch. */
        if (n.neu) e.querySelector('.ge-neu').textContent = 'neu, ';
        e.querySelector('.ge-zeit').appendChild(document.createTextNode(n.zeit));
        e.addEventListener('click', function () {
          /* Der Eintrag führt woanders hin — dort gehört der Fokus hin, nicht
             zurück auf die Glocke hinter der Fläche, die sich gerade öffnet. */
          schliesse(true);
          if (typeof n.tue === 'function') n.tue();
        });
        liste.appendChild(e);
      });
    }

    var alsGelesen = null;
    function schliesse(fokusAbgeben) {
      if (fenster.hidden) return;
      if (alsGelesen) { clearTimeout(alsGelesen); alsGelesen = null; }
      /* Den Fokus nur zurückholen, wenn er noch im Fenster liegt. Sonst
         reißt ein Klick ins Eingabefeld daneben ihn auf die Glocke zurück
         und das Getippte läuft ins Nichts. */
      var drin = !fokusAbgeben && fenster.contains(document.activeElement);
      fenster.hidden = true;
      knopf.setAttribute('aria-expanded', 'false');
      if (drin) knopf.focus();
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
      var offen = eintraege.slice(); /* nur diese hier hat das Auge gesehen */
      var erster = liste.querySelector('.glocke-eintrag');
      if (erster) erster.focus();
      /* Geöffnet heißt gelesen — aber erst, nachdem das Auge die Zeile
         gesehen hat, sonst verschwindet das „neu" vor dem Lesen. */
      alsGelesen = setTimeout(function () {
        alsGelesen = null;
        gelesen = true;
        offen.forEach(function (n) { n.neu = false; });
        liste.querySelectorAll('.glocke-eintrag').forEach(function (e) { e.classList.add('gelesen'); });
        /* Erst wegblenden, dann wirklich aus dem Text nehmen — solange das
           Wort dasteht, hört ein Screenreader es, auch bei Breite null. */
        setTimeout(function () {
          liste.querySelectorAll('.gelesen .ge-neu').forEach(function (w) { w.textContent = ''; });
        }, 500);
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
        /* Frische Lage: der laufende Gelesen-Timer gehört zur alten und
           würde sonst einen gerade eingetroffenen Eintrag abstempeln,
           bevor ihn jemand sehen konnte. */
        if (alsGelesen) { clearTimeout(alsGelesen); alsGelesen = null; }
        /* Eine von Hand gesetzte Lage kommt nicht aus der Quelle — dann zählt
           die Glocke wieder selbst, sonst zeigte sie die Zahl der alten. */
        quelle = null;
        gelesen = false;
        eintraege = neue || [];
        if (!fenster.hidden) male();
        maleZahl();
      }
    };
  }

  return { baue: baue };
})();
