// ─── UI translation ──────────────────────────────────────────────────
// Dictionary keyed by the English string (so call sites stay readable),
// values per language. Missing key or language → the English text, so an
// untranslated string can never break a render, it just shows up in
// English until its translation lands here.
//
// t(key, lang)            — plain strings
// tf(key, lang, vars)     — templates with {placeholders}
//
// Note NAMES (C → Do) are a separate system: utils/noteNames.ts.

import type { Language } from './noteNames'
import { CONTENT } from './i18nContent'

type Entry = Partial<Record<Language, string>>

const STRINGS: Record<string, Entry> = {
  // ─── Tabs ───
  'Modes':   { es: 'Modos', fr: 'Modes', it: 'Modi', pt: 'Modos' },
  'Explore': { es: 'Explora', fr: 'Explorer', it: 'Esplora', pt: 'Explorar' },
  'Flow':    {},

  // ─── Modes (study) bar ───
  'Quick look': { es: 'Vistazo rápido', fr: 'Aperçu rapide', it: 'Sguardo rapido', pt: 'Olhada rápida' },
  'Key':        { es: 'Tonalidad', fr: 'Tonalité', it: 'Tonalità', pt: 'Tonalidade' },
  'Scale':      { es: 'Escala', fr: 'Gamme', it: 'Scala', pt: 'Escala' },
  'Chord':      { es: 'Acorde', fr: 'Accord', it: 'Accordo', pt: 'Acorde' },
  'What is this?': { es: '¿Qué es esto?', fr: 'C’est quoi ?', it: 'Cos’è questo?', pt: 'O que é isto?' },
  'Notes':      { es: 'Notas', fr: 'Notes', it: 'Note', pt: 'Notas' },
  'Intervals':  { es: 'Intervalos', fr: 'Intervalles', it: 'Intervalli', pt: 'Intervalos' },
  'Both':       { es: 'Ambos', fr: 'Les deux', it: 'Entrambi', pt: 'Ambos' },
  'Frets':      { es: 'Trastes', fr: 'Frettes', it: 'Tasti', pt: 'Trastes' },
  'All':        { es: 'Todo', fr: 'Tout', it: 'Tutto', pt: 'Tudo' },
  'More':       { es: 'Más', fr: 'Plus', it: 'Altro', pt: 'Mais' },

  // ─── Backing / sound controls ───
  'Drone': { es: 'Bordón', fr: 'Bourdon', it: 'Bordone', pt: 'Bordão' },
  'Arp':   {},
  'Tune':  { es: 'Afinar', fr: 'Accorder', it: 'Accorda', pt: 'Afinar' },
  'Tuner': { es: 'Afinador', fr: 'Accordeur', it: 'Accordatore', pt: 'Afinador' },
  'play a string': { es: 'toca una cuerda', fr: 'joue une corde', it: 'suona una corda', pt: 'toque uma corda' },

  // ─── Flow setup ───
  'Jam':       {},
  'Changes':   { es: 'Cambios', fr: 'Grille', it: 'Cambi', pt: 'Mudanças' },
  'Evolve':    { es: 'Evoluciona', fr: 'Évolution', it: 'Evolvi', pt: 'Evolui' },
  'Stay':      { es: 'Fijo', fr: 'Fixe', it: 'Fermo', pt: 'Fixo' },
  'Drift':     { es: 'Deriva', fr: 'Dérive', it: 'Deriva', pt: 'Deriva' },
  'My chords': { es: 'Mis acordes', fr: 'Mes accords', it: 'I miei accordi', pt: 'Meus acordes' },
  'Pace':      { es: 'Velocidad', fr: 'Vitesse', it: 'Velocità', pt: 'Velocidade' },
  'Slow':      { es: 'Lento', fr: 'Lent', it: 'Lento', pt: 'Lento' },
  'Medium':    { es: 'Medio', fr: 'Moyen', it: 'Medio', pt: 'Médio' },
  'Fast':      { es: 'Rápido', fr: 'Rapide', it: 'Veloce', pt: 'Rápido' },
  'Tempo':     {},
  'Bars each': { es: 'Compases c/u', fr: 'Mesures chacune', it: 'Battute ciascuno', pt: 'Compassos cada' },
  'tap chords above to build the order': {
    es: 'toca los acordes de arriba para armar el orden',
    fr: 'touche les accords ci-dessus pour construire l’ordre',
    it: 'tocca gli accordi sopra per costruire l’ordine',
    pt: 'toque nos acordes acima para montar a ordem',
  },
  'home': { es: 'casa', fr: 'maison', it: 'casa', pt: 'casa' },
  'now':  { es: 'ahora', fr: 'maintenant', it: 'ora', pt: 'agora' },
  'next': { es: 'sigue', fr: 'ensuite', it: 'poi', pt: 'a seguir' },
  'play': { es: 'play', fr: 'play', it: 'play', pt: 'play' },
  'Hit':  { es: 'Dale a', fr: 'Appuie sur', it: 'Premi', pt: 'Aperte' },
  'and just improvise. No tasks. The sound moves; your hands don’t have to.': {
    es: 'y solo improvisa. Sin tareas. El sonido se mueve; tus manos no tienen que hacerlo.',
    fr: 'et improvise, c’est tout. Aucune tâche. Le son bouge ; tes mains n’ont pas à le faire.',
    it: 'e improvvisa e basta. Nessun compito. Il suono si muove; le tue mani no.',
    pt: 'e apenas improvise. Sem tarefas. O som se move; suas mãos não precisam.',
  },
  'and play anything — a note, a whistle, a hum. The neck shows you what it heard.': {
    es: 'y toca lo que sea: una nota, un silbido, un tarareo. El mástil te muestra lo que oyó.',
    fr: 'et joue n’importe quoi — une note, un sifflement, un fredon. Le manche montre ce qu’il a entendu.',
    it: 'e suona qualsiasi cosa: una nota, un fischio, un mugolio. Il manico ti mostra cosa ha sentito.',
    pt: 'e toque qualquer coisa — uma nota, um assobio, um cantarolar. O braço mostra o que ele ouviu.',
  },

  // ─── Explore (lessons) ───
  'Lessons':  { es: 'Lecciones', fr: 'Leçons', it: 'Lezioni', pt: 'Lições' },
  'Lesson 1': { es: 'Lección 1', fr: 'Leçon 1', it: 'Lezione 1', pt: 'Lição 1' },
  'The seven modes of one scale': {
    es: 'Los siete modos de una escala',
    fr: 'Les sept modes d’une gamme',
    it: 'I sette modi di una scala',
    pt: 'Os sete modos de uma escala',
  },
  'One parent scale contains seven modes — the same notes, a different home each time. Walk the neck position by position and claim each mode by ear.': {
    es: 'Una escala madre contiene siete modos: las mismas notas, con una casa distinta cada vez. Recorre el mástil posición por posición y reclama cada modo de oído.',
    fr: 'Une gamme mère contient sept modes — les mêmes notes, une maison différente à chaque fois. Parcours le manche position par position et gagne chaque mode à l’oreille.',
    it: 'Una scala madre contiene sette modi: le stesse note, una casa diversa ogni volta. Percorri il manico posizione per posizione e conquista ogni modo a orecchio.',
    pt: 'Uma escala mãe contém sete modos — as mesmas notas, uma casa diferente a cada vez. Percorra o braço posição por posição e conquiste cada modo de ouvido.',
  },
  'Drills': { es: 'Ejercicios', fr: 'Exercices', it: 'Esercizi', pt: 'Exercícios' },
  'One sound at a time': { es: 'Un sonido a la vez', fr: 'Un son à la fois', it: 'Un suono alla volta', pt: 'Um som de cada vez' },
  'Short ear-hunts: each one is a single characteristic note against the drone. Owned means the app actually heard you land it.': {
    es: 'Cacerías de oído breves: cada una es una sola nota característica contra el bordón. Conseguida significa que la app de verdad te oyó clavarla.',
    fr: 'De courtes chasses à l’oreille : chacune est une seule note caractéristique contre le bourdon. Acquise veut dire que l’appli t’a vraiment entendu la trouver.',
    it: 'Brevi cacce a orecchio: ognuna è una singola nota caratteristica contro il bordone. Conquistata significa che l’app ti ha sentito davvero centrarla.',
    pt: 'Caçadas de ouvido curtas: cada uma é uma única nota característica contra o bordão. Conquistada significa que o app realmente ouviu você acertá-la.',
  },
  'Start': { es: 'Empezar', fr: 'Commencer', it: 'Inizia', pt: 'Começar' },
  'Major': { es: 'Mayor', fr: 'Majeur', it: 'Maggiore', pt: 'Maior' },
  'Minor': { es: 'Menor', fr: 'Mineur', it: 'Minore', pt: 'Menor' },
  'Next idea':  { es: 'Siguiente idea', fr: 'Idée suivante', it: 'Prossima idea', pt: 'Próxima ideia' },
  'Next sound': { es: 'Siguiente sonido', fr: 'Son suivant', it: 'Prossimo suono', pt: 'Próximo som' },
  'Walk the neck':  { es: 'Recorre el mástil', fr: 'Parcours le manche', it: 'Percorri il manico', pt: 'Percorra o braço' },
  'Shift position': { es: 'Cambiar posición', fr: 'Changer de position', it: 'Cambia posizione', pt: 'Mudar posição' },

  // ─── Learn-session chrome ───
  'sounds you own': { es: 'sonidos tuyos', fr: 'sons à toi', it: 'suoni tuoi', pt: 'sons seus' },
  'Find every {note} — the glowing notes': {
    es: 'Encuentra cada {note} — las notas que brillan',
    fr: 'Trouve chaque {note} — les notes qui brillent',
    it: 'Trova ogni {note} — le note che brillano',
    pt: 'Encontre cada {note} — as notas brilhando',
  },
  'find these': { es: 'encuentra estas', fr: 'trouve celles-ci', it: 'trova queste', pt: 'encontre estas' },
  'safe to play': { es: 'seguras de tocar', fr: 'sans risque', it: 'sicure da suonare', pt: 'seguras de tocar' },
  'what it hears you play': { es: 'lo que te oye tocar', fr: 'ce qu’il t’entend jouer', it: 'quello che ti sente suonare', pt: 'o que ele ouve você tocar' },

  'Headphones recommended — the mic hears your speakers.': {
    es: 'Se recomiendan audífonos: el micro oye tus parlantes.',
    fr: 'Casque recommandé — le micro entend tes enceintes.',
    it: 'Cuffie consigliate: il microfono sente le tue casse.',
    pt: 'Fones recomendados — o microfone ouve suas caixas.',
  },

  // ─── Theory layer chrome ───
  'the': { es: 'el', fr: 'le', it: 'il', pt: 'o' },
  'hide': { es: 'ocultar', fr: 'masquer', it: 'nascondi', pt: 'ocultar' },
  'show the theory': { es: 'mostrar la teoría', fr: 'afficher la théorie', it: 'mostra la teoria', pt: 'mostrar a teoria' },
  'There are': { es: 'Hay', fr: 'Il y a', it: 'Ci sono', pt: 'Há' },
  'chords that fit entirely inside this scale. Every one of them is a place you can land.': {
    es: 'acordes que caben por completo dentro de esta escala. Cada uno de ellos es un lugar donde puedes aterrizar.',
    fr: 'accords qui tiennent entièrement dans cette gamme. Chacun d’eux est un endroit où tu peux te poser.',
    it: 'accordi che stanno interamente dentro questa scala. Ognuno di loro è un posto dove puoi atterrare.',
    pt: 'acordes que cabem inteiramente dentro desta escala. Cada um deles é um lugar onde você pode pousar.',
  },

  // ─── Settings drawer ───
  'Settings': { es: 'Ajustes', fr: 'Réglages', it: 'Impostazioni', pt: 'Ajustes' },
  'DRONE':  { es: 'BORDÓN', fr: 'BOURDON', it: 'BORDONE', pt: 'BORDÃO' },
  'PAD':    {},
  'TUNING': { es: 'AFINACIÓN', fr: 'ACCORDAGE', it: 'ACCORDATURA', pt: 'AFINAÇÃO' },
  'Volume': {},
  'Spread': { es: 'Amplitud', fr: 'Largeur', it: 'Ampiezza', pt: 'Abertura' },
  'Tone':   { es: 'Tono', fr: 'Timbre', it: 'Tono', pt: 'Timbre' },

  // ─── Flow whispers & session summary ───
  'home is now {root} — same notes, new gravity': {
    es: 'la casa ahora es {root}: mismas notas, nueva gravedad',
    fr: 'la maison est maintenant {root} — mêmes notes, nouvelle gravité',
    it: 'casa ora è {root}: stesse note, nuova gravità',
    pt: 'a casa agora é {root} — mesmas notas, nova gravidade',
  },
  'under a minute of sound.': {
    es: 'menos de un minuto de sonido.',
    fr: 'moins d’une minute de son.',
    it: 'meno di un minuto di suono.',
    pt: 'menos de um minuto de som.',
  },
  '{mins} min · {notes} notes heard': {
    es: '{mins} min · {notes} notas oídas',
    fr: '{mins} min · {notes} notes entendues',
    it: '{mins} min · {notes} note sentite',
    pt: '{mins} min · {notes} notas ouvidas',
  },
  ' across {homes} homes': {
    es: ' por {homes} casas',
    fr: ' à travers {homes} maisons',
    it: ' attraverso {homes} case',
    pt: ' por {homes} casas',
  },

  // ─── Walk instructions (the in-game coaching line) ───
  '{tonic} {mode} is yours. Play it for the joy of it, or move up the neck.': {
    es: '{tonic} {mode} es tuyo. Tócalo por el gusto, o sube por el mástil.',
    fr: '{tonic} {mode} est à toi. Joue-le pour le plaisir, ou monte sur le manche.',
    it: '{tonic} {mode} è tuo. Suonalo per il gusto di farlo, o sali sul manico.',
    pt: '{tonic} {mode} é seu. Toque pelo prazer, ou suba pelo braço.',
  },
  'Now come home — land on {tonic} and this mode is yours.': {
    es: 'Ahora vuelve a casa: aterriza en {tonic} y este modo es tuyo.',
    fr: 'Maintenant rentre à la maison — pose-toi sur {tonic} et ce mode est à toi.',
    it: 'Ora torna a casa: atterra su {tonic} e questo modo è tuo.',
    pt: 'Agora volte para casa — pouse em {tonic} e este modo é seu.',
  },
  'Improvise in this position. Play {n} more of its notes, then resolve to {tonic}.': {
    es: 'Improvisa en esta posición. Toca {n} notas más de ella y resuelve a {tonic}.',
    fr: 'Improvise dans cette position. Joue encore {n} de ses notes, puis résous vers {tonic}.',
    it: 'Improvvisa in questa posizione. Suona altre {n} sue note, poi risolvi su {tonic}.',
    pt: 'Improvise nesta posição. Toque mais {n} notas dela e resolva para {tonic}.',
  },

  // ─── Run verdicts ───
  'Clean, and fast. That shape is yours.': {
    es: 'Limpio y rápido. Esa figura ya es tuya.',
    fr: 'Propre et rapide. Cette forme est à toi.',
    it: 'Pulito e veloce. Quella figura è tua.',
    pt: 'Limpo e rápido. Essa forma é sua.',
  },
  'Clean. Every note where it should be — now do it faster.': {
    es: 'Limpio. Cada nota donde debe estar; ahora hazlo más rápido.',
    fr: 'Propre. Chaque note à sa place — maintenant plus vite.',
    it: 'Pulito. Ogni nota al suo posto: ora più veloce.',
    pt: 'Limpo. Cada nota no lugar — agora mais rápido.',
  },
  'You got it. A couple of stray notes — run it again and they’ll go.': {
    es: 'Lo lograste. Un par de notas sueltas: repítelo y desaparecen.',
    fr: 'Tu l’as eu. Deux ou trois notes égarées — refais-le et elles partiront.',
    it: 'Ce l’hai fatta. Un paio di note vaganti: rifallo e spariranno.',
    pt: 'Você conseguiu. Umas notas perdidas — repita e elas somem.',
  },
  'Landed it. It was messy, so slow it right down and run it once more — speed is a by-product of accuracy, never the other way round.': {
    es: 'Lo aterrizaste. Quedó sucio, así que bájale mucho la velocidad y repítelo: la velocidad es un subproducto de la precisión, nunca al revés.',
    fr: 'C’est posé. C’était brouillon : ralentis franchement et refais-le — la vitesse est un sous-produit de la précision, jamais l’inverse.',
    it: 'Atterrato. Era sporco: rallenta parecchio e rifallo. La velocità è un sottoprodotto della precisione, mai il contrario.',
    pt: 'Aterrissou. Ficou sujo: desacelere bem e repita — velocidade é subproduto da precisão, nunca o contrário.',
  },
}

export function t(key: string, lang: Language): string {
  if (lang === 'en') return key
  return STRINGS[key]?.[lang] ?? CONTENT[key]?.[lang] ?? key
}

export function tf(key: string, lang: Language, vars: Record<string, string | number>): string {
  let out = t(key, lang)
  for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v))
  return out
}
