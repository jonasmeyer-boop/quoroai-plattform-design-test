/* quoroai-plattform-design · Der Radar: was von selbst zum Kunden hinausgeht
   (Issue #55). Marker: RADAR-V1

   Warum es diese Datei gibt: Issue #55 war zur Hälfte gebaut und dadurch
   gefährlicher als vorher. `beratung-radar.html` hielt den Punkt zur offenen
   Lücke an — „er darf sie nicht von selbst beantworten" — und
   `briefing.html`, das GENAU DIESES Blatt beim Kunden ist, lieferte die
   angehaltene Zahl trotzdem aus. Zwei Flächen, zwei Wahrheiten über dieselbe
   Sendung. Deshalb steht die Wahrheit jetzt einmal hier, und beide Seiten
   hängen daran statt sie abzuschreiben.

   Wie lage.js liefert dieser Baustein ausschließlich Daten und Zustände —
   kein Markup, keine Farbe, keine Schrift. Das ist die Bedingung dafür, dass
   ihn eine quoroAI-Fläche (beratung-radar.html, mit system.css) und eine
   Kundenfläche (briefing.html, White-Label über marke.js) gemeinsam benutzen
   dürfen. Wie eine angehaltene Meldung beim Kunden AUSSIEHT, entscheidet
   briefing.html; DASS sie angehalten ist, entscheidet der Radar.

   Zwei Dinge stehen hier:

   1. Der Versandtermin. Vor dieser Runde standen zwei Tage für dieselbe
      Sendung: das Blatt des Kunden war auf Dienstag datiert, der Radar sagte
      an 21 Stellen „Donnerstag". Es gilt der Dienstag — nicht aus Geschmack,
      sondern weil die gemeinsame Lage (lage.js) die Meldung „Dein Briefing
      liegt da" auf Dienstag, 7:00 legt, und die Glocke des Kunden zeigt auf
      genau dieses Blatt. Das Briefing geht also wöchentlich dienstags um 7:00
      hinaus; heute ist Dienstag, das Blatt von heute früh liegt beim Kunden,
      und der Radar zeigt die nächste Sendung: Dienstag in einer Woche.
   2. Der Zustand jedes Punktes: läuft er, oder ist er angehalten. Angehalten
      wird auf zwei Wegen — von Hand am Knopf, oder von selbst, solange zum
      selben Thema eine Lücke offen ist. Für den Kunden ist beides dasselbe:
      der Punkt steht nicht in seinem Briefing.

   Der Zustand lebt in sessionStorage, damit er den Weg vom Cockpit auf das
   Blatt des Kunden übersteht (dieselbe Brücke wie `starte-frage` und
   `briefing-woche`). Der Radar ist die Quelle: er setzt beim Laden den
   gezeichneten Ausgangsstand. Wer briefing.html direkt öffnet, bekommt
   denselben Ausgangsstand aus DEFAULT_GESPERRT.

   Voraussetzung: lage.js, wenn vorhanden — daraus kommt das „Heute" des
   Entwurfs. Fehlt es, rechnet dieser Baustein mit demselben Datum weiter,
   statt stehen zu bleiben. */
window.Radar = (function () {
  'use strict';

  var SCHLUESSEL = 'radar-punkte';
  var SCHLUESSEL_ANTWORT = 'radar-antworten';

  /* Die Themen, zu denen im gezeichneten Stand eine Lücke offen ist. Solange
     sie offen ist, geht der Punkt zum selben Thema nicht hinaus. */
  var DEFAULT_GESPERRT = {
    zoll: 'die Antwort der Beratung zur Einfuhrabgabe',
    maut: 'die Anlagenliste von Cordes'
  };

  /* Wie das Thema beim Kunden heißt. Der Radar nennt es intern „zoll" — auf
     dem Blatt des Kunden steht nie ein Kürzel. */
  var THEMA_NAME = {
    zoll: 'die Einfuhrabgabe auf Stahl',
    tarif: 'der Tarifabschluss',
    maut: 'die Maut für schwere Lkw'
  };

  /* ---------- Der Versandtermin ----------
     Das „Heute" kommt aus lage.js. Gelesen werden nur die dokumentierten
     Felder von Lage.tage(): `kurzdatum` („18.08.") und `datum`
     („18. August 2026") — daraus das Jahr. */
  var WOCHENTAG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  function heuteDatum() {
    var L = window.Lage;
    try {
      if (L && L.tage && L.heute) {
        var t = L.tage()[L.heute()];
        if (t && t.kurzdatum && t.datum) {
          var td = /^(\d{1,2})\.(\d{1,2})\./.exec(t.kurzdatum);
          var jahr = /(\d{4})/.exec(t.datum);
          if (td && jahr) return new Date(+jahr[1], +td[2] - 1, +td[1]);
        }
      }
    } catch (e) {}
    return new Date(2026, 7, 18); /* Dienstag, 18. August 2026 */
  }

  function zwei(n) { return (n < 10 ? '0' : '') + n; }

  /* Die nächste Sendung: derselbe Wochentag, eine Woche weiter, 7:00.
     Das Blatt von heute früh liegt beim Kunden — anhalten lässt sich nur
     noch, was danach kommt. */
  function versand() {
    var d = heuteDatum();
    d.setDate(d.getDate() + 7);
    var tag = WOCHENTAG[d.getDay()];
    var kurz = tag + ', ' + zwei(d.getDate()) + '.' + zwei(d.getMonth() + 1) + '.';
    return {
      tag: tag,
      kurz: kurz,                                   /* „Dienstag, 25.08."      */
      mitJahr: kurz + d.getFullYear(),              /* „Dienstag, 25.08.2026"  */
      lang: kurz + d.getFullYear() + ', 7:00 Uhr',  /* „Dienstag, 25.08.2026, 7:00 Uhr" */
      datum: d
    };
  }

  /* Dieselbe Schreibweise für das Blatt, das heute früh hinausgegangen ist. */
  function ausgabe() {
    var d = heuteDatum();
    var kurz = WOCHENTAG[d.getDay()] + ', ' + zwei(d.getDate()) + '.' + zwei(d.getMonth() + 1) + '.';
    return { tag: WOCHENTAG[d.getDay()], kurz: kurz, lang: kurz + d.getFullYear() + ', 7:00 Uhr', datum: d };
  }

  /* ---------- Der Zustand der Punkte ---------- */
  function lies(schluessel) {
    try {
      var roh = JSON.parse(sessionStorage.getItem(schluessel) || 'null');
      return (roh && typeof roh === 'object') ? roh : {};
    } catch (e) { return {}; }
  }

  function schreib(schluessel, wert) {
    try { sessionStorage.setItem(schluessel, JSON.stringify(wert)); } catch (e) {}
  }

  /* „gesperrt" heißt: geht nicht hinaus — egal ob von Hand angehalten oder
     weil die Lücke offen ist. Für den Kunden ist das dasselbe. */
  function zustand(thema) {
    var s = lies(SCHLUESSEL);
    if (Object.prototype.hasOwnProperty.call(s, thema)) return s[thema];
    return Object.prototype.hasOwnProperty.call(DEFAULT_GESPERRT, thema) ? 'gesperrt' : 'frei';
  }

  function setze(thema, wert) {
    var s = lies(SCHLUESSEL);
    s[thema] = wert;
    schreib(SCHLUESSEL, s);
  }

  function sperren(thema) { setze(thema, 'gesperrt'); }
  function freigeben(thema) { setze(thema, 'frei'); }
  function geht(thema) { return zustand(thema) === 'frei'; }

  /* Was die Beratung ins Wissen geschrieben hat. Steht es dort, geht es
     wörtlich mit hinaus — ohne Betrag, es gilt für alle Mandate gleich. */
  function antwort(thema) {
    var a = lies(SCHLUESSEL_ANTWORT);
    return typeof a[thema] === 'string' ? a[thema] : '';
  }

  function setzeAntwort(thema, text) {
    var a = lies(SCHLUESSEL_ANTWORT);
    a[thema] = String(text || '');
    schreib(SCHLUESSEL_ANTWORT, a);
  }

  /* Der Radar setzt beim Laden den gezeichneten Ausgangsstand: alles läuft,
     außer den Themen mit offener Lücke. Ohne das trüge das Blatt des Kunden
     noch die Entscheidung eines früheren Durchgangs, während der Radar
     wieder von vorn zeigt. */
  function zuruecksetzen(gesperrteThemen) {
    var s = {};
    (gesperrteThemen || []).forEach(function (t) { s[t] = 'gesperrt'; });
    schreib(SCHLUESSEL, s);
    schreib(SCHLUESSEL_ANTWORT, {});
  }

  return {
    versand: versand,
    ausgabe: ausgabe,
    themaName: function (t) { return THEMA_NAME[t] || t; },
    grund: function (t) { return DEFAULT_GESPERRT[t] || ''; },
    zustand: zustand,
    geht: geht,
    sperren: sperren,
    freigeben: freigeben,
    antwort: antwort,
    setzeAntwort: setzeAntwort,
    zuruecksetzen: zuruecksetzen
  };
})();
