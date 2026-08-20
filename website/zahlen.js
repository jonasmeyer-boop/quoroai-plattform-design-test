/* quoroai-plattform-design · website/ · Die geteilten Zahlen des Auftritts.
   Quelle der Werte: entwuerfe/preise.js (PREISE-V1). Hier steht eine Kopie,
   weil dieser Ordner ohne entwuerfe/ lauffähig bleiben soll; ändert sich ein
   Tarif, wird er dort geändert und hier nachgezogen. Keine Fläche der Website
   tippt einen Betrag ins Markup.
   Alle Beträge in Cent, netto. Marker: WEBSITE-ZAHLEN-V1 */
window.Zahlen = (function () {
  'use strict';

  var TARIFE = [
    { id: 'basis',    label: 'Basis',    cent: 1900,
      wofuer: 'Unterlagen, Termine und Rechnungen im Portal, ohne KI-Berater.' },
    { id: 'standard', label: 'Standard', cent: 5900,
      wofuer: 'Mit KI-Berater auf dem Wissen der Beratung, Protokoll inbegriffen.' },
    { id: 'plus',     label: 'Plus',     cent: 14900,
      wofuer: 'Dazu Auswertungen, Radar und eigene Vorlagen je Mandat.' }
  ];

  var STAFFEL = [
    { ab: 0,   proz: 25 },
    { ab: 25,  proz: 35 },
    { ab: 100, proz: 45 }
  ];

  var GEBUEHR = 14900;      /* je Beratung und Monat */
  var UST_PROZENT = 19;

  function rabatt(zugaenge) {
    var p = 0;
    STAFFEL.forEach(function (s) { if (zugaenge >= s.ab) p = s.proz; });
    return p;
  }

  /* Was die Beratung im Monat zahlt: Gebühr plus Zugänge nach Rabatt */
  function monat(zugaenge, tarifId) {
    var t = TARIFE.filter(function (x) { return x.id === tarifId; })[0] || TARIFE[1];
    var p = rabatt(zugaenge);
    var proZugang = Math.round(t.cent * (100 - p) / 100);
    return {
      gebuehr: GEBUEHR,
      proZugang: proZugang,
      rabatt: p,
      zugaenge: zugaenge,
      summe: GEBUEHR + proZugang * zugaenge
    };
  }

  function euro(cent) {
    return (cent / 100).toLocaleString('de-DE', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2
    });
  }

  /* Ohne Nachkommastellen, wenn glatt: für große Zahlen im Fließtext */
  function euroKurz(cent) {
    return (cent / 100).toLocaleString('de-DE', {
      style: 'currency', currency: 'EUR',
      minimumFractionDigits: cent % 100 === 0 ? 0 : 2
    });
  }

  return {
    tarife: function () { return TARIFE.slice(); },
    staffel: function () { return STAFFEL.slice(); },
    gebuehr: GEBUEHR,
    ust: UST_PROZENT,
    rabatt: rabatt,
    monat: monat,
    euro: euro,
    euroKurz: euroKurz
  };
})();
