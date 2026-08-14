/* quoroai-plattform-design · Der Versandvermerk: was aus der Mail wurde, in
   einem Halbsatz (Paket 10, Systembausteine).
   Er steht überall dort, wo die Software jemandem etwas geschickt hat —
   Einladung ins Team, Zugang für einen Kunden, Rechnung —, weil „verschickt
   am 10.08." die Frage offen lässt, auf die es ankommt: ist sie angekommen?
   Eine Beratung, die auf Antwort wartet, will nicht raten.
   Gezeigt wird immer der LETZTE Versuch; frühere interessieren am Bildschirm
   niemanden. Wortlaut und Zustände kommen aus dem Produkt
   (src/app/(beratung)/versandvermerk.tsx), nicht das Aussehen.
   Markenneutral: die Farbe für „schiefgegangen" kommt aus dem Token der
   jeweiligen Fläche, deshalb läuft dieser Baustein auf quoroAI-Flächen wie
   auf White-Label-Kundenflächen.
   Marker: VERMERK-V1 */
window.Vermerk = (function () {
  'use strict';

  var MONATE = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];

  /* Eigene Datumsform, damit der Baustein nichts von seiner Seite braucht.
     Gleiche Schreibweise wie formatMoment im Produkt: „14. Aug. 2026". */
  function datum(iso) {
    if (!iso) return '';
    var t = String(iso).slice(0, 10).split('-');
    if (t.length !== 3) return String(iso);
    var m = MONATE[Number(t[1]) - 1];
    if (!m) return String(iso);
    return Number(t[2]) + '. ' + m + ' ' + t[0];
  }

  var stilDa = false;
  function stil() {
    if (stilDa) return;
    stilDa = true;
    var s = document.createElement('style');
    s.textContent =
      '.vermerk-schlecht{color:var(--rot, #c03246)}';
    document.head.appendChild(s);
  }

  /* Der jüngste Versuch, oder nichts, wenn nie einer hinausging. */
  function juengster(liste) {
    if (!liste || !liste.length) return null;
    return liste.slice().sort(function (a, b) {
      return String(b.datum).localeCompare(String(a.datum));
    })[0];
  }

  /* Der Halbsatz als reiner Text — für Vorlesen, Titel, Kopieren. */
  function satz(v) {
    if (!v) return 'nicht verschickt';
    if (v.art === 'zugestellt') return 'zugestellt am ' + datum(v.datum);
    if (v.art === 'kam-nicht') return 'kam nicht an (' + datum(v.datum) + ')';
    if (v.art === 'spam') return 'als Spam gemeldet (' + datum(v.datum) + ')';
    /* „verschickt" heißt: der Mailversand hat sie angenommen. Mehr wissen wir
       in diesem Moment nicht, und mehr behaupten wir auch nicht. */
    return 'verschickt am ' + datum(v.datum);
  }

  /* Der Halbsatz als Element. Schiefgelaufenes steht in Rot, und der
     technische Grund hängt im Titel: „550 5.1.1 user unknown" sagt dem
     Menschen, der es liest, mehr als jede Umschreibung von uns — er erkennt
     seinen Tippfehler daran. */
  function zeichne(v) {
    stil();
    var span = document.createElement('span');
    span.textContent = satz(v);
    if (v && (v.art === 'kam-nicht' || v.art === 'spam')) {
      span.className = 'vermerk-schlecht';
      if (v.grund) span.title = v.grund;
    }
    return span;
  }

  /* Kam die Mail nicht an, braucht die Fläche daneben einen Rettungsweg
     (den Link zum Weitergeben). Diese Frage stellt sie hier. */
  function schiefgegangen(v) {
    return !!v && (v.art === 'kam-nicht' || v.art === 'spam');
  }

  return {
    datum: datum,
    juengster: juengster,
    satz: satz,
    zeichne: zeichne,
    schiefgegangen: schiefgegangen
  };
})();
