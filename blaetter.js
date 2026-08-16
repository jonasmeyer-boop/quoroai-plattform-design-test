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
   Marker: BLAETTER-V1 */
window.Blaetter = (function () {
  'use strict';

  var DOKUMENTE = {

    /* ---------- Die Akte des Mandats Petersen ---------- */
    monatsauswertung: {
      titel: 'Monatsauswertung Juli', seitenGesamt: 8,
      seiten: [
        [{h: 'Monatsauswertung Juli 2026'},
         {klein: 'Petersen Stahlbau GmbH, Brookweg 14, 26123 Oldenburg. Erstellt am 4. August 2026 von {beratung}.'},
         {p: 'Der Juli schließt mit 361.000 € Umsatz, gut vier Prozent über dem Vorjahresmonat. Der Rohertrag bleibt mit 31,4 Prozent hinter dem Vorjahr zurück; getragen hat den Monat die Menge, nicht der Preis.'},
         {tab: [['Kennzahl', 'Juli 2026', 'Juli 2025'],
                ['Umsatz', '361.000 €', '346.500 €'],
                ['Rohertrag', '113.400 €', '116.200 €'],
                ['Rohertragsmarge', '31,4 %', '33,5 %'],
                ['Personalkosten', '141.800 €', '134.100 €'],
                ['Betriebsergebnis', '18.900 €', '27.400 €']]},
         {p: 'Zwei Drittel des Margenverlusts stammen aus dem Stahleinkauf, ein Drittel aus dem Personalaufbau in der Vorfertigung.'}],
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
         {p: 'Grundlage der Pauschale von 2.400 € im Monat: 14 Stunden Beratung, davon 9 durch Dr. Vogelsang, sowie das KI-Kontingent von 40 Fragen.'},
         {tab: [['Position', 'Menge', 'Kosten'],
                ['Dr. Vogelsang, Partnerin', '9 h', '1.170 €'],
                ['Beratung Senior', '5 h', '425 €'],
                ['KI-Verbrauch, Schnitt', '40 Fragen', '31 €'],
                ['Plattformgebühr', '', '89 €'],
                ['Summe Kosten', '', '1.715 €'],
                ['Deckungsbeitrag', '', '685 €']]},
         {p: 'Die Marge liegt bei 28,5 Prozent und damit knapp über der Hausgrenze von 27 Prozent. Fällt der Aufwand wie im Juni auf 11 Stunden, sind es 34 Prozent.'}],
        [{h: 'Was der Kunde davon sieht'},
         {p: 'Auf seiner Rechnung steht eine Zeile: die Pauschale. Die Zerlegung darunter ist unsere Sache und bleibt es. Auslagen werden gesondert erfasst und einzeln ausgewiesen.'},
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
         {p: 'Es gilt eine monatliche Pauschale. Sie deckt alle Leistungen nach Ziffer 1 ab; Auslagen werden gesondert und einzeln abgerechnet.'},
         {h: '3. Laufzeit'},
         {p: 'Der Vertrag läuft zwölf Monate und verlängert sich stillschweigend um jeweils zwölf Monate. Die Kündigungsfrist beträgt drei Monate zum Laufzeitende.'}],
        [{h: '4. Vertraulichkeit'},
         {p: 'Beide Seiten behandeln alle Unterlagen vertraulich. Die Beratung setzt Unterlagen des Mandanten ausschließlich für dessen eigenes Mandat ein.'},
         {h: '5. Der KI-Berater'},
         {p: 'Der Mandant erhält Zugang zu einem KI-Berater, der auf die Unterlagen dieses Mandats und auf die Methodik der Beratung zugreift. Antworten nennen ihre Fundstelle. Die Verantwortung für Entscheidungen bleibt beim Mandanten.'},
         {klein: 'Es folgen die Anlagen 1 und 2 auf den Seiten 3 und 4.'}]
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
         {p: 'Eine Anhebung „wegen der allgemeinen Kostenentwicklung" lädt zum Feilschen ein. Eine Anhebung, die auf den Stahlpreis der letzten achtzehn Monate zeigt, nicht.'}]
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
    return dok;
  }

  return { hol: hol };
})();
