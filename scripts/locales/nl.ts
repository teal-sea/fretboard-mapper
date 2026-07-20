// ─── Nederlands ──────────────────────────────────────────────────────
// Dutch guitarists use international letter names (B stays B), so slugs
// stay letter-based: c-kruis-dorisch. Prose is authored translation; the
// musical facts still come from musicTheory.ts.

import type { Language } from '../../src/utils/noteNames'
import type { ModeKey } from '../shared'
import type { Locale } from '../locales'

const code: Language = 'nl'

const modeNames: Record<ModeKey, string> = {
  ionian: 'Ionisch', dorian: 'Dorisch', phrygian: 'Frygisch', lydian: 'Lydisch',
  mixolydian: 'Mixolydisch', aeolian: 'Aeolisch', locrian: 'Locrisch',
}

export const nl: Locale = {
  code,
  htmlLang: 'nl',
  modesSegment: 'modi',
  sharpWord: 'kruis',
  flatWord: 'mol',
  majorLabel: 'majeur',
  slugSolfege: ['c', 'd', 'e', 'f', 'g', 'a', 'b'],
  modeNames,
  copy: {
    ionian: {
      focusLabel: 'grote septiem',
      hook: 'De Ionische modus is gewoon de majeurladder: de opgeloste, heldere klank die de westerse muziek als thuis beschouwt.',
      sound: 'Het is de klank van poprefreinen en happy ends. Alle andere modi op deze site zijn precies deze noten, met een andere noot als thuis.',
      practice: 'Luister boven de drone hoe de grote septiem hongerig naar de tonica leunt — die aantrekkingskracht is precies wat "opgelost" betekent.',
    },
    dorian: {
      focusLabel: 'grote sext',
      hook: 'De Dorische modus is een mineurladder met één noot omhoog: de sext is groot in plaats van klein, en "droevig" wordt opeens cool.',
      sound: 'Het is de klank van "Oye Como Va" en Santana, van "So What" en modale jazz, van funkgrooves die eindeloos op één mineurakkoord blijven hangen zonder ooit te vervelen. Mineur, maar met opgeheven hoofd.',
      practice: 'Boven de drone klinkt alles als gewone mineur tot je op de grote sext landt — die noot IS de Dorische smaak: mik er bewust op.',
    },
    phrygian: {
      focusLabel: 'kleine secunde',
      hook: 'De Frygische modus is een mineurladder waarvan de noot vlak boven thuis een halve toon omlaag is geduwd — meteen donker.',
      sound: 'Die kleine secunde is de klank van flamenco, van de Andalusische cadens en van de helft van alle metalriffs ooit geschreven. Hij woont één fret van de tonica: de spanning zit altijd onder één vinger.',
      practice: 'Hamer boven de drone tussen de tonica en de kleine secunde — die halve-toonswrijving IS Frygisch; de rest van de ladder is context.',
    },
    lydian: {
      focusLabel: 'overmatige kwart',
      hook: 'De Lydische modus is de majeurladder met de kwart een halve toon omhoog — majeur, maar zwevend in plaats van met beide voeten op de grond.',
      sound: 'Het is de dromerige klank van filmmuziek, van de "Simpsons"-tune en van de ballads van Joe Satriani ("Flying in a Blue Dream" is een Lydisch-tutorial met een platencontract).',
      practice: 'Houd boven de drone de overmatige kwart aan en laat hem klinken — in elke andere majeurcontext zou het een "foute" noot zijn; hier is het juist de bedoeling.',
    },
    mixolydian: {
      focusLabel: 'kleine septiem',
      hook: 'De Mixolydische modus is de majeurladder met de septiem verlaagd — helder van boven, bluesy van onderen.',
      sound: 'Het is de standaardladder van de rock-’n-roll: AC/DC-riffs, Grateful Dead, Keltische muziek en elke twaalfmaatssolo die vrolijk klinkt zonder naïef te zijn.',
      practice: 'Vergelijk boven de drone de kleine septiem met de leidtoon die je oor verwacht — die rust van "hier hoeft niets op te lossen" is de hele modus.',
    },
    aeolian: {
      focusLabel: 'kleine sext',
      hook: 'De Aeolische modus is de natuurlijke mineurladder — de vertrouwde droevige, de schaduwtweeling van de majeurladder.',
      sound: 'Het is de klank van bijna alle rock en pop in mineur: "Stairway to Heaven", "Losing My Religion", elke power ballad. De kleine sext scheidt hem van Dorisch: waar Dorisch optilt, zakt Aeolisch weg.',
      practice: 'Zak boven de drone van de kleine sext naar de kwint en voel hem landen — die zucht is de handtekening van de natuurlijke mineur.',
    },
    locrian: {
      focusLabel: 'verminderde kwint',
      hook: 'De Locrische modus is de instabiele: de secunde en de kwint zijn allebei verlaagd, waardoor thuis zelf een verminderd akkoord is dat nooit tot rust komt.',
      sound: 'Zonder reine kwint om op te leunen weigert Locrisch op te lossen — en precies daarom bewaren metal en jazz hem voor maximale spanning. Minder een plek om te wonen dan een plek om dreigend doorheen te trekken.',
      practice: 'Merk boven de drone hoe zelfs de tonica voorlopig aanvoelt — de verminderde kwint blijft de grond onder je wegtrekken.',
    },
  },
  t: {
    upgradeCta: 'Maak oefenen een gewoonte · $5/mnd',
    title: 'De modus {name} op gitaar — Toonladder, akkoorden en halsdiagram | Modal Runs',
    metaDesc: '{name} op gitaar: {notes}. Een interactief halsdiagram (fretboard), diatonische akkoorden en een gratis drone om over te improviseren — Modal Runs luistert via je microfoon en licht in realtime op wat je speelt.',
    h1: '{name} op gitaar',
    lead: '{hook} De noten van {name} zijn <strong>{notes}</strong>. De karakteristieke noot is <strong>{focus}</strong> — de {focusLabel} — de noot die deze toonladder zijn kleur geeft.',
    neckHeading: '{name} over de hele hals',
    figcaption: 'Standaardstemming, frets 0–12. De gouden noten zijn de tonica ({root}); elke kleur markeert een interval, hetzelfde palet als in de app.',
    ariaFretboard: 'De toonladder {name} op de gitaarhals, frets 0 tot 12',
    ctaMain: 'Oefen {name} boven een drone →',
    ctaSub: 'Gratis, in je browser. Hij luistert via je microfoon en licht op wat je speelt.',
    formulaHeading: 'Formule en intervallen',
    formulaLine: '<strong>{formula}</strong> — {n} noten. {family}',
    familyMajor: 'De grote terts maakt hem een toonladder uit de majeurfamilie.',
    familyMinor: 'De kleine terts maakt hem een toonladder uit de mineurfamilie.',
    familyDim: 'De kleine terts en de verminderde kwint vormen een verminderde drieklank op de tonica.',
    chordsHeading: 'Akkoorden in {name}',
    chordsIntro: 'Dit zijn de diatonische akkoorden — de harmonie gebouwd met alleen de noten hierboven. Ertussen wisselen houdt je binnen de modus.',
    thDegree: 'Trap', thChord: 'Akkoord', thQuality: 'Soort',
    sameNotesHeading: 'Dezelfde noten, ander thuis',
    relative: '{name} bevat exact dezelfde noten als <a href="{parentHref}">{parent}</a>. De noten veranderen niet — welke als thuis voelt verandert, en dat verandert alles.',
    relativeIonian: 'Alle modi op deze site komen uit één majeurladder. {name} is de majeurladder van {root} — de zes andere modi hergebruiken exact deze noten met een ander thuis.',
    otherModesHeading: 'Andere modi op {root}',
    otherModesIntro: 'Houd dezelfde tonica en wissel van toonladder — de snelste manier om te horen wat elke modus doet.',
    indexTitle: 'Gitaarmodi in alle toonsoorten — Formules, noten en halsdiagrammen | Modal Runs',
    indexDesc: 'Halsdiagrammen voor de zeven modi (kerktoonladders) in alle twaalf toonsoorten: de formule en de noten van elke modus, diatonische akkoorden en een gratis drone om over te improviseren. Echte gehoortraining — Modal Runs luistert via je microfoon terwijl je oefent.',
    indexH1: 'Alle modi, alle toonsoorten',
    indexLead: 'De zeven modi van de majeurladder, uitgetekend op de hals in alle twaalf toonsoorten — met de noten, de akkoorden die in elke modus wonen en een drone om over te improviseren. Kies een toonsoort; de pagina laat je het diagram zien en <a href="/">de app</a> luistert terwijl je het speelt.',
    faqQ: 'Wat is {name}?',
    footerModes: 'Alle modi',
    footerApp: 'Open de app',
    footerTag: 'Modal Runs — leer de hals door te spelen. Gratis.',
    homeTitle: 'Modal Runs — Leer de hals door te spelen',
    homeDesc: 'Leer de hals door te spelen: houd een drone aan in elke toonsoort, improviseer, en Modal Runs licht elke noot die je speelt in realtime op de hals op — echte gehoortraining. Vind de modi op het gehoor in plaats van ze uit je hoofd te leren. Gratis.',
    homeH1: 'Modal Runs — leer de hals door te spelen',
    homeLead: 'Houd een drone aan in elke toonsoort, improviseer, en Modal Runs luistert via je microfoon — hij licht elke noot die je op de hals speelt op en zegt het wanneer je de gevraagde noot raakt. Leer de modi op het gehoor in plaats van ze uit je hoofd te leren. Gratis, in de browser, zonder account.',
  },
}
