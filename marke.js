/* quoroai-plattform-design · Der Marken-Kern: eine Quelle für alle Flächen.
   Vier Farbregler + Anrede je Beratung; im Produkt kommt beides aus dem
   Mandanten-Profil (agency_branding). Marker: MARKE-KERN-V8

   V8: Die vierte Beispielmarke war „currily" samt echtem Logo aus dem Repo
   `currily-investmentplattform`. CLAUDE.md trennt dieses Projekt strikt von
   jenem — nichts von dort gehört hierher. An ihrer Stelle steht jetzt eine
   frei erfundene Beratung (Kestner Beratung, Leipzig) mit eigenem Namen,
   eigenen Farben und einem Logo als Data-URI, damit sie keine fremde
   Bilddatei braucht.

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
   Markup, macht das Impressum die Rechtsform falsch.

   V6: Was die Beratung in `beratung-marke.html` einträgt, überschreibt die
   `recht`-Felder der laufenden Sehprobe (sessionStorage `marke-recht`).
   Sonst wäre „Impressum ansehen" dort eine Behauptung: die Fläche zeigte
   Eingabefelder, das Impressum daneben aber weiter die Vorführungswerte. Die
   Überschreibung hängt am Markennamen und gilt nur für ihre Marke — schaltet
   die Vorführung weiter, ruht sie, und mit ihrer Marke gilt sie wieder. */
window.Marke = (function () {
  'use strict';

  /* Ein Logo als Datei-freie Sehprobe. Es zeigt den logo_url-Platz: trägt
     eine Beratung ein Logo ein, tritt der geschriebene Name zurück
     (data-logo-versteckt) und das Bild steht an seiner Stelle. Als Data-URI,
     damit die erfundene Beispielmarke keine Bilddatei ins Repo zieht. Die
     Schrift darin ist bewusst die Systemschrift: ein Logo bringt seine
     eigene mit, und die Kundenflächen sollen an dieser Stelle NICHT die
     Schrift der Plattform durchdrücken. */
  function logoDatei(name, farbe) {
    return 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 372 72">' +
      '<rect x="2" y="8" width="56" height="56" rx="17" fill="' + farbe + '"/>' +
      '<path d="M20 47 L30 33 L38 40 L46 25" fill="none" stroke="#ffffff" stroke-width="5" ' +
      'stroke-linecap="round" stroke-linejoin="round"/>' +
      '<text x="74" y="49" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" ' +
      'font-size="34" font-weight="700" letter-spacing="-1" fill="#1a1512">' + name +
      '<tspan fill="' + farbe + '" font-weight="500"> Beratung</tspan></text></svg>');
  }

  var MARKEN = [
    {name: 'Nordholm & Partner',  anrede: 'du',  blau: '#2b5fe3', stift: '#1d46c9', tinte: '#10131a', papier: '#fafaf7',
     recht: {anschrift: 'Nordholm & Partner Unternehmensberatung GmbH\nGroße Elbstraße 145\n22767 Hamburg',
             /* Jens Nordholm, nicht „Jens Brandt": die Beratung trägt seinen
                Namen, und lage.js führt ihn als Partner. Zwei Namen für
                dieselbe Person standen bis 2026-08-16 nebeneinander. */
             vertretungRolle: 'Geschäftsführung', vertretung: 'Dr. Anna Vogelsang, Jens Nordholm', telefon: '+49 40 5544120',
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
    /* Die Marke mit Logo — zeigt den logo_url-Platz. Sie ist frei erfunden
       wie die drei darüber: Name, Farben und Logo gehören keinem echten
       Unternehmen. Hier stand bis 2026-08-16 „currily" mit dem echten Logo
       aus `currily-investmentplattform`. Das war ein Verstoß gegen die
       Projektregel in CLAUDE.md — dieses Projekt ist von jenem strikt
       getrennt, und nichts von dort gehört hierher. */
    {name: 'Kestner Beratung',    anrede: 'du',  blau: '#a35c15', stift: '#7d4410', tinte: '#1a1512', papier: '#fbfaf7',
     logo: logoDatei('Kestner', '#a35c15'),
     recht: {anschrift: 'Kestner Beratung GmbH\nKäthe-Kollwitz-Straße 84\n04109 Leipzig',
             vertretungRolle: 'Geschäftsführung', vertretung: 'Ines Kestner', telefon: '+49 341 3390260',
             mail: 'kontakt@kestner-beratung.de', register: 'Amtsgericht Leipzig, HRB 32180',
             ust: 'DE289140577', aufsicht: 'Sächsische Datenschutz- und Transparenzbeauftragte'}}
  ];
  var idx = 0;
  try { idx = parseInt(sessionStorage.getItem('marke') || '0', 10); } catch (e) {}
  if (!(idx >= 0 && idx < MARKEN.length)) idx = 0; /* alles Ungültige fällt auf Marke 0 */
  var m = MARKEN[idx];
  /* Die Beratung darf ihre Anbieterkennzeichnung selbst eintragen — dann gilt
     ihr Stand, nicht der der Sehprobe. Alles Unlesbare fällt still zurück. */
  try {
    var eigen = JSON.parse(sessionStorage.getItem('marke-recht') || 'null');
    if (eigen && eigen.name === m.name && eigen.recht) {
      var recht = {};
      Object.keys(m.recht || {}).forEach(function (k) { recht[k] = m.recht[k]; });
      Object.keys(eigen.recht).forEach(function (k) { recht[k] = eigen.recht[k]; });
      var kopie = {};
      Object.keys(m).forEach(function (k) { kopie[k] = m[k]; });
      kopie.recht = recht;
      m = kopie;
    }
  } catch (e) {}
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
    /* Ganze Blöcke, die an einem Feld hängen: „Registereintrag" ohne Register
       wäre eine leere Überschrift, und ein Impressum mit leerer Überschrift
       ist schlechter als eines ohne den Block. */
    document.querySelectorAll('[data-recht-block]').forEach(function (el) {
      el.hidden = !String((marke.recht || {})[el.dataset.rechtBlock] || '').trim();
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
