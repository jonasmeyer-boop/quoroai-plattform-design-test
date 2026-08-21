/* quoroai-plattform-design · website/ · Cookie-Banner und Google Analytics.
   Portiert aus dem bestehenden Auftritt (components/ConsentBanner.tsx), weil
   dessen Feinheiten teuer erkauft sind — sie stehen unten als Kommentar an
   der Stelle, an der sie greifen. Statistik lädt AUSSCHLIESSLICH nach
   ausdrücklicher Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1
   TDDDG); die Entscheidung liegt im lokalen Speicher, nicht in einem Cookie.
   Marker: EINWILLIGUNG-V1 */
(function () {
  'use strict';

  var MESS_ID = 'G-VBTC69EWKM';           /* GA4-Property „quoroAI Website" */
  var FASSUNG = 1;                        /* hochzählen, wenn sich die Erklärung wesentlich ändert: fragt alle neu */
  var SCHLUESSEL = 'quoro-cookie-consent';
  var ABMELDUNG = 'quoro-ga-optout';      /* eigene Geräte: /?ga=off setzt, /?ga=on löscht */
  var HOECHSTALTER = 365 * 24 * 60 * 60 * 1000;

  function gespeichert() {
    try {
      var roh = localStorage.getItem(SCHLUESSEL);
      if (!roh) return { wahl: null, verfallen: false };
      var d = JSON.parse(roh);
      if (d.v !== FASSUNG) return { wahl: null, verfallen: true };
      var zeit = Date.parse(d.ts);
      /* Ohne lesbares Datum lässt sich nicht zeigen, dass die Wahl noch gilt:
         dann fragen wir lieber neu, statt es anzunehmen. */
      if (!isFinite(zeit)) return { wahl: null, verfallen: true };
      if (Date.now() - zeit > HOECHSTALTER) return { wahl: null, verfallen: true };
      return { wahl: d, verfallen: false };
    } catch (e) { return { wahl: null, verfallen: false }; }
  }

  function ladeGA() {
    if (!MESS_ID || document.getElementById('ga4-quelle')) return;
    try { if (localStorage.getItem(ABMELDUNG) === '1') return; } catch (e) {}
    var s = document.createElement('script');
    s.id = 'ga4-quelle';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MESS_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    /* gtag.js wertet NUR das echte arguments-Objekt aus; ein normales Array
       wird still verworfen. Genau dieser Fehler hatte im alten Auftritt die
       gesamte Messung lahmgelegt. Nicht zu einem Array „aufräumen". */
    function gtag() { window.dataLayer.push(arguments); }
    gtag('js', new Date());
    /* Kein anonymize_ip: das ist eine Einstellung des alten Universal
       Analytics, die GA4 ignoriert. GA4 kürzt die IP ohnehin vor dem
       Speichern; die Zeile brächte nur den falschen Eindruck eines Schalters. */
    gtag('config', MESS_ID);
  }

  function loescheGACookies() {
    var wirt = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var name = (c.split('=')[0] || '').trim();
      if (!name || !/^(_ga|_gid|_gat)/.test(name)) return;
      [location.hostname, '.' + wirt, wirt].forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; path=/; domain=' + d;
      });
      document.cookie = name + '=; Max-Age=0; path=/';
    });
  }

  /* ---------- die Fläche ---------- */
  var css = `
  .ew-band{
    position:fixed;left:0;right:0;bottom:0;z-index:120;padding:0 16px 16px;
    display:flex;justify-content:center;pointer-events:none;
  }
  .ew-karte{
    pointer-events:auto;width:min(760px,100%);
    display:flex;align-items:center;gap:22px;flex-wrap:wrap;
    padding:18px 22px;border-radius:var(--radius-karte);
    background:rgba(255,255,255,.82);
    backdrop-filter:blur(26px) saturate(180%);-webkit-backdrop-filter:blur(26px) saturate(180%);
    border:1px solid rgba(255,255,255,.85);
    box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 24px 70px rgba(59,52,134,.24);
    transform:translateY(16px);opacity:0;transition:transform .4s var(--kurve),opacity .4s var(--kurve);
  }
  .ew-band.da .ew-karte{transform:none;opacity:1}
  .ew-karte p{flex:1;min-width:240px;font-size:14px;line-height:1.55;color:var(--nebel-700);margin:0}
  .ew-karte .ew-knoepfe{display:flex;gap:10px;flex-shrink:0}
  .ew-karte .knopf{min-height:44px;padding:0 20px;font-size:14.5px}
  @media (max-width:640px){
    .ew-karte{flex-direction:column;align-items:stretch;gap:14px}
    .ew-karte .ew-knoepfe{flex-direction:column-reverse}
    .ew-karte .knopf{width:100%}
  }
  @media (prefers-reduced-motion:reduce){.ew-karte{transition:none}}`;
  var stil = document.createElement('style');
  stil.textContent = css;
  document.head.appendChild(stil);

  var band = document.createElement('div');
  band.className = 'ew-band';
  band.setAttribute('role', 'dialog');
  band.setAttribute('aria-label', 'Cookie-Einstellungen');
  band.hidden = true;
  band.innerHTML =
    '<div class="ew-karte">' +
      '<p>Wir speichern deine Auswahl im lokalen Speicher deines Geräts. Nur mit deiner ' +
      'Einwilligung kommen Statistik-Cookies (Google Analytics) dazu, damit wir sehen, ' +
      'was gelesen wird. Ändern kannst du das jederzeit über „Cookie-Einstellungen" im Fuß. ' +
      'Mehr in der <a href="datenschutz.html">Datenschutzerklärung</a>.</p>' +
      '<div class="ew-knoepfe">' +
        '<button type="button" class="knopf leise" data-wahl="nein">Ablehnen</button>' +
        '<button type="button" class="knopf primaer" data-wahl="ja">Einverstanden</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(band);

  function zeigen() {
    band.hidden = false;
    window.setTimeout(function () { band.classList.add('da'); }, 20);
  }
  function verbergen() {
    band.classList.remove('da');
    window.setTimeout(function () { band.hidden = true; }, 420);
  }

  function entscheide(ja) {
    /* Ob gtag.js WIRKLICH auf der Seite ist — nicht, was der Eintrag behauptet. */
    var gaGeladen = !!document.getElementById('ga4-quelle');
    try {
      localStorage.setItem(SCHLUESSEL, JSON.stringify({
        status: ja ? 'granted' : 'denied', v: FASSUNG, ts: new Date().toISOString()
      }));
    } catch (e) {}
    verbergen();
    if (ja) { ladeGA(); return; }
    /* Bei jeder Ablehnung räumen, ohne Bedingung: eine verfallene Zustimmung
       verbirgt das alte „granted" vor uns, während _ga noch auf dem Gerät
       liegt. Der Aufräumer ist mehrfach ausführbar. */
    loescheGACookies();
    if (gaGeladen) location.reload();
  }

  Array.prototype.forEach.call(band.querySelectorAll('[data-wahl]'), function (b) {
    b.addEventListener('click', function () { entscheide(b.dataset.wahl === 'ja'); });
  });

  /* ---------- Start ---------- */
  try {
    var ga = new URLSearchParams(location.search).get('ga');
    if (ga === 'off') localStorage.setItem(ABMELDUNG, '1');
    if (ga === 'on') localStorage.removeItem(ABMELDUNG);
  } catch (e) {}

  var stand = gespeichert();
  if (stand.verfallen) {
    /* Die gespeicherte Wahl gilt nicht mehr, also fehlt die Grundlage für die
       GA-Cookies — die aber noch auf dem Gerät liegen. § 25 TDDDG knüpft an
       die Speicherung auf dem Gerät an, nicht erst an einen Datenfluss:
       deshalb jetzt löschen und nicht erst, wenn jemand antwortet.
       Kein Neuladen hier, sonst dreht sich die Seite im Kreis. */
    loescheGACookies();
  }
  if (stand.wahl && stand.wahl.status === 'granted') ladeGA();
  if (!stand.wahl) zeigen();

  /* Der Fuß-Griff öffnet das Band wieder. */
  window.cookieEinstellungen = zeigen;
  Array.prototype.forEach.call(document.querySelectorAll('[data-cookie-einstellungen]'), function (a) {
    a.addEventListener('click', function (ev) { ev.preventDefault(); zeigen(); });
  });
})();
