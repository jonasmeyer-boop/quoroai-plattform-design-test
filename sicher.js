/* quoroai-plattform-design · Die Rückfrage vor dem Unumkehrbaren (Paket A4,
   Issue #56).

   Es gab fünf Stellen, an denen ein einziger Klick etwas tat, das niemand
   zurückholen konnte: eine Unterlage war bei der Beratung, ein Verbandswerk
   mit 41 Abschnitten gelöscht, zwanzig Mandate im Modell, eine Mitarbeiterin
   aus dem Team, das ganze Impressum überschrieben. Keine dieser Stellen
   fragte nach — während harmlose Stellen daneben ihre Erklärkästen hatten.

   Dieser Baustein ist die eine Rückfrage für alle. Er ist absichtlich karg:
   ein Satz als Frage, DER NAME der Sache in der Zeile darunter, und dann in
   Stichzeilen der Umfang — wie viele Abschnitte, wie viele Mandate, wer der
   Empfänger ist, was es wieder kostet. Wer das liest, weiß, was gleich
   passiert, ohne den Satz zweimal zu lesen.

   Zwei Regeln, aus denen alles Übrige folgt:
   1. Gefragt wird nur vor dem, was man nicht zurückholen kann. Alles andere
      passiert einfach — eine Software, die bei jeder Kleinigkeit nachfragt,
      bringt niemandem bei, wann es ernst ist.
   2. Der harmlose Weg ist der bequeme: „Abbrechen" hat den Fokus, Escape
      bricht ab, ein Druck neben den Kasten bricht ab. Nur der ausdrückliche
      Griff auf den Knopf mit dem Tatwort tut es wirklich.

   Aufruf:
     Sicher.frage({
       frage:  'Diese Unterlage verschicken?',   // die Frage, kurz
       was:    'Rahmenvertrag.pdf',              // der Name der Sache
       punkte: ['Geht an Dr. Anna Vogelsang.',   // Umfang und Folgen
                'Gelesenes lässt sich nicht zurückholen.'],
       ja:     'Verschicken',                    // das Tatwort auf dem Knopf
       nein:   'Abbrechen',                      // frei, selten nötig
       gefahr: true,                             // rot statt ruhig
       aus:    knopf,                            // dorthin geht der Fokus zurück
       dann:   function () { … }                 // erst hier passiert es
     });

   Markenneutral wie blatt.js: alle Farben kommen aus den Tokens der Fläche.
   Kundenflächen setzen --blau/--linie/--grau über marke.js, quoroAI-Flächen
   bringen --lila-600/--nebel-200/--rot aus system.css mit. Deshalb läuft
   derselbe Kasten auf beiden Welten, ohne dass eine Kundenfläche system.css
   einbinden müsste.

   Alle Klassen tragen si- (Sicher).
   Marker: SICHER-V1 */
window.Sicher = (function () {
  'use strict';

  function tok(name, ersatz) { return 'var(' + name + ', ' + ersatz + ')'; }

  var stilDa = false;
  function stil() {
    if (stilDa) return;
    stilDa = true;
    var akzent = tok('--blau', tok('--lila-600', '#6f63e8'));
    var linie  = tok('--linie', tok('--nebel-200', '#e9e8f1'));
    var grau   = tok('--grau', tok('--nebel-500', '#7f7d93'));
    var tinte  = tok('--tinte', '#18152f');
    var karte  = tok('--flaeche', tok('--karte', '#ffffff'));
    var rot    = tok('--rot', '#c03246');
    var rund   = tok('--radius-karte', tok('--radius', '18px'));
    var kurve  = tok('--kurve', tok('--feder', 'cubic-bezier(.16,1,.3,1)'));
    var s = document.createElement('style');
    s.textContent =
      '.si-schicht{position:fixed;inset:0;z-index:960;display:flex;align-items:center;' +
        'justify-content:center;padding:24px}' +
      '.si-veil{position:absolute;inset:0;background:rgba(16,19,26,.42);' +
        'backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}' +
      '.si-kasten{position:relative;z-index:2;width:min(440px,100%);max-height:calc(100vh - 48px);' +
        'overflow-y:auto;background:' + karte + ';color:' + tinte + ';border-radius:' + rund + ';' +
        'padding:26px 26px 22px;box-shadow:0 30px 80px rgba(16,19,26,.28);' +
        'animation:si-auf .22s ' + kurve + '}' +
      '@keyframes si-auf{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}' +
      '.si-frage{font-size:19px;font-weight:800;letter-spacing:-.01em;line-height:1.3}' +
      /* Der Name steht für sich: er ist das, woran man erkennt, ob man die
         richtige Sache erwischt hat. */
      '.si-was{margin-top:10px;font-size:15.5px;font-weight:700;line-height:1.4;word-break:break-word}' +
      '.si-punkte{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}' +
      '.si-punkte li{font-size:14px;line-height:1.5;color:' + grau + ';padding-left:14px;position:relative}' +
      '.si-punkte li::before{content:"";position:absolute;left:0;top:.62em;width:6px;height:1.5px;' +
        'background:' + grau + ';opacity:.7}' +
      '.si-griffe{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}' +
      '.si-griffe button{min-height:46px;padding:0 20px;border-radius:999px;font:inherit;' +
        'font-size:14.5px;font-weight:700;cursor:pointer;border:0.5px solid ' + linie + ';' +
        'background:' + karte + ';color:' + tinte + ';transition:border-color .2s,color .2s,background .2s}' +
      '.si-ja{flex:1 1 auto;border-color:transparent!important;background:' + tinte + '!important;color:#fff!important}' +
      '.si-ja.gefahr{background:' + rot + '!important}' +
      '@media (hover:hover){' +
        '.si-nein:hover{border-color:' + akzent + ';color:' + akzent + '}' +
        '.si-ja:hover{filter:brightness(1.12)}}' +
      '@media (max-width:520px){.si-griffe{flex-direction:column-reverse}.si-griffe button{width:100%}}' +
      '@media (prefers-reduced-motion:reduce){.si-kasten{animation:none}}';
    document.head.appendChild(s);
  }

  var offen = null;

  function zu(schicht, zurueckAn) {
    if (!schicht || !schicht.parentNode) return;
    schicht.remove();
    offen = null;
    document.removeEventListener('keydown', taste, true);
    if (zurueckAn && document.contains(zurueckAn)) { try { zurueckAn.focus(); } catch (e) {} }
  }

  function taste(e) {
    if (!offen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      offen.ab();
      return;
    }
    /* Der Kasten hält den Tabulator bei sich: hinter ihm liegt eine Fläche,
       auf der gerade nichts entschieden werden darf. */
    if (e.key !== 'Tab') return;
    var ziele = offen.schicht.querySelectorAll('button');
    if (!ziele.length) return;
    var erst = ziele[0], letzt = ziele[ziele.length - 1];
    if (e.shiftKey && document.activeElement === erst) { e.preventDefault(); letzt.focus(); }
    else if (!e.shiftKey && document.activeElement === letzt) { e.preventDefault(); erst.focus(); }
  }

  function frage(o) {
    o = o || {};
    stil();
    if (offen) offen.ab();

    var zurueckAn = o.aus || document.activeElement;

    var schicht = document.createElement('div');
    schicht.className = 'si-schicht';

    var veil = document.createElement('div');
    veil.className = 'si-veil';
    schicht.appendChild(veil);

    var kasten = document.createElement('div');
    kasten.className = 'si-kasten';
    kasten.setAttribute('role', 'alertdialog');
    kasten.setAttribute('aria-modal', 'true');

    var frageEl = document.createElement('div');
    frageEl.className = 'si-frage';
    frageEl.id = 'si-frage-' + Date.now();
    frageEl.textContent = o.frage || 'Wirklich?';
    kasten.setAttribute('aria-labelledby', frageEl.id);
    kasten.appendChild(frageEl);

    if (o.was) {
      var wasEl = document.createElement('div');
      wasEl.className = 'si-was';
      wasEl.textContent = o.was;
      kasten.appendChild(wasEl);
    }

    var punkte = (o.punkte || []).filter(Boolean);
    if (punkte.length) {
      var ul = document.createElement('ul');
      ul.className = 'si-punkte';
      punkte.forEach(function (p) {
        var li = document.createElement('li');
        li.textContent = p;
        ul.appendChild(li);
      });
      kasten.appendChild(ul);
    }

    var griffe = document.createElement('div');
    griffe.className = 'si-griffe';

    var nein = document.createElement('button');
    nein.type = 'button';
    nein.className = 'si-nein';
    nein.textContent = o.nein || 'Abbrechen';

    var ja = document.createElement('button');
    ja.type = 'button';
    ja.className = 'si-ja' + (o.gefahr ? ' gefahr' : '');
    /* Auf dem Knopf steht die Tat, nicht „OK": wer nur den Knopf liest, soll
       wissen, was er auslöst. */
    ja.textContent = o.ja || 'Ja';

    function ab() { zu(schicht, zurueckAn); if (typeof o.sonst === 'function') o.sonst(); }
    nein.addEventListener('click', ab);
    veil.addEventListener('click', ab);
    ja.addEventListener('click', function () {
      zu(schicht, zurueckAn);
      if (typeof o.dann === 'function') o.dann();
    });

    griffe.appendChild(nein);
    griffe.appendChild(ja);
    kasten.appendChild(griffe);
    schicht.appendChild(kasten);
    document.body.appendChild(schicht);

    offen = {schicht: schicht, ab: ab};
    document.addEventListener('keydown', taste, true);
    /* Der harmlose Weg liegt unter dem Finger: gefragt ist, ob es wirklich
       sein soll, und die Antwort darauf ist im Zweifel nein. */
    nein.focus();
    return {zu: ab};
  }

  return {frage: frage};
})();
