/* quoroai-plattform-design · Der Zeiger ist der Komet (Jonas, 2026-08-13).
   quoroAI-Flächen tauschen den Systempfeil gegen einen glühenden Lichtkern in
   Marken-Lila; hinter ihm zieht ein Schweif her, der sofort verglüht. Auf
   Klickbarem wächst der Kern, beim Drücken duckt er sich. Läuft nur bei feinem
   Zeiger (Maus/Trackpad) und voller Bewegung; auf Touch und bei reduzierter
   Bewegung bleibt der Systemzeiger, über Textfeldern weicht er dem Textzeiger.
   Rückfalllinie, falls der Komet im Alltag stört: das Instrument (Vorschlag E).
   Kundenflächen (White-Label) binden dieses Modul NICHT ein.
   V2 nach Code-Review: Stift (pen) führt den Kometen wie die Maus; Farben und
   Kurve kommen aus den system.css-Tokens; pointercancel löst den Drück-Zustand;
   der Schweif reißt beim Fensterwechsel ab statt quer durchzuziehen; Glow ohne
   shadowBlur; Hover-Zustand wird auch beim Scrollen nachgeführt.
   V3: Der Systemzeiger wird erst ausgeblendet, wenn der Komet weiß, wo er
   steht. Vorher verschwand nach jedem Seitenwechsel der Zeiger ganz — die
   Seite schaltete cursor:none sofort, der Komet stand aber unsichtbar bei
   opacity 0 und wartete auf die erste Mausbewegung. Wer nach einem Klick die
   Hand ruhen ließ, hatte keinen Zeiger mehr. Dasselbe beim Verlassen des
   Fensters und beim Tabwechsel. Ab jetzt gilt: entweder der Komet oder der
   Systempfeil, nie nichts.
   Marker: ZEIGER-KOMET-V3 */
(function(){
  'use strict';
  if (!window.matchMedia('(pointer:fine) and (hover:hover)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var LILA = '111,99,232';
  var SCHWEIF_DAUER = 260; /* ms, bis ein Schweifstück verglüht ist */

  var stil = document.createElement('style');
  stil.textContent =
    'html.komet-zeiger,html.komet-zeiger *{cursor:none!important}' +
    'html.komet-zeiger input,html.komet-zeiger textarea,html.komet-zeiger select,html.komet-zeiger [contenteditable]{cursor:auto!important}' +
    '#komet-schweif{position:fixed;inset:0;z-index:998;pointer-events:none}' +
    '#komet-kopf{position:fixed;left:0;top:0;z-index:999;pointer-events:none;opacity:0;' +
      'width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:999px;' +
      'background:radial-gradient(circle at 35% 35%, #fff 0%, var(--lila-500, #8478ec) 35%, var(--lila-700, #5a4cd6) 100%);' +
      'box-shadow:0 0 12px rgba(' + LILA + ',.8), 0 0 34px rgba(' + LILA + ',.35);' +
      'transition:scale .18s var(--kurve, cubic-bezier(.16,1,.3,1)),opacity .25s ease}' +
    'html.komet-fasst #komet-kopf{scale:1.7}' +
    'html.komet-drueckt #komet-kopf{scale:.8}' +
    'html.komet-schreibt #komet-kopf,html.komet-schreibt #komet-schweif{opacity:0!important}';
  document.head.appendChild(stil);

  var schweif = document.createElement('canvas'); schweif.id = 'komet-schweif';
  var kopf = document.createElement('div'); kopf.id = 'komet-kopf';
  document.body.appendChild(schweif);
  document.body.appendChild(kopf);
  /* Die Klasse blendet den Systemzeiger aus — sie kommt erst, wenn die erste
     Mausbewegung verrät, wo der Komet stehen muss (siehe zeige/verstecke). */

  var ctx = schweif.getContext('2d');
  var dpr = 1;
  function messe(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    schweif.width = innerWidth * dpr;
    schweif.height = innerHeight * dpr;
  }
  messe();
  window.addEventListener('resize', messe);

  var mx = -100, my = -100, da = false;
  var spur = [];      /* der Schweif: {x, y, t} */
  var wach = false;   /* läuft die Malschleife gerade? */

  function wecke(){
    if (wach) return;
    wach = true;
    requestAnimationFrame(male);
  }

  /* Der Tausch geschieht immer als Paar: Komet an, Systemzeiger aus — und
     zurück. Sonst gibt es einen Zustand ohne jeden Zeiger. */
  function zeige(){
    if (da) return;
    da = true;
    document.documentElement.classList.add('komet-zeiger');
    kopf.style.opacity = 1;
  }
  function verstecke(){
    if (!da) return;
    da = false;
    document.documentElement.classList.remove('komet-zeiger');
    kopf.style.opacity = 0;
    spur.length = 0; /* sonst zieht der Wiedereintritt einen Strich quer durchs Bild */
  }

  document.addEventListener('pointermove', function(e){
    if (e.pointerType === 'touch') return; /* Maus und Stift führen den Kometen */
    mx = e.clientX; my = e.clientY;
    zeige();
    spur.push({x: mx, y: my, t: performance.now()});
    kopf.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    wecke();
  }, {passive: true});

  document.addEventListener('pointerdown', function(e){
    if (e.pointerType === 'touch') return;
    document.documentElement.classList.add('komet-drueckt');
  }, {passive: true});
  function loese(){ document.documentElement.classList.remove('komet-drueckt'); }
  document.addEventListener('pointerup', loese, {passive: true});
  /* nativer Drag oder Systemgeste: der Browser schickt cancel statt up */
  document.addEventListener('pointercancel', loese, {passive: true});
  document.addEventListener('lostpointercapture', loese, {passive: true});

  /* Der Kern wächst auf Klickbarem; über Textfeldern weicht der Komet */
  function pruefeZiel(el){
    var wurzel = document.documentElement;
    wurzel.classList.toggle('komet-schreibt',
      !!(el && el.closest('input,textarea,select,[contenteditable]')));
    wurzel.classList.toggle('komet-fasst',
      !!(el && el.closest('a,button,[role="button"],label,summary,.zone')));
  }
  document.addEventListener('pointerover', function(e){
    pruefeZiel(e.target instanceof Element ? e.target : null);
  }, {passive: true});
  /* Scrollt oder wechselt die Seite unter ruhendem Zeiger, altert der
     Hover-Zustand sonst: beim Scrollen einmal pro Frame neu nachsehen */
  var scrollPruefung = false;
  window.addEventListener('scroll', function(){
    if (scrollPruefung || !da) return;
    scrollPruefung = true;
    requestAnimationFrame(function(){
      scrollPruefung = false;
      pruefeZiel(document.elementFromPoint(mx, my));
    });
  }, {passive: true, capture: true});

  /* Fenster verlassen, Tab gewechselt, Fokus weg: der Systemzeiger übernimmt
     wieder, bis die nächste Bewegung den Kometen zurückholt. */
  document.addEventListener('mouseleave', verstecke);
  window.addEventListener('blur', verstecke);
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) verstecke();
  });

  function male(){
    var jetzt = performance.now();
    while (spur.length && jetzt - spur[0].t > SCHWEIF_DAUER) spur.shift();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    /* Glow ohne shadowBlur (Review: der langsamste Canvas-Pfad): erst ein
       breiter, dünner Hof, dann der Kern — zwei billige Strokes je Segment */
    for (var i = 1; i < spur.length; i++) {
      var a = spur[i - 1], b = spur[i];
      var p = 1 - (jetzt - b.t) / SCHWEIF_DAUER;   /* jung = kräftig */
      ctx.strokeStyle = 'rgba(' + LILA + ',' + (0.16 * p * p).toFixed(3) + ')';
      ctx.lineWidth = 14 * p;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.strokeStyle = 'rgba(' + LILA + ',' + (0.5 * p * p).toFixed(3) + ')';
      ctx.lineWidth = 6 * p;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    if (spur.length) {
      requestAnimationFrame(male);
    } else {
      wach = false;
    }
  }
})();
