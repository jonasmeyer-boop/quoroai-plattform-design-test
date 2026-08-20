/* quoroai-plattform-design · website/ · Die geteilten Zahlen des Auftritts.
   Quelle der Werte: entwuerfe/preise.js (PREISE-V1). Hier steht eine Kopie,
   weil dieser Ordner ohne entwuerfe/ lauffähig bleiben soll; ändert sich ein
   Tarif, wird er dort geändert und hier nachgezogen. Keine Fläche der Website
   tippt einen Betrag ins Markup.

   Die Oberfläche ist ABSICHTLICH dieselbe wie in preise.js (tarife, tarif,
   staffel, gebuehr(), ust(), rabattFuer, preisJeZugang, spanne, euro) — so
   lässt sich die Kopie eines Tages durch die Quelle ersetzen, ohne dass eine
   Fläche bricht. Dazu kommen zwei Website-Zugaben: monat() für den Rechner
   und euroKurz() für glatte Beträge im Fließtext.
   Alle Beträge in Cent, netto. Marker: WEBSITE-ZAHLEN-V2 (V2 nach Review:
   Oberfläche an preise.js angeglichen, spanne() übernommen) */
window.Zahlen = (function () {
  'use strict';

  var TARIFE = {
    basis:    { label: 'Basis',    cent: 1900 },
    standard: { label: 'Standard', cent: 5900 },
    plus:     { label: 'Plus',     cent: 14900 }
  };

  /* Die erste Stufe gilt ab dem ERSTEN Zugang (Falle aus registrieren.html) */
  var STAFFEL = [
    { ab: 0,   proz: 25 },
    { ab: 25,  proz: 35 },
    { ab: 100, proz: 45 }
  ];

  var GEBUEHR = 14900;      /* je Beratung und Monat */
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

  function rabattFuer(zugaenge) {
    var p = 0;
    STAFFEL.forEach(function (stufe) { if (zugaenge >= stufe.ab) p = stufe.proz; });
    return p;
  }

  function preisJeZugang(tarifId, zugaenge) {
    var t = TARIFE[tarifId];
    if (!t) return 0;
    return Math.round(t.cent * (100 - rabattFuer(zugaenge)) / 100);
  }

  /* Die günstigste und die teuerste Stufe — für Sätze wie „19 € bis 149 €" */
  function spanne() {
    var c = Object.keys(TARIFE).map(function (id) { return TARIFE[id].cent; });
    return { von: Math.min.apply(null, c), bis: Math.max.apply(null, c) };
  }

  function euro(cent) {
    return (cent / 100).toLocaleString('de-DE', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }) + ' €';
  }

  /* ---- Website-Zugaben ---- */

  /* Was die Beratung im Monat zahlt: Gebühr plus Zugänge nach Rabatt */
  function monat(zugaenge, tarifId) {
    var proZugang = preisJeZugang(TARIFE[tarifId] ? tarifId : 'standard', zugaenge);
    return {
      gebuehr: GEBUEHR,
      proZugang: proZugang,
      rabatt: rabattFuer(zugaenge),
      zugaenge: zugaenge,
      summe: GEBUEHR + proZugang * zugaenge
    };
  }

  /* Ohne Nachkommastellen, wenn glatt: für große Zahlen im Fließtext */
  function euroKurz(cent) {
    return (cent / 100).toLocaleString('de-DE', {
      minimumFractionDigits: cent % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2
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
    euro: euro,
    monat: monat,
    euroKurz: euroKurz
  };
})();
