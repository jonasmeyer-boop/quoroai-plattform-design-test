/* quoroai-plattform-design · Einsatz: die eine Quelle für Abwesenheiten,
   Wochenplan und erfasste Stunden der Beratung.

   Warum es diesen Baustein gibt: beratung-kalender.html führte Abwesenheiten
   und Plan-Stunden in seinem eigenen Skript, und als die Einsatzplanung
   dieselbe Woche erzählen sollte, erzählte sie eine andere (Review
   2026-08-19: der Kalender zeigte Jens im Urlaub, die Einsatzplanung zeigte
   ihn mit voller Kapazität). Die Dauerregel des Repos sagt: eine geteilte
   Größe wird von einem Baustein gelesen, nie in einer Fläche getippt —
   dieser hier liefert Daten und Rechenwege, nie Aussehen.

   Im Produkt kommen dieselben Größen aus absences, planned_hours und den
   Zeiteinträgen. Die Wochen zählen im Versatz zur Woche der Lage
   (0 = die Woche, in der „heute" liegt), die Tage 0–4 sind Mo–Fr.

   Das Erfasste ist ABSICHTLICH kein Prozentsatz des Plans: es weicht ab
   (Cordes läuft über, MTS bleibt drunter, und zwei Mandate wurden bebucht,
   ohne je geplant zu sein) — ein Ist, das rechnerisch am Plan hängt, kann
   nie zeigen, ob sich jemand an den Plan hält. Und was über die Fläche
   eingeplant wird, erzeugt hier nie rückwirkend erfasste Stunden.
   Marker: EINSATZ-V1 (die eine Quelle für Abwesenheit, Plan und Ist) */
window.Einsatz = (function () {
  'use strict';

  /* ---------- Abwesenheiten ----------
     je Eintrag: wer, Wochenversatz, Tage [von..bis] (0=Mo … 4=Fr), Art.
     Woche 0 ist die Woche des Kalenders — Jens Do–Fr im Urlaub, Sabine
     Mittwoch auf Fortbildung. */
  var ABWESEND = [
    { wer: 'j', wo: 0, von: 3, bis: 4, art: 'Urlaub' },
    { wer: 's', wo: 0, von: 2, bis: 2, art: 'Fortbildung' },
    { wer: 's', wo: 2, von: 0, bis: 4, art: 'Urlaub' },
    { wer: 'j', wo: 4, von: 0, bis: 4, art: 'Urlaub' }
  ];

  /* ---------- Der Plan, je Person und Tag — nur Woche 0 ----------
     Das ist die Tagessicht des Kalenders („Wer hat wann Luft"). Die
     Wochensummen darunter stimmen mit PLAN_WOCHE[…][0] überein — wer hier
     ändert, ändert dort mit. */
  var GEPLANT_TAG = {
    a: [3, 2.5, 4, 2, 2],
    j: [4, 4, 3, 0, 0],
    m: [2, 3, 2, 3.5, 2],
    t: [3, 4, 4, 2, 1],
    s: [5, 4, 0, 5, 4]
  };

  /* ---------- Der Plan, je Person, Mandat und Woche ----------
     grund: jede Woche ohne eigenen Eintrag. je Woche 0 und den erzählten
     Wochen ein eigener Satz. Woche 0 summiert exakt auf GEPLANT_TAG
     (a 13,5 · j 11 · m 12,5 · t 14 · s 18). Woche 1 trägt Tareks
     Überplanung, Woche 2 Sabines Urlaub samt trotzdem geplanter Stunden,
     Woche 4 Jens' Urlaub ohne Plan. */
  var PLAN_GRUND = {
    a: { petersen: 12, cordes: 8, intern: 4 },
    j: { mts: 16, freitag: 8 },
    m: { petersen: 20, cordes: 10 },
    t: { cordes: 18, mts: 14 },
    s: { intern: 10, petersen: 6 }
  };
  var PLAN_WOCHE = {
    0: {
      a: { petersen: 8, cordes: 3.5, intern: 2 },
      j: { mts: 8, freitag: 3 },
      m: { petersen: 8, cordes: 4.5 },
      t: { cordes: 8, mts: 6 },
      s: { intern: 12, petersen: 6 }
    },
    1: {
      a: { petersen: 12, cordes: 8, intern: 4, mts: 6 },
      t: { cordes: 24, petersen: 20 }
    },
    2: {
      s: { intern: 6 },
      j: { mts: 16 }
    },
    3: {
      a: { petersen: 12, intern: 4 },
      m: { petersen: 8, cordes: 6 }
    },
    4: {
      j: {}
    }
  };

  /* ---------- Das Erfasste, je Person, Mandat und Woche ----------
     Nur Vergangenheit und die angebrochene Woche (die Lage steht am
     Dienstagvormittag). Die Abweichungen vom Plan sind der Punkt:
     Cordes läuft über, MTS bleibt drunter — und Miriam hat die Bäckerei
     bebucht, Sabine Cordes, ohne dass je etwas geplant war. */
  var IST = {
    0: {
      a: { petersen: 2.5, cordes: 1 },
      j: { mts: 2 },
      m: { petersen: 1.5, cordes: 1.5, freitag: 1 },
      t: { cordes: 3 },
      s: { intern: 2.5, cordes: 1 }
    },
    '-1': {
      a: { petersen: 11, cordes: 9.5, intern: 3 },
      j: { mts: 13, freitag: 8.5 },
      m: { petersen: 18, cordes: 12, freitag: 3 },
      t: { cordes: 21, mts: 11 },
      s: { intern: 8, petersen: 6, cordes: 2 }
    }
  };
  /* Ältere Wochen tragen denselben Satz wie die Vorwoche — die Geschichte
     der Beratung ist gleichmäßig, und die Fläche bleibt in jeder Richtung
     blätterbar. */
  function istVonWoche(wo) {
    if (wo > 0) return {};
    if (wo === 0) return IST[0];
    return IST['-1'];
  }

  function kopie(o) {
    var z = {}, k;
    for (k in o) if (Object.prototype.hasOwnProperty.call(o, k)) z[k] = o[k];
    return z;
  }

  /* ---------- Rechenwege ---------- */

  /* Der Wochenplan einer Person: {mandatId: stunden}. */
  function planWoche(personId, wo) {
    var satz = PLAN_WOCHE[wo];
    if (satz && Object.prototype.hasOwnProperty.call(satz, personId)) return kopie(satz[personId]);
    return kopie(PLAN_GRUND[personId] || {});
  }

  /* Das Erfasste einer Person: {mandatId: stunden} — auch nie Geplantes. */
  function istWoche(personId, wo) {
    var satz = istVonWoche(wo);
    return kopie(satz[personId] || {});
  }

  /* Abwesenheiten der Woche 0 in der Form des Kalenders. */
  function abwesend() {
    var liste = [];
    for (var i = 0; i < ABWESEND.length; i++) {
      var a = ABWESEND[i];
      if (a.wo === 0) liste.push({ wer: a.wer, von: a.von, bis: a.bis, art: a.art });
    }
    return liste;
  }

  /* Abwesende Tage einer Person in einer Woche (0–5). */
  function wegTage(personId, wo) {
    var tage = 0;
    for (var i = 0; i < ABWESEND.length; i++) {
      var a = ABWESEND[i];
      if (a.wer === personId && a.wo === wo) tage += a.bis - a.von + 1;
    }
    return tage;
  }

  /* Verfügbare Stunden einer Person in einer Woche: Tagessoll mal die
     Arbeitstage, die nicht abwesend sind. Feiertage liegen in den erzählten
     Wochen keine. */
  function kapazitaet(person, wo) {
    return person.soll * Math.max(5 - wegTage(person.id, wo), 0);
  }

  return {
    abwesend: abwesend,
    wegTage: wegTage,
    kapazitaet: kapazitaet,
    geplantTag: function () { return GEPLANT_TAG; },
    planWoche: planWoche,
    istWoche: istWoche
  };
})();
