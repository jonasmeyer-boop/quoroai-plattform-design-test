/* quoroai-plattform-design · Abreden: was mit welchem Kunden vereinbart ist.

   Die eine Quelle für die Abrechnungs-Abrede je Mandat — dieselbe Rolle wie
   lage.js für das „Heute" und preise.js für die Tarife (CLAUDE.md: eine
   geteilte Größe wird von einem Baustein gelesen, nie in einer Fläche
   getippt).

   **Warum es ihn seit dem 20.08.2026 gibt:** die Abreden standen im Skript
   von `beratung-rechnungen.html`, und die neue Fläche für wiederkehrende
   Rechnungen (`beratung-rechnungsvorlagen.html`) braucht dieselben Zahlen —
   Rhythmus, Betrag, Zahlungsziel. Eine zweite Kopie hätte bedeutet: zwei
   Flächen behaupten verschiedene Beträge für denselben Kunden, und die eine
   erzeugt den Entwurf, den die andere anzeigt.

   Die Abrede entscheidet, was auf eine Rechnung darf (Häppchen B5,
   Entscheidung 2026-08-14): bei `aufwand` die Stunden mit hinterlegtem Satz,
   bei `monatspauschale` die Rate des Monats, bei `jahrespauschale` der
   Abschlag. Weiterberechenbare Auslagen kommen in allen Fällen dazu.

   Im Produkt kommen dieselben Größen aus der Abrede am Mandat
   (`engagements`). Dieser Baustein liefert Daten und Rechenwege, nie
   Aussehen. Beträge in Cent, netto.
   Marker: ABREDEN-V1 (die eine Quelle für die Abrede je Mandat) */
window.Abreden = (function () {
  'use strict';

  var ABREDEN = {
    petersen: {art: 'monatspauschale', wort: 'über eine Monatspauschale von 2.400 €', cent: 240000,
               zielTage: 10, frueherJahr: '2026', frueherBis: '2026-06'},
    cordes:   {art: 'monatspauschale', wort: 'über eine Monatspauschale von 2.750 €', cent: 275000},
    freitag:  {art: 'aufwand', wort: 'nach Aufwand und Auslagen'},
    mts:      {art: 'jahrespauschale', wort: 'über eine Jahrespauschale von 27.000 € in zwölf Abschlägen',
               cent: 2700000, raten: 12, rate: 225000,
               /* Abschläge vor dem sichtbaren Stapel: Januar bis Juni 2026.
                  Juli und August stehen als 2026-0081 und 2026-0084 im
                  Stapel und werden gezählt, nicht geschätzt. Das Jahr steht
                  dabei — der Stichtag darf in jedem Jahr liegen. */
               frueherJahr: '2026', frueherBis: '2026-06', frueher: 6, frueherCent: 1350000}
  };

  /* Das voreingestellte Zahlungsziel in Tagen, wenn die Abrede keins nennt */
  var ZIEL_TAGE = 14;

  function kopie(o) {
    var z = {}, k;
    for (k in o) if (Object.prototype.hasOwnProperty.call(o, k)) z[k] = o[k];
    return z;
  }

  /* Alle Abreden als Objekt, in der Form, die die Flächen erwarten */
  function alle() {
    var z = {}, k;
    for (k in ABREDEN) if (Object.prototype.hasOwnProperty.call(ABREDEN, k)) z[k] = kopie(ABREDEN[k]);
    return z;
  }

  function abrede(mandatId) {
    return ABREDEN[mandatId] ? kopie(ABREDEN[mandatId]) : null;
  }

  /* Das Zahlungsziel dieses Kunden in Tagen */
  function zielTage(mandatId) {
    var a = ABREDEN[mandatId];
    return (a && a.zielTage) || ZIEL_TAGE;
  }

  /* Wiederkehrend heißt: es entsteht ohne Zutun ein Entwurf. Nach Aufwand
     abgerechnete Mandate gehören NICHT dazu — dort weiß niemand vorher, was
     draufsteht, und ein Entwurf über null Euro wäre eine Meldung ohne Inhalt. */
  function istWiederkehrend(mandatId) {
    var a = ABREDEN[mandatId];
    return !!a && (a.art === 'monatspauschale' || a.art === 'jahrespauschale');
  }

  /* Was je Lauf berechnet wird, in Cent */
  function rateCent(mandatId) {
    var a = ABREDEN[mandatId];
    if (!a) return 0;
    if (a.art === 'monatspauschale') return a.cent;
    if (a.art === 'jahrespauschale') return a.rate;
    return 0;
  }

  /* Der Rhythmus in Worten — beide Pauschalen laufen monatlich, die
     Jahrespauschale als Abschlag. Das ist keine Kleinigkeit: „jährlich"
     stünde falsch da, obwohl der Betrag ein Jahresbetrag ist. */
  function rhythmus(mandatId) {
    var a = ABREDEN[mandatId];
    if (!a) return '';
    if (a.art === 'monatspauschale') return 'monatlich';
    if (a.art === 'jahrespauschale') return 'monatlich, als Abschlag';
    return 'nach Aufwand';
  }

  function euro(cent) {
    return (cent / 100).toLocaleString('de-DE', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }) + ' €';
  }

  return {
    alle: alle,
    abrede: abrede,
    zielTage: zielTage,
    zielTageVorgabe: function () { return ZIEL_TAGE; },
    istWiederkehrend: istWiederkehrend,
    rateCent: rateCent,
    rhythmus: rhythmus,
    euro: euro
  };
})();
