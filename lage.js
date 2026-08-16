/* quoroai-plattform-design · Die Lage: eine Quelle für Meldungen und Termine
   (Issue #57)

   Sie stand zuerst in glocke.js, weil ein Agent dieser Runde keine neue Datei
   anlegen durfte — dadurch banden Terminflächen eine Datei namens „glocke.js"
   ein, an denen gar keine Glocke hängt. Der Inhalt stimmte, der Name log.
   Jetzt trägt jede Datei ihren eigenen Namen: hier das Wissen, in glocke.js
   der Baustein im Chrom, der es anzeigt.

   Wer die Lage braucht, bindet lage.js ein — mit oder ohne Glocke.
   glocke.js setzt lage.js voraus und muss nach ihr geladen werden.
   Marker: LAGE-V2

   V2: Die Lage konnte bisher nur Wochen-Versätze. Wer eine Frist rechnen
   wollte, musste das Datum wieder von Hand hinschreiben — und daraus sind in
   vier Flächen ein zweites und ein drittes „Heute" entstanden (der
   Abrechnungs-Stichtag 14.08.2026 war als „heute" gebaut, beratung-zeiten.html
   lebte auf einem Donnerstag ohne Datum). Jetzt kann die Lage mit Daten
   rechnen: Tagesabstände, Datum plus/minus Tage, und den Wortlaut einer Frist
   aus zwei Daten statt aus einer getippten Zahl. Ein Stichtag bleibt erlaubt —
   er heißt dann Stichtag und nicht „heute".
   ===================================================================

   Denkfehler 1 der Nutzerprüfung war, dass jede Fläche ihre eigene Wahrheit
   rechnet. Hier steht sie einmal. Wer sie liest:
     · uebersicht.html, gespraech.html  (Kundenflächen, White-Label) → Meldungen
     · beratung-termine.html, beratung-kalender.html (quoroAI) → Termine

   Warum das die Marken-Trennung nicht bricht: dieser Baustein liefert
   ausschließlich Daten und Verhalten — kein Markup, keine Farbe, keine
   Schrift. Das Aussehen bleibt Sache der Fläche; die Kundenflächen holen es
   weiter aus marke.js, die quoroAI-Flächen aus system.css. Genau wie bei
   krume.js kommt aus dem Baustein nur, was auf beiden Seiten dasselbe sein
   MUSS: welcher Termin wann ist und was passiert ist.

   Das „Heute" des Entwurfs ist Dienstag, der 18. August 2026, kurz vor zehn
   (es stand bisher in beratung-kalender.html und gilt jetzt für alle).
   Zeit steht datiert, nie relativ: „heute, 18.08., 9:20 Uhr", nicht „vor
   20 Minuten" — sonst stehen zwei Flächen mit derselben Meldung auf zwei
   verschiedenen Uhrzeiten.
   =================================================================== */
window.Lage = (function () {
  'use strict';

  var WOCHENTAG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  /* Montag dieser Woche. Alles andere ist ein Versatz darauf — auch
     Meldungen aus der Woche davor (tag: -3 ist der Freitag zuvor). */
  var MONTAG = new Date(2026, 7, 17);

  var TAGE = [
    { kurz: 'Montag',     datum: '17. August 2026', kurzdatum: '17.08.' },
    { kurz: 'Dienstag',   datum: '18. August 2026', kurzdatum: '18.08.' },
    { kurz: 'Mittwoch',   datum: '19. August 2026', kurzdatum: '19.08.' },
    { kurz: 'Donnerstag', datum: '20. August 2026', kurzdatum: '20.08.' },
    { kurz: 'Freitag',    datum: '21. August 2026', kurzdatum: '21.08.' }
  ];
  var HEUTE = 1, JETZT = 9.67;

  var TEAM = [
    { id: 'a', name: 'Dr. Anna Vogelsang', kurz: 'Anna V.',   rolle: 'Inhaberin', soll: 7 },
    { id: 'j', name: 'Jens Nordholm',      kurz: 'Jens N.',   rolle: 'Partner',   soll: 7 },
    { id: 'm', name: 'Miriam Krohn',       kurz: 'Miriam K.', rolle: 'Beraterin', soll: 8 },
    { id: 't', name: 'Tarek Aydin',        kurz: 'Tarek A.',  rolle: 'Berater',   soll: 8 },
    { id: 's', name: 'Sabine Röttger',     kurz: 'Sabine R.', rolle: 'Assistenz', soll: 8 }
  ];
  /* Wer die Beratungs-Flächen bedient: Dr. Anna Vogelsang. „Nur ich" in der
     Woche und „Deine Termine" auf dem Zettel meinen dieselbe Person — vorher
     kannte die Woche drei ihrer Termine, der Zettel nur zwei. */
  var ICH = 'a';

  /* Die Termine der Woche. Bis Issue #57 standen sie nur in
     beratung-kalender.html; beratung-termine.html führte daneben drei von
     Hand geschriebene Zeilen und ließ den Freitag bei MTS Maschinenbau weg. */
  var TERMINE = [
    { id: 't1',  tag: 0, von: 8.5,  bis: 9,    wer: '*', was: 'Wochenrunde', intern: true },
    { id: 't2',  tag: 0, von: 9,    bis: 10,   wer: 't', kunde: 'MTS Maschinenbau',  was: 'Rückruf nach drei stillen Wochen', form: 'Telefonat' },
    { id: 't3',  tag: 0, von: 14,   bis: 15.5, wer: 'm', kunde: 'Bäckerei Freitag',  was: 'Personalquote', form: 'vor Ort' },
    { id: 't4',  tag: 1, von: 11.5, bis: 12,   wer: 'a', kunde: 'Cordes Logistik',   was: 'Fuhrpark und Finanzierung', form: 'Telefonat',
      wunsch: { tag: 2, von: 16, bis: 16.5, von_wem: 'Herrn Cordes' } },
    { id: 't5',  tag: 1, von: 15,   bis: 16,   wer: 's', kunde: 'Petersen Stahlbau', was: 'Unterlagen durchgehen', form: 'Videocall' },
    { id: 't6',  tag: 2, von: 10,   bis: 11.5, wer: 'm', kunde: 'Petersen Stahlbau', was: 'Zahlen für das Preismodell', form: 'vor Ort' },
    /* Der einzige Termin, dessen Protokoll in der Vorführung gezeichnet ist —
       deshalb trägt genau er seine Tür, hier wie auf dem Zettel. */
    { id: 't7',  tag: 3, von: 10,   bis: 11,   wer: 'a', kunde: 'Petersen Stahlbau', was: 'Preis und Marge', form: 'Videocall',
      ziel: 'beratung-protokoll.html', tuer: 'Protokoll' },
    /* Zwei zur selben Stunde: der Donnerstag zeigt, dass sich Termine im
       Raster nebeneinanderstellen statt übereinanderzuliegen. */
    { id: 't8',  tag: 3, von: 10,   bis: 11,   wer: 'm', kunde: 'Bäckerei Freitag',  was: 'Zwischenstand Personal', form: 'Videocall' },
    { id: 't9',  tag: 3, von: 14,   bis: 15,   wer: 't', kunde: 'Cordes Logistik',   was: 'Frachtraten', form: 'Videocall' },
    { id: 't10', tag: 4, von: 13,   bis: 14,   wer: 'a', kunde: 'MTS Maschinenbau',  was: 'Angebot besprechen', form: 'Videocall' },
    /* Die offene Anfrage: ein Fenster, das noch niemandem gehört. Entschieden
       wird sie auf dem Zettel, beurteilt in der Woche. Sie ist NICHT
       angenommen — was die Glocke des Kunden lange behauptet hat. */
    { id: 'w1',  tag: 4, von: 9,    bis: 9.75, wer: 'a', kunde: 'Petersen Stahlbau', was: 'Gespräch mit einem Menschen',
      form: 'Videocall', angefragt: true, ziel: 'beratung-termine.html#petersen' }
  ];

  /* Die Meldungen des Kunden Petersen Stahlbau, in zwei Lagen der Vorführung.
     `tag` ist der Versatz auf den Montag, `uhr` die Stunde als Zahl.
     `ziel` sagt, WORUM es geht — wohin das führt, weiß jede Fläche selbst. */
  var MELDUNGEN = {
    laufend: {
      /* Der letzte Blick: gestern Nachmittag um fünf. Alles danach ist neu —
         daraus entsteht die Zahl an der Glocke, auf jeder Fläche dieselbe. */
      letzterBlick: { tag: 0, uhr: 17 },
      liste: [
        { id: 'rahmenvertrag', tag: 1, uhr: 9.33, ziel: 'zuliefern',
          titel: { du: 'Deine Beratung braucht etwas von dir', sie: 'Ihre Beratung braucht etwas von Ihnen' },
          text:  { du: 'Der unterschriebene Rahmenvertrag Stahl fehlt Dr. Anna Vogelsang.',
                   sie: 'Der unterschriebene Rahmenvertrag Stahl fehlt Dr. Anna Vogelsang.' } },
        { id: 'briefing', tag: 1, uhr: 7, ziel: 'briefing',
          titel: { du: 'Dein Briefing liegt da', sie: 'Ihr Briefing liegt da' },
          text:  { du: 'Zwei Meldungen rühren diese Woche an deine Zahlen.',
                   sie: 'Zwei Meldungen rühren diese Woche an Ihre Zahlen.' } },
        { id: 'mensch', tag: 0, uhr: 17.2, ziel: 'gespraech-marge',
          titel: 'Dr. Anna Vogelsang hat geschrieben',
          text: 'In „Warum schrumpft meine Marge?" — sie liest seit Montag, 17.08., mit.' },
        /* Angefragt heißt angefragt. Vorher stand hier „Dein Termin steht,
           Donnerstag 10:00, sie hat deine Anfrage angenommen", während
           dieselbe Anfrage auf dem Zettel der Beratung unentschieden lag —
           und zwar zu einer anderen Uhrzeit (Ärger 30). */
        { id: 'terminanfrage', tag: 0, uhr: 16.63, ziel: 'anfragen',
          titel: { du: 'Deine Terminanfrage liegt bei deiner Beratung', sie: 'Ihre Terminanfrage liegt bei Ihrer Beratung' },
          text:  { du: 'Gespräch mit einem Menschen, Wunschfenster Freitag, 21.08., 9:00. Dr. Anna Vogelsang hat noch nicht entschieden.',
                   sie: 'Gespräch mit einem Menschen, Wunschfenster Freitag, 21.08., 9:00. Dr. Anna Vogelsang hat noch nicht entschieden.' } },
        { id: 'dokument', tag: 0, uhr: 14.33, ziel: 'unterlagen',
          titel: { du: 'Neues Dokument für dich', sie: 'Neues Dokument für Sie' },
          text:  { du: 'Preismodell Benchmark liegt in deinen Unterlagen.',
                   sie: 'Preismodell Benchmark liegt in Ihren Unterlagen.' } },
        { id: 'jahresgespraech', tag: -3, uhr: 11.08, ziel: 'termine',
          titel: { du: 'Antwort auf deine Anfrage', sie: 'Antwort auf Ihre Anfrage' },
          text: 'Das Jahresgespräch mit dem Steuerbüro steht: Dienstag, 18.08., 14:30.' }
      ]
    },
    'erster-tag': {
      /* Am ersten Tag hat noch niemand hingesehen: alles ist neu. */
      letzterBlick: { tag: 1, uhr: 0 },
      liste: [
        { id: 'kennenlernen', tag: 1, uhr: 9.5, ziel: 'termine',
          titel: { du: 'Dein Kennenlern-Termin steht', sie: 'Ihr Kennenlern-Termin steht' },
          text: 'Donnerstag, 20.08., 11:00 mit Dr. Anna Vogelsang.' },
        { id: 'bitten', tag: 1, uhr: 8.93, ziel: 'zuliefern',
          titel: { du: 'Deine Beratung braucht etwas von dir', sie: 'Ihre Beratung braucht etwas von Ihnen' },
          text: 'Damit die Analyse anlaufen kann.' },
        { id: 'zugang', tag: 1, uhr: 8.75, ziel: 'brief',
          titel: { du: 'Dein Zugang ist da', sie: 'Ihr Zugang ist da' },
          text:  { du: 'Dr. Anna Vogelsang hat deine Akte angelegt.',
                   sie: 'Dr. Anna Vogelsang hat Ihre Akte angelegt.' } }
      ]
    }
  };

  /* ---------- Zeit in Worten ---------- */
  function zeitWort(h) {
    var st = Math.floor(h + 1e-9), mi = Math.round((h - st) * 60);
    if (mi === 60) { st += 1; mi = 0; }
    return st + ':' + (mi < 10 ? '0' : '') + mi;
  }

  function datum(tag) {
    var d = new Date(MONTAG.getTime());
    d.setDate(d.getDate() + tag);
    return d;
  }

  /* Datiert, immer. „heute" und „gestern" stehen davor, weil sie helfen —
     aber nie ALLEIN, sonst wird aus derselben Meldung auf zwei Flächen zwei
     verschiedene Zeiten. */
  function wannWort(tag, uhr) {
    var d = datum(tag);
    var tt = (d.getDate() < 10 ? '0' : '') + d.getDate();
    var mm = ((d.getMonth() + 1) < 10 ? '0' : '') + (d.getMonth() + 1);
    var vorne = tag === HEUTE ? 'heute' : tag === HEUTE - 1 ? 'gestern' : WOCHENTAG[d.getDay()];
    return vorne + ', ' + tt + '.' + mm + '., ' + zeitWort(uhr) + ' Uhr';
  }

  /* ---------- Rechnen mit Daten ----------
     Alles hier liefert Daten und Zahlen, nie Markup und nie eine Klasse:
     WIE eine überfällige Frist aussieht, bleibt Sache der Fläche.

     Ein „Datum" darf sein: ein Tagesversatz auf den Montag (Zahl, wie bei den
     Terminen), '2026-08-11', '11.08.2026' oder ein echtes Date. Damit passt
     dieselbe Rechnung zu den Flächen, die ihre Daten deutsch schreiben, und
     zu denen, die sie sortierbar ablegen. */
  var MONATSNAME = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
                    'August', 'September', 'Oktober', 'November', 'Dezember'];

  function zwei(n) { return (n < 10 ? '0' : '') + n; }

  function alsDatum(x) {
    if (x instanceof Date) return new Date(x.getFullYear(), x.getMonth(), x.getDate());
    if (typeof x === 'number') return datum(x);
    if (typeof x === 'string') {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(x);
      if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
      m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(x);
      if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    }
    return null;
  }

  function iso(x) {
    var d = alsDatum(x);
    return d ? d.getFullYear() + '-' + zwei(d.getMonth() + 1) + '-' + zwei(d.getDate()) : '';
  }

  /* „11.08.2026" — kurz, für Listen und Tabellen. */
  function kurzDatum(x) {
    var d = alsDatum(x);
    return d ? zwei(d.getDate()) + '.' + zwei(d.getMonth() + 1) + '.' + d.getFullYear() : '';
  }

  /* „11. August 2026" — im Fließtext liest sich ein Zahlendatum wie ein
     Aktenzeichen. */
  function langDatum(x) {
    var d = alsDatum(x);
    return d ? d.getDate() + '. ' + MONATSNAME[d.getMonth()] + ' ' + d.getFullYear() : '';
  }

  function wochentag(x) {
    var d = alsDatum(x);
    return d ? WOCHENTAG[d.getDay()] : '';
  }

  /* Ganze Tage von a nach b. Positiv heißt: b liegt nach a.
     Gerechnet über Mittag, damit keine Sommerzeit-Stunde eine Zahl kippt. */
  function tageZwischen(a, b) {
    var x = alsDatum(a), y = alsDatum(b);
    if (!x || !y) return NaN;
    return Math.round((Date.UTC(y.getFullYear(), y.getMonth(), y.getDate()) -
                       Date.UTC(x.getFullYear(), x.getMonth(), x.getDate())) / 86400000);
  }

  function plusTage(x, n) {
    var d = alsDatum(x);
    if (!d) return null;
    d.setDate(d.getDate() + n);
    return d;
  }

  function heuteDatum() { return datum(HEUTE); }
  function heuteISO() { return iso(heuteDatum()); }

  /* Wie viele Tage liegt ein Datum vom Heute der Lage weg?
     Positiv: es kommt noch. Negativ: es ist vorbei. */
  function tageBis(x) { return tageZwischen(heuteDatum(), x); }
  function tageSeit(x) { return tageZwischen(x, heuteDatum()); }

  function tageWort(n) { return n === 1 ? 'einem Tag' : n + ' Tagen'; }

  /* Der Wortlaut einer Frist, gerechnet aus zwei Daten statt getippt.
     Ohne Bezugstag gilt das Heute der Lage; wer gegen einen Stichtag rechnet,
     gibt ihn ausdrücklich mit — dann heißt er auch im Text Stichtag und nicht
     „heute". */
  function frist(faellig, bezug) {
    var tage = tageZwischen(bezug === undefined ? heuteDatum() : bezug, faellig);
    var durch = tage < 0;
    var text;
    if (tage === 0) text = 'heute fällig';
    else if (durch) text = 'seit ' + tageWort(-tage) + ' überfällig';
    else if (tage === 1) text = 'noch ein Tag Zeit';
    else text = 'noch ' + tage + ' Tage Zeit';
    return { tage: tage, durch: durch, text: text, datum: kurzDatum(faellig), lang: langDatum(faellig) };
  }

  /* „18.08.2026, 9:40 Uhr" — ein Zeitstempel für einen Vorgang, der jetzt
     entsteht. Ohne Angabe: heute zur Stunde der Lage. */
  function zeitstempel(uhr, tag) {
    return kurzDatum(tag === undefined ? heuteDatum() : tag) + ', ' +
           zeitWort(uhr === undefined ? JETZT : uhr) + ' Uhr';
  }

  function wortlaut(x, sieForm) {
    if (x && typeof x === 'object') return sieForm ? x.sie : x.du;
    return x;
  }

  function stunden(m) { return m.tag * 24 + m.uhr; }

  function lageOder(id) {
    return Object.prototype.hasOwnProperty.call(MELDUNGEN, id) ? MELDUNGEN[id] : MELDUNGEN.laufend;
  }

  /* Meldungen, neueste zuerst — auf jeder Fläche dieselbe Reihenfolge
     (Ärger 44: die Glocke stand vorher in beliebiger Folge). */
  function meldungen(lageId) {
    var l = lageOder(lageId);
    var grenze = stunden(l.letzterBlick);
    return l.liste.slice().sort(function (a, b) { return stunden(b) - stunden(a); })
      .map(function (m) {
        return {
          id: m.id,
          ziel: m.ziel,
          titel: m.titel,
          text: m.text,
          zeit: wannWort(m.tag, m.uhr),
          neu: stunden(m) > grenze
        };
      });
  }

  function neueMeldungen(lageId) {
    var l = lageOder(lageId);
    var grenze = stunden(l.letzterBlick);
    return l.liste.filter(function (m) { return stunden(m) > grenze; }).length;
  }

  /* ---------- Termine ---------- */
  /* Eine eigene Kopie, auch für den Wunsch darin: eine Fläche, die einen
     Termin verschiebt, darf die Quelle für die nächste nicht mitverschieben. */
  function termine() {
    return TERMINE.map(function (t) {
      var k = {};
      for (var s in t) if (Object.prototype.hasOwnProperty.call(t, s)) k[s] = t[s];
      if (t.wunsch) {
        k.wunsch = {};
        for (var w in t.wunsch) if (Object.prototype.hasOwnProperty.call(t.wunsch, w)) k.wunsch[w] = t.wunsch[w];
      }
      return k;
    });
  }

  function tagKuerzel(i) {
    return (TAGE[i] ? TAGE[i].kurz : '').slice(0, 2).toUpperCase();
  }

  /* „Donnerstag, 20.08., 10:00 bis 11:00" — ein Wortlaut, den beide Flächen
     teilen. Datiert, damit „Donnerstag" nicht raten lässt, welcher gemeint ist. */
  function terminWann(t) {
    return TAGE[t.tag].kurz + ', ' + TAGE[t.tag].kurzdatum + ', ' +
           zeitWort(t.von) + ' bis ' + zeitWort(t.bis);
  }

  function person(id) {
    for (var i = 0; i < TEAM.length; i++) if (TEAM[i].id === id) return TEAM[i];
    return null;
  }

  return {
    tage: function () { return TAGE.slice(); },
    heute: function () { return HEUTE; },
    jetzt: function () { return JETZT; },
    heuteDatum: heuteDatum,
    heuteISO: heuteISO,
    heuteKurz: function () { return kurzDatum(heuteDatum()); },
    heuteLang: function () { return langDatum(heuteDatum()); },
    iso: iso,
    kurzDatum: kurzDatum,
    langDatum: langDatum,
    wochentag: wochentag,
    tageZwischen: tageZwischen,
    tageBis: tageBis,
    tageSeit: tageSeit,
    tageWort: tageWort,
    plusTage: plusTage,
    frist: frist,
    zeitstempel: zeitstempel,
    team: function () { return TEAM.slice(); },
    person: person,
    ich: function () { return ICH; },
    termine: termine,
    terminWann: terminWann,
    tagKuerzel: tagKuerzel,
    zeitWort: zeitWort,
    wannWort: wannWort,
    wortlaut: wortlaut,
    meldungen: meldungen,
    neueMeldungen: neueMeldungen
  };
})();
