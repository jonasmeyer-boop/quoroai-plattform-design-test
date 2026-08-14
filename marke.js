/* quoroai-plattform-design · Der Marken-Kern: eine Quelle für alle Flächen.
   Vier Farbregler + Anrede je Beratung; im Produkt kommt beides aus dem
   Mandanten-Profil (agency_branding). Marker: MARKE-KERN-V3 */
window.Marke = (function () {
  'use strict';
  var MARKEN = [
    {name: 'Nordholm & Partner',  anrede: 'du',  blau: '#2b5fe3', stift: '#1d46c9', tinte: '#10131a', papier: '#fafaf7'},
    {name: 'Waldmann Consulting', anrede: 'sie', blau: '#0e7a5a', stift: '#0a5f46', tinte: '#101613', papier: '#f8faf7'},
    {name: 'Steinbach & Cie.',    anrede: 'sie', blau: '#9c3948', stift: '#7c2d3a', tinte: '#171114', papier: '#fbf9f7'},
    /* echtes Logo als Sehprobe (Jonas, 2026-08-12) — zeigt den logo_url-Platz */
    {name: 'currily',             anrede: 'du',  blau: '#7047EA', stift: '#5636b8', tinte: '#081B4A', papier: '#fbfafd', logo: 'bilder/currily-logo.svg'}
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
