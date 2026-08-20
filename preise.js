/* quoroai-plattform-design · Preise: was quoroAI der Beratung berechnet.

   Die eine Quelle für Tarife, Mengenrabatt und Plattformgebühr — dieselbe
   Rolle wie lage.js für das „Heute" (CLAUDE.md: eine geteilte Größe wird von
   einem Baustein gelesen, nie in einer Fläche getippt; braucht es eine
   zweite, kommt sie als Baustein daneben).

   **Warum es ihn seit dem 20.08.2026 gibt:** dieselben Zahlen standen in
   DREI Flächen getippt — plattform.html, beratung-abrechnung.html und
   registrieren.html (dort sogar als Fließtext, „19,00 € bis 149,00 €") —,
   und mit den AGB kam eine vierte dazu. Bei einer Zahl in einem Vertrag ist
   Abweichung kein Schönheitsfehler: sie steht dann falsch in einem Dokument,
   das gilt.

   Im Produkt kommen dieselben Größen aus `src/lib/plans.ts` (Listenpreise)
   und `src/lib/platform/preise.ts` (Staffel, Plattformgebühr). Dieser
   Baustein liefert Daten und Rechenwege, nie Aussehen.

   Alle Beträge in Cent, netto. Umsatzsteuer kommt obendrauf und wird von den
   Flächen ausgewiesen, nicht hier hineingerechnet.
   Marker: PREISE-V1 (die eine Quelle für Tarife, Staffel und Gebühr) */
window.Preise = (function () {
  'use strict';

  /* Was ein Zugang je Kunde und vollem Monat kostet, nach Umfang */
  var TARIFE = {
    basis:    { label: 'Basis',    cent: 1900 },
    standard: { label: 'Standard', cent: 5900 },
    plus:     { label: 'Plus',     cent: 14900 }
  };

  /* Mengenrabatt auf den Listenpreis, nach Zahl der Zugänge. Die erste Stufe
     gilt ab dem ERSTEN Zugang — nicht erst ab 25 (Falle aus registrieren.html,
     dort stand einmal das Gegenteil). */
  var STAFFEL = [
    { ab: 0,   proz: 25 },
    { ab: 25,  proz: 35 },
    { ab: 100, proz: 45 }
  ];

  /* Was die Beratung selbst kostet, je Monat, unabhängig von den Zugängen */
  var GEBUEHR = 14900;

  /* Der Umsatzsteuersatz, mit dem die Flächen ausweisen */
  var UST_PROZENT = 19;

  function tarife() {
    return Object.keys(TARIFE).map(function (id) {
      return { id: id, label: TARIFE[id].label, cent: TARIFE[id].cent };
    });
  }
  function tarif(id) { return TARIFE[id] ? { id: id, label: TARIFE[id].label, cent: TARIFE[id].cent } : null; }
  function staffel() { return STAFFEL.map(function (s) { return { ab: s.ab, proz: s.proz }; }); }
  function gebuehr() { return GEBUEHR; }
  function ust() { return UST_PROZENT; }

  /* Der Rabattsatz für eine Zahl von Zugängen, in Prozent */
  function rabattFuer(zugaenge) {
    var p = 0;
    STAFFEL.forEach(function (stufe) { if (zugaenge >= stufe.ab) p = stufe.proz; });
    return p;
  }

  /* Was ein Zugang nach Rabatt kostet, in Cent, kaufmännisch gerundet */
  function preisJeZugang(tarifId, zugaenge) {
    var t = TARIFE[tarifId];
    if (!t) return 0;
    return Math.round(t.cent * (100 - rabattFuer(zugaenge)) / 100);
  }

  /* Die günstigste und die teuerste Stufe — für Sätze wie „19,00 € bis
     149,00 €", die sonst getippt würden */
  function spanne() {
    var c = Object.keys(TARIFE).map(function (id) { return TARIFE[id].cent; });
    return { von: Math.min.apply(null, c), bis: Math.max.apply(null, c) };
  }

  /* Cent als deutscher Betrag mit Euro-Zeichen */
  function euro(cent) {
    return (cent / 100).toLocaleString('de-DE', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }) + ' €';
  }

  return {
    tarife: tarife,
    tarif: tarif,
    staffel: staffel,
    gebuehr: gebuehr,
    ust: ust,
    rabattFuer: rabattFuer,
    preisJeZugang: preisJeZugang,
    spanne: spanne,
    euro: euro
  };
})();
