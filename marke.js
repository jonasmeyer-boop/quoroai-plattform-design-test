/* quoroai-plattform-design · Der Marken-Kern: eine Quelle für alle Flächen.
   Vier Farbregler + Anrede je Beratung; im Produkt kommt beides aus dem
   Mandanten-Profil (agency_branding). Marker: MARKE-KERN-V5

   V4: Jede Marke trägt ihre Anbieterkennzeichnung (`recht`). Sie ist kein
   Design-Regler, sondern eine Pflichtangabe: Impressum und Datenschutz der
   Kundenflächen gehören der Beratung, nicht quoroAI — ohne diese Felder
   könnte quoroAI die beiden Seiten gar nicht ausliefern. Im Produkt sind das
   Spalten am Mandanten, und die Beratung muss sie ausfüllen, bevor ihre
   Adresse öffentlich erreichbar wird.
   Die Werte hier sind Vorführungs-Platzhalter für erfundene Beispielmarken.

   V5 nach Code-Review: auch die Bezeichnung der Vertretung kommt aus der
   Marke (`vertretungRolle`). Eine KG hat keinen Geschäftsführer, sondern
   einen persönlich haftenden Gesellschafter — steht das Wort fest im
   Markup, macht das Impressum die Rechtsform falsch. */
window.Marke = (function () {
  'use strict';
  var MARKEN = [
    {name: 'Nordholm & Partner',  anrede: 'du',  blau: '#2b5fe3', stift: '#1d46c9', tinte: '#10131a', papier: '#fafaf7',
     recht: {anschrift: 'Nordholm & Partner Unternehmensberatung GmbH\nGroße Elbstraße 145\n22767 Hamburg',
             vertretungRolle: 'Geschäftsführung', vertretung: 'Dr. Anna Vogelsang, Jens Brandt', telefon: '+49 40 5544120',
             mail: 'kontakt@nordholm-partner.de', register: 'Amtsgericht Hamburg, HRB 148920',
             ust: 'DE812345678', aufsicht: 'Der Hamburgische Beauftragte für Datenschutz und Informationsfreiheit'}},
    {name: 'Waldmann Consulting', anrede: 'sie', blau: '#0e7a5a', stift: '#0a5f46', tinte: '#101613', papier: '#f8faf7',
     recht: {anschrift: 'Waldmann Consulting GmbH\nKönigsallee 62\n40212 Düsseldorf',
             vertretungRolle: 'Geschäftsführung', vertretung: 'Martin Waldmann', telefon: '+49 211 8820140',
             mail: 'info@waldmann-consulting.de', register: 'Amtsgericht Düsseldorf, HRB 74210',
             ust: 'DE298374611', aufsicht: 'Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen'}},
    {name: 'Steinbach & Cie.',    anrede: 'sie', blau: '#9c3948', stift: '#7c2d3a', tinte: '#171114', papier: '#fbf9f7',
     recht: {anschrift: 'Steinbach & Cie. Unternehmensberatung KG\nMaximilianstraße 13\n80539 München',
             vertretungRolle: 'Persönlich haftender Gesellschafter', vertretung: 'Friedrich Steinbach', telefon: '+49 89 2420380',
             mail: 'kanzlei@steinbach-cie.de', register: 'Amtsgericht München, HRA 96140',
             ust: 'DE165920873', aufsicht: 'Bayerisches Landesamt für Datenschutzaufsicht'}},
    /* echtes Logo als Sehprobe (Jonas, 2026-08-12) — zeigt den logo_url-Platz */
    {name: 'currily',             anrede: 'du',  blau: '#7047EA', stift: '#5636b8', tinte: '#081B4A', papier: '#fbfafd', logo: 'bilder/currily-logo.svg',
     recht: {anschrift: 'currily GmbH\nFriedrichstraße 68\n10117 Berlin',
             vertretungRolle: 'Geschäftsführung', vertretung: 'Lena Kortmann', telefon: '+49 30 20889140',
             mail: 'hallo@currily.de', register: 'Amtsgericht Berlin-Charlottenburg, HRB 231470',
             ust: 'DE347118206', aufsicht: 'Berliner Beauftragte für Datenschutz und Informationsfreiheit'}}
  ];
  var idx = 0;
  try { idx = parseInt(sessionStorage.getItem('marke') || '0', 10); } catch (e) {}
  if (!(idx >= 0 && idx < MARKEN.length)) idx = 0; /* alles Ungültige fällt auf Marke 0 */
  var m = MARKEN[idx];
  var sie = m.anrede === 'sie';

  function rede(du, sieText) { return sie ? sieText : du; }

  /* Färbt sofort — wir laufen im Head, documentElement existiert schon.
     So malt keine Seite erst die Standardmarke und springt dann um. */
  function faerbe(marke) {
    var s = document.documentElement.style;
    s.setProperty('--blau', marke.blau);
    s.setProperty('--stift', marke.stift);
    s.setProperty('--tinte', marke.tinte);
    s.setProperty('--papier', marke.papier);
  }
  faerbe(m);

  /* Wendet eine Marke vollständig auf die Seite an (Farben, Name, Logo,
     Favicon, Du/Sie-Texte und -Platzhalter). Wiederholt aufrufbar. */
  function wende(marke) {
    var s = marke.anrede === 'sie';
    faerbe(marke);
    document.querySelectorAll('[data-marke-name]').forEach(function (el) { el.textContent = marke.name; });
    /* Anbieterkennzeichnung. Zeilenumbrüche in der Anschrift bleiben Umbrüche —
       über white-space:pre-line im CSS, nicht über eingesetztes HTML. */
    document.querySelectorAll('[data-marke-recht]').forEach(function (el) {
      var wert = (marke.recht || {})[el.dataset.markeRecht];
      el.textContent = wert || '';
    });
    document.querySelectorAll('.marke-logo').forEach(function (img) {
      if (marke.logo) { img.src = marke.logo; img.alt = marke.name; img.hidden = false; }
      else { img.hidden = true; img.removeAttribute('src'); img.alt = ''; }
    });
    document.querySelectorAll('[data-logo-versteckt]').forEach(function (el) { el.hidden = !!marke.logo; });
    document.querySelectorAll('[data-du]').forEach(function (el) {
      el.textContent = s ? el.dataset.sie : el.dataset.du;
    });
    document.querySelectorAll('[data-du-ph]').forEach(function (el) {
      el.placeholder = s ? el.dataset.siePh : el.dataset.duPh;
    });
    var icon = document.querySelector('link[rel="icon"]');
    if (icon) icon.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='10' fill='" + encodeURIComponent(marke.blau) + "'/%3E%3C/svg%3E";
  }

  /* Wechsler einmalig verbinden — wiederholtes anwenden() bindet nichts doppelt */
  var gebunden = false;
  function binde() {
    if (gebunden) return;
    gebunden = true;
    document.querySelectorAll('.marke-wechsel').forEach(function (el) {
      el.addEventListener('click', weiter);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); weiter(); }
      });
    });
  }

  function anwenden() {
    wende(m);
    binde();
  }

  function weiter() {
    idx = (idx + 1) % MARKEN.length;
    try { sessionStorage.setItem('marke', String(idx)); } catch (e) {}
    location.reload();
  }

  return {MARKEN: MARKEN, daten: m, sie: sie, rede: rede, wende: wende, anwenden: anwenden, weiter: weiter};
})();
