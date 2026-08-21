/* quoroai-plattform-design · website/ · Der Kontakt-Dialog, ein Baustein für
   alle Seiten. Jeder Mail-CTA öffnet ihn; ohne JavaScript bleibt der
   mailto-Verweis der Weg. Das Formular beginnt wie das Produkt-Portal mit
   der Frage, nicht mit Feldern; gesendet wird ehrlich per Mail (mailto mit
   vorgefülltem Text), es gibt keinen Server. Marker: KONTAKT-V1 */
(function () {
  'use strict';

  var css = `
  .kd-schleier{
    position:fixed;inset:0;z-index:200;display:grid;place-items:center;padding:20px;
    background:rgba(253,253,254,.72);
    backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%);
    opacity:0;pointer-events:none;transition:opacity .35s cubic-bezier(.16,1,.3,1);
  }
  .kd-schleier.da{opacity:1;pointer-events:auto}
  .kd-blatt{
    position:absolute;mix-blend-mode:multiply;pointer-events:none;
    -webkit-mask-image:radial-gradient(closest-side,#000 60%,transparent 98%);
    mask-image:radial-gradient(closest-side,#000 60%,transparent 98%);
    animation:kd-schwebt 6s ease-in-out infinite alternate;
  }
  @keyframes kd-schwebt{from{transform:translateY(0) rotate(var(--dreh,0deg))}to{transform:translateY(-14px) rotate(var(--dreh,0deg))}}
  .kd-karte{
    position:relative;width:min(680px,100%);max-height:calc(100svh - 40px);overflow:auto;
    border-radius:24px;padding:clamp(26px,4vw,44px);
    background:rgba(255,255,255,.86);
    backdrop-filter:blur(30px) saturate(180%);-webkit-backdrop-filter:blur(30px) saturate(180%);
    border:1px solid rgba(255,255,255,.85);
    box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 40px 110px rgba(59,52,134,.30);
    transform:translateY(22px) scale(.985);filter:blur(6px);
    transition:transform .45s cubic-bezier(.16,1,.3,1),filter .45s cubic-bezier(.16,1,.3,1);
  }
  .kd-schleier.da .kd-karte{transform:none;filter:none}
  .kd-zu{
    position:absolute;top:16px;right:16px;width:38px;height:38px;border-radius:50%;
    border:0.5px solid var(--nebel-200);background:rgba(255,255,255,.8);cursor:pointer;
    display:grid;place-items:center;color:var(--nebel-600);font-size:17px;line-height:1;
    transition:color .2s,border-color .2s;
  }
  .kd-zu:hover{color:var(--tinte);border-color:var(--lila-400)}
  .kd-karte h2{font-size:clamp(26px,3.4vw,40px);line-height:1.1;max-width:14ch}
  .kd-karte .kd-unter{margin-top:8px;font-size:15px;color:var(--nebel-600)}
  .kd-themen{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}
  .kd-themen button{
    padding:9px 16px;border-radius:999px;border:0.5px solid var(--nebel-200);
    background:rgba(255,255,255,.7);font:inherit;font-size:14px;font-weight:600;
    color:var(--nebel-600);cursor:pointer;transition:all .2s cubic-bezier(.16,1,.3,1);
  }
  .kd-themen button[aria-pressed=true]{
    border-color:var(--lila-600);color:var(--lila-800);background:var(--lila-050);
    box-shadow:0 0 0 1px var(--lila-600);
  }
  .kd-frage{position:relative;margin-top:18px}
  .kd-frage textarea{
    width:100%;min-height:120px;padding:16px 18px;font:inherit;font-size:16px;
    color:var(--tinte);background:#fff;border:0.5px solid var(--nebel-300);
    border-radius:16px;resize:vertical;outline:none;
    transition:border-color .2s,box-shadow .2s;
  }
  .kd-frage textarea:focus{border-color:var(--lila-500);box-shadow:0 0 0 4px var(--lila-100)}
  .kd-zeile{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
  .kd-zeile input{
    width:100%;min-height:48px;padding:0 16px;font:inherit;font-size:15px;color:var(--tinte);
    background:#fff;border:0.5px solid var(--nebel-300);border-radius:14px;outline:none;
    transition:border-color .2s,box-shadow .2s;
  }
  .kd-zeile input:focus{border-color:var(--lila-500);box-shadow:0 0 0 4px var(--lila-100)}
  .kd-fuss{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:20px;flex-wrap:wrap}
  .kd-fuss .kd-wort{font-size:13px;color:var(--nebel-500);max-width:34ch}
  .kd-senden{
    display:inline-flex;align-items:center;justify-content:center;gap:8px;
    min-height:50px;padding:0 26px;border-radius:999px;border:0;cursor:pointer;
    font:inherit;font-size:16px;font-weight:600;color:#fff;
    background:linear-gradient(180deg,var(--lila-500),var(--lila-700));
    box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -2px 5px rgba(24,21,47,.22),0 10px 24px rgba(111,99,232,.38);
    position:relative;overflow:hidden;
    transition:transform .12s cubic-bezier(.16,1,.3,1),box-shadow .25s cubic-bezier(.16,1,.3,1);
  }
  .kd-senden:active{transform:scale(.97)}
  .kd-senden::after{
    content:"";position:absolute;inset:0;pointer-events:none;
    background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.55) 50%,transparent 70%) no-repeat -120px 0/100px 100%;
  }
  @media (hover:hover){
    .kd-senden:hover::after{animation:kd-glanz 1.6s ease-in-out infinite}
    .kd-senden:hover{box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -2px 5px rgba(24,21,47,.22),0 16px 36px rgba(111,99,232,.5)}
  }
  @keyframes kd-glanz{0%{background-position:-120px 0}60%,100%{background-position:calc(100% + 120px) 0}}
  .kd-fehler{margin-top:10px;font-size:13.5px;color:#a06008;font-weight:600;min-height:1.2em}
  .kd-fehler:empty{margin-top:0;min-height:0}
  .kd-danke{text-align:center;padding:14px 0 6px}
  .kd-danke .kd-haken{
    width:64px;height:64px;border-radius:50%;margin:0 auto 18px;display:grid;place-items:center;
    background:var(--gruen-fond);color:var(--gruen);font-size:30px;
  }
  .kd-danke h2{max-width:none;margin:0 auto}
  .kd-danke p{margin-top:10px;font-size:16px;color:var(--nebel-700)}
  .kd-senden[disabled]{opacity:.7;cursor:progress}
  @media (max-width:600px){
    .kd-zeile{grid-template-columns:1fr}
    .kd-fuss{flex-direction:column;align-items:stretch;text-align:center}
    .kd-senden{width:100%}
    .kd-blatt{display:none}
  }
  @media (prefers-reduced-motion:reduce){
    .kd-schleier,.kd-karte{transition:none}
    .kd-blatt{animation:none}
    .kd-senden:hover::after{animation:none}
  }`;

  var stil = document.createElement('style');
  stil.textContent = css;
  document.head.appendChild(stil);

  var wurzel = document.createElement('div');
  wurzel.className = 'kd-schleier';
  wurzel.setAttribute('role', 'dialog');
  wurzel.setAttribute('aria-modal', 'true');
  wurzel.setAttribute('aria-label', 'Erzähl uns, was dich aufhält');
  wurzel.innerHTML = `
    <img class="kd-blatt" src="bilder/flieger.webp" alt="" style="width:200px;top:8%;right:10%;--dreh:6deg">
    <img class="kd-blatt" src="bilder/blasen.webp" alt="" style="width:230px;bottom:7%;left:7%;--dreh:-4deg;animation-delay:1.4s">
    <form class="kd-karte" novalidate>
      <button type="button" class="kd-zu" aria-label="Schließen">&#10005;</button>
      <h2>Was hält dich auf?</h2>
      <p class="kd-unter">Schreib es, wie du es einem Kollegen erzählen würdest. Fachbegriffe sind unser Problem, nicht deins.</p>
      <div class="kd-themen" role="group" aria-label="Worum geht es?">
        <button type="button" data-thema="Eine Website">Eine Website</button>
        <button type="button" data-thema="Software oder Plattform">Software / Plattform</button>
        <button type="button" data-thema="Automatisierung">Automatisierung</button>
        <button type="button" data-thema="Etwas anderes">Etwas anderes</button>
      </div>
      <div class="kd-frage">
        <textarea name="frage" placeholder="Zum Beispiel: Wir tippen jede Woche dieselben Angebote von Hand, und keiner weiß, wo die aktuelle Preisliste liegt." aria-label="Was hält dich auf?"></textarea>
      </div>
      <div class="kd-zeile">
        <input type="text" name="name" placeholder="Dein Name" aria-label="Dein Name" autocomplete="name">
        <input type="email" name="mail" placeholder="Deine E-Mail" aria-label="Deine E-Mail" autocomplete="email">
      </div>
      <div class="kd-fuss">
        <span class="kd-wort">Wir schreiben dir zurück, meist am selben Tag. Deine Angaben nutzen wir nur für diese Anfrage.</span>
        <button type="submit" class="kd-senden">Abschicken</button>
      </div>
      <p class="kd-fehler" role="alert"></p>
    </form>`;
  document.body.appendChild(wurzel);

  var karte = wurzel.querySelector('.kd-karte');
  var themen = Array.prototype.slice.call(wurzel.querySelectorAll('.kd-themen button'));
  var thema = '';

  function oeffnen() {
    wurzel.classList.add('da');
    document.body.style.overflow = 'hidden';
    window.setTimeout(function () { wurzel.querySelector('textarea').focus(); }, 380);
  }
  function schliessen() {
    wurzel.classList.remove('da');
    document.body.style.overflow = '';
  }

  themen.forEach(function (b) {
    b.addEventListener('click', function () {
      var war = b.getAttribute('aria-pressed') === 'true';
      themen.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      if (!war) { b.setAttribute('aria-pressed', 'true'); thema = b.dataset.thema; }
      else { thema = ''; }
    });
  });

  wurzel.querySelector('.kd-zu').addEventListener('click', schliessen);
  wurzel.addEventListener('click', function (ev) { if (ev.target === wurzel) schliessen(); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') schliessen(); });

  var ZIEL = 'webmaster@quoroai.io';
  /* Der Weg des Versands: die Edge Function, die der bestehende Auftritt schon
     benutzt (Supabase-Projekt quoro-landing, Region Frankfurt). Sie schreibt die
     Anfrage in die Datenbank, schickt uns die Benachrichtigung über Resend an
     ZIEL und dem Absender eine Eingangsbestätigung; Rate-Limits und
     Herkunftsprüfung stecken dort drin. Ein zweiter Weg wird nicht gebaut.
     FormSubmit war der erste Versuch und ist RAUS: zwei ausgelöste
     Aktivierungen kamen nie an, und als US-Dienst wäre er ein AVV-Fall.
     ACHTUNG: Die Funktion antwortet bei Absagen mit 400 oder 429. Wir messen
     deshalb am Status, nicht am Rumpf — genau daran ist der Vorgänger
     gescheitert (200 mit success:false). */
  var ENDPUNKT = 'https://uqfiodcqpssyflynzgoc.supabase.co/functions/v1/contact';
  var fehler = karte.querySelector('.kd-fehler');
  var senden = karte.querySelector('.kd-senden');

  function mailtoWeg(betreff, leib) {
    location.href = 'mailto:' + ZIEL + '?subject=' + encodeURIComponent(betreff) +
      '&body=' + encodeURIComponent(leib);
  }

  function danke() {
    karte.innerHTML =
      '<button type="button" class="kd-zu" aria-label="Schließen">&#10005;</button>' +
      '<div class="kd-danke"><div class="kd-haken">&#10003;</div>' +
      '<h2>' + (ENDPUNKT ? 'Angekommen.' : 'Fast geschafft.') + '</h2>' +
      '<p>' + (ENDPUNKT
        ? 'Wir melden uns bei dir, meist am selben Tag. Kein Newsletter, keine Broschüre.'
        : 'Dein Mailprogramm ist offen und die Nachricht steht schon fertig darin. Einmal senden, dann liegt sie bei uns.') +
      '</p></div>';
    karte.querySelector('.kd-zu').addEventListener('click', schliessen);
  }

  karte.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var frage = karte.querySelector('[name=frage]').value.trim();
    var name = karte.querySelector('[name=name]').value.trim();
    var mail = karte.querySelector('[name=mail]').value.trim();
    var betreff = (thema ? thema : 'Anfrage') + ' über die Website';
    var leib = frage + '\n\n' + (name || 'ohne Namen') + (mail ? ', ' + mail : '');

    if (!frage) {
      fehler.textContent = 'Schreib kurz, was dich aufhält, dann können wir etwas damit anfangen.';
      karte.querySelector('[name=frage]').focus();
      return;
    }
    if (!mail || mail.indexOf('@') < 1) {
      fehler.textContent = 'Ohne deine E-Mail können wir dir nicht antworten.';
      karte.querySelector('[name=mail]').focus();
      return;
    }
    fehler.textContent = '';
    senden.disabled = true;
    senden.textContent = 'Wird gesendet';

    if (!ENDPUNKT) {
      /* Kein Endpunkt eingetragen: der ehrliche Weg über das Mailprogramm. */
      senden.disabled = false;
      senden.textContent = 'Abschicken';
      mailtoWeg(betreff, leib);
      danke();
      return;
    }

    /* Feldnamen wie im bestehenden Auftritt: name, email, message, source.
       Das Thema steht im Text, damit der Wire-Vertrag der Funktion unberührt
       bleibt (Retention-Sweep und Betroffenen-Export hängen daran). */
    fetch(ENDPUNKT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: name || 'ohne Namen',
        email: mail,
        message: (thema ? 'Thema: ' + thema + '\n\n' : '') + frage,
        source: 'website-dialog'
      })
    }).then(function (a) {
      /* Der Status ist die Wahrheit: 400 falsche Felder, 429 zu viele Versuche. */
      if (!a.ok) throw new Error('Absage vom Versand, Status ' + a.status);
      danke();
    }).catch(function () {
      /* Kein Weg soll verloren gehen: dann eben über das Mailprogramm. */
      senden.disabled = false;
      senden.textContent = 'Abschicken';
      fehler.textContent = 'Der Versand hakt gerade. Wir öffnen dein Mailprogramm.';
      window.setTimeout(function () { mailtoWeg(betreff, leib); }, 900);
    });
  });

  /* Jeder Mail-CTA öffnet den Dialog; das mailto bleibt der Weg ohne Skript. */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="mailto:"]'), function (a) {
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      oeffnen();
    });
  });
})();
