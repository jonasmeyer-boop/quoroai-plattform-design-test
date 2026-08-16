/* quoroai-plattform-design · Die Dokumente der Vorführung, eine Quelle
   (Häppchen D4 Teil 1 „Ansehen", Issue #41).

   Seit man Dokumente aufschlagen kann (blatt.js), steht derselbe Vertrag auf
   mehreren Flächen: der Rahmenvertrag liegt in der Kundenakte, beim Kunden in
   den Unterlagen und im mitgelesenen Gespräch als Beleg. Dreimal derselbe Text
   in drei Dateien wäre dreimal die Gelegenheit, dass er auseinanderläuft — und
   ein Beleg, der etwas anderes sagt als das Dokument, auf das er zeigt, ist
   schlimmer als kein Beleg.

   Hier steht der Inhalt, einmal. Wer ihn zeigt, holt ihn und legt seine eigene
   Sicht darüber:

     Blaetter.hol('rahmenvertrag', {meta: '14 Seiten, vom Kunden, 12. Juni',
                                    fund: {seite: 2, wort: 'Preisgleitklausel'}})

   Zurück kommt immer eine frische Kopie — die Fläche darf hineinschreiben
   (aus, griffe, fuss), ohne dass es die nächste trifft.

   Was NICHT hierher gehört: Meta-Zeilen („von dir, 4. August"), Fußsätze,
   Griffe, Fundstellen. Das ist die Sicht der Fläche, nicht der Inhalt des
   Dokuments — beim Kunden heißt dasselbe Blatt anders als in der Akte.

   Ein Block darf einen Vorschlag des KI-Beraters tragen (Häppchen D4 Teil 2):
     {p: 'Der Satz, wie er heute dasteht.',
      feder: {grund: 'Warum er ihn ändern würde.', neu: 'Der neue Wortlaut.'}}
   Der Vorschlag gehört zum Inhalt und nicht zur Sicht: er hängt an einem
   bestimmten Satz, und derselbe Satz steht auf jeder Fläche gleich.

   Geschrieben wird hier nie: die Seiten oben sind die Quelle und bleiben es.
   Wo offenes Papier entsteht, zieht blatt.js sich eine eigene Fassung.

   Ein Block darf statt Sätzen eine Tafel tragen (Häppchen D4 Teil 3):
     {tafel: {beschreibung: '…', striche: [{kasten: […]}, {pfeil: […]}],
              worte: [{x: …, y: …, t: 'Stahlpreis'}]}}
   Die Striche stehen im Maß der Tafel (1000 × 1290), nicht in Pixeln, und die
   Hand wackelt aus den Koordinaten heraus — dieselbe Zeichnung sieht beim
   zweiten Aufschlagen genauso aus. Der Vorschlag des KI-Beraters liegt in
   feder.pause und wird als Pauspapier über die Tafel gelegt.
   V4 (Issue #50): die Akten von Cordes, Freitag und MTS stehen hier neben
   der von Petersen. Ohne sie konnte ein Beleg die Akte eines anderen
   Mandanten nur benennen, nicht öffnen.
   V5 (Issue #53/#54): der Beratungsvertrag nennt Zahlen statt Prosa —
   Pauschale 2.400,00 € netto im Monat (2.856,00 € brutto), Laufzeit
   1. Mai 2026 bis 30. April 2027, Kündigung bis 31. Januar 2027. Die
   Zahlen sind dieselben wie in der Honorar-Kalkulation (2.400 − 1.715 =
   685 Deckungsbeitrag, 28,5 %) und dieselben, die rechnungen.html stellt.
   Wer hier eine Zahl ändert, ändert die Rechnung mit.
   V6 (Welle 3): die Monatsauswertung Juli erklärt den Margenverlust wie das
   Balkenbild des KI-Beraters — Preisdruck, Stahlpreis, Ausschuss — statt wie
   vorher aus Stahleinkauf und Personalaufbau. Zwei Erklärungen desselben
   Betriebs, nebeneinander aufgeschlagen, sind schlimmer als eine grobe. Und
   die 31,4 Prozent sagen jetzt, dass sie der Monat sind und nicht das Jahr,
   in dem 30,4 Prozent stehen.
   Marker: BLAETTER-V6 (eine Erklärung für einen Betrieb) */
window.Blaetter = (function () {
  'use strict';

  var DOKUMENTE = {

    /* ---------- Die Akte des Mandats Petersen ---------- */
    monatsauswertung: {
      titel: 'Monatsauswertung Juli', seitenGesamt: 8,
      seiten: [
        [{h: 'Monatsauswertung Juli 2026'},
         {klein: 'Petersen Stahlbau GmbH, Brookweg 14, 26123 Oldenburg. Erstellt am 4. August 2026 von {beratung}.'},
         {p: 'Der Juli schließt mit 361.000 € Umsatz, gut vier Prozent über dem Vorjahresmonat. Der Rohertrag bleibt mit 31,4 Prozent hinter dem Vorjahr zurück; getragen hat den Monat die Menge, nicht der Preis. Die 31,4 Prozent sind die Marge dieses einen Monats — über das laufende Jahr gerechnet liegt sie bei 30,4 Prozent, und daran wird sie sonst gemessen.'},
         {tab: [['Kennzahl', 'Juli 2026', 'Juli 2025'],
                ['Umsatz', '361.000 €', '346.500 €'],
                ['Rohertrag', '113.400 €', '116.200 €'],
                ['Rohertragsmarge', '31,4 %', '33,5 %'],
                ['Personalkosten', '141.800 €', '134.100 €'],
                ['Betriebsergebnis', '18.900 €', '27.400 €']]},
         /* Hier stand: „Zwei Drittel des Margenverlusts stammen aus dem
            Stahleinkauf, ein Drittel aus dem Personalaufbau in der
            Vorfertigung." Das Balkenbild des KI-Beraters, das auf allen
            Flächen gleich lautet (gespraech.html, beratung-mitlesen.html,
            beratung-protokoll.html), nennt drei ganz andere Treiber: 5,8
            Punkte Verlust, davon 3,1 Preisdruck, 1,8 Stahlpreis, 0,9
            Ausschuss — der Stahl ist knapp ein Drittel, Personal kommt gar
            nicht vor. Wer das Blatt neben dem Gespräch aufschlug, las zwei
            Erklärungen desselben Betriebs. Es gilt das Bild. Die 2,1 Punkte
            dieses Monats sind in denselben Verhältnissen zerlegt, und dass
            der Personalaufbau hier fehlt, sagt der Satz selbst — auf Seite 3
            steht ohnehin, dass er erst ab Oktober auf die Stückkosten
            wirkt. */
         {p: 'Der Rückgang von 33,5 auf 31,4 Prozent, also 2,1 Punkte gegenüber dem Juli 2025, hat dieselben drei Adressen wie das Jahr: 1,1 Punkte Preisdruck, 0,7 Punkte Stahlpreis, 0,3 Punkte Ausschuss. Der Personalaufbau in der Vorfertigung steckt darin noch nicht — er wirkt erst ab Oktober auf die Stückkosten.'}],
        /* Abschnitt 2 ist die Stelle, die der KI-Berater im Gespräch zitiert —
           wortgleich. Ein Beleg, der auf eine Seite zeigt, auf der sein Satz
           nicht steht, wäre schlimmer als gar keiner. */
        [{h: '2. Rohertrag je Auftrag'},
         {p: 'Der Rohertrag je Auftrag lag im Juli bei 31,8 Prozent — im April noch bei 34,6. Der Materialanteil stieg im gleichen Zeitraum um 2,1 Punkte.'},
         {tab: [['Monat', 'Rohertrag je Auftrag', 'Materialanteil'],
                ['April', '34,6 %', '49,8 %'],
                ['Mai', '33,9 %', '50,4 %'],
                ['Juni', '32,7 %', '51,2 %'],
                ['Juli', '31,8 %', '51,9 %']]},
         {p: 'Der Verlauf ist stetig, nicht sprunghaft: es ist kein einzelner Auftrag, sondern der Einkaufspreis, der die Marge Monat für Monat abträgt.'}],
        [{h: 'Marge nach Kundengruppe'},
         {p: 'Die C-Kunden tragen ein Fünftel des Umsatzes und ein Zehntel des Rohertrags. Sie sind die Gruppe, in der eine Preisanpassung am wenigsten kostet und am meisten bringt.'},
         {tab: [['Gruppe', 'Umsatz', 'Marge'],
                ['A-Kunden', '164.000 €', '36,1 %'],
                ['B-Kunden', '124.000 €', '30,8 %'],
                ['C-Kunden', '73.000 €', '22,4 %']]},
         {h: 'Was daraus folgt'},
         {liste: ['Der Stahleinkauf braucht bis zum 30. September einen neuen Rahmen.',
                  'Die Staffeln der C-Kunden sind seit 2023 unverändert.',
                  'Der Personalaufbau ist entschieden und wirkt erst ab Oktober auf die Stückkosten.']}]
      ]
    },

    rahmenvertrag: {
      titel: 'Rahmenvertrag Stahl', seitenGesamt: 14,
      seiten: [
        [{h: 'Rahmenvereinbarung über die Lieferung von Stahlerzeugnissen'},
         {klein: 'zwischen der Petersen Stahlbau GmbH, Oldenburg, im Folgenden Besteller, und der Nordstahl Handel KG, Bremen, im Folgenden Lieferant.'},
         {h: '1. Gegenstand'},
         {p: 'Der Lieferant liefert dem Besteller Walzstahl, Profile und Bleche nach den Spezifikationen der Anlage 1. Diese Vereinbarung begründet keine Abnahmeverpflichtung; sie regelt die Bedingungen, zu denen Einzelabrufe erfolgen.'},
         {h: '2. Laufzeit'},
         {p: 'Die Vereinbarung läuft vom 1. Oktober 2024 bis zum 30. September 2026. Sie verlängert sich um jeweils zwölf Monate, wenn sie nicht drei Monate vor Ablauf schriftlich gekündigt wird.'}],
        [{h: '3. Preise und Preisanpassung'},
         {p: '3.1 Die Preise ergeben sich aus der Preisliste der Anlage 2, gültig ab dem 1. Oktober 2024.'},
         {p: '3.2 Die Preisgleitklausel nach Ziffer 3.2 endet zum 30. September; danach gilt der Tagespreis des Lieferanten, sofern kein neuer Rahmen vereinbart ist.'},
         {p: '3.3 Preisänderungen sind dem Besteller spätestens vier Wochen vor Wirksamkeit schriftlich anzuzeigen. Bereits bestätigte Abrufe bleiben unberührt.'},
         {h: '4. Mengen und Abrufe'},
         {p: 'Abrufe erfolgen schriftlich mit einer Vorlaufzeit von zehn Werktagen. Der Lieferant hält für den Besteller eine Bereitstellungsmenge von 40 Tonnen vor.'}]
      ]
    },

    benchmark: {
      titel: 'Preismodell Benchmark', seitenGesamt: 12,
      seiten: [
        [{h: 'Preismodell Benchmark'},
         {klein: 'Erstellt vom KI-Berater im Gespräch mit Matthias Petersen. Grundlage: Monatsauswertung Juli, Rahmenvertrag Stahl, Branchenspiegel Metallzulieferer 2025.'},
         {h: 'Das Wichtigste in Kürze'},
         {p: 'Eine Preisanpassung von vier Prozent auf die C-Kunden bringt rechnerisch 38.000 € im Jahr — auch dann, wenn jeder zwanzigste Auftrag dadurch verloren geht. Die Staffeln werden neu geschnitten, A- und B-Kunden bleiben unberührt.'},
         {h: 'Staffeln heute und neu'},
         {tab: [['Abnahme', 'heute', 'neu'],
                ['bis 500 Stück', 'Liste', 'Liste +4 %'],
                ['bis 2.000 Stück', '−3 %', '−2 %'],
                ['ab 2.000 Stück', '−7 %', '−5 %']]}],
        [{h: 'Der Rechenweg'},
         {p: 'Ausgangspunkt ist der C-Kunden-Umsatz von 876.000 € im Jahr bei 22,4 Prozent Marge. Vier Prozent Preis wirken voll auf den Rohertrag, weil die Stückkosten unverändert bleiben.'},
         {tab: [['Schritt', 'Betrag'],
                ['C-Umsatz im Jahr', '876.000 €'],
                ['Preiswirkung 4 %', '+35.040 €'],
                ['Wegfall Staffelrabatt', '+8.700 €'],
                ['Abgang, 5 % Auftragsverlust', '−5.740 €'],
                ['Wirkung im Jahr', '+38.000 €']]},
         {h: 'Der Branchenvergleich'},
         {p: 'Die C-Kunden zahlen heute rund sechs Prozent unter dem Schnitt vergleichbarer Zulieferer. Die vier Prozent holen die Hälfte davon auf — genug für die Marge, zu wenig für einen Wechselgrund.'}]
      ]
    },

    honorar: {
      titel: 'Honorar-Kalkulation 2026', seitenGesamt: 2,
      seiten: [
        [{h: 'Honorar-Kalkulation Mandat Petersen 2026'},
         {klein: 'Intern. Nicht freigegeben, nicht eingelesen.'},
         {p: 'Grundlage der Pauschale von 2.400 € netto im Monat — auf der Rechnung 2.856 € brutto —: 14 Stunden Beratung, davon 9 durch Dr. Vogelsang, sowie das KI-Kontingent von 40 Fragen.'},
         {tab: [['Position', 'Menge', 'Kosten'],
                ['Dr. Vogelsang, Partnerin', '9 h', '1.170 €'],
                ['Beratung Senior', '5 h', '425 €'],
                ['KI-Verbrauch, Schnitt', '40 Fragen', '31 €'],
                ['Plattformgebühr', '', '89 €'],
                ['Summe Kosten', '', '1.715 €'],
                ['Deckungsbeitrag', '', '685 €']]},
         {p: 'Die Marge liegt bei 28,5 Prozent und damit knapp über der Hausgrenze von 27 Prozent. Fällt der Aufwand wie im Juni auf 11 Stunden, sind es 34 Prozent.'}],
        [{h: 'Was der Kunde davon sieht'},
         {p: 'Auf seiner Rechnung steht eine Zeile: die Pauschale, 2.400,00 € netto. Die Zerlegung darunter ist unsere Sache und bleibt es. Auslagen werden gesondert erfasst und einzeln ausgewiesen.'},
         {klein: 'Freigabe an den Kunden ist ausdrücklich ausgeschlossen. Auch der KI-Berater liest dieses Blatt nicht, sonst könnte er daraus zitieren.'}]
      ]
    },

    beratungsvertrag: {
      titel: 'Beratungsvertrag', seitenGesamt: 4,
      seiten: [
        [{h: 'Beratungsvertrag'},
         {klein: 'zwischen {beratung} und der Petersen Stahlbau GmbH, Oldenburg.'},
         {h: '1. Gegenstand'},
         {p: 'Die Beratung übernimmt die laufende betriebswirtschaftliche Begleitung des Mandanten. Dazu gehören die monatliche Auswertung, der Zugang zum KI-Berater und die Beratungsgespräche.'},
         {h: '2. Vergütung'},
         {p: 'Es gilt eine monatliche Pauschale von 2.400,00 € zuzüglich Umsatzsteuer. Sie deckt alle Leistungen nach Ziffer 1 ab, gleichgültig wie viele Stunden dafür anfallen; Auslagen werden gesondert und einzeln abgerechnet. Die Rechnung wird am ersten Tag des Folgemonats gestellt und ist innerhalb von zehn Tagen fällig.'},
         {h: '3. Laufzeit'},
         {p: 'Der Vertrag läuft vom 1. Mai 2026 bis zum 30. April 2027, also zwölf Monate, und verlängert sich stillschweigend um jeweils zwölf Monate. Die Kündigungsfrist beträgt drei Monate zum Laufzeitende — für die erste Laufzeit ist das der 31. Januar 2027.'},
         {h: 'Die drei Zahlen auf einen Blick'},
         {tab: [['Punkt', 'Es gilt'],
                ['Pauschale im Monat, netto', '2.400,00 €'],
                ['Umsatzsteuer 19 %', '456,00 €'],
                ['Zu zahlen im Monat', '2.856,00 €'],
                ['Laufzeit', 'zwölf Monate, bis 30. April 2027'],
                ['Kündigungsfrist', 'drei Monate, also bis 31. Januar 2027']]}],
        [{h: '4. Vertraulichkeit'},
         {p: 'Beide Seiten behandeln alle Unterlagen vertraulich. Die Beratung setzt Unterlagen des Mandanten ausschließlich für dessen eigenes Mandat ein.'},
         {h: '5. Der KI-Berater'},
         {p: 'Der Mandant erhält Zugang zu einem KI-Berater, der auf die Unterlagen dieses Mandats und auf die Methodik der Beratung zugreift. Antworten nennen ihre Fundstelle. Die Verantwortung für Entscheidungen bleibt beim Mandanten.'},
         {klein: 'Es folgen die Anlagen 1 und 2 auf den Seiten 3 und 4.'}]
      ]
    },

    /* Das eine Blatt, das gerade entsteht ---------------------------------
       Alles andere hier ist fertiges Papier: hochgeladen, unterschrieben,
       eingelesen. Der Vermerk ist der Gegenfall — er wird geschrieben, während
       man ihn ansieht, und der KI-Berater hat dazu drei Vorschläge, die er
       NICHT selbst hineinschreibt (Häppchen D4 Teil 2). */
    vermerk: {
      titel: 'Vermerk zum Preisgespräch', seitenGesamt: 2,
      seiten: [
        [{h: 'Vermerk zum Preisgespräch Petersen'},
         {klein: 'Entwurf, Dr. Anna Vogelsang, {beratung}. Grundlage: Monatsauswertung Juli, Preismodell Benchmark, Fallsammlung Margenprojekte.'},
         {h: 'Worum es geht'},
         {p: 'Die C-Kunden zahlen seit 2023 unveränderte Preise, während der Stahleinkauf die Marge Monat für Monat abträgt. Wir schlagen eine Anhebung von vier Prozent zum 1. Oktober vor.',
          feder: {grund: 'Der Absatz nennt den Vorschlag, aber nicht seine Wirkung — und nicht, was in vergleichbaren Mandaten wirklich passiert ist. Beides steht in euren eigenen Unterlagen.',
                  neu: 'Die C-Kunden zahlen seit 2023 unveränderte Preise, während der Stahleinkauf die Marge Monat für Monat abträgt. Wir schlagen eine Anhebung von vier Prozent zum 1. Oktober vor. Rechnerisch sind das 38.000 € im Jahr. In vier vergleichbaren Mandaten der Fallsammlung sind dabei zwischen null und neun von je hundert Kunden abgesprungen.'}},
         {h: 'Die Zahlen dahinter'},
         {tab: [['', 'heute', 'nach dem Schritt'],
                ['Rohertragsmarge', '31,4 %', '33,1 %'],
                ['C-Umsatz im Jahr', '876.000 €', '911.000 €'],
                ['Wirkung im Jahr', '', '+38.000 €']]},
         {p: 'Der Branchenspiegel weist für Betriebe dieser Größe einen Median von 35,9 Prozent aus. Auch nach dem Schritt liegt Petersen darunter.'}],

        [{h: 'Wie wir es ihm sagen'},
         {p: 'Wir gehen mit einer Zahl hinein und lassen uns nicht auf eine Spanne ein.',
          feder: {grund: 'Eure Hausmethodik sagt das schärfer, und sie sagt auch, warum.',
                  neu: 'Eine Preisanhebung wird nicht verhandelt, sie wird begründet. Wer mit einer Spanne ins Gespräch geht, hat den unteren Wert schon vergeben.'}},
         {liste: ['Was sich geändert hat, in Zahlen, ohne Klage.',
                  'Was gleich bleibt: Lieferzeit, Ansprechpartner, Qualität.',
                  'Ab wann es gilt, mit Vorlauf für eine letzte Bestellung zum alten Preis.']},
         {h: 'Was offen ist'},
         {p: 'Der Rahmenvertrag mit Nordstahl läuft aus. Ob die vier Prozent reichen, hängt daran, was der neue Einkaufspreis wird.',
          feder: {grund: 'Der Vertrag nennt ein Datum, und es ist nah. Ohne das Datum liest sich der Satz wie eine Sorge statt wie eine Frist.',
                  neu: 'Der Rahmenvertrag mit Nordstahl endet am 30. September, danach gilt der Tagespreis. Ob die vier Prozent reichen, entscheidet sich am neuen Einkaufspreis — die Verhandlung gehört vor das Preisgespräch, nicht danach.'}},
         {klein: 'Solange dieser Vermerk ein Entwurf ist, sieht ihn außer euch niemand.'}]
      ]
    },

    /* Das Blatt, auf dem gezeichnet wird (Häppchen D4 Teil 3) -------------
       Nicht jeder Gedanke ist ein Absatz. Was am Tisch entsteht, entsteht als
       Kästen und Pfeile — und der KI-Berater hat dazu etwas beizutragen, das
       er NICHT selbst in die Zeichnung setzt: sein Vorschlag liegt als
       Pauspapier darüber (blatt.js). */
    skizze: {
      titel: 'Skizze zum Preisgespräch', seitenGesamt: 1,
      seiten: [
        [{h: 'Preisgespräch Petersen, Donnerstag'},
         {klein: 'Handzeichnung, Dr. Anna Vogelsang, {beratung}. Am Tisch entstanden.'},
         {tafel: {
           beschreibung: 'Eine Handzeichnung: Vom seit achtzehn Monaten hohen Stahlpreis führt ein Pfeil auf die Marge von 31,4 Prozent gegenüber 35,9 Prozent in der Branche, von dort auf den eingekreisten Schritt „plus vier Prozent auf die C-Kunden". Darunter steht, was er im Jahr bringt: 38.000 Euro. Am Rand die Notiz, nicht zu verhandeln, sondern zu begründen.',
           striche: [
             {kasten: [70, 58, 330, 170]},
             {pfeil: [235, 245, 235, 370]},
             {kasten: [70, 385, 330, 185]},
             {pfeil: [415, 472, 545, 472]},
             {kasten: [560, 380, 375, 195]},
             {kringel: [747, 477, 205, 138]},
             {linie: [568, 720, 900, 720], art: 'marker'}
           ],
           worte: [
             {x: 100, y: 130, t: 'Stahlpreis', gross: true},
             {x: 100, y: 188, t: 'seit 18 Monaten hoch'},
             {x: 100, y: 458, t: 'Marge 31,4 %', gross: true},
             {x: 100, y: 518, t: 'Branche: 35,9 %'},
             {x: 590, y: 458, t: '+4 % auf die', gross: true},
             {x: 590, y: 523, t: 'C-Kunden', gross: true},
             {x: 575, y: 700, t: '= 38.000 € im Jahr', gross: true},
             {x: 110, y: 690, t: 'nicht verhandeln —'},
             {x: 110, y: 740, t: 'begründen.'}
           ]
         },
          feder: {
            grund: 'In der Skizze fehlt, woran der Schritt hängt: Der Rahmenvertrag mit Nordstahl endet am 30. September, danach gilt der Tagespreis. Der KI-Berater würde den Einkauf als eigenen Kasten dazusetzen — verhandelt gehört er vor das Preisgespräch, nicht danach.',
            pause: {
              papier: [60, 800, 530, 350],
              striche: [
                {kasten: [100, 845, 400, 175]},
                {pfeil: [505, 880, 610, 742]}
              ],
              worte: [
                {x: 125, y: 915, t: 'Einkauf Nordstahl', gross: true},
                {x: 125, y: 975, t: 'endet am 30.9.'},
                {x: 125, y: 1100, t: 'erst hier verhandeln'}
              ]
            }
          }}]
      ]
    },

    jahresabschluss: {
      titel: 'Jahresabschluss 2025, Entwurf', seitenGesamt: 48,
      seiten: [
        [{h: 'Jahresabschluss zum 31. Dezember 2025'},
         {klein: 'Petersen Stahlbau GmbH, Oldenburg. Entwurf, vorbehaltlich der Schlussbuchungen des Steuerbüros.'},
         {h: 'Gewinn- und Verlustrechnung, verkürzt'},
         {tab: [['Position', '2025', '2024'],
                ['Umsatzerlöse', '4.096.000 €', '3.912.000 €'],
                ['Materialaufwand', '2.793.000 €', '2.618.000 €'],
                ['Rohertrag', '1.303.000 €', '1.294.000 €'],
                ['Personalaufwand', '1.011.000 €', '958.000 €'],
                ['Jahresüberschuss', '164.000 €', '191.000 €']]},
         {p: 'Der Rohertrag liegt bei 31,8 Prozent nach 33,1 Prozent im Vorjahr. Die Eigenkapitalquote beträgt 38 Prozent.'}]
      ]
    },

    /* ---------- Die Akten der drei anderen Mandate ----------
       Seit jedes Mandat seine Akte hat (Issue #50), darf ein Beleg die Akte
       eines anderen Mandanten benennen UND dorthin führen. Die Seiten hier
       sind der Grund, dass das keine Behauptung ist. */

    /* Cordes Logistik. Seite 2 ist die Stelle, die der KI-Berater in
       beratung-fragen.html zitiert: zwei Wechselbrücken, 34.800 €, und keine
       eingetragene Nutzungsdauer — daher überhaupt die Frage. Die steuerliche
       Anlagenliste 2026 fehlt Cordes noch (beratung-radar.html); dies ist die
       Fassung des Kunden, nicht die des Steuerbüros. */
    fuhrpark: {
      titel: 'Fuhrpark-Übersicht 2026', seitenGesamt: 6,
      seiten: [
        [{h: 'Fuhrpark-Übersicht 2026'},
         {klein: 'Cordes Logistik GmbH & Co. KG, Bremen. Fassung 1, gepflegt von der Disposition, Stand 30. Juni 2026.'},
         {h: '1. Bestand'},
         {tab: [['Art', 'Anzahl', 'Ø Alter', 'Buchwert'],
                ['Zugmaschinen', '11', '4,2 Jahre', '486.000 €'],
                ['Sattelauflieger', '14', '6,8 Jahre', '291.000 €'],
                ['Wechselbrücken', '8', '3,1 Jahre', '89.200 €'],
                ['Transporter bis 3,5 t', '3', '5,0 Jahre', '38.700 €']]},
         {p: 'Die Fahrleistung der Zugmaschinen lag 2025 bei 428.000 Kilometern; sie ist die Grundlage jeder Mautrechnung in diesem Mandat.'}],
        [{h: '2. Zugänge 2026'},
         {tab: [['Zugang', 'Datum', 'Anzahl', 'Netto'],
                ['Wechselbrücken, Typ C 745', '14. Mai 2026', '2', '34.800 €'],
                ['Sattelauflieger, gebraucht', '3. März 2026', '1', '21.500 €']]},
         {p: 'Die beiden Wechselbrücken ersetzen zwei Einheiten von 2016, die im April ausgesondert wurden. Bezahlt wurde aus dem laufenden Konto, ohne Finanzierung.'},
         {p: 'Für die Wechselbrücken ist in dieser Fassung keine Nutzungsdauer eingetragen. Die Übersicht führt den Bestand, sie rechnet nicht ab.'}]
      ]
    },

    dieselkosten: {
      titel: 'Dieselkosten je Tour, erstes Halbjahr', seitenGesamt: 4,
      seiten: [
        [{h: 'Dieselkosten je Tour, Januar bis Juni 2026'},
         {klein: 'Cordes Logistik, ausgewertet vom KI-Berater aus den Tankbelegen und den Tourdaten. Erstellt am 9. Juli 2026.'},
         {tab: [['Monat', 'Touren', 'Liter je Tour', '€ je Tour'],
                ['Januar', '412', '78,4', '132,10 €'],
                ['März', '446', '77,9', '128,40 €'],
                ['Mai', '463', '79,6', '136,80 €'],
                ['Juni', '451', '80,2', '141,20 €']]},
         {p: 'Der Verbrauch je Tour steigt seit März, der Preis je Liter ebenfalls. Zusammen sind das 9,10 € je Tour mehr als im Januar, bei rund 5.400 Touren im Jahr also etwa 49.000 €.'},
         {p: 'Die Frachtraten sind im selben Zeitraum um 1,4 Prozent gestiegen. Der Dieselzuschlag deckt davon rechnerisch zwei Drittel.'}]
      ]
    },

    steuernotiz: {
      titel: 'Notiz zur Steuerfrage Cordes', seitenGesamt: 1,
      seiten: [
        [{h: 'Notiz zur Steuerfrage Cordes'},
         {klein: 'Dr. Anna Vogelsang, {beratung}, 16. August 2026. Interne Notiz.'},
         {p: 'Herr Cordes fragt, ob die beiden Wechselbrücken vom 14. Mai in diesem Jahr voll abgezogen werden können. Die Nutzungsdauer nach amtlicher Tabelle beträgt neun Jahre; ab Mai zeitanteilig, also mit acht Zwölfteln, 2.578 € für 2026.'},
         {p: 'Was ich nicht weiß und vor einer Antwort brauche: Gewinn 2025 nach Abschluss, ob in den letzten drei Jahren bereits ein Investitionsabzugsbetrag gebildet wurde, und die Größenmerkmale zum Bilanzstichtag.'},
         {p: 'Vor der Antwort mit dem Steuerbüro Ahlers klären. Bis dahin bekommt Herr Cordes die Rechnung nach Nutzungsdauer und den Satz, dass daneben ein Sofortabzug geprüft wird.'}]
      ]
    },

    /* Bäckerei Freitag. Ein ruhiges Mandat hat eine dünne Akte, und das darf
       man sehen — zwei Blätter, beide freigegeben, kein interner Vermerk. */
    personalquote: {
      titel: 'Personalquote Juli', seitenGesamt: 5,
      seiten: [
        [{h: 'Personalquote Juli 2026'},
         {klein: 'Bäckerei Freitag e.K., Wilhelmshaven. Erstellt am 6. August 2026 von {beratung}.'},
         {p: 'Die Personalquote liegt im Juli bei 38,4 Prozent vom Umsatz und damit erstmals seit März im Zielkorridor von 37 bis 39 Prozent.'},
         {tab: [['Standort', 'Umsatz Juli', 'Personalkosten', 'Quote'],
                ['Marktstraße', '104.200 €', '38.900 €', '37,3 %'],
                ['Bahnhof', '61.800 €', '25.400 €', '41,1 %'],
                ['Voslapp', '48.300 €', '18.100 €', '37,5 %']]},
         {p: 'Der Standort Bahnhof trägt die Abweichung allein. Die Öffnungszeit am Sonntag bindet dort zwei Kräfte für einen Umsatz, der an Werktagen in vier Stunden entsteht.'}]
      ]
    },

    filialvergleich: {
      titel: 'Filialvergleich, drei Standorte', seitenGesamt: 7,
      seiten: [
        [{h: 'Filialvergleich, drei Standorte'},
         {klein: 'Bäckerei Freitag, ausgewertet vom KI-Berater aus den Kassendaten Januar bis Juli 2026.'},
         {tab: [['Kennzahl', 'Marktstraße', 'Bahnhof', 'Voslapp'],
                ['Bons je Tag', '612', '388', '291'],
                ['Ø Bon', '5,40 €', '4,10 €', '5,80 €'],
                ['Retourenquote', '4,1 %', '9,3 %', '3,8 %'],
                ['Rohertragsmarge', '32,6 %', '27,9 %', '33,1 %']]},
         {p: 'Der Standort Bahnhof verkauft mehr Stück zu kleineren Bons und wirft fast jedes zehnte Teil weg. Beides zusammen erklärt die vier Punkte Margenabstand vollständig.'},
         {p: 'Eine kleinere Nachmittagsbestückung am Bahnhof würde bei gleicher Nachfrage rund 11.000 € Retouren im Jahr sparen.'}]
      ]
    },

    /* MTS Maschinenbau. Seit drei Wochen still, Zugang abgelaufen — die Akte
       ist das Einzige, was in diesem Mandat gerade noch spricht. */
    ratenabrede: {
      titel: 'Abrede zur Ratenzahlung', seitenGesamt: 2,
      seiten: [
        [{h: 'Abrede zur Ratenzahlung'},
         {klein: 'Zwischen {beratung} und der MTS Maschinenbau GmbH, Cloppenburg. Geschlossen am 12. Juni 2026.'},
         {p: 'Die Jahrespauschale 2026 von 27.000 € netto wird abweichend von der Rechnung in zwölf gleichen Monatsraten von 2.250 € netto gezahlt, fällig jeweils zum 15. des Monats.'},
         {p: 'Die Abrede endet, wenn zwei Raten offen sind. Dann wird der Restbetrag in einer Summe fällig.'},
         {p: 'Die Leistung bleibt unverändert: KI-Berater mit 40 Fragen im Monat, vier Termine im Jahr, Auswertung zum Quartal.'}]
      ]
    },

    maiauswertung: {
      titel: 'Auswertung Mai', seitenGesamt: 6,
      seiten: [
        [{h: 'Auswertung Mai 2026'},
         {klein: 'MTS Maschinenbau GmbH, Cloppenburg. Erstellt am 11. Juni 2026 von {beratung}.'},
         {tab: [['Kennzahl', 'Mai 2026', 'Mai 2025'],
                ['Umsatz', '612.000 €', '648.000 €'],
                ['Rohertragsmarge', '26,8 %', '28,9 %'],
                ['Auftragsbestand', '2,1 Monate', '3,4 Monate'],
                ['Betriebsergebnis', '21.400 €', '39.800 €']]},
         {p: 'Der Auftragsbestand ist der schwächste seit Beginn des Mandats. Bei gleichbleibendem Zugang reicht er bis Mitte Juli.'}]
      ]
    },

    stillnotiz: {
      titel: 'Notiz: seit drei Wochen still', seitenGesamt: 1,
      seiten: [
        [{h: 'Notiz: seit drei Wochen still'},
         {klein: 'Dr. Anna Vogelsang, {beratung}, 14. August 2026. Interne Notiz.'},
         {p: 'Seit dem 22. Juli keine Frage, kein Anruf, keine Antwort auf zwei Mails. Sein Anmelde-Link ist am 26. Juli abgelaufen — möglich, dass er schlicht nicht mehr hineinkommt.'},
         {p: 'Die Juli-Rate ist gezahlt, die August-Rate seit dem 15. offen. Der Auftragsbestand aus der Mai-Auswertung reichte bis Mitte Juli.'},
         {p: 'Vor allem anderen anrufen, nicht schreiben. Wenn niemand rangeht, über die Assistenz einen Termin anbieten.'}]
      ]
    },

    /* ---------- Das Wissen der Beratung ---------- */
    branchenspiegel: {
      titel: 'Branchenspiegel Metallzulieferer 2025', seitenGesamt: 38,
      seiten: [
        [{h: 'Branchenspiegel Metallzulieferer 2025'},
         /* Kein Wort über „internen Gebrauch": dieses Blatt liegt im Wissen der
            Beratung UND bei dem Kunden, für den sie es freigegeben hat. Wem es
            gehört, sagt die Fläche, nicht das Papier. */
         {klein: 'Auswertung von 214 Betrieben mit 10 bis 250 Mitarbeitenden, Erhebungsjahr 2025. Herausgegeben vom Fachverband, ausgewertet von {beratung}.'},
         {h: '1. Was diese Zahlen sind'},
         {p: 'Die Angaben stammen aus den Jahresabschlüssen der teilnehmenden Betriebe, bereinigt um Sondereffekte aus Grundstücksverkäufen und Fördermitteln. Betriebe mit weniger als zwölf Monaten Geschäftstätigkeit sind nicht enthalten.'},
         {h: '2. Größenklassen'},
         {p: 'Die Auswertung unterscheidet drei Klassen: bis 20, 20 bis 80 und über 80 Mitarbeitende. Die mittlere Klasse ist mit 97 Betrieben die größte und für die meisten Mandate die richtige Vergleichsgruppe.'}],
        [{h: '5. Rohertrag und Marge'},
         {p: 'Zulieferer mit 20 bis 80 Mitarbeitenden erzielen im Median 35,9 Prozent Rohertragsmarge; das untere Quartil liegt bei 31,2 Prozent.'},
         {tab: [['Größenklasse', 'unteres Quartil', 'Median', 'oberes Quartil'],
                ['bis 20 Mitarbeitende', '29,4 %', '34,1 %', '39,8 %'],
                ['20 bis 80', '31,2 %', '35,9 %', '41,3 %'],
                ['über 80', '30,1 %', '33,6 %', '37,9 %']]},
         {p: 'Der Abstand zwischen unterem Quartil und Median beträgt in der mittleren Klasse 4,7 Punkte. Betriebe im unteren Quartil unterscheiden sich von den anderen fast durchweg im Preis, selten in den Kosten.'},
         {h: '6. Energiekosten je Tonne'},
         {p: 'Die Energiekosten je verarbeiteter Tonne sind gegenüber 2023 um 18 Prozent gestiegen und liegen im Median bei 41 €.'}]
      ]
    },

    fallsammlung: {
      titel: 'Fallsammlung Margenprojekte 2019–2025', seitenGesamt: 52,
      seiten: [
        [{h: 'Fallsammlung Margenprojekte 2019 bis 2025'},
         {klein: 'Neunzehn abgeschlossene Mandate, anonymisiert. Zusammengestellt von Dr. Anna Vogelsang.'},
         {h: 'Warum es diese Sammlung gibt'},
         {p: 'In fast jedem Margenprojekt kommt derselbe Einwand: „Bei uns geht das nicht, unsere Kunden springen ab." Die Sammlung hält fest, was tatsächlich passiert ist — wie viele Kunden gegangen sind, und was der Preisschritt gebracht hat.'},
         {tab: [['Fall', 'Preisschritt', 'Abgang', 'Wirkung im Jahr'],
                ['Zulieferer, 61 MA', '+4 %', '3 von 140', '+41.000 €'],
                ['Lohnfertiger, 34 MA', '+6 %', '2 von 88', '+29.000 €'],
                ['Stahlbau, 52 MA', '+3 %', '0 von 96', '+22.000 €'],
                ['Blechbearbeitung, 78 MA', '+8 %', '9 von 210', '+18.000 €']]},
         {p: 'Der vierte Fall ist der lehrreichste: acht Prozent auf einmal haben mehr Kunden gekostet, als die Anhebung eingebracht hat.'}]
      ]
    },

    checkliste: {
      titel: 'Checkliste Kostenanalyse produzierendes Gewerbe', seitenGesamt: 26,
      seiten: [
        [{h: 'Kostenanalyse im produzierenden Gewerbe'},
         {klein: 'Arbeitsablauf für die ersten vier Wochen eines Mandats.'},
         {h: 'Woche 1, Zahlen holen'},
         {liste: ['Summen- und Saldenliste der letzten 24 Monate',
                  'Lohnjournal, verdichtet nach Kostenstellen',
                  'Einkaufskonditionen der fünf größten Lieferanten',
                  'Offene-Posten-Liste, Debitoren und Kreditoren']},
         {h: 'Woche 2, Zahlen prüfen'},
         {liste: ['Bestandsveränderungen gegen die Inventur laufen lassen',
                  'Periodenfremde Aufwendungen herausrechnen',
                  'Kalkulatorischen Unternehmerlohn ansetzen, falls Einzelunternehmen']},
         {h: 'Woche 3, vergleichen'},
         {p: 'Erst jetzt der Branchenspiegel. Wer zuerst vergleicht und dann prüft, erklärt sich Abweichungen, die es gar nicht gibt.'}]
      ]
    },

    methodik: {
      titel: 'Methodik Preisgespräch', seitenGesamt: 18,
      seiten: [
        [{h: 'Das Preisgespräch'},
         {klein: 'Hausmethodik, Stand Juni 2026.'},
         {h: 'Der Grundsatz'},
         {p: 'Eine Preisanhebung wird nicht verhandelt, sie wird begründet. Wer mit einer Spanne ins Gespräch geht, hat den unteren Wert schon vergeben.'},
         {h: 'Die drei Sätze'},
         {liste: ['Was sich geändert hat, in Zahlen, ohne Klage.',
                  'Was gleich bleibt: Lieferzeit, Ansprechpartner, Qualität.',
                  'Ab wann es gilt, mit genügend Vorlauf für eine letzte Bestellung.']},
         {h: 'Was nicht funktioniert'},
         {p: 'Eine Anhebung „wegen der allgemeinen Kostenentwicklung" lädt zum Feilschen ein. Eine Anhebung, die auf den Stahlpreis der letzten achtzehn Monate zeigt, nicht.',
          feder: {grund: 'Eure eigene Fallsammlung kennt einen Fall, den diese Methodik nicht abdeckt: acht Prozent auf einmal haben dort mehr Kunden gekostet, als die Anhebung eingebracht hat.',
                  neu: 'Eine Anhebung „wegen der allgemeinen Kostenentwicklung" lädt zum Feilschen ein. Eine Anhebung, die auf den Stahlpreis der letzten achtzehn Monate zeigt, nicht. Und keine Anhebung über fünf Prozent auf einen Schlag: in der Fallsammlung ist das der einzige Fall, in dem der Abgang die Wirkung aufgefressen hat.'}}]
      ]
    },

    stundensaetze: {
      titel: 'Benchmark Stundensätze Beratung 2026', seitenGesamt: 22,
      seiten: [
        [{h: 'Benchmark Stundensätze Beratung 2026'},
         {klein: 'Erhebung unter 96 mittelständischen Beratungen im deutschsprachigen Raum, Frühjahr 2026.'},
         {h: 'Sätze nach Rolle'},
         {tab: [['Rolle', 'unteres Quartil', 'Median', 'oberes Quartil'],
                ['Partner', '190 €', '245 €', '310 €'],
                ['Senior', '135 €', '165 €', '198 €'],
                ['Berater', '95 €', '118 €', '140 €']]},
         {p: 'Die Spanne ist bei den Partnern am größten. Sie erklärt sich fast vollständig über die Branche des Mandanten, kaum über die Region.'},
         {h: 'Pauschalen'},
         {p: 'Zwei von drei Beratungen arbeiten inzwischen mit Monatspauschalen statt mit Stundensätzen. Der rechnerische Stundenwert liegt dabei im Median sieben Prozent über dem ausgewiesenen Satz.'}]
      ]
    },

    /* ---------- Was keinen Text hat ---------- */
    folien: {
      titel: 'Vortragsfolien Restrukturierung, gescannt', seitenGesamt: 24,
      ohneText: true
    },

    fotos: {
      titel: 'Fotos Halle 2, Begehung', seitenGesamt: 9,
      ohneText: 'Das hier ist ein Foto von der Begehung. Bilder lassen sich ansehen, aber nicht zitieren — es steht kein Text darin.'
    }
  };

  /* Der Name der Beratung steht nicht im Text ---------------------------
     Diese Seiten liegen auch auf den Kundenflächen, und die sind White-Label:
     dort heißt die Beratung so, wie marke.js es sagt. Im Papier steht deshalb
     {beratung}, und wer das Blatt zeigt, reicht den Namen mit:
       Blaetter.hol('beratungsvertrag', {beratung: Marke.daten.name})
     Ohne Angabe bleibt es bei „deiner Beratung" — neutral und nie falsch. */
  function setzeNamen(bloecke, name) {
    return bloecke.map(function (seite) {
      return seite.map(function (b) {
        var neu = {}, drin = false;
        for (var k in b) {
          if (!Object.prototype.hasOwnProperty.call(b, k)) continue;
          if (typeof b[k] === 'string' && b[k].indexOf('{beratung}') !== -1) {
            neu[k] = b[k].split('{beratung}').join(name); drin = true;
          } else if (Array.isArray(b[k])) {
            neu[k] = b[k].map(function (z) {
              if (typeof z === 'string') {
                if (z.indexOf('{beratung}') === -1) return z;
                drin = true; return z.split('{beratung}').join(name);
              }
              return z.map(function (zelle) {
                if (typeof zelle !== 'string' || zelle.indexOf('{beratung}') === -1) return zelle;
                drin = true; return zelle.split('{beratung}').join(name);
              });
            });
          } else if (b[k] && typeof b[k] === 'object') {
            /* Der Vorschlag des KI-Beraters ist ein eigenes Objekt aus Sätzen —
               auch darin darf der Name der Beratung stehen. */
            var innen = {}, dabei = false;
            for (var i in b[k]) {
              if (!Object.prototype.hasOwnProperty.call(b[k], i)) continue;
              if (typeof b[k][i] === 'string' && b[k][i].indexOf('{beratung}') !== -1) {
                innen[i] = b[k][i].split('{beratung}').join(name); dabei = true;
              } else innen[i] = b[k][i];
            }
            neu[k] = dabei ? innen : b[k];
            if (dabei) drin = true;
          } else neu[k] = b[k];
        }
        return drin ? neu : b;
      });
    });
  }

  /* Immer eine frische Kopie: die Fläche schreibt ihre eigene Sicht hinein
     (aus, griffe, meta), und das darf die nächste Fläche nicht erben. Die
     Seiten selbst werden nur gelesen — außer der Name der Beratung steckt
     darin, dann entsteht für diese Sicht eine eigene Fassung. */
  function hol(name, sicht) {
    var quelle = DOKUMENTE[name];
    if (!quelle) return null;
    var dok = {};
    for (var k in quelle) if (Object.prototype.hasOwnProperty.call(quelle, k)) dok[k] = quelle[k];
    if (sicht) for (var s in sicht) if (Object.prototype.hasOwnProperty.call(sicht, s)) dok[s] = sicht[s];
    if (dok.seiten) dok.seiten = setzeNamen(dok.seiten, (sicht && sicht.beratung) || 'deiner Beratung');
    /* Die eigene Fassung für offenes Papier macht der Blatt-Blick selbst
       (blatt.js): setzeNamen reicht Blöcke ohne {beratung} unverändert durch,
       und wer hineinschreibt, änderte sonst die Quelle für alle Flächen. Sie
       hier zu ziehen, hinge daran, dass der Aufrufer schreibbar schon beim
       Holen mitgibt — der Schutz gehört dorthin, wo geschrieben wird. */
    return dok;
  }

  return { hol: hol };
})();
