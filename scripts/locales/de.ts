// ─── Deutsch ─────────────────────────────────────────────────────────
// German locale for the static mode pages. Germans name notes C D E F G
// A H (H = English B, German B = English Bb); sharps are Cis/Fis etc.
// Displayed note names are handled by the app — here we only shape slugs:
// slugSolfege gives c…h, sharpWord 'is' → /de/modi/c-is-dorisch,
// flatWord 'es' → /de/modi/e-es-lydisch. Äolisch needs an ASCII slug.

import type { Language } from '../../src/utils/noteNames'
import type { ModeKey } from '../shared'
import type { Locale } from '../locales'

export const de: Locale = {
  code: 'de' satisfies Language,
  htmlLang: 'de',
  modesSegment: 'modi',
  sharpWord: 'is',
  flatWord: 'es',
  majorLabel: 'Dur',
  modeNames: {
    ionian: 'Ionisch', dorian: 'Dorisch', phrygian: 'Phrygisch', lydian: 'Lydisch',
    mixolydian: 'Mixolydisch', aeolian: 'Äolisch', locrian: 'Lokrisch',
  },
  slugSolfege: ['c', 'd', 'e', 'f', 'g', 'a', 'h'],
  modeSlugs: {
    ionian: 'ionisch', dorian: 'dorisch', phrygian: 'phrygisch', lydian: 'lydisch',
    mixolydian: 'mixolydisch', aeolian: 'aeolisch', locrian: 'lokrisch',
  } satisfies Record<ModeKey, string>,
  copy: {
    ionian: {
      focusLabel: 'große Septime',
      hook: 'Der ionische Modus ist die ganz normale Durtonleiter: der aufgelöste, helle Klang, den die westliche Musik als ihr Zuhause behandelt.',
      sound: 'Es ist der Klang von Pop-Refrains und Happy Ends. Alle anderen Modi auf dieser Seite sind genau dieselben Töne — nur mit einem anderen Ton als Zuhause.',
      practice: 'Hör über dem Drone, wie sich die große Septime hungrig zum Grundton neigt — genau dieser Sog ist das, was "aufgelöst" bedeutet.',
    },
    dorian: {
      focusLabel: 'große Sexte',
      hook: 'Der dorische Modus ist eine Molltonleiter mit einem angehobenen Ton: Die Sexte ist groß statt klein — und aus "traurig" wird Haltung.',
      sound: 'Es ist der Klang von "Oye Como Va" und Santana, von "So What" und dem Modal Jazz, von Funk-Grooves, die auf einem einzigen Mollakkord leben, ohne je langweilig zu werden. Moll, aber mit erhobenem Kopf.',
      practice: 'Über dem Drone klingt alles nach gewöhnlichem Moll — bis du auf der großen Sexte landest. Dieser Ton IST der dorische Geschmack: Ziel bewusst auf ihn.',
    },
    phrygian: {
      focusLabel: 'kleine Sekunde',
      hook: 'Der phrygische Modus ist eine Molltonleiter, bei der der Ton direkt über dem Zuhause einen Halbton nach unten gedrückt wird — sofortige Dunkelheit.',
      sound: 'Diese kleine Sekunde ist der Klang des Flamenco, der andalusischen Kadenz und der Hälfte aller Metal-Riffs, die je geschrieben wurden. Sie wohnt nur einen Bund vom Grundton entfernt: Die Spannung ist immer einen Finger weit weg.',
      practice: 'Hämmere über dem Drone zwischen Grundton und kleiner Sekunde hin und her — diese Halbton-Reibung IST Phrygisch; der Rest der Tonleiter ist nur Kontext.',
    },
    lydian: {
      focusLabel: 'übermäßige Quarte',
      hook: 'Der lydische Modus ist die Durtonleiter mit einer um einen Halbton angehobenen Quarte — Dur, aber schwebend statt mit beiden Füßen am Boden.',
      sound: 'Es ist der verträumte Klang der Filmmusik, des "Simpsons"-Themas und der Balladen von Joe Satriani ("Flying in a Blue Dream" ist ein Lydisch-Tutorial mit Plattenvertrag).',
      practice: 'Halte über dem Drone die übermäßige Quarte und lass sie klingen — in jedem anderen Dur-Kontext wäre sie ein "falscher" Ton; hier ist sie der Punkt.',
    },
    mixolydian: {
      focusLabel: 'kleine Septime',
      hook: 'Der mixolydische Modus ist die Durtonleiter mit erniedrigter Septime — oben hell, darunter Blues.',
      sound: 'Es ist die Standard-Tonleiter des Rock’n’Roll: AC/DC-Riffs, Grateful Dead, keltische Musik und jedes Zwölftakter-Solo, das fröhlich klingt, ohne naiv zu sein.',
      practice: 'Vergleiche über dem Drone die kleine Septime mit dem Leitton, den dein Ohr erwartet — diese Ruhe von "hier muss nichts aufgelöst werden" ist der ganze Modus.',
    },
    aeolian: {
      focusLabel: 'kleine Sexte',
      hook: 'Der äolische Modus ist die natürliche Molltonleiter — die klassische traurige, die Schattenzwillingin der Durtonleiter.',
      sound: 'Es ist der Klang von fast allem Rock und Pop in Moll: "Stairway to Heaven", "Losing My Religion", jede Power-Ballade. Die kleine Sexte trennt ihn vom Dorischen: Wo Dorisch hebt, sinkt Äolisch.',
      practice: 'Geh über dem Drone von der kleinen Sexte zur Quinte hinunter und spür, wie sie sich setzt — dieser Seufzer ist die Unterschrift des natürlichen Molls.',
    },
    locrian: {
      focusLabel: 'verminderte Quinte',
      hook: 'Der lokrische Modus ist der instabile: Sekunde und Quinte sind erniedrigt, sodass das Zuhause selbst ein verminderter Akkord ist, der nie zur Ruhe kommt.',
      sound: 'Ohne reine Quinte zum Anlehnen weigert sich Lokrisch, sich aufzulösen — genau deshalb heben Metal und Jazz ihn für die maximale Spannung auf. Weniger ein Ort zum Wohnen als einer, durch den man drohend hindurchzieht.',
      practice: 'Merke über dem Drone, wie sogar der Grundton vorläufig wirkt — die verminderte Quinte zieht dir immer wieder den Boden weg.',
    },
  },
  t: {
    upgradeCta: 'Mach Üben zur Gewohnheit · 5 $/Monat',
    title: 'Der Modus {name} auf der Gitarre — Skala, Akkorde und Griffbrett-Diagramm | Modal Runs',
    metaDesc: '{name} auf der Gitarre: {notes}. Ein interaktives Griffbrett-Diagramm, die leitereigenen Akkorde und ein kostenloser Drone zum Improvisieren — Modal Runs hört dich übers Mikrofon und lässt in Echtzeit aufleuchten, was du spielst.',
    h1: '{name} auf der Gitarre',
    lead: '{hook} Die Töne von {name} sind <strong>{notes}</strong>. Sein charakteristischer Ton ist <strong>{focus}</strong> — die {focusLabel} — der Ton, der dieser Tonleiter ihre Farbe gibt.',
    neckHeading: '{name} über das ganze Griffbrett',
    figcaption: 'Standardstimmung, Bünde 0–12. Die goldenen Töne sind der Grundton ({root}); jede Farbe steht für ein Intervall — dieselbe Palette wie in der App.',
    ariaFretboard: 'Die Tonleiter {name} auf dem Gitarrengriffbrett, Bünde 0 bis 12',
    ctaMain: 'Übe {name} über einem Drone →',
    ctaSub: 'Kostenlos, im Browser. Er hört dich übers Mikrofon und lässt aufleuchten, was du spielst.',
    formulaHeading: 'Formel und Intervalle',
    formulaLine: '<strong>{formula}</strong> — {n} Töne. {family}',
    familyMajor: 'Die große Terz macht sie zu einer Tonleiter der Dur-Familie.',
    familyMinor: 'Die kleine Terz macht sie zu einer Tonleiter der Moll-Familie.',
    familyDim: 'Die kleine Terz und die verminderte Quinte bilden einen verminderten Dreiklang auf dem Grundton.',
    chordsHeading: 'Akkorde in {name}',
    chordsIntro: 'Das sind die leitereigenen Akkorde — Harmonik, gebaut nur aus den Tönen oben. Zwischen ihnen zu wechseln hält dich im Modus.',
    thDegree: 'Stufe', thChord: 'Akkord', thQuality: 'Qualität',
    sameNotesHeading: 'Gleiche Töne, anderes Zuhause',
    relative: '{name} enthält exakt dieselben Töne wie <a href="{parentHref}">{parent}</a>. Die Töne ändern sich nicht — es ändert sich, welcher sich wie Zuhause anfühlt, und das ändert alles.',
    relativeIonian: 'Alle Modi auf dieser Seite entstehen aus einer Durtonleiter. {name} ist die {root}-Dur-Tonleiter — die anderen sechs Modi verwenden exakt ihre Töne, nur mit einem anderen Zuhause.',
    otherModesHeading: 'Andere Modi auf {root}',
    otherModesIntro: 'Behalte denselben Grundton und wechsle die Tonleiter — der schnellste Weg zu hören, was jeder Modus macht.',
    indexTitle: 'Gitarren-Modi in allen Tonarten — Formeln, Töne und Griffbrett-Diagramme | Modal Runs',
    indexDesc: 'Griffbrett-Diagramme für alle sieben Modi (Kirchentonarten) in allen zwölf Tonarten: die Formel und die Töne jedes Modus, leitereigene Akkorde und ein kostenloser Drone zum Improvisieren. Echtes Gehörtraining — Modal Runs hört dich beim Üben übers Mikrofon.',
    indexH1: 'Alle Modi, alle Tonarten',
    indexLead: 'Die sieben Modi der Durtonleiter, in allen zwölf Tonarten aufs Griffbrett gelegt — mit den Tönen, den Akkorden, die in jedem Modus wohnen, und einem Drone zum Improvisieren. Wähl eine Tonart; die Seite zeigt dir das Diagramm, und <a href="/">die App</a> hört dir zu, während du es spielst.',
    faqQ: 'Was ist {name}?',
    footerModes: 'Alle Modi',
    footerApp: 'App öffnen',
    footerTag: 'Modal Runs — lern das Griffbrett, indem du es spielst. Kostenlos.',
    homeTitle: 'Modal Runs — Lern das Griffbrett, indem du es spielst',
    homeDesc: 'Lern das Griffbrett, indem du es spielst: Halte einen Drone in jeder Tonart, improvisiere, und Modal Runs lässt jeden Ton, den du spielst, in Echtzeit auf dem Griffbrett aufleuchten — echtes Gehörtraining. Finde die Modi nach Gehör, statt sie auswendig zu lernen. Kostenlos.',
    homeH1: 'Modal Runs — lern das Griffbrett, indem du es spielst',
    homeLead: 'Halte einen Drone in jeder Tonart, improvisiere, und Modal Runs hört dich übers Mikrofon — lässt jeden Ton, den du spielst, auf dem Griffbrett aufleuchten und sagt dir, wenn du den gesuchten Ton triffst. Lerne die Modi nach Gehör, statt sie auswendig zu lernen. Kostenlos, im Browser, ohne Anmeldung.',
  },
}
