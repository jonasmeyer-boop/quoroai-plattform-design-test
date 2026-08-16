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
       griffe: [{wort:'Laden', tat:fn, stark:true}], // optional, unten in der Leiste
       fuss: 'Liegt in deiner Akte.',                // optional, unten links
       aus: element                                   // Zeile, aus der es aufschlägt
     });

   Schreiben (Häppchen D4 Teil 2) — drei Zusätze, sonst dieselbe Seite:
       schreibbar: true,        // eigenes Papier: der Cursor steht im Text
       stand: 'Entwurf, zuletzt von dir vor vier Minuten',   // unten links
       standNeu: 'Entwurf, gerade eben von dir',             // ab dem ersten Zeichen
       notizbar: true           // fremdes Papier: nur an den Rand
   Ein einzelner Block trägt den Vorschlag des KI-Beraters:
       {p:'…', feder:{grund:'Warum er das vorschlägt.', neu:'Der neue Wortlaut.'}}

   Warum das zwei verschiedene Dinge sind: In ein fremdes Dokument schreibt
   niemand hinein. Ein Rahmenvertrag, den die Beratung im Blatt-Blick ändern
   könnte, wäre kein Beleg mehr — man wüsste bei jedem Zitat nicht, ob der Satz
   je so dastand. Auf fremdem Papier gibt es deshalb nur die Randnotiz; offen
   ist allein, was der Beratung selbst gehört.

   Und warum die KI nur vorschlägt: Was der KI-Berater schreibt, steht neben dem
   Blatt, nie darin — bis ein Mensch „Übernehmen" drückt. Danach ist es der Text
   der Beratung, mit allem, was daran hängt. Ein Vermerk, in dem unbemerkt Sätze
   auftauchen, die niemand geschrieben hat, ist die eine Sache, die diese
   Software sich nicht leisten kann.
   V3 (Nach-Review zu Teil 2): Umbrüche überleben auch in Tabellenzellen und
   Randnotizen, die Feder-Tönung schlägt den Überfahr-Ton, ein leerer Absatz
   mit Feder sagt trotzdem „Schreib hier.", der Stand unten veraltet nicht mehr,
   und die Fläche erfährt vom Zuklappen (beimSchliessen).
   Marker: BLATT-V3

   Markenneutral: alle Farben kommen aus den Tokens der Fläche — Kundenflächen
   setzen --blau/--linie/--grau über marke.js, quoroAI-Flächen bringen
   --lila-600/--nebel-200 aus system.css mit. Das Blatt selbst ist immer weißes
   Papier mit Serifen-Satz: ein Dokument ist kein Bildschirm, und dass man den
   Unterschied zwischen „das ist die Software" und „das ist mein Vertrag" sieht,
   ist der halbe Sinn der Sache.

   Alle Klassen tragen bb- (Blatt-Blick): blatt- ist auf mehreren Flächen schon
   für anderes vergeben, unter anderem für das Blatt-Symbol in den Zeilen. */
window.Blatt = (function () {
  'use strict';

  var BREIT = 720;          /* Satzbreite einer Seite, in Pixeln gedacht wie DIN A4 */
  var HOCH = Math.round(BREIT * 1.414);
  var MINI = 96;            /* Breite der Seiten-Miniatur in der Leiste */

  var offen = false;
  var schicht = null, lauf = null, leiste = null, kopfTitel = null, kopfMeta = null;
  var zaehler = null, zurueckKnopf = null, weiterKnopf = null, griffeKasten = null, fussWort = null;
  var standWort = null, federBlatt = null, federKnopf = null, notizKnopf = null;
  var seitenEl = [], miniEl = [];
  var federn = [], federHier = null;
  var standNeu = '', schonGetippt = false, miniTakt = null;
  var jetzigesDok = null;
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
      '.bb-seite .bb-notiz[contenteditable]:empty::before{content:"…";color:' + akzent + ';opacity:.45}' +
      '.bb-seite .bb-notiz[contenteditable]:focus{background:color-mix(in srgb, ' + akzent + ' 10%, transparent)}' +

      /* ---- Schreiben: der Cursor steht im Papier ----
         Kein Werkzeugkasten über dem Blatt. Ein Vermerk braucht keine
         Symbolleiste — er braucht Sätze. Was man sieht, ist die Seite, die
         später ausgedruckt wird; was man ändert, ändert man dort, wo es steht. */
      /* Umbrüche überleben: wer im Vermerk Enter drückt, baut einen Absatz,
         und der muss beim nächsten Aufschlagen noch da sein. Gesichert wird
         mit Zeilenumbruch im Text, gezeigt wird er nur, wenn das Papier ihn
         auch stehen lässt. */
      '.bb-seite p,.bb-seite h4,.bb-seite .bb-klein,.bb-seite li,' +
      '.bb-seite td,.bb-seite th,.bb-seite .bb-notiz{white-space:pre-wrap}' +
      '.bb-seite [contenteditable]{outline:none;border-radius:3px;' +
        'transition:background .18s ' + kurve + '}' +
      /* Nur offene Stellen tönen beim Überfahren — der Feder-Knopf trägt
         contenteditable="false" und wäre sonst ein grauer Kasten in der Marge. */
      '.bb-seite [contenteditable="true"]:hover{background:rgba(16,19,26,.028)}' +
      '.bb-seite [contenteditable="true"]:focus{background:color-mix(in srgb, ' + akzent + ' 7%, transparent)}' +
      /* Ein leerer Absatz fiele auf null zusammen und wäre nicht zu treffen.
         Nur der Absatz: eine Tabellenzelle ist oft mit Absicht leer — die
         Ecke über der Kopfspalte etwa —, und „Schreib hier." stünde dort als
         Aufforderung, wo nichts hingehört. */
      '.bb-seite p[contenteditable]:empty::before,' +
        '.bb-seite p[contenteditable].bb-leer::before{content:"Schreib hier.";color:#b8b8c0}' +
      /* Wer schreibt, schreibt irgendwann über den Fuß der Seite hinaus. Ein
         Umbruch auf die nächste Seite ist Produktarbeit; hier darf das Blatt
         wenigstens nichts verschlucken — es rollt in sich, ohne Balken, und
         der Browser zieht den Cursor mit. */
      '.bb-seite.offen{cursor:text;overflow:auto;scrollbar-width:none}' +
      '.bb-seite.offen::-webkit-scrollbar{display:none}' +
      /* Übernommen: der Satz setzt sich einmal sichtbar an seine Stelle. */
      '.bb-seite .frisch-text{animation:bb-gesetzt 1.4s ' + kurve + ' 1}' +
      '@keyframes bb-gesetzt{0%,20%{background:color-mix(in srgb, ' + akzent + ' 34%, transparent)}' +
        '100%{background:transparent}}' +

      /* ---- die Feder: der Vorschlag steht NEBEN dem Blatt, nie darin ---- */
      /* Die Tönung sagt, WELCHER Satz gemeint ist. Sie muss den Überfahr-Ton
         schlagen, sonst verliert man beim Zeigen genau die Auskunft, wegen
         der man hinschaut — deshalb dieselbe Bauart im Selektor, nur später. */
      '.bb-mit-feder,.bb-seite [contenteditable="true"].bb-mit-feder:hover' +
        '{position:relative;background:color-mix(in srgb, ' + akzent + ' 6%, transparent)}' +
      '.bb-mit-feder.hier,.bb-seite [contenteditable="true"].bb-mit-feder.hier:hover,' +
        '.bb-seite [contenteditable="true"].bb-mit-feder.hier:focus' +
        '{background:color-mix(in srgb, ' + akzent + ' 15%, transparent)}' +
      '.bb-feder{position:absolute;left:-5.6%;top:0;bottom:0;width:22px;min-height:26px;' +
        'border:0;background:none;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center}' +
      '.bb-feder .strich{display:block;width:3px;height:calc(100% - 4px);min-height:18px;border-radius:2px;' +
        'background:' + akzent + ';opacity:.55;transition:opacity .18s ' + kurve + ',width .18s ' + kurve + '}' +
      '@media (hover:hover){.bb-feder:hover .strich{opacity:1;width:5px}}' +
      '.bb-feder:focus-visible{outline:2px solid ' + akzent + ';outline-offset:2px;border-radius:4px}' +
      '.bb-feder[aria-expanded="true"] .strich{opacity:1;width:5px}' +

      /* Der Vorschlag darf nicht das halbe Blatt verdecken: er ist die
         Nebensache, das Papier ist die Hauptsache. */
      '.bb-vorschlag{position:relative;z-index:2;border-top:0.5px solid ' + linie + ';background:' + karte + ';' +
        'color:' + tinte + ';padding:14px 16px 15px;max-height:40vh;overflow-y:auto}' +
      '.bb-vorschlag[hidden]{display:none}' +
      '.bb-vorschlag .innen{max-width:' + (BREIT + 40) + 'px;margin:0 auto;display:flex;flex-direction:column;gap:9px}' +
      /* Am großen Schirm stehen der alte und der neue Wortlaut nebeneinander:
         untereinander wäre der Kasten so hoch, dass er das halbe Blatt
         verdeckt — und einen Unterschied liest man ohnehin am besten quer. */
      '@media (min-width:901px){' +
        '.bb-vorschlag .innen{display:grid;grid-template-columns:1fr 1fr;' +
          'column-gap:26px;row-gap:5px;align-items:start}' +
        '.bb-vorschlag .wer{grid-column:1/-1;grid-row:1}' +
        '.bb-vorschlag .grund{grid-column:1/-1;grid-row:2}' +
        '.bb-vorschlag .statt.a{grid-column:1;grid-row:3}' +
        '.bb-vorschlag .alt{grid-column:1;grid-row:4}' +
        '.bb-vorschlag .statt.b{grid-column:2;grid-row:3}' +
        '.bb-vorschlag .wortlaut{grid-column:2;grid-row:4}' +
        '.bb-vorschlag .tat{grid-column:1/-1;grid-row:5}' +
      '}' +
      '.bb-vorschlag .wer{font-size:12.5px;font-weight:600;color:' + akzent + '}' +
      '.bb-vorschlag .grund{font-size:13px;color:' + grau + ';line-height:1.5;max-width:78ch}' +
      /* Der vorgeschlagene Wortlaut steht schon im Satz des Papiers: man liest
         ihn so, wie er auf der Seite stünde, nicht als Systemmeldung. */
      '.bb-vorschlag .wortlaut{font-family:Georgia,"Iowan Old Style","Times New Roman",serif;' +
        'font-size:15px;line-height:1.6;color:#1b1b1f;max-width:78ch;' +
        'border-left:3px solid ' + akzent + ';padding-left:13px;white-space:pre-wrap}' +
      '.bb-vorschlag .statt{font-size:11px;font-weight:600;letter-spacing:.04em;' +
        'text-transform:uppercase;color:' + grau + ';margin-top:2px}' +
      /* Der alte Wortlaut steht durchgestrichen daneben — man sieht in einem
         Blick, was man hergibt. */
      '.bb-vorschlag .alt{font-family:Georgia,"Iowan Old Style","Times New Roman",serif;' +
        'font-size:14px;line-height:1.55;color:#8b8b95;max-width:78ch;' +
        'border-left:3px solid ' + linie + ';padding-left:13px;white-space:pre-wrap}' +
      /* Die beiden Knöpfe kleben am Fuß des Vorschlags. Ohne das lägen sie am
         Handy unter dem Rand: man liest den Vorschlag und findet nicht, wo
         man ihn annimmt. */
      '.bb-vorschlag .tat{display:flex;gap:8px;flex-wrap:wrap;margin-top:2px;' +
        'position:sticky;bottom:-15px;background:' + karte + ';padding:8px 0 15px;margin-bottom:-15px}' +
      '.bb-vorschlag button{font:inherit;font-size:13.5px;font-weight:600;min-height:44px;padding:0 17px;' +
        'border-radius:999px;cursor:pointer;border:0.5px solid ' + linie + ';background:' + karte + ';color:' + tinte + '}' +
      '.bb-vorschlag button.stark{background:' + tinte + ';color:#fff;border-color:' + tinte + '}' +
      '@media (hover:hover){.bb-vorschlag button:hover{border-color:' + akzent + '}' +
        '.bb-vorschlag button.stark:hover{background:' + akzent + ';border-color:' + akzent + '}}' +

      /* ---- Steuerleiste unten: blättern und die Griffe der Fläche ---- */
      '.bb-steuer{position:relative;z-index:2;display:flex;align-items:center;gap:10px;flex-wrap:wrap;' +
        'padding:10px 16px calc(10px + env(safe-area-inset-bottom));' +
        'border-top:0.5px solid ' + linie + ';background:' + karte + ';color:' + tinte + '}' +
      '.bb-steuer .zaehler{font-size:13px;color:' + grau + ';font-variant-numeric:tabular-nums}' +
      /* Nichts wird gespeichert, weil nichts zu speichern ist: jedes Zeichen
         steht. Unten links steht deshalb kein Knopf, sondern der Stand. */
      '.bb-steuer .stand{font-size:12.5px;color:' + grau + ';line-height:1.4}' +
      '.bb-steuer .stand b{color:' + tinte + ';font-weight:600}' +
      '.bb-steuer .fusswort{font-size:12.5px;color:' + grau + ';line-height:1.4;flex:1 1 12ch;min-width:0}' +
      '.bb-steuer button.stark{background:' + tinte + ';color:#fff;border-color:' + tinte + '}' +
      '@media (hover:hover){.bb-steuer button.stark:hover:not([disabled]){background:' + akzent + ';border-color:' + akzent + '}}' +
      '.bb-steuer button.feder-knopf{border-color:' + akzent + ';color:' + akzent + '}' +
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
        /* Am Handy teilen sich Papier und Vorschlag einen kleinen Schirm. Der
           alte Wortlaut ist dort ein Beleg, kein Lesetext: drei Zeilen
           genügen, um zu sehen, was man hergibt — der ganze Satz steht ja
           direkt darüber auf der Seite. */
        '.bb-vorschlag{max-height:32vh}' +
        /* Der alte Wortlaut fällt am Handy ganz weg: er steht zwei Finger
           weiter oben auf der Seite und ist dort markiert. Ihn hier noch
           einmal zu setzen, kostet die halbe Höhe des Blattes für nichts. */
        '.bb-vorschlag .alt,.bb-vorschlag .statt{display:none}' +
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

    /* Der Vorschlag des KI-Beraters wohnt zwischen Papier und Steuerleiste:
       nah genug, um zur Stelle zu gehören, und außerhalb des Blattes, weil er
       noch nicht darin steht. */
    federBlatt = document.createElement('div');
    federBlatt.className = 'bb-vorschlag';
    federBlatt.hidden = true;
    /* Der Vorschlag nimmt den Fokus selbst, statt ihn auf „Übernehmen" zu
       werfen: dort landet er unten im Kasten, und der Browser scrollt Titel
       und Grund aus dem Bild — man liest dann „NEU" und einen Satz, ohne zu
       wissen, warum. */
    federBlatt.tabIndex = -1;
    federBlatt.setAttribute('role', 'group');
    federBlatt.setAttribute('aria-label', 'Vorschlag des KI-Beraters');
    federBlatt.innerHTML = '<div class="innen"><span class="wer">Der KI-Berater schlägt vor</span>' +
      '<span class="grund"></span>' +
      '<span class="statt a">statt</span><span class="alt"></span>' +
      '<span class="statt b">neu</span><span class="wortlaut"></span>' +
      '<span class="tat"><button type="button" class="nimm stark">Übernehmen</button>' +
      '<button type="button" class="wirf">Verwerfen</button></span></div>';
    federBlatt.querySelector('.nimm').addEventListener('click', nimmFeder);
    federBlatt.querySelector('.wirf').addEventListener('click', function () { wirfFeder(true); });

    var steuer = document.createElement('div');
    steuer.className = 'bb-steuer';
    steuer.innerHTML = '<button type="button" class="vor">Zurück</button>' +
      '<button type="button" class="nach">Weiter</button>' +
      '<span class="zaehler" aria-live="polite"></span>' +
      '<span class="stand" aria-live="polite"></span>' +
      '<span class="fusswort"></span>' +
      '<span class="griffe"></span>';
    zaehler = steuer.querySelector('.zaehler');
    standWort = steuer.querySelector('.stand');
    fussWort = steuer.querySelector('.fusswort');
    zurueckKnopf = steuer.querySelector('.vor');
    weiterKnopf = steuer.querySelector('.nach');
    griffeKasten = steuer.querySelector('.griffe');
    zurueckKnopf.addEventListener('click', function () { zuSeite(jetzt - 1); });
    weiterKnopf.addEventListener('click', function () { zuSeite(jetzt + 1); });

    schicht.append(veil, band, raum, federBlatt, steuer);
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

  /* Die Feder am Rand: ein Strich in der Marge, mehr nicht. Sie sitzt IM
     offenen Block und trägt deshalb contenteditable="false" — sonst wäre der
     Knopf selbst Text, den man versehentlich wegtippt. */
  function hefteFeder(el, feder, seitenNr) {
    el.classList.add('bb-mit-feder');
    var f = document.createElement('button');
    f.type = 'button';
    f.className = 'bb-feder';
    f.contentEditable = 'false';
    f.setAttribute('aria-expanded', 'false');
    f.setAttribute('aria-label', 'Der KI-Berater schlägt an dieser Stelle etwas vor');
    f.innerHTML = '<span class="strich"></span>';
    el.appendChild(f);
    var eintrag = { el: el, knopf: f, feder: feder, seite: seitenNr };
    f.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      zeigeFeder(eintrag);
    });
    federn.push(eintrag);
  }

  /* Eine Fassung, die nur diesem Dokument gehört: flach kopierte Blöcke,
     kopierte Listen, kopierte Tabellenzeilen, kopierter Vorschlag. */
  function eigeneFassung(seiten) {
    return seiten.map(function (seite) {
      return seite.map(function (b) {
        var neu = {};
        for (var k in b) {
          if (!Object.prototype.hasOwnProperty.call(b, k)) continue;
          if (Array.isArray(b[k])) {
            neu[k] = b[k].map(function (z) { return Array.isArray(z) ? z.slice() : z; });
          } else if (b[k] && typeof b[k] === 'object') {
            var innen = {};
            for (var i in b[k]) if (Object.prototype.hasOwnProperty.call(b[k], i)) innen[i] = b[k][i];
            neu[k] = innen;
          } else neu[k] = b[k];
        }
        return neu;
      });
    });
  }

  function baueSeite(bloecke, nr, gesamt, fundWort, papierOffen) {
    var seite = document.createElement('div');
    seite.className = 'bb-seite' + (papierOffen ? ' offen' : '');
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
      /* Gefragt wird, ob der Schlüssel DA ist — nicht, ob etwas darin steht.
         Wer eine Überschrift leert, hat immer noch eine Überschrift; wäre sie
         hier nur „falsch", käme sie beim nächsten Aufschlagen als Absatz
         wieder, und der nachher hineingeschriebene Titel landete in einem
         Feld, das niemand mehr liest. */
      } else if (b.h !== undefined) {
        el = document.createElement('h4');
        el.innerHTML = mitFund(b.h, fundWort, treffer);
      } else if (b.klein !== undefined) {
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
            /* Bei der Tabelle ist die Zelle offen, nicht das Gitter: wer das
               ganze <table> editierbar macht, verliert beim ersten Enter die
               Zeilenstruktur. */
            if (papierOffen) { td.setAttribute('contenteditable', 'true'); td.__zelle = [b, i, tr.children.length]; }
            tr.appendChild(td);
          });
          el.appendChild(tr);
        });
      } else {
        el = document.createElement('p');
        el.innerHTML = mitFund(b.p || '', fundWort, treffer);
      }
      if (papierOffen && !b.bild && !b.tab) el.setAttribute('contenteditable', 'true');
      /* Das Element weiß, aus welchem Block es entstanden ist. Nur so kann,
         was jemand hineinschreibt, beim Schließen wieder dorthin zurück —
         sonst stünde beim zweiten Aufschlagen der alte Text da, und der
         Entwurf wäre ein Bild von einem Entwurf. */
      if (papierOffen) el.__block = b;
      if (b.feder && papierOffen) hefteFeder(el, b.feder, nr);
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
    /* Der Klon ist ein Bild, keine Bedienung: Federn und offene Stellen fliegen
       heraus, sonst stünden in der Miniaturleiste Knöpfe, die der Tabulator
       ansteuert und niemand sieht. */
    Array.prototype.forEach.call(klon.querySelectorAll('button'), function (b) { b.remove(); });
    Array.prototype.forEach.call(klon.querySelectorAll('[contenteditable]'), function (c) {
      c.removeAttribute('contenteditable');
    });
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

  /* ---------- Der Stift der KI und der Stift des Menschen ----------
     Der Vorschlag wird gezeigt, nicht eingesetzt. Erst „Übernehmen" macht ihn
     zum Text der Beratung; „Verwerfen" nimmt die Feder weg und lässt den Satz,
     wie er war. Ein dritter Weg — die KI schreibt und man merkt es hinterher —
     existiert hier nicht. */
  function zeigeFeder(eintrag) {
    if (federHier === eintrag) { wirfFeder(false); return; }
    if (federHier) {
      federHier.el.classList.remove('hier');
      federHier.knopf.setAttribute('aria-expanded', 'false');
    }
    federHier = eintrag;
    eintrag.el.classList.add('hier');
    eintrag.knopf.setAttribute('aria-expanded', 'true');
    federBlatt.querySelector('.grund').textContent = eintrag.feder.grund || '';
    /* Was heute dasteht, wird aus dem Blatt gelesen und nicht aus den Daten:
       hat jemand den Satz inzwischen selbst umgeschrieben, muss er SEINEN
       Satz sehen — sonst nimmt er einen Vorschlag an und merkt erst danach,
       dass er die eigene Fassung damit weggeräumt hat. */
    federBlatt.querySelector('.alt').textContent = lies(eintrag.el);
    federBlatt.querySelector('.wortlaut').textContent = eintrag.feder.neu || '';
    federBlatt.hidden = false;
    /* Erst das Panel einblenden, dann die Stelle ins Bild holen: das Panel
       nimmt bis zu 38vh, und ein Vorschlag, dessen Satz man nicht sieht, ist
       eine Behauptung. */
    zuSeite(eintrag.seite - 1);
    holInsBild(eintrag.el);
    federBlatt.scrollTop = 0;
    federBlatt.focus();
  }

  /* Der Absatz kommt in die Mitte des Leseraums, wenn er nicht ohnehin
     bequem dasteht. Gerechnet wird von Hand: scrollIntoView würde auch die
     Seite in sich verschieben und die Kopfzeile des Blattes wegschieben. */
  function holInsBild(el) {
    if (!el || !lauf) return;
    requestAnimationFrame(function () {
      var r = el.getBoundingClientRect(), rl = lauf.getBoundingClientRect();
      if (r.top >= rl.top + 8 && r.bottom <= rl.bottom - 8) return;
      var ziel = lauf.scrollTop + (r.top - rl.top) - Math.max(14, (rl.height - r.height) / 2);
      haltAn();
      faehrtSelbst = 1;
      faehrtEnde = setTimeout(fahrtEnde, 'onscrollend' in lauf ? 2600 : 560);
      lauf.scrollTo({ top: ziel, behavior: reduziert ? 'auto' : 'smooth' });
    });
  }

  /* zu: nur zuklappen. weg: die Feder ist erledigt und verschwindet. */
  function schliesseFeder(weg) {
    if (!federHier) return;
    federHier.el.classList.remove('hier');
    federHier.knopf.setAttribute('aria-expanded', 'false');
    if (weg) {
      federHier.el.classList.remove('bb-mit-feder');
      federHier.knopf.remove();
      /* Übernommen wie verworfen: der Vorschlag ist erledigt und kommt beim
         nächsten Aufschlagen nicht wieder. Eine Entscheidung, die man jedes
         Mal neu treffen muss, ist keine. */
      if (federHier.el.__block) delete federHier.el.__block.feder;
      var i = federn.indexOf(federHier);
      if (i > -1) federn.splice(i, 1);
      zeigeFedernStand();
    }
    federHier = null;
    federBlatt.hidden = true;
  }

  function wirfFeder(weg) {
    var el = federHier && federHier.el;
    schliesseFeder(weg);
    if (el && el.isContentEditable) el.focus();
  }

  function nimmFeder() {
    if (!federHier) return;
    var el = federHier.el, neu = federHier.feder.neu || '';
    schliesseFeder(true);
    setzeText(el, neu);
    el.classList.add('frisch-text');
    setTimeout(function () { el.classList.remove('frisch-text'); }, 1500);
    getippt();
    if (el.isContentEditable) el.focus();
  }

  /* Übernehmen muss sich zurücknehmen lassen. Ein direktes textContent = …
     geht am Gedächtnis des Browsers vorbei: Strg+Z holte den eigenen Satz
     nicht zurück, und mit dem Sichern wäre er endgültig weg. Über die
     Eingabe-Kette geschrieben, ist der Schritt ein Schritt wie jeder andere. */
  function setzeText(el, text) {
    if (!el.isContentEditable) { el.textContent = text; return; }
    el.focus();
    var sel = window.getSelection();
    var r = document.createRange();
    r.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(r);
    var ging = false;
    try { ging = document.execCommand('insertText', false, text); } catch (e) { ging = false; }
    if (!ging || lies(el) !== text) el.textContent = text;
  }

  /* Der Strich in der Marge ist klein und am Handy gar nicht zu treffen. Wie
     viele Vorschläge offen sind, steht deshalb auch unten — ein Druck führt
     zum nächsten, quer über die Seiten. */
  /* Wer einen Absatz komplett löscht, löscht den Feder-Knopf gleich mit — er
     steht ja darin. Dann muss auch der Vorschlag weg sein, sonst zählt die
     Leiste unten drei und führt ins Leere. */
  function raeumeFedern() {
    var vorher = federn.length;
    federn = federn.filter(function (f) {
      if (f.knopf.isConnected) return true;
      /* Der Knopf ist weggetippt worden. Dann muss auch alles andere weg, was
         zu ihm gehörte: die Tönung des Absatzes, die sonst den Rest der
         Sitzung stehen bliebe, und der Vorschlag im Block — sonst käme er
         beim nächsten Aufschlagen wieder, obwohl seine Marke längst weg ist. */
      f.el.classList.remove('bb-mit-feder', 'hier');
      if (f.el.__block) delete f.el.__block.feder;
      return false;
    });
    if (federHier && federn.indexOf(federHier) === -1) {
      federHier = null;
      federBlatt.hidden = true;
    }
    if (federn.length !== vorher) zeigeFedernStand();
  }

  function zeigeFedernStand() {
    if (!federKnopf) return;
    if (!federn.length) { federKnopf.hidden = true; return; }
    federKnopf.hidden = false;
    federKnopf.textContent = federn.length === 1
      ? 'Ein Vorschlag des KI-Beraters'
      : federn.length + ' Vorschläge des KI-Beraters';
  }

  function naechsteFeder() {
    raeumeFedern();
    if (!federn.length) return;
    var ab = federHier ? federn.indexOf(federHier) + 1 : 0;
    zeigeFeder(federn[ab % federn.length]);
  }

  /* ---------- Der Stand: geschrieben ist gespeichert ---------- */
  function getippt() {
    if (!schonGetippt && standNeu) {
      schonGetippt = true;
      standWort.innerHTML = '<b>' + zahm(standNeu) + '</b>';
      /* Stand blieb bisher womöglich versteckt, weil das Blatt keinen hatte —
         geschrieben hat man jetzt trotzdem. */
      standWort.style.display = '';
    }
    raeumeFedern();
    zeigeLeere();
    /* Die Miniaturen sind Klone der Seite. Wer tippt und links das alte Wort
       stehen sieht, traut der Leiste nicht mehr — also wird die Miniatur der
       Seite neu gezogen, sobald die Finger stillstehen. */
    clearTimeout(miniTakt);
    miniTakt = setTimeout(frischeMini, 450);
  }

  /* Nachgezogen wird die Seite, in die geschrieben wurde — nicht die, die der
     Zähler gerade nennt. Am großen Schirm stehen zwei Seiten nebeneinander im
     Blick; wer in die untere tippt, ohne zu scrollen, sähe sonst die obere
     Miniatur neu und die eigene alt. */
  /* :empty greift nicht, wo eine Feder im Absatz steht — der Knopf ist ein
     Kind des Absatzes. Ein leerer Absatz fiele dann auf den Strich zusammen,
     ohne zu sagen, dass man hier schreiben kann. */
  function zeigeLeere() {
    seitenEl.forEach(function (seite) {
      Array.prototype.forEach.call(seite.querySelectorAll('p[contenteditable]'), function (p) {
        p.classList.toggle('bb-leer', !lies(p).trim());
      });
    });
  }

  function frischeMini() {
    var i = jetzt;
    var wo = document.activeElement;
    while (wo && wo !== lauf) {
      if (wo.classList && wo.classList.contains('bb-seite')) {
        var k = seitenEl.indexOf(wo);
        if (k > -1) i = k;
        break;
      }
      wo = wo.parentNode;
    }
    var seite = seitenEl[i], alt = miniEl[i];
    if (!seite || !alt || !alt.parentNode) return;
    var neu = baueMini(seite, i);
    if (alt.classList.contains('hier')) {
      neu.classList.add('hier');
      neu.setAttribute('aria-current', 'true');
    }
    alt.parentNode.replaceChild(neu, alt);
    miniEl[i] = neu;
  }

  /* ---------- Zurück ins Dokument ----------
     Es gibt keinen Speichern-Knopf, weil es nichts zu speichern gibt — aber
     dann muss das Geschriebene auch dort landen, wo das Dokument steht. Sonst
     stünde beim zweiten Aufschlagen der alte Satz da, und „die Akte ist ein
     Arbeitsraum" wäre eine Behauptung, die beim zweiten Druck zusammenfällt.
     Zustand über den Tab hinaus gibt es in dieser Vorführung trotzdem nicht:
     ein Neuladen setzt alles zurück, wie überall hier. */
  /* Ein Block ist eine Zeichenkette, kein HTML. textContent verschluckt dabei
     jeden Umbruch: „Erste Zeile" Enter „Zweite Zeile" käme als ein Wortbrei
     zurück. innerText liest, was tatsächlich als Zeile dasteht. */
  function lies(el) {
    var t = el.innerText !== undefined ? el.innerText : el.textContent;
    /* Der Browser hängt an ein contenteditable gern eine leere Schlusszeile. */
    return String(t).replace(/\n+$/, '');
  }

  function sichere() {
    if (!jetzigesDok) return;
    var notizen = {};
    seitenEl.forEach(function (seite, i) {
      Array.prototype.forEach.call(seite.querySelectorAll('[contenteditable="true"]'), function (el) {
        if (el.__zelle) {
          var z = el.__zelle;
          if (z[0].tab && z[0].tab[z[1]]) z[0].tab[z[1]][z[2]] = lies(el);
          return;
        }
        var b = el.__block;
        if (!b) return;
        if (b.liste) {
          b.liste = Array.prototype.map.call(el.querySelectorAll('li'), lies);
        } else if (b.h !== undefined) b.h = lies(el);
        else if (b.klein !== undefined) b.klein = lies(el);
        else if (!b.tab && !b.bild) b.p = lies(el);
      });
      var n = seite.querySelector('.bb-notiz');
      /* lies() auch hier: eine Handschrift über zwei Zeilen ist zwei Zeilen. */
      if (n && lies(n).trim()) notizen[i + 1] = lies(n).trim();
    });
    jetzigesDok.notizen = notizen;
    /* Was unten steht, muss beim nächsten Aufschlagen noch stimmen: „noch kein
       Wort" auf einem vollgeschriebenen Blatt wäre die eine Zeile, die dem
       Versprechen „geschrieben ist gespeichert" widerspricht. */
    if (schonGetippt && standNeu) jetzigesDok.stand = standNeu;
    /* Die alte Kurzform für Seite 1 darf nicht zusätzlich wirken, sonst stünde
       eine gelöschte Notiz beim nächsten Mal wieder da. */
    delete jetzigesDok.randnotiz;
  }

  /* ---------- Die Randnotiz: was man auf fremdes Papier schreiben darf -----
     Eine Notiz entsteht immer hier, ob sie neu geschrieben oder aus dem
     letzten Mal wiederhergestellt wird — sonst hätte die wiederhergestellte
     keinen Horcher, und wer sie leert, ließe einen unsichtbaren Fleck auf der
     Seite zurück, den die Miniatur brav mitkopiert. */
  function baueNotiz(seite, text) {
    var n = document.createElement('div');
    n.className = 'bb-notiz';
    n.textContent = text || '';
    n.addEventListener('blur', function () {
      if (!lies(n).trim()) n.remove();
      else getippt();
    });
    seite.appendChild(n);
    return n;
  }
  /* ---------- Die Randnotiz: was man auf fremdes Papier schreiben darf ----- */
  function notizAnDenRand() {
    var seite = seitenEl[jetzt];
    if (!seite) return;
    var n = seite.querySelector('.bb-notiz') || baueNotiz(seite, '');
    n.setAttribute('contenteditable', 'true');
    n.focus();
    var r = document.createRange();
    r.selectNodeContents(n);
    r.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }

  /* ---------- Auf und zu ---------- */
  function zeige(dok) {
    if (!schicht) baueSchicht();
    offen = true;
    jetzigesDok = dok;
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
    federn = [];
    federHier = null;
    federBlatt.hidden = true;
    clearTimeout(miniTakt);

    /* Ein gescannter Stapel hat keinen Text — auf dem kann man auch keinen
       ändern. Offen ist nur, wo Sätze stehen. */
    var papierOffen = !!dok.schreibbar && !dok.ohneText;
    schonGetippt = false;
    /* Auf fremdem Papier braucht die Fläche nichts zu sagen: dass eine
       Randnotiz steht, ist überall dasselbe. */
    standNeu = dok.standNeu || (dok.notizbar && !papierOffen ? 'Deine Randnotiz steht.' : '');

    /* Offenes Papier bekommt eigene Blöcke ---------------------------------
       Beim Sichern wird in die Blöcke zurückgeschrieben. Kämen sie aus der
       gemeinsamen Quelle (blaetter.js reicht Blöcke ohne {beratung}
       unverändert durch), landete der getippte Satz im Rahmenvertrag, den
       das Gespräch und die Unterlagen des Kunden ebenfalls zeigen. Die Kopie
       hängt deshalb an DIESER Stelle — dort, wo geschrieben wird — und nicht
       daran, dass ein Aufrufer sie vorher bestellt hat. Sie ersetzt die Seiten
       im übergebenen Dokument, damit das Geschriebene beim nächsten
       Aufschlagen noch da ist. */
    if (papierOffen && dok.seiten && !dok.__eigen) {
      dok.seiten = eigeneFassung(dok.seiten);
      dok.__eigen = true;
    }

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
          (fund && fund.seite === i + 1) ? fund.wort : null, papierOffen));
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

    /* Randnotizen: die Kurzform randnotiz meint Seite 1, notizen nennt die
       Seite selbst — so kommt zurück, was beim letzten Mal an den Rand
       geschrieben wurde. */
    var notizen = {};
    if (dok.randnotiz) notizen[1] = dok.randnotiz;
    if (dok.notizen) for (var nk in dok.notizen) {
      if (Object.prototype.hasOwnProperty.call(dok.notizen, nk)) notizen[nk] = dok.notizen[nk];
    }
    Object.keys(notizen).forEach(function (nr) {
      var seite = seitenEl[+nr - 1];
      if (!seite) return;
      var notiz = baueNotiz(seite, notizen[nr]);
      if (dok.notizbar) notiz.setAttribute('contenteditable', 'true');
      /* Auch die Miniatur trägt sie — sie ist ein Klon, der vor der Notiz
         entstanden ist. */
      var mk = miniEl[+nr - 1] && miniEl[+nr - 1].querySelector('.bb-seite');
      if (mk) mk.appendChild(notiz.cloneNode(true));
    });

    zeigeLeere();

    fussWort.textContent = dok.fuss || '';
    standWort.textContent = dok.stand || '';
    standWort.style.display = dok.stand ? '' : 'none';

    griffeKasten.textContent = '';
    federKnopf = null;
    notizKnopf = null;

    if (federn.length) {
      federKnopf = document.createElement('button');
      federKnopf.type = 'button';
      federKnopf.className = 'feder-knopf';
      federKnopf.addEventListener('click', naechsteFeder);
      griffeKasten.appendChild(federKnopf);
      zeigeFedernStand();
    }

    /* Auf fremdem Papier ist der Rand der einzige Platz, der einem gehört. */
    if (dok.notizbar) {
      notizKnopf = document.createElement('button');
      notizKnopf.type = 'button';
      notizKnopf.textContent = 'An den Rand schreiben';
      notizKnopf.addEventListener('click', notizAnDenRand);
      griffeKasten.appendChild(notizKnopf);
    }

    (dok.griffe || []).forEach(function (g) {
      var b = document.createElement('button');
      b.type = 'button';
      if (g.stark) b.className = 'stark';
      b.textContent = g.wort;
      b.addEventListener('click', function () { g.tat(dok); });
      griffeKasten.appendChild(b);
    });

    /* Derselbe Horcher, immer angemeldet: er hört nur, wo etwas offen ist, und
       zweimal anmelden geht bei gleicher Funktion nicht. */
    lauf.addEventListener('input', getippt);
    if (papierOffen || dok.notizbar) {
      schicht.setAttribute('aria-label', (dok.titel || 'Dokument') +
        (papierOffen ? ', offen zum Schreiben' : ', gesetzt, mit Platz für Randnotizen'));
    }

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
    clearTimeout(miniTakt);
    schliesseFeder(false);
    sichere();
    /* Die Fläche darf erfahren, dass zugeklappt wurde — sie hängt eine Zeile
       an dem Dokument, und deren Name steht in der Überschrift, die eben noch
       geändert werden konnte. */
    if (jetzigesDok && typeof jetzigesDok.beimSchliessen === 'function') {
      jetzigesDok.beimSchliessen(jetzigesDok);
    }
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
    var imText = document.activeElement && document.activeElement.isContentEditable;
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation();
      /* Escape geht rückwärts durch das, was aufgeklappt ist: erst der
         Vorschlag, dann der Cursor im Papier, erst dann das Blatt. Wer beim
         Schreiben Escape drückt, will nicht das halbe Dokument verlassen. */
      if (federHier) { var k = federHier.knopf; schliesseFeder(false); if (k.isConnected) k.focus(); return; }
      if (imText) { document.activeElement.blur(); schicht.querySelector('.bb-zu').focus(); return; }
      schliesse();
      return;
    }
    /* Im offenen Text gehören die Pfeile dem Cursor, nicht dem Blättern. */
    if (!imText && (e.key === 'ArrowRight' || e.key === 'PageDown')) { e.preventDefault(); zuSeite(jetzt + 1); return; }
    if (!imText && (e.key === 'ArrowLeft' || e.key === 'PageUp')) { e.preventDefault(); zuSeite(jetzt - 1); return; }
    if (e.key !== 'Tab') return;
    /* Modal heißt modal: der Fokus verlässt die Ebene nicht, sonst tippt man
       blind in der Fläche darunter herum. */
    /* Nur, was auch dasteht: die Seiten-Miniaturen sind am Handy display:none,
       und ein unsichtbarer letzter Halt hieße, dass Tab aus der Ebene heraus
       in die Fläche dahinter fällt. */
    var greifbar = Array.prototype.filter.call(
      schicht.querySelectorAll('button:not([disabled]), [href], [contenteditable="true"], [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.offsetParent !== null || el === document.activeElement; });
    if (!greifbar.length) return;
    var erster = greifbar[0], letzter = greifbar[greifbar.length - 1];
    if (!schicht.contains(document.activeElement)) { e.preventDefault(); erster.focus(); return; }
    if (e.shiftKey && document.activeElement === erster) { e.preventDefault(); letzter.focus(); }
    else if (!e.shiftKey && document.activeElement === letzter) { e.preventDefault(); erster.focus(); }
  });

  return { zeige: zeige, schliesse: schliesse, offen: function () { return offen; } };
})();
