// ─── Locales for the static mode pages ───────────────────────────────
// Spanish, French, Italian and Portuguese versions of the /modes/ cluster.
// These languages name notes in fixed-do solfège, so every note on a page —
// prose, tables, and the SVG diagram — goes through the app's own
// displayNote(). The prose here is authored translation; the musical facts
// still come from musicTheory.ts.
//
// Template strings use {placeholders} filled by fmt() in modePages.ts.

import type { Language } from '../src/utils/noteNames'
import type { ModeKey } from './shared'

export interface LocaleCopy {
  hook: string
  sound: string
  practice: string
  focusLabel: string
}

export interface Locale {
  code: Language
  htmlLang: string
  modesSegment: string          // 'modos' → /es/modos/…
  sharpWord: string             // for slugs: do-sostenido-dorico
  flatWord: string
  modeNames: Record<ModeKey, string>
  majorLabel: string            // "Do mayor" in the relative-key line
  copy: Record<ModeKey, LocaleCopy>
  t: Record<string, string>
}

// ─── Español ─────────────────────────────────────────────────────────
const es: Locale = {
  code: 'es',
  htmlLang: 'es',
  modesSegment: 'modos',
  sharpWord: 'sostenido',
  flatWord: 'bemol',
  majorLabel: 'mayor',
  modeNames: {
    ionian: 'Jónico', dorian: 'Dórico', phrygian: 'Frigio', lydian: 'Lidio',
    mixolydian: 'Mixolidio', aeolian: 'Eólico', locrian: 'Locrio',
  },
  copy: {
    ionian: {
      focusLabel: '7ª mayor',
      hook: 'El modo jónico es la escala mayor de toda la vida: el sonido resuelto y luminoso que la música occidental trata como su casa.',
      sound: 'Es el sonido de los estribillos de pop y de los finales felices. Todos los demás modos de este sitio son estas mismas notas con otra nota como hogar.',
      practice: 'Sobre el drone, escucha cómo la 7ª mayor se inclina con hambre hacia la tónica — esa atracción es lo que significa "resuelto".',
    },
    dorian: {
      focusLabel: '6ª mayor',
      hook: 'El modo dórico es una escala menor con una nota elevada: la 6ª es mayor en vez de menor, y eso convierte lo "triste" en algo con actitud.',
      sound: 'Es el sonido de "Oye Como Va" y de Santana, de "So What" y del jazz modal, de los grooves de funk que viven en un solo acorde menor sin aburrir jamás. Menor, pero con la cabeza alta.',
      practice: 'Sobre el drone, todo suena a menor normal hasta que caes en la 6ª mayor — esa nota ES el sabor dórico: apunta a ella a propósito.',
    },
    phrygian: {
      focusLabel: '2ª menor',
      hook: 'El modo frigio es una escala menor con la nota justo encima del hogar empujada un semitono hacia abajo — oscuridad instantánea.',
      sound: 'Esa 2ª menor es el sonido del flamenco, de la cadencia andaluza y de la mitad de los riffs de metal jamás escritos. Vive a un solo traste de la tónica: la tensión siempre está a un dedo.',
      practice: 'Sobre el drone, martillea entre la tónica y la 2ª menor — ese roce de semitono ES el frigio; el resto de la escala es contexto.',
    },
    lydian: {
      focusLabel: '4ª aumentada',
      hook: 'El modo lidio es la escala mayor con la 4ª subida un semitono — mayor, pero flotando en vez de pisar el suelo.',
      sound: 'Es el sonido soñador de las bandas sonoras, del tema de "Los Simpson" y de las baladas de Joe Satriani ("Flying in a Blue Dream" es un tutorial de lidio con contrato discográfico).',
      practice: 'Sobre el drone, sostén la 4ª aumentada y déjala sonar — en cualquier otro contexto mayor sería una nota "equivocada"; aquí es el punto.',
    },
    mixolydian: {
      focusLabel: '7ª menor',
      hook: 'El modo mixolidio es la escala mayor con la 7ª bajada — brillante por arriba, con blues por debajo.',
      sound: 'Es la escala por defecto del rock and roll: riffs de AC/DC, Grateful Dead, música celta y cada solo de doce compases que suena feliz pero no ingenuo.',
      practice: 'Sobre el drone, compara la 7ª menor con la sensible que tu oído espera — esa calma de "no hace falta resolver" es todo el modo.',
    },
    aeolian: {
      focusLabel: '6ª menor',
      hook: 'El modo eólico es la escala menor natural — la triste de siempre, la gemela en sombra de la escala mayor.',
      sound: 'Es el sonido de casi todo el rock y pop en tonalidad menor: "Stairway to Heaven", "Losing My Religion", cada power ballad. La 6ª menor es lo que lo separa del dórico: donde el dórico levanta, el eólico se hunde.',
      practice: 'Sobre el drone, baja de la 6ª menor a la 5ª y siente cómo se asienta — ese suspiro es la firma del menor natural.',
    },
    locrian: {
      focusLabel: '5ª disminuida',
      hook: 'El modo locrio es el inestable: la 2ª y la 5ª están bajadas, así que el propio hogar es un acorde disminuido que nunca se asienta.',
      sound: 'Sin 5ª justa donde apoyarse, el locrio se niega a resolver — justo por eso el metal y el jazz lo guardan para la máxima tensión. Más que un lugar donde vivir, es un lugar por el que pasar amenazando.',
      practice: 'Sobre el drone, nota cómo hasta la tónica se siente provisional — la 5ª disminuida no deja de quitarte el suelo.',
    },
  },
  t: {
    upgradeCta: 'Convierte la práctica en hábito · $5/mes',
    title: '{name} en la guitarra — Notas, mapa del mástil y drone | Modal Runs',
    metaDesc: '{name} en la guitarra: {notes}. Un visualizador interactivo del mástil (diapasón), acordes diatónicos y un drone gratis para improvisar — Modal Runs te escucha por el micrófono e ilumina lo que tocas en tiempo real.',
    h1: '{name} en la guitarra',
    lead: '{hook} Las notas de {name} son <strong>{notes}</strong>. Su nota característica es <strong>{focus}</strong> — la {focusLabel} — la nota que le da a esta escala su color.',
    neckHeading: '{name} por todo el mástil',
    figcaption: 'Afinación estándar, trastes 0–12. Las notas doradas son la tónica ({root}); cada color marca un intervalo, la misma paleta que usa la app.',
    ariaFretboard: 'La escala {name} sobre el mástil de la guitarra, trastes 0 a 12',
    ctaMain: 'Practica {name} sobre un drone →',
    ctaSub: 'Gratis, en tu navegador. Te escucha por el micrófono e ilumina lo que tocas.',
    formulaHeading: 'Fórmula e intervalos',
    formulaLine: '<strong>{formula}</strong> — {n} notas. {family}',
    familyMajor: 'La 3ª mayor la hace una escala de familia mayor.',
    familyMinor: 'La 3ª menor la hace una escala de familia menor.',
    familyDim: 'La 3ª menor y la 5ª disminuida forman una tríada disminuida sobre la tónica.',
    chordsHeading: 'Acordes en {name}',
    chordsIntro: 'Estos son los acordes diatónicos — la armonía construida solo con las notas de arriba. Alternar entre ellos te mantiene dentro del modo.',
    thDegree: 'Grado', thChord: 'Acorde', thQuality: 'Cualidad',
    sameNotesHeading: 'Mismas notas, otro hogar',
    relative: '{name} contiene exactamente las mismas notas que <a href="{parentHref}">{parent}</a>. Las notas no cambian — cambia cuál se siente como hogar, y eso lo cambia todo.',
    relativeIonian: 'Todos los modos de este sitio nacen de una escala mayor. {name} es la escala mayor de {root} — los otros seis modos reutilizan sus notas exactas con otro hogar.',
    otherModesHeading: 'Otros modos sobre {root}',
    otherModesIntro: 'Mantén la misma tónica y cambia la escala — la forma más rápida de oír lo que hace cada modo.',
    indexTitle: 'Modos de guitarra en todas las tonalidades — Mapas del mástil, notas y drones | Modal Runs',
    indexDesc: 'Mapas del mástil para los siete modos (escalas modales) en las doce tonalidades: notas, acordes diatónicos y un drone gratis para improvisar. Un entrenamiento auditivo real — Modal Runs te escucha por el micrófono mientras practicas.',
    indexH1: 'Todos los modos, todas las tonalidades',
    indexLead: 'Los siete modos de la escala mayor, mapeados sobre el mástil en las doce tonalidades — con las notas, los acordes que viven dentro de cada uno y un drone para improvisar. Elige una tonalidad; la página te enseña el mapa y <a href="/">la app</a> te escucha mientras lo tocas.',
    faqQ: '¿Qué es {name}?',
    footerModes: 'Todos los modos',
    footerApp: 'Abrir la app',
    footerTag: 'Modal Runs — práctica de guitarra gratis que te escucha.',
    homeTitle: 'Modal Runs — Te escucha mientras tocas',
    homeDesc: 'Un visualizador interactivo del mástil (diapasón) que te escucha: mantén un drone en cualquier tonalidad, improvisa, y Modal Runs ilumina cada nota que tocas en el mástil en tiempo real — un entrenamiento auditivo real. Encuentra los modos de oído en vez de memorizarlos. Gratis.',
    homeH1: 'Modal Runs — te escucha mientras tocas',
    homeLead: 'Mantén un drone en cualquier tonalidad, improvisa, y Modal Runs te escucha por el micrófono — iluminando cada nota que tocas en el mástil y diciéndote cuándo llegas a la nota que te pidió. Aprende los modos de oído en vez de memorizarlos. Gratis, en el navegador, sin registro.',
  },
}

// ─── Français ────────────────────────────────────────────────────────
const fr: Locale = {
  code: 'fr',
  htmlLang: 'fr',
  modesSegment: 'modes',
  sharpWord: 'diese',
  flatWord: 'bemol',
  majorLabel: 'majeur',
  modeNames: {
    ionian: 'Ionien', dorian: 'Dorien', phrygian: 'Phrygien', lydian: 'Lydien',
    mixolydian: 'Mixolydien', aeolian: 'Éolien', locrian: 'Locrien',
  },
  copy: {
    ionian: {
      focusLabel: '7e majeure',
      hook: 'Le mode ionien, c’est la gamme majeure tout court : le son résolu et lumineux que la musique occidentale considère comme sa maison.',
      sound: 'C’est le son des refrains pop et des fins heureuses. Tous les autres modes de ce site sont ces mêmes notes, avec une autre note pour maison.',
      practice: 'Sur le drone, écoute la 7e majeure se pencher avidement vers la tonique — cette attraction, c’est exactement ce que « résolu » veut dire.',
    },
    dorian: {
      focusLabel: '6te majeure',
      hook: 'Le mode dorien est une gamme mineure avec une note relevée : la 6te est majeure au lieu de mineure, et le « triste » devient « cool ».',
      sound: 'C’est le son de « Oye Como Va » et de Santana, de « So What » et du jazz modal, des grooves funk qui tournent sur un seul accord mineur sans jamais lasser. Mineur, mais la tête haute.',
      practice: 'Sur le drone, tout sonne mineur ordinaire jusqu’à ce que tu tombes sur la 6te majeure — cette note EST la couleur dorienne : vise-la exprès.',
    },
    phrygian: {
      focusLabel: '2de mineure',
      hook: 'Le mode phrygien est une gamme mineure dont la note juste au-dessus de la maison est poussée un demi-ton plus bas — obscurité immédiate.',
      sound: 'Cette 2de mineure, c’est le flamenco, la cadence andalouse et la moitié des riffs de metal jamais écrits. Elle vit à une seule case de la tonique : la tension est toujours sous le doigt.',
      practice: 'Sur le drone, martèle entre la tonique et la 2de mineure — ce frottement de demi-ton EST le phrygien ; le reste de la gamme n’est que du contexte.',
    },
    lydian: {
      focusLabel: '4te augmentée',
      hook: 'Le mode lydien est la gamme majeure avec la 4te haussée d’un demi-ton — majeur, mais qui flotte au lieu de toucher le sol.',
      sound: 'C’est le son rêveur des musiques de film, du thème des « Simpson » et des ballades de Joe Satriani (« Flying in a Blue Dream » est un tutoriel de lydien avec un contrat de disque).',
      practice: 'Sur le drone, tiens la 4te augmentée et laisse-la sonner — dans tout autre contexte majeur ce serait une « fausse » note ; ici, c’est le but.',
    },
    mixolydian: {
      focusLabel: '7e mineure',
      hook: 'Le mode mixolydien est la gamme majeure avec la 7e abaissée — brillant en haut, bluesy en dessous.',
      sound: 'C’est la gamme par défaut du rock’n’roll : les riffs d’AC/DC, le Grateful Dead, les airs celtiques et chaque solo de douze mesures qui sonne heureux sans être naïf.',
      practice: 'Sur le drone, compare la 7e mineure à la sensible que ton oreille attend — ce calme de « rien à résoudre », c’est tout le mode.',
    },
    aeolian: {
      focusLabel: '6te mineure',
      hook: 'Le mode éolien est la gamme mineure naturelle — la triste classique, la jumelle d’ombre de la gamme majeure.',
      sound: 'C’est le son de presque tout le rock et la pop en mineur : « Stairway to Heaven », « Losing My Religion », chaque power ballad. La 6te mineure le sépare du dorien : là où le dorien soulève, l’éolien s’enfonce.',
      practice: 'Sur le drone, descends de la 6te mineure vers la 5te et sens-la se poser — ce soupir est la signature du mineur naturel.',
    },
    locrian: {
      focusLabel: '5te diminuée',
      hook: 'Le mode locrien est l’instable : la 2de et la 5te sont abaissées, si bien que la maison elle-même est un accord diminué qui ne se pose jamais.',
      sound: 'Sans 5te juste où s’appuyer, le locrien refuse de résoudre — c’est exactement pour ça que le metal et le jazz le gardent pour la tension maximale. Moins un endroit où vivre qu’un endroit qu’on traverse d’un air menaçant.',
      practice: 'Sur le drone, remarque comme même la tonique semble provisoire — la 5te diminuée ne cesse de dérober le sol.',
    },
  },
  t: {
    upgradeCta: 'Fais de la pratique une habitude · 5 $/mois',
    title: '{name} à la guitare — Notes, schéma du manche et drone | Modal Runs',
    metaDesc: '{name} à la guitare : {notes} — les notes du manche de guitare. Une cartographie interactive du manche, accords diatoniques et un drone gratuit pour improviser — Modal Runs t’écoute au micro et illumine ce que tu joues.',
    h1: '{name} à la guitare',
    lead: '{hook} Les notes de {name} sont <strong>{notes}</strong>. Sa note caractéristique est <strong>{focus}</strong> — la {focusLabel} — la note qui donne à cette gamme sa couleur.',
    neckHeading: '{name} sur tout le manche',
    figcaption: 'Accordage standard, cases 0–12. Les notes dorées sont la tonique ({root}) ; chaque couleur marque un intervalle, la même palette que l’app.',
    ariaFretboard: 'La gamme {name} sur le manche de la guitare, cases 0 à 12',
    ctaMain: 'Pratique {name} sur un drone →',
    ctaSub: 'Gratuit, dans ton navigateur. Il t’écoute au micro et illumine ce que tu joues.',
    formulaHeading: 'Formule et intervalles',
    formulaLine: '<strong>{formula}</strong> — {n} notes. {family}',
    familyMajor: 'La 3ce majeure en fait une gamme de la famille majeure.',
    familyMinor: 'La 3ce mineure en fait une gamme de la famille mineure.',
    familyDim: 'La 3ce mineure et la 5te diminuée forment un accord diminué sur la tonique.',
    chordsHeading: 'Accords dans {name}',
    chordsIntro: 'Voici les accords diatoniques — l’harmonie construite avec les seules notes ci-dessus. Passer de l’un à l’autre te garde dans le mode.',
    thDegree: 'Degré', thChord: 'Accord', thQuality: 'Qualité',
    sameNotesHeading: 'Mêmes notes, autre maison',
    relative: '{name} contient exactement les mêmes notes que <a href="{parentHref}">{parent}</a>. Les notes ne changent pas — c’est celle qui fait office de maison qui change, et cela change tout.',
    relativeIonian: 'Tous les modes de ce site naissent d’une gamme majeure. {name} est la gamme majeure de {root} — les six autres modes réutilisent ses notes exactes avec une autre maison.',
    otherModesHeading: 'Autres modes sur {root}',
    otherModesIntro: 'Garde la même tonique et change de gamme — le moyen le plus rapide d’entendre ce que fait chaque mode.',
    indexTitle: 'Les modes à la guitare dans toutes les tonalités — Schémas du manche, notes et drones | Modal Runs',
    indexDesc: 'Envie de trouver une gamme ou un mode ? Cartographie du manche pour les sept modes dans les douze tonalités : notes, accords diatoniques et un drone gratuit pour improviser — un vrai entraînement auditif, à l’oreille. Modal Runs t’écoute au micro pendant que tu pratiques.',
    indexH1: 'Tous les modes, toutes les tonalités',
    indexLead: 'Les sept modes de la gamme majeure, cartographiés sur le manche dans les douze tonalités — avec les notes, les accords qui vivent dans chacun et un drone pour improviser. Choisis une tonalité ; la page te montre le schéma et <a href="/">l’app</a> t’écoute pendant que tu le joues.',
    faqQ: 'Qu’est-ce que le {name} ?',
    footerModes: 'Tous les modes',
    footerApp: 'Ouvrir l’app',
    footerTag: 'Modal Runs — pratique de la guitare gratuite, qui écoute.',
    homeTitle: 'Modal Runs — Il t’écoute pendant que tu joues',
    homeDesc: 'Une cartographie interactive du manche qui t’écoute : garde un drone dans n’importe quelle tonalité, improvise, et Modal Runs illumine les notes du manche de guitare que tu joues en temps réel — un vrai entraînement auditif, à l’oreille. Trouve les modes à l’oreille plutôt que de les mémoriser. Gratuit.',
    homeH1: 'Modal Runs — il t’écoute pendant que tu joues',
    homeLead: 'Garde un drone dans n’importe quelle tonalité, improvise, et Modal Runs t’écoute au micro — illuminant chaque note que tu joues sur le manche et te disant quand tu tombes sur la note demandée. Apprends les modes à l’oreille plutôt que de les mémoriser. Gratuit, dans le navigateur, sans inscription.',
  },
}

// ─── Italiano ────────────────────────────────────────────────────────
const it: Locale = {
  code: 'it',
  htmlLang: 'it',
  modesSegment: 'modi',
  sharpWord: 'diesis',
  flatWord: 'bemolle',
  majorLabel: 'maggiore',
  modeNames: {
    ionian: 'Ionico', dorian: 'Dorico', phrygian: 'Frigio', lydian: 'Lidio',
    mixolydian: 'Misolidio', aeolian: 'Eolio', locrian: 'Locrio',
  },
  copy: {
    ionian: {
      focusLabel: '7ª maggiore',
      hook: 'Il modo ionico è la scala maggiore di sempre: il suono risolto e luminoso che la musica occidentale considera casa.',
      sound: 'È il suono dei ritornelli pop e dei finali felici. Tutti gli altri modi di questo sito sono queste stesse note con un’altra nota come casa.',
      practice: 'Sul drone, ascolta la 7ª maggiore piegarsi affamata verso la tonica — quell’attrazione è ciò che significa "risolto".',
    },
    dorian: {
      focusLabel: '6ª maggiore',
      hook: 'Il modo dorico è una scala minore con una nota alzata: la 6ª è maggiore invece che minore, e il "triste" diventa "cool".',
      sound: 'È il suono di "Oye Como Va" e di Santana, di "So What" e del jazz modale, dei groove funk che vivono su un solo accordo minore senza annoiare mai. Minore, ma a testa alta.',
      practice: 'Sul drone, tutto suona come un minore qualsiasi finché non atterri sulla 6ª maggiore — quella nota È il sapore dorico: prendila di mira apposta.',
    },
    phrygian: {
      focusLabel: '2ª minore',
      hook: 'Il modo frigio è una scala minore con la nota subito sopra casa spinta giù di un semitono — oscurità immediata.',
      sound: 'Quella 2ª minore è il suono del flamenco, della cadenza andalusa e di metà dei riff metal mai scritti. Vive a un solo tasto dalla tonica: la tensione è sempre a un dito di distanza.',
      practice: 'Sul drone, martella tra la tonica e la 2ª minore — quell’attrito di semitono È il frigio; il resto della scala è contesto.',
    },
    lydian: {
      focusLabel: '4ª aumentata',
      hook: 'Il modo lidio è la scala maggiore con la 4ª alzata di un semitono — maggiore, ma che fluttua invece di toccare terra.',
      sound: 'È il suono sognante delle colonne sonore, della sigla dei "Simpson" e delle ballate di Joe Satriani ("Flying in a Blue Dream" è un tutorial di lidio con un contratto discografico).',
      practice: 'Sul drone, tieni la 4ª aumentata e lasciala suonare — in qualsiasi altro contesto maggiore sarebbe una nota "sbagliata"; qui è il punto.',
    },
    mixolydian: {
      focusLabel: '7ª minore',
      hook: 'Il modo misolidio è la scala maggiore con la 7ª abbassata — brillante sopra, blues sotto.',
      sound: 'È la scala di default del rock’n’roll: i riff degli AC/DC, i Grateful Dead, le melodie celtiche e ogni assolo di dodici battute che suona felice ma non ingenuo.',
      practice: 'Sul drone, confronta la 7ª minore con la sensibile che il tuo orecchio si aspetta — quella calma da "niente da risolvere" è tutto il modo.',
    },
    aeolian: {
      focusLabel: '6ª minore',
      hook: 'Il modo eolio è la scala minore naturale — quella triste di sempre, la gemella d’ombra della scala maggiore.',
      sound: 'È il suono di quasi tutto il rock e pop in minore: "Stairway to Heaven", "Losing My Religion", ogni power ballad. La 6ª minore lo separa dal dorico: dove il dorico solleva, l’eolio affonda.',
      practice: 'Sul drone, scendi dalla 6ª minore alla 5ª e senti come si posa — quel sospiro è la firma del minore naturale.',
    },
    locrian: {
      focusLabel: '5ª diminuita',
      hook: 'Il modo locrio è quello instabile: la 2ª e la 5ª sono abbassate, così casa stessa è un accordo diminuito che non si posa mai.',
      sound: 'Senza una 5ª giusta su cui appoggiarsi, il locrio si rifiuta di risolvere — ed è esattamente per questo che metal e jazz lo tengono per la tensione massima. Meno un posto in cui vivere che un posto da attraversare con aria minacciosa.',
      practice: 'Sul drone, nota come perfino la tonica sembri provvisoria — la 5ª diminuita continua a toglierti il pavimento.',
    },
  },
  t: {
    upgradeCta: 'Rendi la pratica un’abitudine · 5 $/mese',
    title: '{name} alla chitarra — Note, mappa della tastiera e drone | Modal Runs',
    metaDesc: '{name} alla chitarra: {notes}. Una mappa interattiva della tastiera (il manico), accordi diatonici e un drone gratis per improvvisare — Modal Runs ti ascolta dal microfono in tempo reale e illumina quello che suoni.',
    h1: '{name} alla chitarra',
    lead: '{hook} Le note di {name} sono <strong>{notes}</strong>. La sua nota caratteristica è <strong>{focus}</strong> — la {focusLabel} — la nota che dà a questa scala il suo colore.',
    neckHeading: '{name} su tutta la tastiera',
    figcaption: 'Accordatura standard, tasti 0–12. Le note dorate sono la tonica ({root}); ogni colore segna un intervallo, la stessa palette dell’app.',
    ariaFretboard: 'La scala {name} sulla tastiera della chitarra, tasti da 0 a 12',
    ctaMain: 'Esercitati con {name} su un drone →',
    ctaSub: 'Gratis, nel tuo browser. Ti ascolta dal microfono e illumina quello che suoni.',
    formulaHeading: 'Formula e intervalli',
    formulaLine: '<strong>{formula}</strong> — {n} note. {family}',
    familyMajor: 'La 3ª maggiore ne fa una scala di famiglia maggiore.',
    familyMinor: 'La 3ª minore ne fa una scala di famiglia minore.',
    familyDim: 'La 3ª minore e la 5ª diminuita formano una triade diminuita sulla tonica.',
    chordsHeading: 'Accordi in {name}',
    chordsIntro: 'Questi sono gli accordi diatonici — l’armonia costruita con le sole note qui sopra. Alternarli ti tiene dentro il modo.',
    thDegree: 'Grado', thChord: 'Accordo', thQuality: 'Qualità',
    sameNotesHeading: 'Stesse note, altra casa',
    relative: '{name} contiene esattamente le stesse note di <a href="{parentHref}">{parent}</a>. Le note non cambiano — cambia quale si sente come casa, e questo cambia tutto.',
    relativeIonian: 'Tutti i modi di questo sito nascono da una scala maggiore. {name} è la scala maggiore di {root} — gli altri sei modi riusano le sue note esatte con un’altra casa.',
    otherModesHeading: 'Altri modi su {root}',
    otherModesIntro: 'Tieni la stessa tonica e cambia scala — il modo più veloce per sentire cosa fa ciascun modo.',
    indexTitle: 'I modi della chitarra in tutte le tonalità — Mappe della tastiera, note e droni | Modal Runs',
    indexDesc: 'Mappe della tastiera (il manico) per i sette modi nelle dodici tonalità: note, accordi diatonici e un drone gratis per improvvisare. Un vero allenamento dell’orecchio — Modal Runs ti ascolta dal microfono mentre ti eserciti.',
    indexH1: 'Tutti i modi, tutte le tonalità',
    indexLead: 'I sette modi della scala maggiore, mappati sulla tastiera in tutte e dodici le tonalità — con le note, gli accordi che vivono in ciascuno e un drone per improvvisare. Scegli una tonalità; la pagina ti mostra la mappa e <a href="/">l’app</a> ti ascolta mentre la suoni.',
    faqQ: 'Cos’è il {name}?',
    footerModes: 'Tutti i modi',
    footerApp: 'Apri l’app',
    footerTag: 'Modal Runs — pratica di chitarra gratuita che ti ascolta.',
    homeTitle: 'Modal Runs — Ti ascolta mentre suoni',
    homeDesc: 'Una mappa interattiva della tastiera (il manico) che ti ascolta: mantieni un drone in qualsiasi tonalità, improvvisa, e Modal Runs illumina ogni nota che suoni sul manico in tempo reale — un vero allenamento dell’orecchio. Trova i modi a orecchio invece di memorizzarli. Gratis.',
    homeH1: 'Modal Runs — ti ascolta mentre suoni',
    homeLead: 'Mantieni un drone in qualsiasi tonalità, improvvisa, e Modal Runs ti ascolta dal microfono — illuminando ogni nota che suoni sul manico e dicendoti quando raggiungi la nota richiesta. Impara i modi a orecchio invece di memorizzarli. Gratis, nel browser, senza registrazione.',
  },
}

// ─── Português ───────────────────────────────────────────────────────
const pt: Locale = {
  code: 'pt',
  htmlLang: 'pt',
  modesSegment: 'modos',
  sharpWord: 'sustenido',
  flatWord: 'bemol',
  majorLabel: 'maior',
  modeNames: {
    ionian: 'Jônico', dorian: 'Dórico', phrygian: 'Frígio', lydian: 'Lídio',
    mixolydian: 'Mixolídio', aeolian: 'Eólio', locrian: 'Lócrio',
  },
  copy: {
    ionian: {
      focusLabel: '7ª maior',
      hook: 'O modo jônico é a escala maior de sempre: o som resolvido e luminoso que a música ocidental trata como casa.',
      sound: 'É o som dos refrões de pop e dos finais felizes. Todos os outros modos deste site são estas mesmas notas com outra nota como casa.',
      practice: 'Sobre o drone, ouve a 7ª maior inclinar-se faminta para a tônica — essa atração é o que "resolvido" significa.',
    },
    dorian: {
      focusLabel: '6ª maior',
      hook: 'O modo dórico é uma escala menor com uma nota elevada: a 6ª é maior em vez de menor, e o "triste" vira "cool".',
      sound: 'É o som de "Oye Como Va" e do Santana, de "So What" e do jazz modal, dos grooves de funk que vivem num só acorde menor sem cansar nunca. Menor, mas de cabeça erguida.',
      practice: 'Sobre o drone, tudo soa a menor comum até você cair na 6ª maior — essa nota É o sabor dórico: mire nela de propósito.',
    },
    phrygian: {
      focusLabel: '2ª menor',
      hook: 'O modo frígio é uma escala menor com a nota logo acima de casa empurrada um semitom para baixo — escuridão instantânea.',
      sound: 'Essa 2ª menor é o som do flamenco, da cadência andaluza e de metade dos riffs de metal já escritos. Vive a um traste da tônica: a tensão está sempre a um dedo.',
      practice: 'Sobre o drone, martele entre a tônica e a 2ª menor — esse atrito de semitom É o frígio; o resto da escala é contexto.',
    },
    lydian: {
      focusLabel: '4ª aumentada',
      hook: 'O modo lídio é a escala maior com a 4ª subida um semitom — maior, mas flutuando em vez de pisar o chão.',
      sound: 'É o som sonhador das trilhas de cinema, do tema dos "Simpsons" e das baladas de Joe Satriani ("Flying in a Blue Dream" é um tutorial de lídio com contrato de gravadora).',
      practice: 'Sobre o drone, segure a 4ª aumentada e deixe-a soar — em qualquer outro contexto maior seria uma nota "errada"; aqui é o ponto.',
    },
    mixolydian: {
      focusLabel: '7ª menor',
      hook: 'O modo mixolídio é a escala maior com a 7ª abaixada — brilhante em cima, blues por baixo.',
      sound: 'É a escala padrão do rock’n’roll: riffs de AC/DC, Grateful Dead, música celta e todo solo de doze compassos que soa feliz sem ser ingênuo.',
      practice: 'Sobre o drone, compare a 7ª menor com a sensível que o teu ouvido espera — essa calma de "nada a resolver" é o modo inteiro.',
    },
    aeolian: {
      focusLabel: '6ª menor',
      hook: 'O modo eólio é a escala menor natural — a triste de sempre, a gêmea de sombra da escala maior.',
      sound: 'É o som de quase todo rock e pop em tom menor: "Stairway to Heaven", "Losing My Religion", toda power ballad. A 6ª menor é o que o separa do dórico: onde o dórico levanta, o eólio afunda.',
      practice: 'Sobre o drone, desça da 6ª menor para a 5ª e sinta-a assentar — esse suspiro é a assinatura do menor natural.',
    },
    locrian: {
      focusLabel: '5ª diminuta',
      hook: 'O modo lócrio é o instável: a 2ª e a 5ª estão abaixadas, então a própria casa é um acorde diminuto que nunca assenta.',
      sound: 'Sem uma 5ª justa onde se apoiar, o lócrio recusa-se a resolver — e é exatamente por isso que o metal e o jazz o guardam para a tensão máxima. Menos um lugar para viver do que um lugar por onde passar de forma ameaçadora.',
      practice: 'Sobre o drone, repare como até a tônica parece provisória — a 5ª diminuta não para de tirar o chão.',
    },
  },
  t: {
    upgradeCta: 'Torne a prática um hábito · $5/mês',
    title: '{name} no violão e na guitarra — Notas, mapa do braço e drone | Modal Runs',
    metaDesc: '{name} na guitarra: {notes} — as notas no braço. Mapa interativo do braço, o campo harmônico (acordes diatônicos) e um drone grátis para improvisar — o Modal Runs te escuta pelo microfone e ilumina o que você toca.',
    h1: '{name} na guitarra',
    lead: '{hook} As notas de {name} são <strong>{notes}</strong>. Sua nota característica é <strong>{focus}</strong> — a {focusLabel} — a nota que dá a esta escala a sua cor.',
    neckHeading: '{name} pelo braço inteiro',
    figcaption: 'Afinação padrão, trastes 0–12. As notas douradas são a tônica ({root}); cada cor marca um intervalo, a mesma paleta do app.',
    ariaFretboard: 'A escala {name} no braço da guitarra, trastes 0 a 12',
    ctaMain: 'Pratique {name} sobre um drone →',
    ctaSub: 'Grátis, no navegador. Ele te escuta pelo microfone e ilumina o que você toca.',
    formulaHeading: 'Fórmula e intervalos',
    formulaLine: '<strong>{formula}</strong> — {n} notas. {family}',
    familyMajor: 'A 3ª maior faz dela uma escala da família maior.',
    familyMinor: 'A 3ª menor faz dela uma escala da família menor.',
    familyDim: 'A 3ª menor e a 5ª diminuta formam uma tríade diminuta sobre a tônica.',
    chordsHeading: 'Acordes em {name}',
    chordsIntro: 'Estes são os acordes diatônicos — a harmonia construída só com as notas acima. Alternar entre eles te mantém dentro do modo.',
    thDegree: 'Grau', thChord: 'Acorde', thQuality: 'Qualidade',
    sameNotesHeading: 'Mesmas notas, outra casa',
    relative: '{name} contém exatamente as mesmas notas de <a href="{parentHref}">{parent}</a>. As notas não mudam — muda qual delas se sente como casa, e isso muda tudo.',
    relativeIonian: 'Todos os modos deste site nascem de uma escala maior. {name} é a escala maior de {root} — os outros seis modos reutilizam suas notas exatas com outra casa.',
    otherModesHeading: 'Outros modos sobre {root}',
    otherModesIntro: 'Mantenha a mesma tônica e troque a escala — o jeito mais rápido de ouvir o que cada modo faz.',
    indexTitle: 'Modos de guitarra em todos os tons — Mapas do braço, notas e drones | Modal Runs',
    indexDesc: 'Os sete modos gregos da escala maior, mapeados no braço nos doze tons — use como identificador de escalas e modos: notas, acordes diatônicos e um drone grátis para improvisar. O Modal Runs te escuta pelo microfone enquanto você pratica.',
    indexH1: 'Todos os modos, todos os tons',
    indexLead: 'Os sete modos da escala maior, mapeados no braço nos doze tons — com as notas, os acordes que vivem dentro de cada um e um drone para improvisar. Escolha um tom; a página mostra o mapa e <a href="/">o app</a> te escuta enquanto você toca.',
    faqQ: 'O que é o {name}?',
    footerModes: 'Todos os modos',
    footerApp: 'Abrir o app',
    footerTag: 'Modal Runs — prática de guitarra grátis que te escuta.',
    homeTitle: 'Modal Runs — Ele te escuta enquanto você toca',
    homeDesc: 'Um mapa interativo do braço que te escuta: mantenha um drone em qualquer tom, improvise, e o Modal Runs ilumina cada nota no braço que você toca em tempo real — as notas no braço, o campo harmônico, tudo mapeado. Encontre os modos gregos de ouvido em vez de decorá-los. Grátis.',
    homeH1: 'Modal Runs — ele te escuta enquanto você toca',
    homeLead: 'Mantenha um drone em qualquer tom, improvise, e o Modal Runs te escuta pelo microfone — iluminando cada nota que você toca no braço e avisando quando você acerta a nota pedida. Aprenda os modos de ouvido em vez de decorá-los. Grátis, no navegador, sem cadastro.',
  },
}

export const LOCALES: Locale[] = [es, fr, it, pt]
