/* quoroai-plattform-design · Die Bitten: was die Beratung vom Kunden braucht
   (Häppchen D1, Issue #38).

   Drei Dinge laufen im Produkt getrennt — Datei-Anfragen, Aufgaben für den
   Kunden, Abnahmen. Für den Kunden sind sie EINE Sache: irgendjemand wartet
   auf ihn. Deshalb sind sie hier eine Gattung mit drei Formen, und jede Bitte
   trägt drei Teile, die zusammen den Unterschied zwischen Beratung und
   Formular ausmachen:

     was  — in einem Satz, in seiner Sprache
     warum — was ohne ihn nicht weitergeht (ohne diesen Satz ist es ein Formular)
     wozu — genau EIN Griff, der die Bitte an Ort und Stelle erledigt

   Beantwortet wird dort, wo die Bitte steht. Keine Bitte schickt jemanden auf
   eine andere Fläche; die Datei wird an der Bitte selbst gewählt, die Antwort
   an der Bitte selbst getippt, die Abnahme an der Bitte selbst gegeben.

   Eine Quelle für alle Flächen: Übersicht, Unterlagen und das Gespräch zeigen
   dieselben Bitten und denselben Stand. Wer eine im Gespräch erledigt, findet
   sie auf der Übersicht erledigt vor (Vorführung: sessionStorage; im Produkt
   ist das der Server).

   Kein Deko-Punkt (Jonas' Regel): dass etwas offen ist, sagt der Satz und die
   Frist, kein farbiger Kreis. Erledigt zieht der Stift einen Haken — dieselbe
   Hand, die auf den quoroAI-Flächen zeigt und auf den Kundenflächen anstreicht.

   Aufruf: <div data-bitten></div> auf die Fläche setzen, danach
   Bitten.tafel({arten: ['datei']}) — ohne `arten` stehen alle.
   Für eigene Behälter (Karten im Gespräch): Bitten.inhalt(bitte) liefert den
   fertigen, bedienbaren Körper einer Bitte.

   Markenneutral: alle Farben kommen aus den Tokens der jeweiligen Fläche.
   Marker: BITTEN-V2 */
window.Bitten = (function () {
  'use strict';

  var Marke = window.Marke || {};
  /* Die Anrede ist ein Marken-Regler. Die meisten Flächen laden neu, wenn die
     Vorführung die Marke wechselt — das Gespräch nicht, dort wechselt sie im
     Stehen. Deshalb ist sie hier überschreibbar, und die stehenden Bitten
     zeichnen sich neu, statt in der alten Anrede weiterzureden. */
  var anredeSie = null;
  function sieGilt() { return anredeSie === null ? !!Marke.sie : anredeSie; }
  function rede(du, sie) { return sieGilt() ? sie : du; }
  function anrede(sie) {
    if (anredeSie === !!sie) return;
    anredeSie = !!sie;
    document.querySelectorAll('[data-bitte]').forEach(function (alt) {
      var b = finde(alt.dataset.bitte);
      if (!b || !alt.parentNode) return;
      /* Was schon getippt war, kommt mit: ein Markenwechsel ist eine Frage
         der Anrede, kein Grund, dem Kunden seinen Satz wegzunehmen. */
      var altesFeld = alt.querySelector('input[type=text]');
      var neu = inhalt(b);
      if (altesFeld && altesFeld.value) {
        var neuesFeld = neu.querySelector('input[type=text]');
        if (neuesFeld) {
          neuesFeld.value = altesFeld.value;
          neuesFeld.dispatchEvent(new Event('input'));
        }
      }
      alt.parentNode.replaceChild(neu, alt);
    });
  }

  /* ---------- Der Bestand ----------
     Vorführungsdaten zum Fall Petersen (Metallzulieferer), passend zu dem,
     was der Berater im Gespräch rechnet. Im Produkt kommt das vom Server. */
  var BITTEN = [
    {id: 'rahmenvertrag', art: 'datei',
     titel: 'Der unterschriebene Rahmenvertrag Stahl',
     warum: 'Meine Rechnung zum Einkauf steht auf der Fassung vom Mai. Die Preisgleitklausel endet am 30. September — steht im unterschriebenen Vertrag etwas anderes, liegt der Hebel um 21.000 € daneben.',
     frist: 'bis Freitag, sonst rechne ich ohne',
     wer: 'Dr. Anna Vogelsang'},
    {id: 'c-kunden', art: 'aufgabe',
     titel: function () { return rede('Nenn mir deine drei wichtigsten C-Kunden', 'Nennen Sie mir Ihre drei wichtigsten C-Kunden'); },
     warum: function () {
       return rede('Die Preiserhöhung trifft die C-Kunden zuerst. Welche drei du auf keinen Fall verlieren willst, nehme ich aus der Staffel heraus — das kostet rechnerisch 4.000 € und spart dir den Ärger.',
                   'Die Preiserhöhung trifft die C-Kunden zuerst. Welche drei Sie auf keinen Fall verlieren wollen, nehme ich aus der Staffel heraus — das kostet rechnerisch 4.000 € und spart Ihnen den Ärger.');
     },
     frist: 'vor dem Termin am Donnerstag',
     wer: 'Dr. Anna Vogelsang',
     platzhalter: 'Drei Namen reichen'},
    {id: 'preismodell', art: 'abnahme',
     titel: 'Das neue Preismodell freigeben',
     warum: function () {
       return rede('Mit deiner Freigabe schneide ich die Staffeln und lasse deine Preisliste neu rechnen. Vorher passiert nichts — und nach der Freigabe bekommen deine C-Kunden vier Wochen Vorlauf.',
                   'Mit Ihrer Freigabe schneide ich die Staffeln und lasse Ihre Preisliste neu rechnen. Vorher passiert nichts — und nach der Freigabe bekommen Ihre C-Kunden vier Wochen Vorlauf.');
     },
     frist: 'keine Eile, aber vor Woche 3',
     wer: 'Dr. Anna Vogelsang',
     woran: 'Preismodell Benchmark'}
  ];

  var ART_WORT = {datei: 'Unterlage', aufgabe: 'Aufgabe', abnahme: 'Abnahme'};
  var ZAHLWORT = ['Nichts', 'Eine Sache', 'Zwei Dinge', 'Drei Dinge', 'Vier Dinge', 'Fünf Dinge'];

  /* Stand der Vorführung überlebt den Flächenwechsel, nicht den Browser — und
     nicht den Wechsel der Beispielmarke: mit einer neuen Marke beginnt die
     Vorführung von vorn, sonst stünde bei Waldmann alles schon erledigt da
     und niemand bekäme die Bitten je wieder zu sehen. */
  var MARKENNAME = (Marke.daten && Marke.daten.name) || '';
  var STAND = {};
  try {
    var abgelegt = JSON.parse(sessionStorage.getItem('bitten-stand') || 'null');
    if (abgelegt && abgelegt.marke === MARKENNAME) STAND = abgelegt.stand || {};
  } catch (e) { STAND = {}; }
  function merke() {
    try { sessionStorage.setItem('bitten-stand', JSON.stringify({marke: MARKENNAME, stand: STAND})); } catch (e) {}
  }

  function wert(x) { return typeof x === 'function' ? x() : x; }
  function stand(b) { return (STAND[b.id] && STAND[b.id].stand) || 'offen'; }
  /* Was der Kunde eingegeben hat — sein Wortlaut, unverändert */
  function eingabe(b) { return (STAND[b.id] && STAND[b.id].eingabe) || ''; }
  /* Der Satz, der die erledigte Bitte beschreibt, entsteht beim Zeichnen.
     Eingefroren würde er nach einem Markenwechsel in der alten Anrede
     weiterreden — genau das, was anrede() verhindern soll. */
  function ergebnis(b) {
    var st = stand(b);
    if (st === 'offen') return '';
    if (st === 'rueckfrage') {
      return rede('Rückfrage gestellt: „' + eingabe(b) + '" Deine Beratung antwortet.',
                  'Rückfrage gestellt: „' + eingabe(b) + '" Ihre Beratung antwortet.');
    }
    if (b.art === 'abnahme') {
      return rede('Freigegeben. Deine Beratung setzt die Staffeln auf.',
                  'Freigegeben. Ihre Beratung setzt die Staffeln auf.');
    }
    return 'Geschickt: ' + eingabe(b);
  }

  function finde(id) {
    return BITTEN.filter(function (b) { return b.id === id; })[0] || null;
  }
  function liste(arten) {
    if (!arten || !arten.length) return BITTEN.slice();
    return BITTEN.filter(function (b) { return arten.indexOf(b.art) !== -1; });
  }
  function offen(arten) {
    return liste(arten).filter(function (b) { return stand(b) === 'offen'; }).length;
  }
  /* Eine gestellte Rückfrage ist weder offen noch erledigt: sie liegt bei der
     Beratung. Wer sie als erledigt zählte, behauptete, die Abnahme sei
     gegeben — sie ist es nicht. */
  function wartend(arten) {
    return liste(arten).filter(function (b) { return stand(b) === 'rueckfrage'; }).length;
  }
  function zahlwort(n) { return ZAHLWORT[n] || (n + ' Dinge'); }

  var hoerer = [];
  function abonniere(fn) { hoerer.push(fn); }
  function rufe(id) { hoerer.forEach(function (fn) { try { fn(id); } catch (e) {} }); }

  /* ---------- Der Stil ---------- */
  var stilDa = false;
  function stil() {
    if (stilDa) return;
    stilDa = true;
    var akzent = 'var(--blau, var(--lila-600, #6f63e8))';
    var stift  = 'var(--stift, var(--lila-700, #5a4fd0))';
    var linie  = 'var(--linie, var(--nebel-200, #e9e8f1))';
    var grau   = 'var(--grau, var(--nebel-500, #7f7d93))';
    var tinte  = 'var(--tinte, #18152f)';
    var rund   = 'var(--radius, 16px)';
    var s = document.createElement('style');
    s.textContent =
      '.bitten-tafel{display:flex;flex-direction:column;gap:12px;margin-top:14px}' +
      '.bitten-satz{font-size:12.5px;color:' + grau + ';margin-top:2px}' +
      '.bitte{position:relative;background:#fff;border:0.5px solid ' + linie + ';' +
        'border-radius:' + rund + ';padding:18px 20px;box-shadow:0 6px 20px rgba(16,19,26,.05);' +
        'transition:border-color .3s ease,opacity .4s ease}' +
      /* Im Gespräch sitzt die Bitte schon in einer Karte — dann trägt sie
         weder Rahmen noch Schatten ein zweites Mal */
      '.karte .bitte{border:0;box-shadow:none;padding:0;background:none}' +
      '.bitte-kopf{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}' +
      '.bitte-art{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:' + akzent + '}' +
      '.bitte.fertig .bitte-art{color:' + grau + '}' +
      '.bitte-wer{font-size:11.5px;color:' + grau + '}' +
      '.bitte-titel{font-size:16px;font-weight:800;letter-spacing:-.01em;color:' + tinte + ';margin-top:4px}' +
      '.bitte.fertig .bitte-titel{color:' + grau + '}' +
      '.bitte-warum{font-size:14px;color:' + grau + ';margin-top:6px;max-width:58ch;line-height:1.55}' +
      '.bitte-frist{font-size:12.5px;font-weight:700;color:' + tinte + ';margin-top:10px}' +
      '.bitte-tun{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px}' +
      '.bitte-tun input[type=text]{flex:1 1 240px;min-width:0;min-height:46px;padding:0 16px;' +
        'border-radius:12px;border:0.5px solid ' + linie + ';background:#fff;' +
        'font-family:inherit;font-size:15px;color:' + tinte + ';outline:none}' +
      '.bitte-tun input[type=text]:focus{border-color:' + akzent + '}' +
      '.bitte-haupt{min-height:46px;padding:0 22px;border-radius:999px;border:0;background:' + tinte + ';' +
        'color:#fff;font-family:inherit;font-size:14.5px;font-weight:700;cursor:pointer;transition:background .2s ease}' +
      /* Am Finger gibt es kein Überfahren: ohne diese Schranke bliebe der
         zuletzt berührte Knopf hängen und sähe aus wie ausgewählt */
      '@media (hover:hover){.bitte-haupt:hover{background:' + akzent + '}}' +
      '.bitte-haupt:disabled{background:rgba(16,19,26,.18);cursor:not-allowed}' +
      '.bitte-neben{min-height:46px;padding:0 18px;border-radius:999px;border:0.5px solid ' + linie + ';' +
        'background:#fff;font-family:inherit;font-size:14.5px;font-weight:700;color:' + grau + ';cursor:pointer;' +
        'transition:border-color .2s ease,color .2s ease}' +
      '@media (hover:hover){.bitte-neben:hover{border-color:' + akzent + ';color:' + akzent + '}}' +
      /* Wartend ist ein eigener Zustand: kein Haken, aber auch nicht grau
         weggelegt — die Sache ist noch im Gang. */
      '.bitte.wartet{border-color:' + akzent + '}' +
      '.bitte-wartet-zeile{margin-top:12px;font-size:13.5px;font-weight:700;color:' + akzent + '}' +
      '.bitte-fertig-zeile{display:flex;align-items:center;gap:12px;margin-top:12px;font-size:13.5px;color:' + grau + '}' +
      '.bitte-haken{width:26px;height:26px;flex-shrink:0}' +
      '.bitte-haken path{fill:none;stroke:' + stift + ';stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;' +
        'stroke-dasharray:40;stroke-dashoffset:40}' +
      '.bitte-haken.zieht path{transition:stroke-dashoffset .5s cubic-bezier(.45,.05,.55,.95);stroke-dashoffset:0}' +
      '.bitte-leer{font-size:14px;color:' + grau + '}' +
      '@media (prefers-reduced-motion:reduce){' +
        '.bitte{transition:none}' +
        '.bitte-haken path{stroke-dashoffset:0}' +
        '.bitte-haken.zieht path{transition:none}}' +
      '@media (max-width:520px){' +
        /* Am Finger trägt jeder Griff die volle Breite, statt sich zu zweit
           eine Zeile zu teilen und dabei unter die Tippgröße zu fallen */
        '.bitte-tun{flex-direction:column;align-items:stretch}' +
        '.bitte-tun input[type=text],.bitte-haupt,.bitte-neben{width:100%}}';
    document.head.appendChild(s);
  }

  /* ---------- Ein Körper je Bitte ---------- */
  function haken() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'bitte-haken');
    svg.setAttribute('viewBox', '0 0 26 26');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<path d="M4 14 L10 21 L22 5"/>';
    return svg;
  }

  function inhalt(b) {
    stil();
    var el = document.createElement('div');
    el.className = 'bitte';
    el.dataset.bitte = b.id;
    el.dataset.art = b.art;

    var kopf = document.createElement('div');
    kopf.className = 'bitte-kopf';
    var art = document.createElement('span');
    art.className = 'bitte-art';
    art.textContent = ART_WORT[b.art] || 'Bitte';
    var wer = document.createElement('span');
    wer.className = 'bitte-wer';
    wer.textContent = 'von ' + wert(b.wer);
    kopf.appendChild(art);
    kopf.appendChild(wer);

    var titel = document.createElement('div');
    titel.className = 'bitte-titel';
    titel.textContent = wert(b.titel);

    el.appendChild(kopf);
    el.appendChild(titel);

    if (stand(b) === 'erledigt') {
      el.classList.add('fertig');
      el.appendChild(fertigZeile(ergebnis(b), false));
      return el;
    }

    var warum = document.createElement('p');
    warum.className = 'bitte-warum';
    warum.textContent = wert(b.warum);
    el.appendChild(warum);

    /* Rückfrage gestellt: der Grund bleibt stehen, der Griff geht weg — und
       kein Haken, denn getan ist nichts. Jetzt ist die Beratung am Zug. */
    if (stand(b) === 'rueckfrage') {
      el.classList.add('wartet');
      var w = document.createElement('div');
      w.className = 'bitte-wartet-zeile';
      w.setAttribute('role', 'status');
      w.textContent = ergebnis(b);
      el.appendChild(w);
      return el;
    }

    var frist = document.createElement('div');
    frist.className = 'bitte-frist';
    frist.textContent = wert(b.frist);
    el.appendChild(frist);
    el.appendChild(griffe(b, el));
    return el;
  }

  function fertigZeile(text, zeichnen) {
    var zeile = document.createElement('div');
    zeile.className = 'bitte-fertig-zeile';
    zeile.setAttribute('role', 'status');
    var h = haken();
    var wort = document.createElement('span');
    wort.textContent = text;
    zeile.appendChild(h);
    zeile.appendChild(wort);
    /* Der Stift zieht den Haken erst, wenn die Zeile steht — sonst läuft die
       Linie ins Leere, bevor das Auge sie findet */
    if (zeichnen) requestAnimationFrame(function () { h.classList.add('zieht'); });
    else h.classList.add('zieht');
    return zeile;
  }

  /* Genau ein Griff je Bitte — und wo eine Rückfrage möglich sein muss,
     ein zweiter, der nichts entscheidet, sondern fragt. */
  function griffe(b, el) {
    var lage = document.createElement('div');
    lage.className = 'bitte-tun';

    if (b.art === 'datei') {
      var wahl = document.createElement('input');
      wahl.type = 'file';
      wahl.hidden = true;
      var knopf = document.createElement('button');
      knopf.type = 'button';
      knopf.className = 'bitte-haupt';
      knopf.textContent = 'Unterlage wählen';
      knopf.addEventListener('click', function () { wahl.click(); });
      wahl.addEventListener('change', function () {
        var datei = wahl.files && wahl.files[0];
        if (!datei) return;
        loese(b.id, datei.name, 'erledigt', el);
      });
      lage.appendChild(knopf);
      lage.appendChild(wahl);
      return lage;
    }

    if (b.art === 'aufgabe') {
      var feld = document.createElement('input');
      feld.type = 'text';
      feld.placeholder = b.platzhalter || '';
      feld.setAttribute('aria-label', wert(b.titel));
      var ab = document.createElement('button');
      ab.type = 'button';
      ab.className = 'bitte-haupt';
      ab.textContent = 'Abschicken';
      ab.disabled = true;
      feld.addEventListener('input', function () { ab.disabled = !feld.value.trim(); });
      feld.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && feld.value.trim()) ab.click();
      });
      ab.addEventListener('click', function () {
        var t = feld.value.trim();
        if (!t) return;
        loese(b.id, t, 'erledigt', el);
      });
      lage.appendChild(feld);
      lage.appendChild(ab);
      return lage;
    }

    /* Abnahme: freigeben ist eine Entscheidung, die Rückfrage ist keine —
       deshalb steht sie daneben und nicht als zweite Entscheidung darunter. */
    var ja = document.createElement('button');
    ja.type = 'button';
    ja.className = 'bitte-haupt';
    ja.textContent = 'Freigeben';
    ja.addEventListener('click', function () {
      loese(b.id, '', 'erledigt', el);
    });
    var frag = document.createElement('button');
    frag.type = 'button';
    frag.className = 'bitte-neben';
    /* Der Kunde spricht von sich selbst — die Anrede der Beratung ändert
       daran nichts, sonst wird aus einem Menschen ein „wir". */
    frag.textContent = 'Ich habe eine Rückfrage';
    frag.addEventListener('click', function () {
      lage.textContent = '';
      var feld2 = document.createElement('input');
      feld2.type = 'text';
      feld2.placeholder = rede('Was willst du wissen?', 'Was wollen Sie wissen?');
      feld2.setAttribute('aria-label', 'Rückfrage zur Abnahme');
      var senden = document.createElement('button');
      senden.type = 'button';
      senden.className = 'bitte-haupt';
      senden.textContent = 'Fragen';
      senden.disabled = true;
      feld2.addEventListener('input', function () { senden.disabled = !feld2.value.trim(); });
      feld2.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && feld2.value.trim()) senden.click();
      });
      senden.addEventListener('click', function () {
        loese(b.id, feld2.value.trim(), 'rueckfrage', el);
      });
      lage.appendChild(feld2);
      lage.appendChild(senden);
      feld2.focus();
    });
    lage.appendChild(ja);
    lage.appendChild(frag);
    return lage;
  }

  /* ---------- Erledigen ---------- */
  function loese(id, eingegeben, art, herkunft) {
    var b = finde(id);
    if (!b) return;
    STAND[id] = {stand: art || 'erledigt', eingabe: eingegeben || ''};
    merke();
    var text = ergebnis(b);
    /* Jede sichtbare Ausfertigung dieser Bitte legt sich hin — auf jeder
       Fläche, die gerade offen ist, und auch in der Karte im Gespräch */
    var wartet = stand(b) === 'rueckfrage';
    document.querySelectorAll('[data-bitte="' + id + '"]').forEach(function (el) {
      if (el.classList.contains('fertig') || el.classList.contains('wartet')) return;
      el.classList.add(wartet ? 'wartet' : 'fertig');
      /* Bei einer Rückfrage bleibt der Grund stehen — er ist der Zusammenhang,
         in dem die Antwort der Beratung gleich ankommt. */
      var weg = el.querySelectorAll(wartet ? '.bitte-frist, .bitte-tun' : '.bitte-warum, .bitte-frist, .bitte-tun');
      weg.forEach(function (x) { x.remove(); });
      if (wartet) {
        var w = document.createElement('div');
        w.className = 'bitte-wartet-zeile';
        w.setAttribute('role', 'status');
        w.textContent = text;
        el.appendChild(w);
      } else {
        el.appendChild(fertigZeile(text, true));
      }
    });
    /* Die Fläche darf antworten, und zwar dort, wo der Kunde gedrückt hat:
       das Ereignis steigt von SEINER Karte auf, nicht von der ersten im
       Dokument. Im Gespräch entscheidet das, in welches Kapitel die Antwort
       des Beraters läuft. */
    var quelle = (herkunft && herkunft.isConnected) ? herkunft : document.querySelector('[data-bitte="' + id + '"]');
    if (quelle) {
      quelle.dispatchEvent(new CustomEvent('bitte-erledigt', {
        bubbles: true, detail: {id: id, art: b.art, stand: stand(b)}
      }));
    }
    rufe(id);
  }

  /* ---------- Die Tafel: die stehende Liste auf einer Fläche ---------- */
  function tafel(opts) {
    stil();
    opts = opts || {};
    var ziel = opts.ziel || document.querySelector('[data-bitten]');
    if (!ziel) return null;
    var arten = opts.arten || null;

    var lage = document.createElement('div');
    lage.className = 'bitten-tafel';
    ziel.textContent = '';
    ziel.appendChild(lage);

    function male() {
      lage.textContent = '';
      var alle = liste(arten);
      /* „nurOffene" heißt: alles, was noch nicht durch ist — eine gestellte
         Rückfrage gehört dazu, sie ist nicht erledigt. */
      var zeigen = opts.nurOffene ? alle.filter(function (b) { return stand(b) !== 'erledigt'; }) : alle;
      if (!zeigen.length) {
        var p = document.createElement('p');
        p.className = 'bitte-leer';
        p.textContent = opts.leer || rede('Gerade wartet nichts auf dich.', 'Gerade wartet nichts auf Sie.');
        lage.appendChild(p);
        return;
      }
      zeigen.forEach(function (b) { lage.appendChild(inhalt(b)); });
    }
    male();

    abonniere(function () {
      /* Eine Tafel, die nur Offenes führt, räumt die erledigte Bitte weg —
         aber nicht in derselben Sekunde. Erst zieht der Stift seinen Haken,
         dann geht die Karte. Sonst quittiert niemand, was gerade geschickt
         wurde, und die Fläche sieht aus, als sei nichts passiert. */
      if (!opts.nurOffene) {
        if (typeof opts.aufAenderung === 'function') opts.aufAenderung(offen(arten), wartend(arten));
        return;
      }
      var reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(function () {
        lage.querySelectorAll('.bitte.fertig').forEach(function (el) { el.style.opacity = '0'; });
        setTimeout(function () {
          male();
          if (typeof opts.aufAenderung === 'function') opts.aufAenderung(offen(arten), wartend(arten));
        }, reduziert ? 0 : 420);
      }, reduziert ? 0 : 1500);
    });
    if (typeof opts.aufAenderung === 'function') opts.aufAenderung(offen(arten), wartend(arten));
    return {male: male};
  }

  return {
    liste: liste, offen: offen, wartend: wartend, zahlwort: zahlwort, finde: finde,
    inhalt: inhalt, tafel: tafel, loese: loese, abonniere: abonniere,
    anrede: anrede, stand: stand, ergebnis: ergebnis, eingabe: eingabe
  };
})();
