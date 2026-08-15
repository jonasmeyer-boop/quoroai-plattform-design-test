/* quoroai-plattform-design · Die Hilfe ist eine Ebene über der Fläche, auf der
   man steht (Häppchen C3, Issue #36).

   Kein Handbuch, keine Hilfe-Seite, kein Chat: wer nicht weiß, was er vor sich
   hat, soll es DORT erklärt bekommen, wo es steht. Ein Druck auf das Fragezeichen
   im Chrom legt eine Ebene über die Fläche — die Seite wird milchig, ein
   Scheinwerfer steht auf einer Sache, und daneben steht in einem Satz, was sie
   ist und was man mit ihr tut. Weiter, weiter, fertig: das ist die Führung
   durch den Raum. Wer lieber springt, drückt direkt auf die Stelle, die ihn
   interessiert; jede erklärte Stelle trägt ihre Nummer.

   Aufruf: <span data-hilfe-knopf></span> ins Chrom setzen. Erklärt wird alles,
   was ein data-hilfe="…" trägt, in der Reihenfolge des Dokuments. Die Fläche
   selbst stellt sich über zwei Felder am body vor:
     data-hilfe-titel="Die Woche"  data-hilfe-satz="Was hier passiert."
   Beides zusammen ist die erste Karte der Führung.

   Was nur in einem bestimmten Zustand gilt, bekommt eine Bedingung dazu:
     data-hilfe-wenn="body.gezoomt"
   Trifft der Wähler gerade nicht zu, wird die Stelle nicht erklärt. Nötig
   überall dort, wo eine Fläche Ebenen ein- und ausblendet — ein Scheinwerfer
   auf etwas Unsichtbarem ist schlimmer als gar keine Hilfe.

   Markenneutral: alle Farben kommen aus den Tokens der jeweiligen Fläche —
   White-Label-Kundenflächen setzen --blau/--linie/--grau über marke.js,
   quoroAI-Flächen bringen --lila-600/--nebel-200 aus system.css mit. Deshalb
   läuft dieser Baustein in beiden Welten.

   Kein Deko-Punkt (Jonas' Regel): die Kreise an den Stellen tragen eine Zahl,
   sie sagen „die dritte von acht" und nicht „hier ist Farbe".
   Marker: HILFE-V1 */
window.Hilfe = (function () {
  'use strict';

  var LUFT = 6;      /* wie weit der Scheinwerfer um die Sache herum ausgreift */
  var RUND = 14;     /* Eckenradius des Lochs, passt zu --radius-innen */

  var offen = false;
  var stellen = [];  /* [{el, text, rect, kasten, nummer}] */
  var jetzt = -1;    /* -1 = die Karte über die Fläche selbst */
  var knopf = null;
  var schicht = null, veil = null, loch = null, tafel = null;
  var vorherFokus = null;
  var messLauf = false;
  var reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function tok(name, ersatz) { return 'var(' + name + ', ' + ersatz + ')'; }

  var stilDa = false;
  function stil() {
    if (stilDa) return;
    stilDa = true;
    var akzent = tok('--blau', tok('--lila-600', '#6f63e8'));
    var linie  = tok('--linie', tok('--nebel-200', '#e9e8f1'));
    var grau   = tok('--grau', tok('--nebel-500', '#7f7d93'));
    var tinte  = tok('--tinte', '#18152f');
    var kurve  = tok('--kurve', 'cubic-bezier(.16,1,.3,1)');
    /* Papier und Fläche kommen ebenfalls aus den Tokens: auf einer
       White-Label-Kundenfläche ist der Grund nicht quoroAI-Weiß. */
    var papier = tok('--papier', tok('--grund', '#fdfdfe'));
    var karte  = tok('--flaeche', tok('--papier', '#ffffff'));
    var s = document.createElement('style');
    s.textContent =
      /* ---- der Griff im Chrom, exakt Pillenhöhe wie die Glocke ---- */
      '.hilfe-knopf{width:35px;height:35px;border-radius:999px;border:0.5px solid ' + linie + ';' +
        'background:' + karte + ';cursor:pointer;padding:0;display:inline-flex;align-items:center;justify-content:center;' +
        'font:inherit;font-size:15px;font-weight:700;color:' + tinte + ';line-height:1}' +
      '@media (hover:hover){.hilfe-knopf:hover{border-color:' + akzent + ';color:' + akzent + '}}' +
      /* Der Daumen führt: am Handy 44px, auch wenn das Chrom sonst schlanker ist
         (docs/wissen/handy-durchgang.md) */
      '@media (pointer:coarse){.hilfe-knopf{width:44px;height:44px;font-size:17px}}' +
      '.hilfe-knopf[aria-expanded="true"]{background:' + akzent + ';border-color:' + akzent + ';color:#fff}' +

      /* ---- die Ebene ---- */
      '.hilfe-schicht{position:fixed;inset:0;z-index:900}' +
      '.hilfe-schicht[hidden]{display:none}' +
      '.hilfe-veil{position:absolute;inset:0;width:100%;height:100%;display:block}' +
      '.hilfe-veil rect.grund{fill:' + papier + ';fill-opacity:.86}' +

      /* Jede erklärte Stelle bekommt ein durchsichtiges Trefferfeld über der
         Ebene — sonst wäre die Führung eine Einbahnstraße und man käme an die
         Sache, die man wirklich meint, nur über sechsmal „Weiter". */
      /* Der Ring trägt die Akzentfarbe der Fläche, nicht quoroAI-Lila: ein
         dünner Strich für die stillen Stellen, ein doppelter für die, auf der
         der Scheinwerfer steht. Der Hof darunter ist neutrales Dunkel, damit
         auf keiner Kundenfläche eine fremde Farbe aufleuchtet. */
      '.hilfe-stelle{position:fixed;border:0;padding:0;cursor:pointer;background:none;opacity:.55;' +
        'border-radius:' + RUND + 'px;box-shadow:0 0 0 1px ' + akzent + ';' +
        'transition:box-shadow .18s ' + kurve + ',opacity .18s ' + kurve + '}' +
      '@media (hover:hover){.hilfe-stelle:hover{opacity:1;box-shadow:0 0 0 2px ' + akzent + '}}' +
      '.hilfe-stelle.hier{opacity:1;box-shadow:0 0 0 2px ' + akzent + ', 0 12px 40px rgba(24,21,47,.22)}' +
      '.hilfe-nr{position:absolute;top:-11px;left:-11px;min-width:22px;height:22px;padding:0 6px;' +
        'border-radius:999px;background:' + karte + ';border:1px solid ' + akzent + ';color:' + akzent + ';' +
        'font:inherit;font-size:12px;font-weight:700;line-height:20px;text-align:center;' +
        'font-variant-numeric:tabular-nums}' +
      '.hilfe-stelle.hier .hilfe-nr{background:' + akzent + ';color:#fff}' +

      /* ---- die Tafel: ein Satz, und der Weg weiter ---- */
      '.hilfe-tafel{position:fixed;z-index:910;width:min(360px, calc(100vw - 32px));' +
        'background:' + karte + ';backdrop-filter:blur(24px) saturate(180%);' +
        '-webkit-backdrop-filter:blur(24px) saturate(180%);' +
        'border:1px solid rgba(255,255,255,.7);border-radius:' + tok('--radius-karte', '20px') + ';' +
        'box-shadow:inset 0 1px 0 rgba(255,255,255,.85), 0 20px 60px rgba(24,21,47,.22);' +
        'padding:18px 18px 14px;color:' + tinte + '}' +
      '.hilfe-tafel .zaehler{font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:' + grau + '}' +
      '.hilfe-tafel h4{font-family:' + tok('--schrift-schau', 'inherit') + ';font-weight:600;letter-spacing:-.01em;' +
        'word-spacing:1.5px;font-size:19px;line-height:1.2;margin:6px 0 0}' +
      '.hilfe-tafel p{font-size:14.5px;line-height:1.55;margin:8px 0 0}' +
      '.hilfe-tafel .reihe{display:flex;gap:8px;align-items:center;margin-top:16px}' +
      '.hilfe-tafel button{font:inherit;font-size:13.5px;font-weight:600;min-height:44px;padding:0 15px;' +
        'border-radius:999px;cursor:pointer;border:0.5px solid ' + linie + ';background:' + karte + ';color:' + tinte + '}' +
      '.hilfe-tafel button.weiter{background:' + akzent + ';border-color:' + akzent + ';color:#fff}' +
      '.hilfe-tafel button.schluss{margin-left:auto;border-color:transparent;background:none;color:' + grau + '}' +
      '@media (hover:hover){.hilfe-tafel button:hover{border-color:' + akzent + '}' +
        '.hilfe-tafel button.weiter:hover{filter:brightness(1.06)}' +
        '.hilfe-tafel button.schluss:hover{color:' + tinte + '}}' +
      '.hilfe-tafel button[disabled]{opacity:.4;cursor:default}' +

      '@media (max-width:600px){' +
        '.hilfe-tafel{left:12px!important;right:12px;top:auto!important;' +
          'bottom:calc(12px + env(safe-area-inset-bottom));width:auto}' +
      '}' +
      '@media (prefers-reduced-motion:reduce){.hilfe-stelle{transition:none}}';
    document.head.appendChild(s);
  }

  /* ---------- Die Stellen einsammeln ---------- */
  /* Nicht über offsetParent gehen: der ist bei allem null, was in einem
     position:fixed-Chrom steckt, und genau dort hängen auf mehreren Flächen die
     Sachen, die erklärt werden sollen. Die Kiste plus die berechneten Werte
     sagen es genauer. */
  function sichtbar(el) {
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    if (r.bottom < 0 || r.right < 0) return false;

    /* Nicht nur die Sache selbst prüfen, sondern die ganze Kette darüber: das
       Modell blendet im hineingezoomten Zustand ganze Ebenen mit opacity:0 aus
       (body.gezoomt), und ein Scheinwerfer auf etwas Unsichtbarem ist schlimmer
       als gar keine Hilfe. */
    for (var a = el; a && a !== document.documentElement; a = a.parentElement) {
      var st = getComputedStyle(a);
      if (st.visibility === 'hidden' || st.display === 'none') return false;
      if (parseFloat(st.opacity) <= 0.05) return false;
    }

    /* Verdeckung wird NICHT geraten. Ein Treffertest über elementFromPoint sieht
       durch jede Deko hindurch, die pointer-events:none trägt — auf dem Modell
       liegt genau so ein Schleier über der Stadt, und der Test hätte die
       Gebäude dahinter für sichtbar gehalten. Wo eine Fläche Zustände hat, die
       sie selbst kennt, sagt sie es: data-hilfe-wenn="body.gezoomt". */
    var wenn = el.getAttribute('data-hilfe-wenn');
    if (wenn) {
      try { if (!document.querySelector(wenn)) return false; }
      catch (e) { /* ein kaputter Wähler soll die Hilfe nicht abschalten */ }
    }
    return true;
  }

  function sammle() {
    var alle = Array.prototype.slice.call(document.querySelectorAll('[data-hilfe]'));
    var neu = [];
    alle.forEach(function (el) {
      if (!sichtbar(el)) return;
      neu.push({ el: el, text: el.getAttribute('data-hilfe'), titel: el.getAttribute('data-hilfe-name') || '' });
    });
    return neu;
  }

  /* ---------- Bauen ---------- */
  function baueSchicht() {
    stil();
    schicht = document.createElement('div');
    schicht.className = 'hilfe-schicht';
    schicht.hidden = true;

    veil = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    veil.setAttribute('class', 'hilfe-veil');
    veil.setAttribute('aria-hidden', 'true');
    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    var maske = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
    maske.setAttribute('id', 'hilfe-maske');
    maske.setAttribute('maskUnits', 'userSpaceOnUse');
    var voll = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    voll.setAttribute('x', '0'); voll.setAttribute('y', '0');
    voll.setAttribute('width', '100%'); voll.setAttribute('height', '100%');
    voll.setAttribute('fill', '#fff');
    loch = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    loch.setAttribute('fill', '#000');
    loch.setAttribute('rx', String(RUND));
    maske.append(voll, loch);
    defs.appendChild(maske);
    var grund = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    grund.setAttribute('class', 'grund');
    grund.setAttribute('x', '0'); grund.setAttribute('y', '0');
    grund.setAttribute('width', '100%'); grund.setAttribute('height', '100%');
    grund.setAttribute('mask', 'url(#hilfe-maske)');
    veil.append(defs, grund);
    schicht.appendChild(veil);

    /* Ein Druck neben alles schließt — wie überall sonst auch */
    veil.addEventListener('click', schliesse);

    tafel = document.createElement('div');
    tafel.className = 'hilfe-tafel';
    tafel.setAttribute('role', 'dialog');
    tafel.setAttribute('aria-modal', 'false');
    tafel.setAttribute('aria-live', 'polite');
    tafel.innerHTML =
      '<div class="zaehler"></div><h4></h4><p></p>' +
      '<div class="reihe">' +
        '<button type="button" class="zurueck">Zurück</button>' +
        '<button type="button" class="weiter">Weiter</button>' +
        '<button type="button" class="schluss">Fertig</button>' +
      '</div>';
    schicht.appendChild(tafel);

    tafel.querySelector('.zurueck').addEventListener('click', function () { gehe(jetzt - 1); });
    tafel.querySelector('.weiter').addEventListener('click', function () {
      if (jetzt >= stellen.length - 1) { schliesse(); return; }
      gehe(jetzt + 1);
    });
    tafel.querySelector('.schluss').addEventListener('click', schliesse);

    document.body.appendChild(schicht);
  }

  /* ---------- Messen und zeichnen ---------- */
  /* Der Rahmen bleibt im Fenster. Eine Sache, die größer ist als der Bildschirm
     oder halb darüber hinausragt, bekäme sonst einen Rahmen mit Ecken, die
     niemand sieht — und die Nummer säße bei -11 Pixeln außerhalb des Bildes. */
  function kasten(r) {
    var links = Math.max(14, r.left - LUFT);
    var oben  = Math.max(20, r.top - LUFT);
    var recht = Math.min(window.innerWidth - 6, r.right + LUFT);
    var unten = Math.min(window.innerHeight - 6, r.bottom + LUFT);
    return { x: links, y: oben, b: recht - links, h: unten - oben };
  }

  function messe() {
    stellen.forEach(function (s, i) {
      var r = s.el.getBoundingClientRect();
      if (!s.kasten) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'hilfe-stelle';
        var nr = document.createElement('span');
        nr.className = 'hilfe-nr';
        nr.textContent = String(i + 1);
        b.appendChild(nr);
        b.addEventListener('click', function (e) { e.stopPropagation(); gehe(i); });
        schicht.appendChild(b);
        s.kasten = b;
      }
      s.kasten.setAttribute('aria-label', 'Erklärung ' + (i + 1) + ' von ' + stellen.length);
      var k = kasten(r);
      /* Ganz aus dem Bild gescrollt: der Rahmen verschwindet, die Führung holt
         die Sache ohnehin heran, bevor sie sie erklärt. */
      if (k.b <= 8 || k.h <= 8) {
        s.kasten.style.visibility = 'hidden';
      } else {
        s.kasten.style.visibility = '';
        s.kasten.style.left   = k.x + 'px';
        s.kasten.style.top    = k.y + 'px';
        s.kasten.style.width  = k.b + 'px';
        s.kasten.style.height = k.h + 'px';
      }
      s.rect = r;
      s.kastenMass = k;
    });
    setzeLoch();
    setzeTafel();
  }

  function messeBald() {
    if (messLauf) return;
    messLauf = true;
    requestAnimationFrame(function () { messLauf = false; if (offen) messe(); });
  }

  function setzeLoch() {
    var s = stellen[jetzt];
    if (!s) {
      /* Die Karte über die Fläche selbst hat keinen Scheinwerfer: es geht um
         alles, was man sieht, nicht um eine Stelle darin. */
      loch.setAttribute('width', '0'); loch.setAttribute('height', '0');
      stellen.forEach(function (x) { if (x.kasten) x.kasten.classList.remove('hier'); });
      return;
    }
    var k = s.kastenMass || kasten(s.rect);
    loch.setAttribute('x', String(k.x));
    loch.setAttribute('y', String(k.y));
    loch.setAttribute('width', String(Math.max(0, k.b)));
    loch.setAttribute('height', String(Math.max(0, k.h)));
    stellen.forEach(function (x, i) {
      if (x.kasten) x.kasten.classList.toggle('hier', i === jetzt);
    });
  }

  function setzeTafel() {
    var breit = tafel.offsetWidth || 360;
    var hoch = tafel.offsetHeight || 180;
    var rand = 14;
    var s = stellen[jetzt];

    if (!s) {
      /* Fläche selbst: die Tafel steht in der Mitte, wie ein Titel */
      tafel.style.left = Math.round((window.innerWidth - breit) / 2) + 'px';
      tafel.style.top = Math.round((window.innerHeight - hoch) / 2) + 'px';
      return;
    }
    var k = s.kastenMass || kasten(s.rect);
    var unten = k.y + k.h + 12;
    var oben = k.y - 12 - hoch;
    var y;
    if (unten + hoch + rand <= window.innerHeight) y = unten;
    else if (oben >= rand) y = oben;
    else y = Math.max(rand, Math.min(window.innerHeight - hoch - rand, k.y));
    var x = k.x;
    x = Math.max(rand, Math.min(window.innerWidth - breit - rand, x));
    tafel.style.left = Math.round(x) + 'px';
    tafel.style.top = Math.round(y) + 'px';
  }

  function schreibe() {
    var s = stellen[jetzt];
    var z = tafel.querySelector('.zaehler');
    var h = tafel.querySelector('h4');
    var p = tafel.querySelector('p');
    var w = tafel.querySelector('.weiter');
    var zu = tafel.querySelector('.zurueck');

    if (!s) {
      z.textContent = 'Wo du bist';
      h.textContent = document.body.getAttribute('data-hilfe-titel') || document.title;
      p.textContent = document.body.getAttribute('data-hilfe-satz') || '';
      p.hidden = !p.textContent;
    } else {
      z.textContent = (jetzt + 1) + ' von ' + stellen.length;
      h.textContent = s.titel;
      h.hidden = !s.titel;
      p.textContent = s.text;
      p.hidden = false;
    }
    if (!s) h.hidden = !h.textContent;
    zu.disabled = jetzt <= -1;
    w.textContent = jetzt >= stellen.length - 1 ? 'Fertig' : 'Weiter';
  }

  function gehe(i) {
    jetzt = Math.max(-1, Math.min(stellen.length - 1, i));
    var s = stellen[jetzt];
    if (s) {
      var r = s.el.getBoundingClientRect();
      /* Nur holen, was nicht da ist — ein Sprung bei jedem „Weiter" macht
         aus einer Erklärung eine Achterbahn. */
      if (r.top < 90 || r.bottom > window.innerHeight - 90) {
        s.el.scrollIntoView({ behavior: reduziert ? 'auto' : 'smooth', block: 'center' });
      }
    }
    schreibe();
    messe();
    /* nach einem weichen Scrollen sitzt der Scheinwerfer erst am Ende richtig */
    var bis = performance.now() + 700;
    (function nach() {
      if (!offen) return;
      messe();
      if (performance.now() < bis) requestAnimationFrame(nach);
    })();
  }

  /* ---------- Auf und zu ---------- */
  function oeffne() {
    if (offen) return;
    stellen = sammle();
    offen = true;
    vorherFokus = document.activeElement;
    schicht.hidden = false;
    knopf.setAttribute('aria-expanded', 'true');
    jetzt = -1;
    schreibe();
    messe();
    tafel.querySelector('.weiter').focus();
  }

  function schliesse() {
    if (!offen) return;
    offen = false;
    schicht.hidden = true;
    knopf.setAttribute('aria-expanded', 'false');
    stellen.forEach(function (s) { if (s.kasten) s.kasten.remove(); });
    stellen = [];
    if (vorherFokus === knopf || !vorherFokus) knopf.focus();
    else if (vorherFokus && document.contains(vorherFokus)) vorherFokus.focus();
  }

  function schalte() { offen ? schliesse() : oeffne(); }

  /* ---------- Aufbau ---------- */
  function baue() {
    var halter = document.querySelector('[data-hilfe-knopf]');
    if (!halter || knopf) return;
    stil();
    knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'hilfe-knopf';
    knopf.setAttribute('aria-expanded', 'false');
    knopf.setAttribute('aria-label', 'Diese Fläche erklären');
    knopf.title = 'Diese Fläche erklären';
    knopf.textContent = '?';
    knopf.addEventListener('click', schalte);
    halter.appendChild(knopf);

    baueSchicht();

    window.addEventListener('resize', messeBald);
    window.addEventListener('scroll', messeBald, { passive: true, capture: true });
    document.addEventListener('keydown', function (e) {
      if (!offen) return;
      if (e.key === 'Escape') { e.preventDefault(); schliesse(); return; }
      /* Die Ebene ist absichtlich nicht modal: die Seite dahinter behält ihren
         Fokus. Wer in einem Feld steht, meint mit dem Pfeil den Schreibzeiger
         und nicht die nächste Erklärung. */
      var z = e.target;
      if (z && z.closest && z.closest('input,textarea,select,[contenteditable]')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); if (jetzt < stellen.length - 1) gehe(jetzt + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); gehe(jetzt - 1); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', baue);
  else baue();

  return { oeffne: oeffne, schliesse: schliesse, baue: baue };
})();
