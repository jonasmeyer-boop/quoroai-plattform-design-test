/* quoroai-plattform-design · Der Stift als Zeiger.
   quoroAI-Flächen tauschen den Systempfeil gegen die Stiftspitze der Marke:
   ein Tintenpunkt führt, hinter ihm verblasst eine Tintenspur, ein Glasring
   rastet auf allem Klickbaren ein, und jeder Klick setzt einen Tintentropfen.
   Läuft nur bei feinem Zeiger (Maus/Trackpad) und voller Bewegung; auf Touch
   und bei reduzierter Bewegung bleibt der Systemzeiger. Über Textfeldern
   weicht der Stift dem Textzeiger. Kundenflächen (White-Label) binden dieses
   Modul NICHT ein. Marker: STIFT-CURSOR-V1 */
(function(){
  'use strict';
  if (!window.matchMedia('(pointer:fine) and (hover:hover)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var TINTE = '#5a4cd6';           /* lila-700, die Stiftfarbe des Systems */
  var SPUR_DAUER = 650;            /* ms, bis ein Spurpunkt verblasst ist */
  var TROPFEN_DAUER = 520;         /* ms, bis ein Klick-Tropfen versickert ist */

  var stil = document.createElement('style');
  stil.textContent =
    'html.stift-zeiger,html.stift-zeiger *{cursor:none!important}' +
    'html.stift-zeiger input,html.stift-zeiger textarea,html.stift-zeiger select,html.stift-zeiger [contenteditable]{cursor:auto!important}' +
    '#stift-tinte{position:fixed;inset:0;z-index:997;pointer-events:none}' +
    '#stift-ring{position:fixed;left:0;top:0;z-index:998;pointer-events:none;opacity:0;' +
      'width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:999px;' +
      'border:1.5px solid rgba(111,99,232,.4);background:rgba(255,255,255,.14);' +
      'box-shadow:inset 0 1px 0 rgba(255,255,255,.55), 0 2px 10px rgba(59,52,134,.12);' +
      'transition:width .22s cubic-bezier(.16,1,.3,1),height .22s cubic-bezier(.16,1,.3,1),' +
        'margin .22s cubic-bezier(.16,1,.3,1),border-color .2s ease,background .2s ease,opacity .25s ease}' +
    'html.stift-fasst #stift-ring{width:48px;height:48px;margin:-24px 0 0 -24px;' +
      'border-color:rgba(111,99,232,.75);background:rgba(255,255,255,.32)}' +
    'html.stift-drueckt #stift-ring{width:28px;height:28px;margin:-14px 0 0 -14px;' +
      'border-color:rgba(90,76,214,.9)}' +
    '#stift-punkt{position:fixed;left:0;top:0;z-index:999;pointer-events:none;opacity:0;' +
      'width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:999px;background:' + TINTE + ';' +
      'transition:opacity .25s ease,width .18s ease,height .18s ease,margin .18s ease}' +
    'html.stift-fasst #stift-punkt{width:5px;height:5px;margin:-2.5px 0 0 -2.5px}' +
    'html.stift-schreibt #stift-ring,html.stift-schreibt #stift-punkt{opacity:0!important}';
  document.head.appendChild(stil);

  var tinte = document.createElement('canvas'); tinte.id = 'stift-tinte';
  var ring = document.createElement('div'); ring.id = 'stift-ring';
  var punkt = document.createElement('div'); punkt.id = 'stift-punkt';
  document.body.appendChild(tinte);
  document.body.appendChild(ring);
  document.body.appendChild(punkt);
  document.documentElement.classList.add('stift-zeiger');

  var ctx = tinte.getContext('2d');
  var dpr = 1;
  function messe(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    tinte.width = innerWidth * dpr;
    tinte.height = innerHeight * dpr;
  }
  messe();
  window.addEventListener('resize', messe);

  var mx = -100, my = -100;        /* wo der Zeiger wirklich ist */
  var rx = -100, ry = -100;        /* wo der Ring gerade schwebt (federt nach) */
  var da = false;                  /* schon eine Bewegung gesehen? */
  var spur = [];                   /* die Tintenspur: {x, y, t} */
  var tropfen = [];                /* Klick-Tropfen: {x, y, t, spritzer:[{wx,wy,r}]} */
  var wach = false;                /* läuft die Malschleife gerade? */

  function wecke(){
    if (wach) return;
    wach = true;
    requestAnimationFrame(male);
  }

  document.addEventListener('pointermove', function(e){
    if (e.pointerType && e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY;
    if (!da) { da = true; rx = mx; ry = my; ring.style.opacity = 1; punkt.style.opacity = 1; }
    var letzter = spur[spur.length - 1];
    if (!letzter || Math.hypot(mx - letzter.x, my - letzter.y) > 1.5) {
      spur.push({x: mx, y: my, t: performance.now()});
    }
    punkt.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    wecke();
  }, {passive: true});

  document.addEventListener('pointerdown', function(e){
    if (e.pointerType && e.pointerType !== 'mouse') return;
    document.documentElement.classList.add('stift-drueckt');
    var sp = [];
    for (var i = 0; i < 3; i++) {
      var w = Math.random() * Math.PI * 2;
      sp.push({wx: Math.cos(w), wy: Math.sin(w), r: 8 + Math.random() * 14});
    }
    tropfen.push({x: e.clientX, y: e.clientY, t: performance.now(), spritzer: sp});
    wecke();
  }, {passive: true});
  document.addEventListener('pointerup', function(){
    document.documentElement.classList.remove('stift-drueckt');
  }, {passive: true});

  /* Der Ring rastet auf Klickbarem ein; über Textfeldern weicht der Stift */
  document.addEventListener('pointerover', function(e){
    var wurzel = document.documentElement;
    var el = e.target instanceof Element ? e.target : null;
    wurzel.classList.toggle('stift-schreibt',
      !!(el && el.closest('input,textarea,select,[contenteditable]')));
    wurzel.classList.toggle('stift-fasst',
      !!(el && el.closest('a,button,[role="button"],label,summary,.zone')));
  }, {passive: true});

  document.addEventListener('mouseleave', function(){
    ring.style.opacity = 0; punkt.style.opacity = 0; da = false;
  });
  window.addEventListener('blur', function(){ spur.length = 0; });

  function male(){
    var jetzt = performance.now();
    while (spur.length && jetzt - spur[0].t > SPUR_DAUER) spur.shift();
    while (tropfen.length && jetzt - tropfen[0].t > TROPFEN_DAUER) tropfen.shift();

    /* der Ring federt der Spitze nach */
    rx += (mx - rx) * 0.22;
    ry += (my - ry) * 0.22;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    /* die Tintenspur: langsam gezogen ist sie satt, schnell wird sie dünn */
    for (var i = 1; i < spur.length; i++) {
      var a = spur[i - 1], b = spur[i];
      var alter = (jetzt - b.t) / SPUR_DAUER;
      var weite = Math.hypot(b.x - a.x, b.y - a.y);
      var staerke = Math.max(1, 3.6 - weite * 0.09);
      ctx.strokeStyle = 'rgba(90,76,214,' + (0.45 * (1 - alter)).toFixed(3) + ')';
      ctx.lineWidth = staerke * (1 - alter * 0.5);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    /* Klick-Tropfen: ein Kreis läuft aus, kleine Spritzer setzen sich daneben */
    for (var j = 0; j < tropfen.length; j++) {
      var tr = tropfen[j];
      var p = (jetzt - tr.t) / TROPFEN_DAUER;
      var weich = 1 - Math.pow(1 - p, 3);
      ctx.strokeStyle = 'rgba(90,76,214,' + (0.4 * (1 - p)).toFixed(3) + ')';
      ctx.lineWidth = 1.6 * (1 - p) + 0.4;
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, 5 + weich * 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(90,76,214,' + (0.5 * (1 - p)).toFixed(3) + ')';
      for (var k = 0; k < tr.spritzer.length; k++) {
        var s = tr.spritzer[k];
        ctx.beginPath();
        ctx.arc(tr.x + s.wx * s.r * weich, tr.y + s.wy * s.r * weich, 1.6 * (1 - p), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* schlafen, sobald nichts mehr zu malen ist und der Ring angekommen ist */
    if (spur.length || tropfen.length || Math.hypot(mx - rx, my - ry) > 0.5) {
      requestAnimationFrame(male);
    } else {
      wach = false;
    }
  }
})();
