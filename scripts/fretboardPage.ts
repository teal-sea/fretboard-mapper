// ─── /fretboard/ — the plain notes-on-the-neck chart cluster ─────────
// Google Trends: "fretboard map" interest is up 300% and the intent
// cluster around it — "guitar fretboard notes", "fretboard chart",
// "guitar fretboard notes pdf" — is more basic than anything the mode
// or chord pages answer: just show me every note on the neck. This page
// does exactly that, in every language, from the same deterministic
// engine (golden rule 2 — no hardcoded frets, noteIndex/noteName
// compute every label).
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  noteIndex, noteName, TUNINGS, SCALES, getScaleNotes, computeFretboard,
} from '../src/utils/musicTheory'
import { DEFAULT_INTERVAL_COLORS } from '../src/utils/defaultColors'
import { displayNote, LANGUAGES } from '../src/utils/noteNames'
import Fretboard from '../src/components/Fretboard'
import {
  ORIGIN, head, siteHeader, SITE_HEADER, footer,
  breadcrumbList, articleSchema,
} from './shared'
import { LOCALES, type Locale } from './locales'

const NUM_FRETS = 12

// ─── The actual fretboard ────────────────────────────────────────────
// Not a lookalike: the app's own Fretboard component (ebony board, bone
// nut, fret wires, wound strings, interval palette), server-rendered
// with renderToStaticMarkup. Anchored on C: the naturals chart IS C
// major on the neck; the full chart adds the chromatic notes.
function chartSvg(disp: (n: string) => string, ariaLabel: string, naturalsOnly: boolean, localized: boolean): string {
  const activeNotes = naturalsOnly
    ? getScaleNotes('C', SCALES['ionian'])
    : new Set(Array.from({ length: 12 }, (_, pc) => pc))
  const board = computeFretboard(TUNINGS['standard'], 'C', activeNotes, NUM_FRETS)
  // Same lookup table App.tsx hands the component — every engine
  // spelling mapped to this page's language (solfège, German H, …).
  let noteMap: Record<string, string> | null = null
  if (localized) {
    noteMap = {}
    for (const n of ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B']) noteMap[n] = disp(n)
  }
  const svg = renderToStaticMarkup(createElement(Fretboard, {
    board,
    displayMode: 'notes',
    inlayStyle: 'dots',
    intervalColors: DEFAULT_INTERVAL_COLORS,
    highlightRoot: true,
    showLeftHanded: false,
    posRange: null,
    numFrets: NUM_FRETS,
    tuningLabels: TUNINGS['standard'].labels.map(disp),
    noteMap,
  }))
  return `<div role="img" aria-label="${ariaLabel}">${svg}</div>`
}

// Per-string note run, fret 0 → 12, as prose ("E string: E, F, F# …") —
// this is the text form the "guitar fretboard notes" queries want.
function stringRuns(disp: (n: string) => string): { open: string; run: string }[] {
  const labels = TUNINGS['standard'].labels
  // High E first — reads top-down like the chart
  return [...labels].map((l, i) => ({ l, i })).reverse().map(({ l }) => {
    const openPc = noteIndex(l)
    const run = Array.from({ length: NUM_FRETS + 1 }, (_, f) => disp(noteName((openPc + f) % 12, false))).join(' · ')
    return { open: disp(l), run }
  })
}

// ─── Copy, per language ──────────────────────────────────────────────
type FretboardCopy = {
  slug: string            // URL segment under /{lang}/ ('' = English /fretboard/)
  title: string
  description: string
  h1: string
  lead: string
  fullHeading: string
  fullCaption: string
  naturalsHeading: string
  naturalsBody: string
  naturalsCaption: string
  stringsHeading: string
  stringsBody: string
  stringLabel: string     // '{open} string' pattern, {open} replaced
  octaveHeading: string
  octaveBody: string
  printHeading: string
  printBody: string
  printButton: string
  nextHeading: string
  nextBody: string        // may contain {modes} and {app} link slots
  modesWord: string       // the in-sentence link text the {modes} slot gets
  appWord: string         // the in-sentence link text the {app} slot gets
  aria: string
  ariaNaturals: string
}

const EN: FretboardCopy = {
  slug: '',
  title: 'Guitar Fretboard Map — Every Note on the Neck (Chart & Diagram) | Modal Runs',
  description: 'A complete guitar fretboard map: every note on all six strings, frets 0–12, in standard tuning. Naturals and sharps charted, per-string note runs, a printable chart, and an app that lights the map up while you play.',
  h1: 'The guitar fretboard, mapped',
  lead: 'Every note on the neck in standard tuning ({tuning}), from the open strings to the 12th fret — after fret 12 the whole map repeats an octave higher. Every note wears the colour the app gives it — its sound relative to C — and the gold dots are C itself.',
  fullHeading: 'The full fretboard chart',
  fullCaption: 'All 12 notes on every string, frets 0–12, standard tuning. Sharps are shown; each sharp is the same fret as its flat name (F# = Gb).',
  naturalsHeading: 'Start with the naturals',
  naturalsBody: 'Nobody memorises 78 fret positions at once. Learn the seven natural notes ({naturals}) on each string first — they are the skeleton; every sharp or flat is one fret up or down from a natural you already know.',
  naturalsCaption: 'Natural notes only — the skeleton of the fretboard map.',
  stringsHeading: 'The notes on each string',
  stringsBody: 'The same map as text, one string at a time, open string to fret 12:',
  stringLabel: '{open} string',
  octaveHeading: 'Shortcuts that make it stick',
  octaveBody: 'Frets 3, 5, 7, 9 and 12 have inlay dots on almost every guitar — anchor the naturals to those. The 12th fret is always the octave of the open string. And the two E strings are identical, so learning the low E gives you the high E for free.',
  printHeading: 'Print it (or save as PDF)',
  printBody: 'This page prints as a clean one-sheet chart — use your browser’s print dialog and choose "Save as PDF" to keep it on your music stand or tablet.',
  printButton: 'Print this chart / Save as PDF',
  nextHeading: 'Make the map light up',
  nextBody: 'A static chart shows you the notes; {app} listens through your mic and lights up every note you actually play on this same map, in real time. When you’re ready for what the notes mean together, {modes} map every scale onto this neck.',
  modesWord: 'the mode pages',
  appWord: 'the app',
  aria: 'Guitar fretboard chart: every note on all six strings from open to fret 12 in standard tuning',
  ariaNaturals: 'Guitar fretboard chart showing only the natural notes, open to fret 12, standard tuning',
}

const LOCALIZED: Record<string, FretboardCopy> = {
  es: {
    slug: 'diapason',
    title: 'Mapa del diapasón de la guitarra — Todas las notas del mástil (diagrama) | Modal Runs',
    description: 'Mapa completo del diapasón: todas las notas de las seis cuerdas, trastes 0–12, en afinación estándar. Notas naturales y alteraciones, las notas cuerda por cuerda, un diagrama imprimible y una app que ilumina el mapa mientras tocas.',
    h1: 'El diapasón de la guitarra, mapeado',
    lead: 'Todas las notas del mástil en afinación estándar ({tuning}), desde las cuerdas al aire hasta el traste 12 — después del traste 12 todo el mapa se repite una octava más arriba. Cada nota lleva el color que le da la app — su sonido respecto a Do — y los puntos dorados son el propio Do.',
    fullHeading: 'El diagrama completo del diapasón',
    fullCaption: 'Las 12 notas en cada cuerda, trastes 0–12, afinación estándar. Se muestran los sostenidos; cada sostenido ocupa el mismo traste que su nombre en bemol.',
    naturalsHeading: 'Empieza por las naturales',
    naturalsBody: 'Nadie memoriza 78 posiciones de golpe. Aprende primero las siete notas naturales ({naturals}) en cada cuerda — son el esqueleto; cada sostenido o bemol está a un traste de una natural que ya conoces.',
    naturalsCaption: 'Solo las notas naturales — el esqueleto del mapa del diapasón.',
    stringsHeading: 'Las notas de cada cuerda',
    stringsBody: 'El mismo mapa en texto, cuerda por cuerda, de la cuerda al aire al traste 12:',
    stringLabel: 'Cuerda {open}',
    octaveHeading: 'Atajos para que se te quede',
    octaveBody: 'Los trastes 3, 5, 7, 9 y 12 llevan marcas en casi todas las guitarras — ancla las naturales a esos puntos. El traste 12 siempre es la octava de la cuerda al aire. Y las dos cuerdas Mi son idénticas: aprender la sexta te regala la primera.',
    printHeading: 'Imprímelo (o guárdalo como PDF)',
    printBody: 'Esta página se imprime como un diagrama limpio de una hoja — usa el diálogo de impresión del navegador y elige «Guardar como PDF» para tenerlo en el atril o la tablet.',
    printButton: 'Imprimir el diagrama / Guardar como PDF',
    nextHeading: 'Haz que el mapa se ilumine',
    nextBody: 'Un diagrama estático te enseña las notas; {app} te escucha por el micrófono e ilumina en tiempo real cada nota que tocas sobre este mismo mapa. Cuando quieras saber qué significan juntas, las páginas de {modes} proyectan cada escala sobre este mástil.',
    modesWord: 'los modos',
    appWord: 'la app',
    aria: 'Diagrama del diapasón: todas las notas de las seis cuerdas, del aire al traste 12, afinación estándar',
    ariaNaturals: 'Diagrama del diapasón con solo las notas naturales, del aire al traste 12, afinación estándar',
  },
  fr: {
    slug: 'manche',
    title: 'Carte du manche de la guitare — Toutes les notes du manche (schéma) | Modal Runs',
    description: 'La carte complète du manche : toutes les notes des six cordes, cases 0 à 12, en accordage standard. Notes naturelles et altérations, les notes corde par corde, un schéma imprimable et une app qui illumine la carte pendant que tu joues.',
    h1: 'Le manche de la guitare, cartographié',
    lead: 'Toutes les notes du manche en accordage standard ({tuning}), des cordes à vide à la 12e case — après la case 12, toute la carte se répète une octave plus haut. Chaque note porte la couleur que l’app lui donne — sa sonorité par rapport à Do — et les points dorés sont Do lui-même.',
    fullHeading: 'Le schéma complet du manche',
    fullCaption: 'Les 12 notes sur chaque corde, cases 0–12, accordage standard. Les dièses sont affichés ; chaque dièse occupe la même case que son nom en bémol.',
    naturalsHeading: 'Commence par les notes naturelles',
    naturalsBody: 'Personne ne mémorise 78 positions d’un coup. Apprends d’abord les sept notes naturelles ({naturals}) sur chaque corde — c’est le squelette ; chaque dièse ou bémol est à une case d’une naturelle que tu connais déjà.',
    naturalsCaption: 'Les notes naturelles seules — le squelette de la carte du manche.',
    stringsHeading: 'Les notes de chaque corde',
    stringsBody: 'La même carte en texte, corde par corde, de la corde à vide à la case 12 :',
    stringLabel: 'Corde {open}',
    octaveHeading: 'Des raccourcis pour que ça reste',
    octaveBody: 'Les cases 3, 5, 7, 9 et 12 portent des repères sur presque toutes les guitares — ancre les naturelles dessus. La 12e case est toujours l’octave de la corde à vide. Et les deux cordes Mi sont identiques : apprendre la grosse corde t’offre la chanterelle.',
    printHeading: 'Imprime-la (ou enregistre en PDF)',
    printBody: 'Cette page s’imprime comme un schéma propre sur une feuille — utilise la boîte d’impression du navigateur et choisis « Enregistrer au format PDF » pour la garder sur ton pupitre ou ta tablette.',
    printButton: 'Imprimer le schéma / Enregistrer en PDF',
    nextHeading: 'Fais s’illuminer la carte',
    nextBody: 'Un schéma statique montre les notes ; {app} t’écoute au micro et illumine en temps réel chaque note que tu joues sur cette même carte. Quand tu veux comprendre ce qu’elles signifient ensemble, les pages des {modes} projettent chaque gamme sur ce manche.',
    modesWord: 'modes',
    appWord: 'l’app',
    aria: 'Schéma du manche : toutes les notes des six cordes, de la corde à vide à la case 12, accordage standard',
    ariaNaturals: 'Schéma du manche avec uniquement les notes naturelles, de la corde à vide à la case 12, accordage standard',
  },
  it: {
    slug: 'tastiera',
    title: 'Mappa della tastiera della chitarra — Tutte le note sul manico (schema) | Modal Runs',
    description: 'La mappa completa della tastiera: tutte le note sulle sei corde, tasti 0–12, in accordatura standard. Note naturali e alterazioni, le note corda per corda, uno schema stampabile e un’app che illumina la mappa mentre suoni.',
    h1: 'La tastiera della chitarra, mappata',
    lead: 'Tutte le note sul manico in accordatura standard ({tuning}), dalle corde a vuoto al 12º tasto — dopo il tasto 12 l’intera mappa si ripete un’ottava sopra. Ogni nota indossa il colore che le dà l’app — il suo suono rispetto a Do — e i punti dorati sono il Do stesso.',
    fullHeading: 'Lo schema completo della tastiera',
    fullCaption: 'Le 12 note su ogni corda, tasti 0–12, accordatura standard. Sono mostrati i diesis; ogni diesis occupa lo stesso tasto del suo nome in bemolle.',
    naturalsHeading: 'Parti dalle note naturali',
    naturalsBody: 'Nessuno memorizza 78 posizioni in una volta. Impara prima le sette note naturali ({naturals}) su ogni corda — sono lo scheletro; ogni diesis o bemolle è a un tasto da una naturale che già conosci.',
    naturalsCaption: 'Solo le note naturali — lo scheletro della mappa della tastiera.',
    stringsHeading: 'Le note su ogni corda',
    stringsBody: 'La stessa mappa in testo, corda per corda, dalla corda a vuoto al tasto 12:',
    stringLabel: 'Corda {open}',
    octaveHeading: 'Scorciatoie per farla restare',
    octaveBody: 'I tasti 3, 5, 7, 9 e 12 hanno i segnatasti su quasi tutte le chitarre — àncora le naturali a quei punti. Il 12º tasto è sempre l’ottava della corda a vuoto. E le due corde Mi sono identiche: imparare il Mi basso ti regala il cantino.',
    printHeading: 'Stampala (o salvala in PDF)',
    printBody: 'Questa pagina si stampa come uno schema pulito su un foglio — usa la finestra di stampa del browser e scegli «Salva come PDF» per tenerlo sul leggio o sul tablet.',
    printButton: 'Stampa lo schema / Salva in PDF',
    nextHeading: 'Fai illuminare la mappa',
    nextBody: 'Uno schema statico ti mostra le note; {app} ti ascolta dal microfono e illumina in tempo reale ogni nota che suoni su questa stessa mappa. Quando vuoi capire cosa significano insieme, le pagine dei {modes} proiettano ogni scala su questo manico.',
    modesWord: 'modi',
    appWord: 'l’app',
    aria: 'Schema della tastiera: tutte le note sulle sei corde, dalla corda a vuoto al tasto 12, accordatura standard',
    ariaNaturals: 'Schema della tastiera con solo le note naturali, dalla corda a vuoto al tasto 12, accordatura standard',
  },
  pt: {
    slug: 'braco',
    title: 'Mapa do braço da guitarra — Todas as notas no braço (diagrama) | Modal Runs',
    description: 'O mapa completo do braço: todas as notas nas seis cordas, casas 0–12, em afinação padrão. Notas naturais e acidentes, as notas corda por corda, um diagrama para imprimir e um app que ilumina o mapa enquanto você toca.',
    h1: 'O braço da guitarra, mapeado',
    lead: 'Todas as notas do braço em afinação padrão ({tuning}), das cordas soltas até a casa 12 — depois da casa 12 o mapa inteiro se repete uma oitava acima. Cada nota carrega a cor que o app lhe dá — o seu som em relação ao Dó — e os pontos dourados são o próprio Dó.',
    fullHeading: 'O diagrama completo do braço',
    fullCaption: 'As 12 notas em cada corda, casas 0–12, afinação padrão. Os sustenidos aparecem no mapa; cada sustenido fica na mesma casa que o seu nome em bemol.',
    naturalsHeading: 'Comece pelas naturais',
    naturalsBody: 'Ninguém memoriza 78 posições de uma vez. Aprenda primeiro as sete notas naturais ({naturals}) em cada corda — elas são o esqueleto; cada sustenido ou bemol está a uma casa de uma natural que você já conhece.',
    naturalsCaption: 'Só as notas naturais — o esqueleto do mapa do braço.',
    stringsHeading: 'As notas em cada corda',
    stringsBody: 'O mesmo mapa em texto, corda por corda, da corda solta até a casa 12:',
    stringLabel: 'Corda {open}',
    octaveHeading: 'Atalhos para fixar',
    octaveBody: 'As casas 3, 5, 7, 9 e 12 têm marcações em quase toda guitarra — ancore as naturais nelas. A casa 12 é sempre a oitava da corda solta. E as duas cordas Mi são idênticas: aprender a mais grave te dá a mais aguda de graça.',
    printHeading: 'Imprima (ou salve em PDF)',
    printBody: 'Esta página imprime como um diagrama limpo de uma folha — use a janela de impressão do navegador e escolha «Salvar como PDF» para deixar na estante ou no tablet.',
    printButton: 'Imprimir o diagrama / Salvar em PDF',
    nextHeading: 'Faça o mapa acender',
    nextBody: 'Um diagrama estático mostra as notas; {app} te escuta pelo microfone e ilumina em tempo real cada nota que você toca neste mesmo mapa. Quando quiser entender o que elas significam juntas, as páginas dos {modes} projetam cada escala neste braço.',
    modesWord: 'modos',
    appWord: 'o app',
    aria: 'Diagrama do braço: todas as notas nas seis cordas, da corda solta à casa 12, afinação padrão',
    ariaNaturals: 'Diagrama do braço mostrando só as notas naturais, da corda solta à casa 12, afinação padrão',
  },
  de: {
    slug: 'griffbrett',
    title: 'Griffbrett-Diagramm der Gitarre — Alle Töne auf dem Griffbrett | Modal Runs',
    description: 'Das komplette Griffbrett der Gitarre: alle Töne auf allen sechs Saiten, Bund 0–12, in Standardstimmung. Naturtöne und Vorzeichen im Diagramm, die Töne Saite für Saite, ein druckbares Diagramm und eine App, die das Griffbrett beim Spielen aufleuchten lässt.',
    h1: 'Das Griffbrett der Gitarre, kartiert',
    lead: 'Alle Töne auf dem Griffbrett in Standardstimmung ({tuning}), von den Leersaiten bis zum 12. Bund — ab Bund 12 wiederholt sich das ganze Diagramm eine Oktave höher. Jeder Ton trägt die Farbe, die ihm die App gibt — seinen Klang relativ zu C — und die goldenen Punkte sind das C selbst.',
    fullHeading: 'Das komplette Griffbrett-Diagramm',
    fullCaption: 'Alle 12 Töne auf jeder Saite, Bund 0–12, Standardstimmung. Angezeigt werden die Kreuz-Namen; jeder Ton liegt auf demselben Bund wie sein B-Name.',
    naturalsHeading: 'Fang mit den Naturtönen an',
    naturalsBody: 'Niemand merkt sich 78 Positionen auf einmal. Lerne zuerst die sieben Naturtöne ({naturals}) auf jeder Saite — sie sind das Gerüst; jedes Vorzeichen liegt einen Bund neben einem Naturton, den du schon kennst.',
    naturalsCaption: 'Nur die Naturtöne — das Gerüst des Griffbrett-Diagramms.',
    stringsHeading: 'Die Töne auf jeder Saite',
    stringsBody: 'Dasselbe Diagramm als Text, Saite für Saite, von der Leersaite bis Bund 12:',
    stringLabel: '{open}-Saite',
    octaveHeading: 'Abkürzungen, damit es hängen bleibt',
    octaveBody: 'Die Bünde 3, 5, 7, 9 und 12 tragen auf fast jeder Gitarre Einlagen — verankere die Naturtöne daran. Der 12. Bund ist immer die Oktave der Leersaite. Und die beiden E-Saiten sind identisch: Wer die tiefe E-Saite lernt, bekommt die hohe geschenkt.',
    printHeading: 'Drucken (oder als PDF speichern)',
    printBody: 'Diese Seite druckt sich als sauberes Ein-Blatt-Diagramm — öffne den Druckdialog des Browsers und wähle „Als PDF speichern“, um es aufs Notenpult oder Tablet zu legen.',
    printButton: 'Diagramm drucken / Als PDF speichern',
    nextHeading: 'Lass das Diagramm aufleuchten',
    nextBody: 'Ein statisches Diagramm zeigt dir die Töne; {app} hört dich übers Mikrofon und lässt jeden Ton, den du spielst, in Echtzeit auf genau diesem Diagramm aufleuchten. Wenn du wissen willst, was die Töne zusammen bedeuten, projizieren die {modes}-Seiten jede Skala auf dieses Griffbrett.',
    modesWord: 'Modi',
    appWord: 'die App',
    aria: 'Griffbrett-Diagramm: alle Töne auf allen sechs Saiten, von der Leersaite bis Bund 12, Standardstimmung',
    ariaNaturals: 'Griffbrett-Diagramm nur mit den Naturtönen, von der Leersaite bis Bund 12, Standardstimmung',
  },
  nl: {
    slug: 'gitaarhals',
    title: 'Halsdiagram van de gitaar — Alle noten op de hals (kaart) | Modal Runs',
    description: 'De complete kaart van de gitaarhals: alle noten op alle zes snaren, fret 0–12, in standaardstemming. Stamtonen en voortekens in beeld, de noten snaar voor snaar, een printbaar diagram en een app die de kaart laat oplichten terwijl je speelt.',
    h1: 'De gitaarhals, in kaart gebracht',
    lead: 'Alle noten op de hals in standaardstemming ({tuning}), van de losse snaren tot fret 12 — na fret 12 herhaalt de hele kaart zich een octaaf hoger. Elke noot draagt de kleur die de app hem geeft — zijn klank ten opzichte van C — en de gouden stippen zijn de C zelf.',
    fullHeading: 'Het complete halsdiagram',
    fullCaption: 'Alle 12 noten op elke snaar, fret 0–12, standaardstemming. Kruizen worden getoond; elk kruis zit op dezelfde fret als zijn mol-naam.',
    naturalsHeading: 'Begin met de stamtonen',
    naturalsBody: 'Niemand onthoudt 78 posities tegelijk. Leer eerst de zeven stamtonen ({naturals}) op elke snaar — dat is het skelet; elk kruis of elke mol zit één fret naast een stamtoon die je al kent.',
    naturalsCaption: 'Alleen de stamtonen — het skelet van de halskaart.',
    stringsHeading: 'De noten op elke snaar',
    stringsBody: 'Dezelfde kaart als tekst, snaar voor snaar, van losse snaar tot fret 12:',
    stringLabel: '{open}-snaar',
    octaveHeading: 'Trucs waardoor het blijft hangen',
    octaveBody: 'Frets 3, 5, 7, 9 en 12 hebben op bijna elke gitaar inleg-stippen — veranker de stamtonen daaraan. Fret 12 is altijd het octaaf van de losse snaar. En de twee E-snaren zijn identiek: de lage E leren geeft je de hoge E cadeau.',
    printHeading: 'Print hem (of bewaar als PDF)',
    printBody: 'Deze pagina print als een schoon één-vel-diagram — open het printvenster van je browser en kies “Opslaan als PDF” voor op je muziekstandaard of tablet.',
    printButton: 'Diagram printen / Opslaan als PDF',
    nextHeading: 'Laat de kaart oplichten',
    nextBody: 'Een statisch diagram laat je de noten zien; {app} luistert via je microfoon en laat elke noot die je speelt in realtime oplichten op precies deze kaart. Klaar voor wat de noten samen betekenen? De {modes}-pagina’s projecteren elke toonladder op deze hals.',
    modesWord: 'modi',
    appWord: 'de app',
    aria: 'Halsdiagram: alle noten op alle zes snaren, van losse snaar tot fret 12, standaardstemming',
    ariaNaturals: 'Halsdiagram met alleen de stamtonen, van losse snaar tot fret 12, standaardstemming',
  },
  pl: {
    slug: 'gryf',
    title: 'Mapa gryfu gitary — Wszystkie nuty na gryfie (diagram) | Modal Runs',
    description: 'Kompletna mapa gryfu: wszystkie nuty na sześciu strunach, progi 0–12, w stroju standardowym. Nuty naturalne i alterowane, przebiegi struna po strunie, diagram do druku i aplikacja, która podświetla mapę, gdy grasz.',
    h1: 'Gryf gitary, zmapowany',
    lead: 'Wszystkie nuty na gryfie w stroju standardowym ({tuning}), od pustych strun do 12. progu — za 12. progiem cała mapa powtarza się oktawę wyżej. Każda nuta nosi kolor, który nadaje jej aplikacja — jej brzmienie względem C — a złote kropki to samo C.',
    fullHeading: 'Pełny diagram gryfu',
    fullCaption: 'Wszystkie 12 nut na każdej strunie, progi 0–12, strój standardowy. Pokazane są krzyżyki; każdy krzyżyk leży na tym samym progu co jego bemolowa nazwa.',
    naturalsHeading: 'Zacznij od nut naturalnych',
    naturalsBody: 'Nikt nie zapamięta 78 pozycji naraz. Naucz się najpierw siedmiu nut naturalnych ({naturals}) na każdej strunie — to szkielet; każdy krzyżyk czy bemol leży o próg od naturalnej, którą już znasz.',
    naturalsCaption: 'Same nuty naturalne — szkielet mapy gryfu.',
    stringsHeading: 'Nuty na każdej strunie',
    stringsBody: 'Ta sama mapa jako tekst, struna po strunie, od pustej struny do 12. progu:',
    stringLabel: 'Struna {open}',
    octaveHeading: 'Skróty, dzięki którym to zostaje',
    octaveBody: 'Progi 3, 5, 7, 9 i 12 mają na prawie każdej gitarze znaczniki — zakotwicz nuty naturalne właśnie tam. 12. próg to zawsze oktawa pustej struny. A obie struny E są identyczne: ucząc się niskiej, dostajesz wysoką gratis.',
    printHeading: 'Wydrukuj (albo zapisz jako PDF)',
    printBody: 'Ta strona drukuje się jako czysty jednokartkowy diagram — otwórz okno drukowania przeglądarki i wybierz „Zapisz jako PDF”, żeby mieć go na pulpicie nutowym albo tablecie.',
    printButton: 'Wydrukuj diagram / Zapisz jako PDF',
    nextHeading: 'Niech mapa się zaświeci',
    nextBody: 'Statyczny diagram pokazuje nuty; {app} słucha cię przez mikrofon i w czasie rzeczywistym podświetla na tej samej mapie każdą nutę, którą grasz. Gdy zechcesz wiedzieć, co znaczą razem, strony {modes} nakładają każdą skalę na ten gryf.',
    modesWord: 'skal modalnych',
    appWord: 'aplikacja',
    aria: 'Diagram gryfu: wszystkie nuty na sześciu strunach, od pustej struny do 12. progu, strój standardowy',
    ariaNaturals: 'Diagram gryfu tylko z nutami naturalnymi, od pustej struny do 12. progu, strój standardowy',
  },
  ru: {
    slug: 'grif',
    title: 'Карта грифа гитары — Все ноты на грифе (схема) | Modal Runs',
    description: 'Полная карта грифа: все ноты на шести струнах, лады 0–12, в стандартном строе. Натуральные ноты и знаки альтерации, ноты по каждой струне, схема для печати и приложение, которое подсвечивает карту, пока ты играешь.',
    h1: 'Гриф гитары — на карте',
    lead: 'Все ноты на грифе в стандартном строе ({tuning}), от открытых струн до 12-го лада — после 12-го лада вся карта повторяется октавой выше. Каждая нота носит цвет, который даёт ей приложение — её звучание относительно До, — а золотые точки — это само До.',
    fullHeading: 'Полная схема грифа',
    fullCaption: 'Все 12 нот на каждой струне, лады 0–12, стандартный строй. Показаны диезы; каждый диез стоит на том же ладу, что и его бемольное имя.',
    naturalsHeading: 'Начни с натуральных нот',
    naturalsBody: 'Никто не запоминает 78 позиций разом. Сначала выучи семь натуральных нот ({naturals}) на каждой струне — это скелет; каждый диез или бемоль находится в одном ладу от натуральной ноты, которую ты уже знаешь.',
    naturalsCaption: 'Только натуральные ноты — скелет карты грифа.',
    stringsHeading: 'Ноты на каждой струне',
    stringsBody: 'Та же карта текстом, струна за струной, от открытой струны до 12-го лада:',
    stringLabel: 'Струна {open}',
    octaveHeading: 'Приёмы, чтобы запомнилось',
    octaveBody: 'На ладах 3, 5, 7, 9 и 12 почти у каждой гитары есть метки — привяжи натуральные ноты к ним. 12-й лад — всегда октава открытой струны. А обе струны Ми одинаковы: выучив нижнюю, получаешь верхнюю бесплатно.',
    printHeading: 'Распечатай (или сохрани в PDF)',
    printBody: 'Эта страница печатается как аккуратная схема на один лист — открой диалог печати браузера и выбери «Сохранить как PDF», чтобы держать её на пюпитре или планшете.',
    printButton: 'Распечатать схему / Сохранить в PDF',
    nextHeading: 'Пусть карта загорится',
    nextBody: 'Статичная схема показывает ноты; {app} слушает тебя через микрофон и в реальном времени подсвечивает на этой же карте каждую ноту, которую ты играешь. А когда захочешь понять, что ноты значат вместе, страницы {modes} накладывают каждую гамму на этот гриф.',
    modesWord: 'ладов',
    appWord: 'приложение',
    aria: 'Схема грифа: все ноты на шести струнах, от открытой струны до 12-го лада, стандартный строй',
    ariaNaturals: 'Схема грифа только с натуральными нотами, от открытой струны до 12-го лада, стандартный строй',
  },
  uk: {
    slug: 'hryf',
    title: 'Мапа грифа гітари — Усі ноти на грифі (схема) | Modal Runs',
    description: 'Повна мапа грифа: усі ноти на шести струнах, лади 0–12, у стандартному строї. Натуральні ноти і знаки альтерації, ноти по кожній струні, схема для друку і застосунок, що підсвічує мапу, поки ти граєш.',
    h1: 'Гриф гітари — на мапі',
    lead: 'Усі ноти на грифі в стандартному строї ({tuning}), від відкритих струн до 12-го ладу — після 12-го ладу вся мапа повторюється октавою вище. Кожна нота носить колір, який дає їй застосунок — її звучання відносно До, — а золоті точки — це саме До.',
    fullHeading: 'Повна схема грифа',
    fullCaption: 'Усі 12 нот на кожній струні, лади 0–12, стандартний стрій. Показано дієзи; кожен дієз стоїть на тому самому ладу, що і його бемольна назва.',
    naturalsHeading: 'Почни з натуральних нот',
    naturalsBody: 'Ніхто не запам’ятовує 78 позицій одразу. Спершу вивчи сім натуральних нот ({naturals}) на кожній струні — це скелет; кожен дієз чи бемоль лежить за один лад від натуральної ноти, яку ти вже знаєш.',
    naturalsCaption: 'Лише натуральні ноти — скелет мапи грифа.',
    stringsHeading: 'Ноти на кожній струні',
    stringsBody: 'Та сама мапа текстом, струна за струною, від відкритої струни до 12-го ладу:',
    stringLabel: 'Струна {open}',
    octaveHeading: 'Прийоми, щоб запам’яталося',
    octaveBody: 'На ладах 3, 5, 7, 9 і 12 майже кожна гітара має позначки — прив’яжи натуральні ноти до них. 12-й лад — завжди октава відкритої струни. А обидві струни Мі однакові: вивчивши нижню, отримуєш верхню задарма.',
    printHeading: 'Роздрукуй (або збережи в PDF)',
    printBody: 'Ця сторінка друкується як охайна схема на один аркуш — відкрий діалог друку браузера й обери «Зберегти як PDF», щоб тримати її на пюпітрі або планшеті.',
    printButton: 'Роздрукувати схему / Зберегти в PDF',
    nextHeading: 'Нехай мапа засвітиться',
    nextBody: 'Статична схема показує ноти; {app} слухає тебе через мікрофон і в реальному часі підсвічує на цій самій мапі кожну ноту, яку ти граєш. А коли захочеш зрозуміти, що ноти означають разом, сторінки {modes} накладають кожну гаму на цей гриф.',
    modesWord: 'ладів',
    appWord: 'застосунок',
    aria: 'Схема грифа: усі ноти на шести струнах, від відкритої струни до 12-го ладу, стандартний стрій',
    ariaNaturals: 'Схема грифа лише з натуральними нотами, від відкритої струни до 12-го ладу, стандартний стрій',
  },
  tr: {
    slug: 'klavye',
    title: 'Gitar klavye haritası — Saptaki bütün notalar (şema) | Modal Runs',
    description: 'Klavyenin eksiksiz haritası: altı telin tamamındaki bütün notalar, perde 0–12, standart akortta. Doğal notalar ve arızalar şemada, tel tel nota dizileri, yazdırılabilir bir şema ve sen çalarken haritayı aydınlatan bir uygulama.',
    h1: 'Gitar klavyesi, haritalandı',
    lead: 'Standart akortta ({tuning}) saptaki bütün notalar, boş tellerden 12. perdeye — 12. perdeden sonra bütün harita bir oktav yukarıda tekrarlanır. Her nota, uygulamanın ona verdiği rengi taşır — Do’ya göre tınısını — altın noktalar ise Do’nun kendisidir.',
    fullHeading: 'Eksiksiz klavye şeması',
    fullCaption: 'Her teldeki 12 nota, perde 0–12, standart akort. Diyezler gösterilir; her diyez, bemol adıyla aynı perdededir.',
    naturalsHeading: 'Doğal notalarla başla',
    naturalsBody: 'Kimse 78 pozisyonu bir kerede ezberlemez. Önce her telde yedi doğal notayı ({naturals}) öğren — onlar iskelettir; her diyez ya da bemol, zaten bildiğin bir doğal notanın bir perde yanındadır.',
    naturalsCaption: 'Yalnızca doğal notalar — klavye haritasının iskeleti.',
    stringsHeading: 'Her teldeki notalar',
    stringsBody: 'Aynı harita metin olarak, tel tel, boş telden 12. perdeye:',
    stringLabel: '{open} teli',
    octaveHeading: 'Aklında kalması için kısayollar',
    octaveBody: 'Perde 3, 5, 7, 9 ve 12, hemen her gitarda işaretlidir — doğal notaları oralara demirle. 12. perde her zaman boş telin oktavıdır. İki Mi teli de birbirinin aynısıdır: kalın teli öğrenmek inceyi bedavaya getirir.',
    printHeading: 'Yazdır (ya da PDF olarak kaydet)',
    printBody: 'Bu sayfa tek yapraklık temiz bir şema olarak yazdırılır — tarayıcının yazdırma penceresini aç ve nota sehpanda ya da tablette dursun diye «PDF olarak kaydet»i seç.',
    printButton: 'Şemayı yazdır / PDF olarak kaydet',
    nextHeading: 'Haritayı aydınlat',
    nextBody: 'Statik bir şema notaları gösterir; {app} seni mikrofondan dinler ve çaldığın her notayı aynı haritada gerçek zamanlı aydınlatır. Notaların birlikte ne anlama geldiğine hazır olduğunda {modes} sayfaları her gamı bu sapa yansıtır.',
    modesWord: 'mod',
    appWord: 'uygulama',
    aria: 'Klavye şeması: altı teldeki bütün notalar, boş telden 12. perdeye, standart akort',
    ariaNaturals: 'Yalnızca doğal notaları gösteren klavye şeması, boş telden 12. perdeye, standart akort',
  },
  ja: {
    slug: 'fretboard',
    title: 'ギター指板マップ — 指板上の全音名(チャート) | Modal Runs',
    description: 'ギター指板の完全マップ:レギュラーチューニングの6弦すべて、0〜12フレットの全音名。ナチュラルと臨時記号のチャート、弦ごとの音名一覧、印刷用チャート、そして演奏をマイクで聴き取ってマップを光らせるアプリ。',
    h1: 'ギターの指板を、マップに',
    lead: 'レギュラーチューニング({tuning})の指板上の全音名を、開放弦から12フレットまで。12フレットから先は同じマップが1オクターブ上で繰り返されます。各音はアプリと同じ色 — ドを基準にした響きの色 — をまとい、金色のドットがドそのものです。',
    fullHeading: '指板の完全チャート',
    fullCaption: '各弦の12音すべて、0〜12フレット、レギュラーチューニング。シャープ表記で示していますが、各シャープはフラット名と同じフレットです。',
    naturalsHeading: 'まずはナチュラルから',
    naturalsBody: '78ものポジションを一度に覚える人はいません。まず各弦の7つのナチュラル({naturals})を覚えましょう — それが骨組みです。シャープやフラットは、すでに知っているナチュラルの1フレット隣にあります。',
    naturalsCaption: 'ナチュラルのみ — 指板マップの骨組み。',
    stringsHeading: '各弦の音名',
    stringsBody: '同じマップをテキストで。弦ごとに、開放弦から12フレットまで:',
    stringLabel: '{open}弦',
    octaveHeading: '覚えるためのショートカット',
    octaveBody: '3・5・7・9・12フレットにはほとんどのギターでポジションマークがあります — ナチュラルをそこに結びつけましょう。12フレットは必ず開放弦のオクターブ。そして2本のE弦はまったく同じ配置なので、6弦を覚えれば1弦はおまけで付いてきます。',
    printHeading: '印刷する(またはPDFで保存)',
    printBody: 'このページは1枚のきれいなチャートとして印刷できます。ブラウザの印刷ダイアログで「PDFとして保存」を選べば、譜面台やタブレットに置いておけます。',
    printButton: 'チャートを印刷 / PDFで保存',
    nextHeading: 'マップを光らせよう',
    nextBody: '静的なチャートは音名を教えてくれるだけ。{app}はマイクであなたの演奏を聴き取り、弾いた音をこの同じマップ上でリアルタイムに光らせます。音の意味を知りたくなったら、{modes}のページがすべてのスケールをこの指板に映します。',
    modesWord: 'モード',
    appWord: 'アプリ',
    aria: '指板チャート:6弦すべての全音名、開放弦から12フレットまで、レギュラーチューニング',
    ariaNaturals: 'ナチュラルのみを示した指板チャート、開放弦から12フレットまで、レギュラーチューニング',
  },
  ko: {
    slug: 'fretboard',
    title: '기타 지판 맵 — 지판 위의 모든 음(차트) | Modal Runs',
    description: '기타 지판의 완전한 맵: 표준 튜닝 여섯 줄 전부, 0–12프렛의 모든 음. 자연음과 임시표 차트, 줄별 음 목록, 인쇄용 차트, 그리고 연주를 마이크로 들으며 맵을 밝혀주는 앱.',
    h1: '기타 지판, 맵으로',
    lead: '표준 튜닝({tuning})에서 지판 위의 모든 음을 개방현부터 12프렛까지. 12프렛 뒤로는 같은 맵이 한 옥타브 위에서 반복됩니다. 모든 음은 앱이 주는 색 — 도를 기준으로 한 울림의 색 — 을 입고 있고, 금색 점이 바로 도예요.',
    fullHeading: '지판 전체 차트',
    fullCaption: '각 줄의 12음 전부, 0–12프렛, 표준 튜닝. 샤프로 표기했지만 각 샤프는 플랫 이름과 같은 프렛입니다.',
    naturalsHeading: '자연음부터 시작하세요',
    naturalsBody: '78개 포지션을 한 번에 외우는 사람은 없어요. 먼저 각 줄의 일곱 자연음({naturals})부터 익히세요 — 그게 뼈대입니다. 샤프나 플랫은 이미 아는 자연음에서 한 프렛 옆에 있어요.',
    naturalsCaption: '자연음만 — 지판 맵의 뼈대.',
    stringsHeading: '줄마다의 음',
    stringsBody: '같은 맵을 텍스트로, 줄별로, 개방현부터 12프렛까지:',
    stringLabel: '{open} 줄',
    octaveHeading: '외우기 쉬워지는 지름길',
    octaveBody: '3, 5, 7, 9, 12프렛에는 거의 모든 기타에 인레이 점이 있어요 — 자연음을 거기에 붙들어 두세요. 12프렛은 언제나 개방현의 옥타브. 그리고 두 미(E) 줄은 완전히 같아서, 낮은 줄을 외우면 높은 줄은 덤으로 따라옵니다.',
    printHeading: '인쇄하기(또는 PDF로 저장)',
    printBody: '이 페이지는 깔끔한 한 장짜리 차트로 인쇄됩니다 — 브라우저 인쇄 창에서 “PDF로 저장”을 골라 보면대나 태블릿에 두세요.',
    printButton: '차트 인쇄 / PDF로 저장',
    nextHeading: '맵에 불을 켜세요',
    nextBody: '정적인 차트는 음만 보여줍니다. {app}은 마이크로 연주를 듣고, 치는 모든 음을 바로 이 맵 위에 실시간으로 밝혀줘요. 음들이 함께 무엇을 뜻하는지 궁금해지면 {modes} 페이지가 모든 스케일을 이 지판에 펼쳐 보여줍니다.',
    modesWord: '모드',
    appWord: '앱',
    aria: '지판 차트: 여섯 줄 전부의 모든 음, 개방현부터 12프렛까지, 표준 튜닝',
    ariaNaturals: '자연음만 표시한 지판 차트, 개방현부터 12프렛까지, 표준 튜닝',
  },
  zh: {
    slug: 'fretboard',
    title: '吉他指板图——指板上的全部音名(图表) | Modal Runs',
    description: '完整的吉他指板图:标准调弦下六根弦、0–12品的全部音名。自然音与升降音一目了然,逐弦音名列表,可打印图表,还有一个在你弹奏时点亮指板图的应用。',
    h1: '吉他指板,一张图',
    lead: '标准调弦({tuning})下指板上的全部音名,从空弦到第12品——过了12品,整张图会在高一个八度处重复。每个音都带着应用赋予它的颜色——它相对于C的声音——金色圆点就是C本身。',
    fullHeading: '完整指板图',
    fullCaption: '每根弦上的12个音,0–12品,标准调弦。图中标升号;每个升号与它的降号名在同一品。',
    naturalsHeading: '从自然音开始',
    naturalsBody: '没有人能一次记住78个把位。先学会每根弦上的七个自然音({naturals})——它们是骨架;每个升降音都在你已经认识的自然音旁边一品。',
    naturalsCaption: '只显示自然音——指板图的骨架。',
    stringsHeading: '每根弦上的音',
    stringsBody: '同一张图的文字版,逐弦列出,从空弦到第12品:',
    stringLabel: '{open}弦',
    octaveHeading: '帮你记住的捷径',
    octaveBody: '第3、5、7、9、12品在几乎所有吉他上都有品记——把自然音锚定在那里。第12品永远是空弦的八度。两根E弦完全相同:学会低音E弦,高音E弦就白送了。',
    printHeading: '打印(或存为PDF)',
    printBody: '这一页可以打印成干净的单页图表——打开浏览器的打印窗口,选择“存储为PDF”,放在谱架或平板上随时看。',
    printButton: '打印图表 / 存为PDF',
    nextHeading: '让指板图亮起来',
    nextBody: '静态图表只能告诉你音名;{app}会通过麦克风听你演奏,把你弹的每个音实时点亮在这张图上。想知道这些音合在一起意味着什么,{modes}页面会把每条音阶投射到这条指板上。',
    modesWord: '调式',
    appWord: '应用',
    aria: '指板图:六根弦上的全部音名,从空弦到第12品,标准调弦',
    ariaNaturals: '只显示自然音的指板图,从空弦到第12品,标准调弦',
  },
  vi: {
    slug: 'can-dan',
    title: 'Sơ đồ cần đàn guitar — Tất cả các nốt trên cần đàn | Modal Runs',
    description: 'Sơ đồ cần đàn đầy đủ: mọi nốt trên cả sáu dây, phím 0–12, ở hệ chỉnh dây chuẩn. Nốt tự nhiên và dấu hóa, danh sách nốt từng dây, sơ đồ in được, và một ứng dụng thắp sáng sơ đồ trong lúc bạn chơi.',
    h1: 'Cần đàn guitar, vẽ thành sơ đồ',
    lead: 'Tất cả các nốt trên cần đàn ở hệ chỉnh dây chuẩn ({tuning}), từ dây buông đến phím 12 — qua phím 12, cả sơ đồ lặp lại cao hơn một quãng tám. Mỗi nốt mang màu mà ứng dụng gán cho nó — âm thanh của nó so với Đô — và những chấm vàng chính là nốt Đô.',
    fullHeading: 'Sơ đồ cần đàn đầy đủ',
    fullCaption: 'Đủ 12 nốt trên mỗi dây, phím 0–12, chỉnh dây chuẩn. Hiển thị theo dấu thăng; mỗi dấu thăng nằm cùng phím với tên giáng của nó.',
    naturalsHeading: 'Bắt đầu từ nốt tự nhiên',
    naturalsBody: 'Không ai nhớ nổi 78 vị trí cùng lúc. Hãy học bảy nốt tự nhiên ({naturals}) trên từng dây trước — đó là bộ khung; mỗi nốt thăng hay giáng chỉ cách một phím so với nốt tự nhiên bạn đã biết.',
    naturalsCaption: 'Chỉ các nốt tự nhiên — bộ khung của sơ đồ cần đàn.',
    stringsHeading: 'Các nốt trên từng dây',
    stringsBody: 'Cùng sơ đồ ấy dưới dạng chữ, từng dây một, từ dây buông đến phím 12:',
    stringLabel: 'Dây {open}',
    octaveHeading: 'Mẹo để nhớ lâu',
    octaveBody: 'Phím 3, 5, 7, 9 và 12 có chấm định vị trên hầu hết mọi cây đàn — hãy neo các nốt tự nhiên vào đó. Phím 12 luôn là quãng tám của dây buông. Và hai dây Mi giống hệt nhau: học dây trầm là được luôn dây cao.',
    printHeading: 'In ra (hoặc lưu thành PDF)',
    printBody: 'Trang này in ra thành một sơ đồ gọn trên một tờ — mở hộp thoại in của trình duyệt và chọn «Lưu thành PDF» để đặt lên giá nhạc hay máy tính bảng.',
    printButton: 'In sơ đồ / Lưu thành PDF',
    nextHeading: 'Thắp sáng sơ đồ',
    nextBody: 'Sơ đồ tĩnh chỉ cho bạn thấy các nốt; {app} nghe bạn qua micro và thắp sáng theo thời gian thực từng nốt bạn chơi trên chính sơ đồ này. Khi muốn hiểu các nốt kết hợp nghĩa là gì, các trang {modes} sẽ chiếu từng âm giai lên cần đàn này.',
    modesWord: 'mode',
    appWord: 'ứng dụng',
    aria: 'Sơ đồ cần đàn: mọi nốt trên sáu dây, từ dây buông đến phím 12, chỉnh dây chuẩn',
    ariaNaturals: 'Sơ đồ cần đàn chỉ với các nốt tự nhiên, từ dây buông đến phím 12, chỉnh dây chuẩn',
  },
  id: {
    slug: 'fretboard',
    title: 'Peta fretboard gitar — Semua nada di fretboard (diagram) | Modal Runs',
    description: 'Peta fretboard lengkap: semua nada di keenam senar, fret 0–12, dalam stem standar. Nada natural dan aksidental, daftar nada per senar, diagram siap cetak, dan aplikasi yang menyalakan peta selagi kamu bermain.',
    h1: 'Fretboard gitar, dipetakan',
    lead: 'Semua nada di fretboard dalam stem standar ({tuning}), dari senar lepas sampai fret 12 — setelah fret 12, seluruh peta berulang satu oktaf lebih tinggi. Tiap nada memakai warna yang diberikan aplikasi — bunyinya relatif terhadap C — dan titik emas adalah C itu sendiri.',
    fullHeading: 'Diagram fretboard lengkap',
    fullCaption: 'Semua 12 nada di tiap senar, fret 0–12, stem standar. Ditampilkan dengan kres; tiap kres berada di fret yang sama dengan nama molnya.',
    naturalsHeading: 'Mulai dari nada natural',
    naturalsBody: 'Tidak ada yang menghafal 78 posisi sekaligus. Pelajari dulu tujuh nada natural ({naturals}) di tiap senar — itulah kerangkanya; tiap kres atau mol hanya satu fret dari nada natural yang sudah kamu kenal.',
    naturalsCaption: 'Hanya nada natural — kerangka peta fretboard.',
    stringsHeading: 'Nada di tiap senar',
    stringsBody: 'Peta yang sama dalam bentuk teks, senar per senar, dari senar lepas sampai fret 12:',
    stringLabel: 'Senar {open}',
    octaveHeading: 'Jalan pintas biar nempel',
    octaveBody: 'Fret 3, 5, 7, 9, dan 12 punya tanda inlay di hampir semua gitar — jangkarkan nada natural ke sana. Fret 12 selalu oktaf dari senar lepas. Dan kedua senar E identik: belajar E rendah berarti dapat E tinggi gratis.',
    printHeading: 'Cetak (atau simpan sebagai PDF)',
    printBody: 'Halaman ini tercetak sebagai diagram satu lembar yang bersih — buka dialog cetak browser dan pilih “Simpan sebagai PDF” untuk ditaruh di stand musik atau tablet.',
    printButton: 'Cetak diagram / Simpan sebagai PDF',
    nextHeading: 'Nyalakan petanya',
    nextBody: 'Diagram statis hanya menunjukkan nada; {app} mendengarkanmu lewat mikrofon dan menyalakan tiap nada yang kamu mainkan di peta yang sama ini secara real time. Kalau sudah siap memahami arti nada-nada itu bersama, halaman {modes} memproyeksikan tiap tangga nada ke fretboard ini.',
    modesWord: 'mode',
    appWord: 'aplikasi',
    aria: 'Diagram fretboard: semua nada di enam senar, dari senar lepas sampai fret 12, stem standar',
    ariaNaturals: 'Diagram fretboard hanya dengan nada natural, dari senar lepas sampai fret 12, stem standar',
  },
  hi: {
    slug: 'fretboard',
    title: 'गिटार फ्रेटबोर्ड मैप — फ्रेटबोर्ड के सारे नोट्स (चार्ट) | Modal Runs',
    description: 'पूरा फ्रेटबोर्ड मैप: स्टैंडर्ड ट्यूनिंग में छहों स्ट्रिंग्स के सारे नोट्स, फ्रेट 0–12। नैचुरल नोट्स और शार्प/फ्लैट का चार्ट, हर स्ट्रिंग के नोट्स की सूची, प्रिंट करने लायक चार्ट, और एक ऐप जो बजाते समय मैप को रोशन कर देता है।',
    h1: 'गिटार का फ्रेटबोर्ड, मैप पर',
    lead: 'स्टैंडर्ड ट्यूनिंग ({tuning}) में फ्रेटबोर्ड के सारे नोट्स, खुली स्ट्रिंग्स से 12वें फ्रेट तक — 12वें फ्रेट के बाद पूरा मैप एक ऑक्टेव ऊपर दोहराता है। हर नोट वही रंग पहनता है जो ऐप उसे देता है — C के सापेक्ष उसकी आवाज़ — और सुनहरे बिंदु खुद C हैं।',
    fullHeading: 'पूरा फ्रेटबोर्ड चार्ट',
    fullCaption: 'हर स्ट्रिंग के 12 नोट्स, फ्रेट 0–12, स्टैंडर्ड ट्यूनिंग। शार्प दिखाए गए हैं; हर शार्प उसी फ्रेट पर है जहाँ उसका फ्लैट नाम होता है।',
    naturalsHeading: 'नैचुरल नोट्स से शुरू करें',
    naturalsBody: 'कोई भी 78 पोज़िशन एक साथ याद नहीं करता। पहले हर स्ट्रिंग पर सात नैचुरल नोट्स ({naturals}) सीखें — यही ढांचा है; हर शार्प या फ्लैट किसी ऐसे नैचुरल नोट से बस एक फ्रेट दूर है जो आप पहले से जानते हैं।',
    naturalsCaption: 'सिर्फ नैचुरल नोट्स — फ्रेटबोर्ड मैप का ढांचा।',
    stringsHeading: 'हर स्ट्रिंग के नोट्स',
    stringsBody: 'वही मैप टेक्स्ट में, स्ट्रिंग दर स्ट्रिंग, खुली स्ट्रिंग से 12वें फ्रेट तक:',
    stringLabel: '{open} स्ट्रिंग',
    octaveHeading: 'याद रखने के शॉर्टकट',
    octaveBody: 'फ्रेट 3, 5, 7, 9 और 12 पर लगभग हर गिटार में डॉट्स होते हैं — नैचुरल नोट्स को उन्हीं से जोड़कर याद करें। 12वाँ फ्रेट हमेशा खुली स्ट्रिंग का ऑक्टेव होता है। और दोनों E स्ट्रिंग्स एक जैसी हैं: नीचे वाली सीख ली तो ऊपर वाली मुफ्त मिल गई।',
    printHeading: 'प्रिंट करें (या PDF में सेव करें)',
    printBody: 'यह पेज एक साफ-सुथरे एक-पन्ने के चार्ट की तरह प्रिंट होता है — ब्राउज़र का प्रिंट डायलॉग खोलें और «Save as PDF» चुनें, ताकि यह आपके म्यूज़िक स्टैंड या टैबलेट पर रहे।',
    printButton: 'चार्ट प्रिंट करें / PDF सेव करें',
    nextHeading: 'मैप को रोशन करें',
    nextBody: 'स्टैटिक चार्ट सिर्फ नोट्स दिखाता है; {app} माइक से आपको सुनता है और आपके बजाए हर नोट को इसी मैप पर रियल टाइम में रोशन कर देता है। जब नोट्स का मिलकर मतलब समझना हो, तो {modes} के पेज हर स्केल को इसी फ्रेटबोर्ड पर उतार देते हैं।',
    modesWord: 'मोड्स',
    appWord: 'ऐप',
    aria: 'फ्रेटबोर्ड चार्ट: छहों स्ट्रिंग्स के सारे नोट्स, खुली स्ट्रिंग से 12वें फ्रेट तक, स्टैंडर्ड ट्यूनिंग',
    ariaNaturals: 'सिर्फ नैचुरल नोट्स वाला फ्रेटबोर्ड चार्ट, खुली स्ट्रिंग से 12वें फ्रेट तक, स्टैंडर्ड ट्यूनिंग',
  },
}

export function fretboardPagePath(locale?: Locale): string {
  if (!locale) return '/fretboard/'
  return `/${locale.code}/${LOCALIZED[locale.code].slug}/`
}

function alternates(): { hreflang: string; href: string }[] {
  return [
    { hreflang: 'en', href: `${ORIGIN}/fretboard/` },
    ...LOCALES.filter(l => LOCALIZED[l.code]).map(l => ({ hreflang: l.code, href: `${ORIGIN}${fretboardPagePath(l)}` })),
    { hreflang: 'x-default', href: `${ORIGIN}/fretboard/` },
  ]
}

// A print stylesheet the shared CSS doesn't need: white page, dark ink,
// hide the chrome, keep both charts and the string runs.
// The component's own styling — the same rules index.css gives it, with
// the dark-theme variable values baked in (these pages ship no app CSS).
const FRETBOARD_CSS = `
  .fretboard-container { width: 100%; border-radius: 16px; overflow: hidden; background: #101216; border: 1px solid #171a20; box-shadow: 0 2px 12px rgba(0,0,0,0.3), 0 0 60px rgba(0,0,0,0.15) }
  .fretboard-viewport { overflow-x: auto; overflow-y: hidden; padding: 8px 0 }
  .fretboard-svg { display: block; width: 100%; min-width: 640px; min-height: 200px; max-height: min(52vh, 430px) }
  .open-string-label { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; fill: #79818c }
  .note-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; fill: #000 }
  .interval-label { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; font-weight: 700; fill: rgba(0,0,0,0.7) }
  .fret-number { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 500; fill: #3a4049 }
`

const PRINT_CSS = `<style>${FRETBOARD_CSS}@media print {
  body { background: #fff; color: #111 }
  header.site, .cta, button.print, footer, .no-print { display: none !important }
  h1 { color: #111; background: none; -webkit-text-fill-color: initial }
  h2, p, td, figcaption, main > ul li { color: #111 }
  figure svg { min-width: 0 }
}
button.print { display: block; width: 100%; margin: 14px 0; padding: 14px 22px; border: 0; border-radius: 14px; cursor: pointer;
  background: linear-gradient(135deg, #6a2fc0, #9846ea); color: #fff; font-size: 1rem; font-weight: 650; font-family: inherit }
</style>`

function renderPage(copy: FretboardCopy, locale?: Locale): string {
  const disp = (n: string) => locale
    ? displayNote(n, LANGUAGES.find(l => l.key === locale.code)?.defaultStyle ?? 'solfege', locale.code)
    : n
  // Note spellings in prose stay engine-driven: {tuning} and {naturals}
  // fill in per-language names (solfège, German H, kana …) via disp().
  const tuning = TUNINGS['standard'].labels.map(disp).join(' ')
  const naturals = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(disp).join(' ')
  const sub = (s: string) => s.replace('{tuning}', tuning).replace('{naturals}', naturals)
  const canonicalPath = fretboardPagePath(locale)
  const modesHref = locale ? `/${locale.code}/${locale.modesSegment}/` : '/modes/'
  const appHref = locale ? `/?lang=${locale.code}` : '/'
  // In-sentence link words ≠ footer labels: "the app" reads inside a
  // sentence, "Open the app" belongs in the footer.
  const nextBody = copy.nextBody
    .replace('{app}', `<a href="${appHref}">${copy.appWord}</a>`)
    .replace('{modes}', `<a href="${modesHref}">${copy.modesWord}</a>`)
  const runs = stringRuns(disp)
  const runRows = runs.map(r =>
    `<tr><td><strong>${copy.stringLabel.replace('{open}', r.open)}</strong></td><td>${r.run}</td></tr>`
  ).join('\n      ')
  const structuredData = [
    breadcrumbList([{ name: 'Modal Runs', path: '/' }, { name: copy.h1, path: canonicalPath }]),
    articleSchema({ headline: copy.title, description: copy.description, path: canonicalPath, inLanguage: locale?.code ?? 'en' }),
  ]

  return `<!DOCTYPE html>
<html lang="${locale?.htmlLang ?? 'en'}">
<head>
    ${head({ title: copy.title, description: copy.description, canonicalPath, alternates: alternates(), jsonLd: structuredData })}
    ${PRINT_CSS}
</head>
<body>
  ${locale ? siteHeader(locale.t.upgradeCta) : SITE_HEADER}
  <main>
    <h1>${copy.h1}</h1>
    <p class="lead">${sub(copy.lead)}</p>

    <h2>${copy.fullHeading}</h2>
    <figure>
      ${chartSvg(disp, copy.aria, false, !!locale)}
      <figcaption>${copy.fullCaption}</figcaption>
    </figure>
    <button class="print" onclick="window.print()">${copy.printButton}</button>

    <h2>${copy.naturalsHeading}</h2>
    <p>${sub(copy.naturalsBody)}</p>
    <figure>
      ${chartSvg(disp, copy.ariaNaturals, true, !!locale)}
      <figcaption>${copy.naturalsCaption}</figcaption>
    </figure>

    <h2>${copy.stringsHeading}</h2>
    <p>${copy.stringsBody}</p>
    <div class="tablewrap"><table>
      ${runRows}
    </table></div>

    <h2>${copy.octaveHeading}</h2>
    <p>${copy.octaveBody}</p>

    <h2>${copy.printHeading}</h2>
    <p>${copy.printBody}</p>

    <h2>${copy.nextHeading}</h2>
    <p>${nextBody}</p>
  </main>
  ${locale
    ? footer({ modesHref, modesLabel: locale.t.footerModes, appLabel: locale.t.footerApp, tag: locale.t.footerTag, showGuides: false })
    : footer()}
</body>
</html>
`
}

// write() comes from the mode-pages plugin — same signature.
export function writeFretboardPages(write: (urlPath: string, html: string) => void): number {
  write('/fretboard/', renderPage(EN))
  let count = 1
  for (const locale of LOCALES) {
    const copy = LOCALIZED[locale.code]
    if (!copy) continue
    write(fretboardPagePath(locale), renderPage(copy, locale))
    count++
  }
  return count
}

// For cross-links from the mode indexes — the localized page's own H1
// doubles as the link text so anchor and destination always agree.
export function fretboardH1(locale?: Locale): string {
  return locale ? LOCALIZED[locale.code]?.h1 ?? EN.h1 : EN.h1
}

export function allFretboardPagePaths(): string[] {
  return ['/fretboard/', ...LOCALES.filter(l => LOCALIZED[l.code]).map(l => fretboardPagePath(l))]
}
