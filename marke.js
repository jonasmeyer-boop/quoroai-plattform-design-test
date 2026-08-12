/* quoroai-plattform-design · Der Marken-Kern: eine Quelle für alle Flächen.
   Vier Farbregler + Anrede je Beratung; im Produkt kommt beides aus dem
   Mandanten-Profil (agency_branding). Marker: MARKE-KERN-V1 */
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
  try { idx = parseInt(sessionStorage.getItem('marke') || '0', 10) % MARKEN.length || 0; } catch (e) {}
  var m = MARKEN[idx];
  var sie = m.anrede === 'sie';

  function rede(du, sieText) { return sie ? sieText : du; }

  /* Färbt die Seite, setzt Namen/Logo, schaltet Du/Sie-Texte um.
     Texte tragen data-du/data-sie (Inhalt) bzw. data-du-ph/data-sie-ph (Platzhalter). */
  function anwenden() {
    var s = document.documentElement.style;
    s.setProperty('--blau', m.blau);
    s.setProperty('--stift', m.stift);
    s.setProperty('--tinte', m.tinte);
    s.setProperty('--papier', m.papier);
    document.querySelectorAll('[data-marke-name]').forEach(function (el) { el.textContent = m.name; });
    document.querySelectorAll('.marke-logo').forEach(function (img) {
      if (m.logo) { img.src = m.logo; img.alt = m.name; img.hidden = false; }
      else { img.hidden = true; img.removeAttribute('src'); }
    });
    document.querySelectorAll('[data-logo-versteckt]').forEach(function (el) { el.hidden = !!m.logo; });
    document.querySelectorAll('[data-du]').forEach(function (el) {
      el.textContent = sie ? el.dataset.sie : el.dataset.du;
    });
    document.querySelectorAll('[data-du-ph]').forEach(function (el) {
      el.placeholder = sie ? el.dataset.siePh : el.dataset.duPh;
    });
    var icon = document.querySelector('link[rel="icon"]');
    if (icon) icon.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='10' fill='" + encodeURIComponent(m.blau) + "'/%3E%3C/svg%3E";
    document.querySelectorAll('.marke-wechsel').forEach(function (el) {
      el.addEventListener('click', weiter);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); weiter(); }
      });
    });
  }

  function weiter() {
    idx = (idx + 1) % MARKEN.length;
    try { sessionStorage.setItem('marke', String(idx)); } catch (e) {}
    location.reload();
  }

  return {MARKEN: MARKEN, daten: m, sie: sie, rede: rede, anwenden: anwenden, weiter: weiter};
})();
