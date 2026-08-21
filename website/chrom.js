/* quoroai-plattform-design · website/ · Das Chrom: Kante an der Kopfzeile,
   Menü am Telefon. Ein Baustein für alle Seiten. Marker: CHROM-V1 */
(function () {
  'use strict';
  var kopf = document.getElementById('kopf');
  if (!kopf) return;

  function kante() { kopf.classList.toggle('gescrollt', window.scrollY > 8); }
  window.addEventListener('scroll', kante, { passive: true });
  kante();

  var schalter = kopf.querySelector('.menue');
  var nav = kopf.querySelector('nav');
  if (!schalter || !nav) return;

  function zu() {
    kopf.classList.remove('offen');
    schalter.setAttribute('aria-expanded', 'false');
  }
  schalter.addEventListener('click', function () {
    var offen = kopf.classList.toggle('offen');
    schalter.setAttribute('aria-expanded', offen ? 'true' : 'false');
  });
  /* Ein Griff im Menü schließt es; dasselbe gilt für Esc und einen Klick daneben. */
  nav.addEventListener('click', function (ev) { if (ev.target.closest('a')) zu(); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') zu(); });
  document.addEventListener('click', function (ev) {
    if (!kopf.classList.contains('offen')) return;
    if (ev.target.closest('.kopf')) return;
    zu();
  });
})();
