// ─── Translated CONTENT — the prose layer ────────────────────────────
// Everything long-form: theory insights, concept hooks, walk stories,
// scale/chord display names, the welcome essay. Same shape as the chrome
// dictionary in i18n.ts (English-keyed, missing → English), merged there.
//
// Musical judgment calls: mode names (Dorian, Lydian…) are universal and
// stay; qualities (Major/Minor) translate; genre words (blues, rock, jazz)
// stay; register aims for the same spoken, non-textbook voice as the
// English, not literal word order.

import type { Language } from './noteNames'

type Entry = Partial<Record<Language, string>>

export const CONTENT: Record<string, Entry> = {
  // ═══ theory.ts — PLAIN scale glosses ═══
  'the plain major scale — the happy, resolved one': {
    es: 'la escala mayor de toda la vida: la alegre, la resuelta',
    fr: 'la gamme majeure toute simple — la joyeuse, la résolue',
    it: 'la scala maggiore semplice: quella felice, risolta',
    pt: 'a escala maior comum — a feliz, a resolvida',
  },
  'a minor (sad) scale with ONE note lifted higher than normal': {
    es: 'una escala menor (triste) con UNA nota subida más de lo normal',
    fr: 'une gamme mineure (triste) avec UNE note remontée plus haut que la normale',
    it: 'una scala minore (triste) con UNA nota alzata più del normale',
    pt: 'uma escala menor (triste) com UMA nota elevada além do normal',
  },
  'a minor scale with the note right above home pushed down — dark, Spanish': {
    es: 'una escala menor con la nota justo encima de casa empujada hacia abajo: oscura, española',
    fr: 'une gamme mineure dont la note juste au-dessus de la maison est abaissée — sombre, espagnole',
    it: 'una scala minore con la nota subito sopra casa spinta in giù: scura, spagnola',
    pt: 'uma escala menor com a nota logo acima de casa empurrada para baixo — sombria, espanhola',
  },
  'a major (happy) scale with ONE note pushed higher — dreamy, floating': {
    es: 'una escala mayor (alegre) con UNA nota empujada hacia arriba: soñadora, flotante',
    fr: 'une gamme majeure (joyeuse) avec UNE note poussée plus haut — rêveuse, flottante',
    it: 'una scala maggiore (felice) con UNA nota spinta più in alto: sognante, sospesa',
    pt: 'uma escala maior (feliz) com UMA nota empurrada para cima — sonhadora, flutuante',
  },
  'a major scale with ONE note lowered — bright, but bluesy': {
    es: 'una escala mayor con UNA nota bajada: brillante, pero con blues',
    fr: 'une gamme majeure avec UNE note abaissée — brillante, mais bluesy',
    it: 'una scala maggiore con UNA nota abbassata: brillante, ma blues',
    pt: 'uma escala maior com UMA nota abaixada — brilhante, mas com blues',
  },
  'the plain minor scale — the sad one': {
    es: 'la escala menor de toda la vida: la triste',
    fr: 'la gamme mineure toute simple — la triste',
    it: 'la scala minore semplice: quella triste',
    pt: 'a escala menor comum — a triste',
  },
  'an unstable scale that never feels settled': {
    es: 'una escala inestable que nunca se siente en paz',
    fr: 'une gamme instable qui ne se pose jamais',
    it: 'una scala instabile che non si sente mai a posto',
    pt: 'uma escala instável que nunca se assenta',
  },
  'a minor scale with one note raised, making a big exotic leap': {
    es: 'una escala menor con una nota subida, que crea un gran salto exótico',
    fr: 'une gamme mineure avec une note relevée, créant un grand saut exotique',
    it: 'una scala minore con una nota alzata, che crea un grande salto esotico',
    pt: 'uma escala menor com uma nota elevada, criando um grande salto exótico',
  },
  'a scale that starts sad and turns bright on the way up': {
    es: 'una escala que empieza triste y se vuelve brillante al subir',
    fr: 'une gamme qui commence triste et s’éclaircit en montant',
    it: 'una scala che parte triste e diventa luminosa salendo',
    pt: 'uma escala que começa triste e clareia na subida',
  },
  'the 5-note scale everyone solos with — nothing in it can sound wrong': {
    es: 'la escala de 5 notas con la que todo el mundo solea: nada en ella puede sonar mal',
    fr: 'la gamme à 5 notes avec laquelle tout le monde improvise — rien dedans ne peut sonner faux',
    it: 'la scala di 5 note con cui tutti fanno assoli: niente al suo interno può suonare sbagliato',
    pt: 'a escala de 5 notas com que todo mundo sola — nada nela pode soar errado',
  },
  'the sweet 5-note scale — open and vocal': {
    es: 'la escala dulce de 5 notas: abierta y vocal',
    fr: 'la douce gamme à 5 notes — ouverte et vocale',
    it: 'la dolce scala di 5 note: aperta e vocale',
    pt: 'a escala doce de 5 notas — aberta e vocal',
  },
  'the 5-note solo scale plus one deliberately "wrong" note': {
    es: 'la escala de solos de 5 notas más una nota deliberadamente "equivocada"',
    fr: 'la gamme à 5 notes pour solos plus une note volontairement « fausse »',
    it: 'la scala da assolo di 5 note più una nota volutamente "sbagliata"',
    pt: 'a escala de solo de 5 notas mais uma nota deliberadamente "errada"',
  },

  // ═══ theory.ts — objective templates ═══
  '{root} {scale} is {plain}.': {
    es: '{root} {scale} es {plain}.',
    fr: '{root} {scale}, c’est {plain}.',
    it: '{root} {scale} è {plain}.',
    pt: '{root} {scale} é {plain}.',
  },
  'You’re playing {root} {scale}.': {
    es: 'Estás tocando {root} {scale}.',
    fr: 'Tu joues {root} {scale}.',
    it: 'Stai suonando {root} {scale}.',
    pt: 'Você está tocando {root} {scale}.',
  },
  ' The white-outlined notes are a shape you can sweep through.': {
    es: ' Las notas con borde blanco son una figura que puedes barrer.',
    fr: ' Les notes cerclées de blanc forment une figure que tu peux balayer.',
    it: ' Le note bordate di bianco sono una figura che puoi suonare in sweep.',
    pt: ' As notas com contorno branco são uma forma que você pode varrer.',
  },
  '{what} A drone is holding {root} underneath you, so every note you play is heard against it.{shape} Your job: play around and land on {note} — the glowing notes. That’s the {interval}, the one note that gives this scale its character. When the app hears you hit it, it’ll tell you.': {
    es: '{what} Un bordón sostiene {root} debajo de ti, así que cada nota que tocas se oye contra él.{shape} Tu misión: juega y aterriza en {note} — las notas que brillan. Ese es el {interval}, la única nota que le da a esta escala su carácter. Cuando la app te oiga clavarla, te lo dirá.',
    fr: '{what} Un bourdon tient {root} sous toi, donc chaque note que tu joues s’entend contre lui.{shape} Ta mission : explore et pose-toi sur {note} — les notes qui brillent. C’est le {interval}, la seule note qui donne à cette gamme son caractère. Quand l’appli t’entendra la toucher, elle te le dira.',
    it: '{what} Un bordone tiene {root} sotto di te, quindi ogni nota che suoni si sente contro di lui.{shape} Il tuo compito: gira intorno e atterra su {note} — le note che brillano. È il {interval}, l’unica nota che dà a questa scala il suo carattere. Quando l’app ti sentirà centrarla, te lo dirà.',
    pt: '{what} Um bordão segura {root} embaixo de você, então cada nota que você toca é ouvida contra ele.{shape} Sua missão: explore e pouse em {note} — as notas brilhando. Esse é o {interval}, a única nota que dá a esta escala seu caráter. Quando o app ouvir você acertá-la, ele avisa.',
  },

  // ═══ theory.ts — PRIMER ═══
  'What am I actually doing?': {
    es: '¿Qué estoy haciendo exactamente?',
    fr: 'Qu’est-ce que je fais, au juste ?',
    it: 'Cosa sto facendo esattamente?',
    pt: 'O que exatamente estou fazendo?',
  },
  'Playing over a drone (a held note) and hunting for one specific note on the neck. That note is what makes each scale sound the way it does. Find it, hear it, and the theory stops being abstract.': {
    es: 'Tocar sobre un bordón (una nota sostenida) y cazar una nota concreta en el mástil. Esa nota es lo que hace que cada escala suene como suena. Encuéntrala, óyela, y la teoría deja de ser abstracta.',
    fr: 'Jouer sur un bourdon (une note tenue) et chasser une note précise sur le manche. C’est cette note qui donne à chaque gamme son son. Trouve-la, entends-la, et la théorie cesse d’être abstraite.',
    it: 'Suonare sopra un bordone (una nota tenuta) e cacciare una nota precisa sul manico. È quella nota a far suonare ogni scala come suona. Trovala, sentila, e la teoria smette di essere astratta.',
    pt: 'Tocar sobre um bordão (uma nota sustentada) e caçar uma nota específica no braço. Essa nota é o que faz cada escala soar do jeito que soa. Encontre-a, ouça-a, e a teoria deixa de ser abstrata.',
  },
  'What’s a "mode" or "scale"?': {
    es: '¿Qué es un "modo" o una "escala"?',
    fr: 'C’est quoi un « mode » ou une « gamme » ?',
    it: 'Cos’è un "modo" o una "scala"?',
    pt: 'O que é um "modo" ou uma "escala"?',
  },
  'A scale is just a set of notes that sound good together. A mode is one of those sets with its own flavour. Two scales can share almost every note and differ by one — and that one note changes everything. That’s the note we make you find.': {
    es: 'Una escala es solo un conjunto de notas que suenan bien juntas. Un modo es uno de esos conjuntos con su propio sabor. Dos escalas pueden compartir casi todas las notas y diferir en una — y esa nota lo cambia todo. Esa es la nota que te hacemos encontrar.',
    fr: 'Une gamme n’est qu’un ensemble de notes qui sonnent bien ensemble. Un mode est un de ces ensembles avec sa propre saveur. Deux gammes peuvent partager presque toutes leurs notes et différer d’une seule — et cette note change tout. C’est celle qu’on te fait trouver.',
    it: 'Una scala è solo un insieme di note che suonano bene insieme. Un modo è uno di questi insiemi con il suo sapore. Due scale possono condividere quasi ogni nota e differire per una sola — e quella nota cambia tutto. È la nota che ti facciamo trovare.',
    pt: 'Uma escala é só um conjunto de notas que soam bem juntas. Um modo é um desses conjuntos com seu próprio sabor. Duas escalas podem compartilhar quase todas as notas e diferir em uma — e essa nota muda tudo. É essa que fazemos você encontrar.',
  },
  'What do R, b3, 5, 6 mean?': {
    es: '¿Qué significan R, b3, 5, 6?',
    fr: 'Que veulent dire R, b3, 5, 6 ?',
    it: 'Cosa significano R, b3, 5, 6?',
    pt: 'O que significam R, b3, 5, 6?',
  },
  'They’re positions, not note names. R is "home" (the root). The numbers count steps up from home. So the 6 is the sixth note of the scale. We use numbers because the shape stays the same in every key — learn it once, play it anywhere.': {
    es: 'Son posiciones, no nombres de notas. R es "casa" (la fundamental). Los números cuentan pasos desde casa. Así que el 6 es la sexta nota de la escala. Usamos números porque la figura es la misma en todas las tonalidades: apréndela una vez, tócala en cualquier parte.',
    fr: 'Ce sont des positions, pas des noms de notes. R, c’est la « maison » (la fondamentale). Les chiffres comptent les pas depuis la maison. Le 6 est donc la sixième note de la gamme. On utilise des chiffres parce que la figure reste la même dans toutes les tonalités — apprends-la une fois, joue-la partout.',
    it: 'Sono posizioni, non nomi di note. R è "casa" (la fondamentale). I numeri contano i passi da casa. Quindi il 6 è la sesta nota della scala. Usiamo i numeri perché la figura resta uguale in ogni tonalità: imparala una volta, suonala ovunque.',
    pt: 'São posições, não nomes de notas. R é "casa" (a fundamental). Os números contam passos a partir de casa. Então o 6 é a sexta nota da escala. Usamos números porque a forma é a mesma em toda tonalidade — aprenda uma vez, toque em qualquer lugar.',
  },
  'Why is there a drone?': {
    es: '¿Por qué hay un bordón?',
    fr: 'Pourquoi un bourdon ?',
    it: 'Perché c’è un bordone?',
    pt: 'Por que existe um bordão?',
  },
  'A single held note gives your ear a reference. Against silence, no note sounds like anything. Against a drone, each note has a clear personality — and the note you’re hunting will jump out.': {
    es: 'Una sola nota sostenida le da a tu oído una referencia. Contra el silencio, ninguna nota suena a nada. Contra un bordón, cada nota tiene una personalidad clara — y la nota que cazas saltará a la vista.',
    fr: 'Une seule note tenue donne une référence à ton oreille. Contre le silence, aucune note ne ressemble à rien. Contre un bourdon, chaque note a une personnalité nette — et celle que tu chasses te sautera aux oreilles.',
    it: 'Una singola nota tenuta dà al tuo orecchio un riferimento. Contro il silenzio, nessuna nota suona come niente. Contro un bordone, ogni nota ha una personalità chiara — e quella che stai cacciando salterà fuori.',
    pt: 'Uma única nota sustentada dá ao seu ouvido uma referência. Contra o silêncio, nenhuma nota soa como nada. Contra um bordão, cada nota tem personalidade clara — e a nota que você caça vai saltar aos ouvidos.',
  },
  'What is it listening for?': {
    es: '¿Qué está escuchando?',
    fr: 'Qu’est-ce qu’elle écoute ?',
    it: 'Cosa sta ascoltando?',
    pt: 'O que ele está escutando?',
  },
  'Your microphone. Play, whistle, or hum. It works out which note you produced and lights it up on the neck. When you land the glowing note, you own that sound.': {
    es: 'Tu micrófono. Toca, silba o tararea. Averigua qué nota produjiste y la ilumina en el mástil. Cuando aterrices en la nota que brilla, ese sonido es tuyo.',
    fr: 'Ton micro. Joue, siffle ou fredonne. Elle déduit la note produite et l’allume sur le manche. Quand tu poses la note qui brille, ce son est à toi.',
    it: 'Il tuo microfono. Suona, fischia o canticchia. Capisce quale nota hai prodotto e la accende sul manico. Quando atterri sulla nota che brilla, quel suono è tuo.',
    pt: 'Seu microfone. Toque, assobie ou cantarole. Ele descobre qual nota você produziu e a acende no braço. Quando você pousa na nota brilhando, aquele som é seu.',
  },

  // ═══ theory.ts — CHARACTER (title + body per scale) ═══
  'The leading tone': { es: 'La sensible', fr: 'La sensible', it: 'La sensibile', pt: 'A sensível' },
  'The 7 sits a half-step under the root and leans on it. That lean is why major sounds resolved and sure of itself — remove it (flatten it to a b7) and the whole thing goes loose and bluesy.': {
    es: 'El 7 está medio tono bajo la fundamental y se apoya en ella. Ese apoyo es la razón de que mayor suene resuelto y seguro de sí mismo — quítalo (bájalo a b7) y todo se vuelve suelto y con blues.',
    fr: 'Le 7 est un demi-ton sous la fondamentale et s’appuie dessus. Cet appui est la raison pour laquelle le majeur sonne résolu et sûr de lui — enlève-le (abaisse-le en b7) et tout devient lâche et bluesy.',
    it: 'Il 7 sta mezzo tono sotto la fondamentale e ci si appoggia. Quell’appoggio è il motivo per cui il maggiore suona risolto e sicuro di sé — toglilo (abbassalo a b7) e tutto diventa sciolto e blues.',
    pt: 'O 7 fica meio tom abaixo da fundamental e se apoia nela. Esse apoio é por que o maior soa resolvido e seguro de si — tire-o (abaixe para b7) e tudo fica solto e com blues.',
  },
  'The raised 6th': { es: 'La 6ª elevada', fr: 'La 6te haussée', it: 'La 6ª alzata', pt: 'A 6ª elevada' },
  'Minor, but the 6 is natural instead of flat. That single note is the whole mode: still dark, but hopeful rather than grieving. Aeolian flattens it and the light goes out.': {
    es: 'Menor, pero el 6 es natural en vez de bemol. Esa única nota es todo el modo: sigue siendo oscuro, pero esperanzado en vez de afligido. Eólico la baja y la luz se apaga.',
    fr: 'Mineur, mais le 6 est naturel au lieu d’être bémolisé. Cette seule note est tout le mode : toujours sombre, mais plein d’espoir plutôt qu’endeuillé. L’éolien l’abaisse et la lumière s’éteint.',
    it: 'Minore, ma il 6 è naturale invece che bemolle. Quella singola nota è tutto il modo: ancora scuro, ma pieno di speranza invece che in lutto. L’eolio la abbassa e la luce si spegne.',
    pt: 'Menor, mas o 6 é natural em vez de bemol. Essa única nota é o modo inteiro: ainda escuro, mas esperançoso em vez de enlutado. O eólio a abaixa e a luz se apaga.',
  },
  'The flat 2nd': { es: 'La 2ª bemol', fr: 'La 2de bémol', it: 'La 2ª bemolle', pt: 'A 2ª bemol' },
  'A half-step above the root — the tightest, most menacing interval you can put next to home. Spanish or metal depending on how hard you hit it. Nothing else sounds like it.': {
    es: 'Medio tono sobre la fundamental: el intervalo más apretado y amenazante que puedes poner junto a casa. Español o metal según lo fuerte que lo toques. Nada más suena así.',
    fr: 'Un demi-ton au-dessus de la fondamentale — l’intervalle le plus serré et menaçant qu’on puisse mettre à côté de la maison. Espagnol ou metal selon la force de l’attaque. Rien d’autre ne sonne comme ça.',
    it: 'Mezzo tono sopra la fondamentale: l’intervallo più stretto e minaccioso che puoi mettere accanto a casa. Spagnolo o metal a seconda di quanto forte lo colpisci. Nient’altro suona così.',
    pt: 'Meio tom acima da fundamental — o intervalo mais apertado e ameaçador que você pode pôr ao lado de casa. Espanhol ou metal dependendo da força. Nada mais soa assim.',
  },
  'The raised 4th': { es: 'La 4ª aumentada', fr: 'La 4te haussée', it: 'La 4ª aumentata', pt: 'A 4ª aumentada' },
  'Major, but the 4th is sharpened. It hovers — it wants to resolve and never has to. Major sounds happy; Lydian sounds like wonder. This is the film-score note.': {
    es: 'Mayor, pero con la 4ª sostenida. Flota: quiere resolver y nunca tiene que hacerlo. Mayor suena alegre; lidio suena a asombro. Esta es la nota de banda sonora.',
    fr: 'Majeur, mais la 4te est diésée. Elle plane — elle veut se résoudre et n’y est jamais obligée. Le majeur sonne joyeux ; le lydien sonne comme l’émerveillement. C’est la note de musique de film.',
    it: 'Maggiore, ma la 4ª è diesizzata. Aleggia: vuole risolvere e non deve mai farlo. Il maggiore suona felice; il lidio suona come meraviglia. Questa è la nota da colonna sonora.',
    pt: 'Maior, mas com a 4ª sustenida. Ela paira — quer resolver e nunca precisa. Maior soa feliz; lídio soa como deslumbre. Esta é a nota de trilha sonora.',
  },
  'The flat 7th': { es: 'La 7ª bemol', fr: 'La 7e bémol', it: 'La 7ª bemolle', pt: 'A 7ª bemol' },
  'All of major’s brightness, with the leash off. The major 3rd and the flat 7th in the same scale is the dominant sound — the single reason blues and rock exist.': {
    es: 'Todo el brillo de mayor, sin correa. La 3ª mayor y la 7ª bemol en la misma escala es el sonido dominante: la única razón de que existan el blues y el rock.',
    fr: 'Toute la brillance du majeur, sans laisse. La 3ce majeure et la 7e bémol dans la même gamme, c’est le son dominant — l’unique raison pour laquelle le blues et le rock existent.',
    it: 'Tutta la brillantezza del maggiore, senza guinzaglio. La 3ª maggiore e la 7ª bemolle nella stessa scala è il suono di dominante: l’unico motivo per cui esistono blues e rock.',
    pt: 'Todo o brilho do maior, sem coleira. A 3ª maior e a 7ª bemol na mesma escala é o som dominante — a única razão de blues e rock existirem.',
  },
  'The flat 6th': { es: 'La 6ª bemol', fr: 'La 6te bémol', it: 'La 6ª bemolle', pt: 'A 6ª bemol' },
  'The natural minor. The b6 is what makes it grieve rather than brood — compare it to Dorian’s natural 6 and you can hear the light switch off.': {
    es: 'El menor natural. El b6 es lo que lo hace llorar en vez de rumiar — compáralo con el 6 natural del dórico y oirás cómo se apaga la luz.',
    fr: 'Le mineur naturel. Le b6 est ce qui le fait pleurer plutôt que ruminer — compare-le au 6 naturel du dorien et tu entendras la lumière s’éteindre.',
    it: 'Il minore naturale. Il b6 è ciò che lo fa piangere invece che rimuginare — confrontalo con il 6 naturale del dorico e sentirai la luce spegnersi.',
    pt: 'O menor natural. O b6 é o que o faz chorar em vez de remoer — compare com o 6 natural do dórico e você ouve a luz se apagar.',
  },
  'No home to go to': { es: 'Sin casa a la que volver', fr: 'Pas de maison où rentrer', it: 'Nessuna casa dove tornare', pt: 'Sem casa para voltar' },
  'Flat 2 AND flat 5. The tonic chord is diminished, so home itself is unstable — you keep wanting to leave. That restlessness IS the sound. Use it as colour, not as a key.': {
    es: '2 bemol Y 5 bemol. El acorde de tónica es disminuido, así que la propia casa es inestable: no dejas de querer irte. Esa inquietud ES el sonido. Úsalo como color, no como tonalidad.',
    fr: '2 bémol ET 5 bémol. L’accord de tonique est diminué, donc la maison elle-même est instable — tu veux sans cesse partir. Cette agitation EST le son. Utilise-le comme couleur, pas comme tonalité.',
    it: '2 bemolle E 5 bemolle. L’accordo di tonica è diminuito, quindi casa stessa è instabile: continui a voler andartene. Quell’irrequietezza È il suono. Usalo come colore, non come tonalità.',
    pt: '2 bemol E 5 bemol. O acorde de tônica é diminuto, então a própria casa é instável — você fica querendo ir embora. Essa inquietação É o som. Use como cor, não como tonalidade.',
  },
  'A step and a half': { es: 'Un tono y medio', fr: 'Un ton et demi', it: 'Un tono e mezzo', pt: 'Um tom e meio' },
  'Natural minor with the 7th raised back up. Now the b6 leaps to the 7 — the widest gap in the scale, and the reason this sounds like a knife. Everything else here is just Aeolian.': {
    es: 'Menor natural con la 7ª subida de vuelta. Ahora el b6 salta al 7: el hueco más ancho de la escala, y la razón de que esto suene a cuchillo. Todo lo demás aquí es simplemente eólico.',
    fr: 'Mineur naturel avec la 7e remontée. Maintenant le b6 saute vers le 7 — le plus grand écart de la gamme, et la raison pour laquelle ça sonne comme un couteau. Tout le reste ici n’est que de l’éolien.',
    it: 'Minore naturale con la 7ª rialzata. Ora il b6 salta al 7: il divario più ampio della scala, e il motivo per cui suona come un coltello. Tutto il resto qui è solo eolio.',
    pt: 'Menor natural com a 7ª elevada de volta. Agora o b6 salta para o 7 — o maior vão da escala, e a razão de isto soar como uma faca. Todo o resto aqui é só eólio.',
  },
  'Minor below, major above': { es: 'Menor abajo, mayor arriba', fr: 'Mineur en bas, majeur en haut', it: 'Minore sotto, maggiore sopra', pt: 'Menor embaixo, maior em cima' },
  'The 6 and the 7 are both raised, so it starts minor and turns bright halfway up. Ambiguous, expensive-sounding, and the backbone of most jazz reharmonisation.': {
    es: 'El 6 y el 7 están ambos subidos, así que empieza menor y se vuelve brillante a mitad de camino. Ambiguo, con sonido caro, y la columna vertebral de casi toda la rearmonización del jazz.',
    fr: 'Le 6 et le 7 sont tous deux relevés : ça commence mineur et s’éclaircit à mi-chemin. Ambigu, au son luxueux, et l’épine dorsale de la plupart des réharmonisations jazz.',
    it: 'Il 6 e il 7 sono entrambi alzati, quindi parte minore e diventa luminoso a metà strada. Ambiguo, dal suono costoso, e la spina dorsale di quasi tutta la riarmonizzazione jazz.',
    pt: 'O 6 e o 7 estão ambos elevados: começa menor e clareia no meio do caminho. Ambíguo, com som caro, e a espinha dorsal de quase toda rearmonização do jazz.',
  },
  'Nothing to get wrong': { es: 'Nada que fallar', fr: 'Rien à rater', it: 'Niente da sbagliare', pt: 'Nada para errar' },
  'Five notes, no half-step clashes, no avoid notes. All the tension has been removed — which means the only thing left to work on is phrasing. Play fewer notes than you want to.': {
    es: 'Cinco notas, sin choques de semitono, sin notas a evitar. Toda la tensión se ha eliminado — lo único que queda por trabajar es el fraseo. Toca menos notas de las que quieres.',
    fr: 'Cinq notes, aucun frottement de demi-ton, aucune note à éviter. Toute la tension a été retirée — il ne reste donc que le phrasé à travailler. Joue moins de notes que tu n’en as envie.',
    it: 'Cinque note, nessuno scontro di semitono, nessuna nota da evitare. Tutta la tensione è stata rimossa — l’unica cosa su cui lavorare è il fraseggio. Suona meno note di quante ne vorresti.',
    pt: 'Cinco notas, sem choques de semitom, sem notas a evitar. Toda a tensão foi removida — só resta trabalhar o fraseado. Toque menos notas do que você quer.',
  },
  'The sweet one': { es: 'La dulce', fr: 'La douce', it: 'La dolce', pt: 'A doce' },
  'Same five shapes as minor pentatonic, moved to a major home. Open, vocal, uncluttered — the country and Mayer sound. Bend into the 2 and the 6 and let them ring.': {
    es: 'Las mismas cinco figuras que la pentatónica menor, movidas a una casa mayor. Abierto, vocal, despejado: el sonido country y de Mayer. Haz bend hacia el 2 y el 6 y déjalos sonar.',
    fr: 'Les cinq mêmes figures que la pentatonique mineure, déplacées vers une maison majeure. Ouvert, vocal, épuré — le son country et Mayer. Tire vers le 2 et le 6 et laisse-les sonner.',
    it: 'Le stesse cinque figure della pentatonica minore, spostate su una casa maggiore. Aperto, vocale, pulito: il suono country e alla Mayer. Fai bending verso il 2 e il 6 e lasciali suonare.',
    pt: 'As mesmas cinco formas da pentatônica menor, movidas para uma casa maior. Aberto, vocal, limpo — o som country e do Mayer. Faça bend no 2 e no 6 e deixe soar.',
  },
  'The one dirty note': { es: 'La única nota sucia', fr: 'La seule note sale', it: 'L’unica nota sporca', pt: 'A única nota suja' },
  'Minor pentatonic plus the b5. Don’t land on it — pass THROUGH it. Sit on it and it sounds like a mistake; slide off it and it sounds like the blues.': {
    es: 'Pentatónica menor más el b5. No aterrices en él: pásalo DE LARGO. Siéntate en él y suena a error; resbala fuera y suena a blues.',
    fr: 'Pentatonique mineure plus le b5. Ne t’y pose pas — TRAVERSE-le. Reste dessus et ça sonne comme une erreur ; glisse et ça sonne comme le blues.',
    it: 'Pentatonica minore più il b5. Non atterrarci: ATTRAVERSALO. Fermati sopra e suona come un errore; scivola via e suona come il blues.',
    pt: 'Pentatônica menor mais o b5. Não pouse nele — passe ATRAVÉS dele. Fique nele e soa como erro; deslize para fora e soa como blues.',
  },
  'The sound': { es: 'El sonido', fr: 'Le son', it: 'Il suono', pt: 'O som' },
  'Why it works': { es: 'Por qué funciona', fr: 'Pourquoi ça marche', it: 'Perché funziona', pt: 'Por que funciona' },
  ' In {root}, that note is {note}.': {
    es: ' En {root}, esa nota es {note}.',
    fr: ' En {root}, cette note est {note}.',
    it: ' In {root}, quella nota è {note}.',
    pt: ' Em {root}, essa nota é {note}.',
  },

  // ═══ theory.ts — chord insight templates ═══
  '{chord} is the {roman} of {key} {scale}.': {
    es: '{chord} es el {roman} de {key} {scale}.',
    fr: '{chord} est le {roman} de {key} {scale}.',
    it: '{chord} è il {roman} di {key} {scale}.',
    pt: '{chord} é o {roman} de {key} {scale}.',
  },
  'It shares {notes} with your home chord — that overlap is why it can wander this far and still sound like it belongs.': {
    es: 'Comparte {notes} con tu acorde de casa: ese solape es la razón de que pueda alejarse tanto y aun así sonar como si perteneciera.',
    fr: 'Il partage {notes} avec ton accord de maison — ce recouvrement explique qu’il puisse s’éloigner autant et sonner encore à sa place.',
    it: 'Condivide {notes} con il tuo accordo di casa: quella sovrapposizione è il motivo per cui può allontanarsi così tanto e suonare ancora al suo posto.',
    pt: 'Ele compartilha {notes} com seu acorde de casa — essa sobreposição é por que ele pode vagar tão longe e ainda soar como se pertencesse.',
  },
  'Its only anchor to home is {note} — which is exactly why it feels like it’s pulling away.': {
    es: 'Su única ancla a casa es {note} — exactamente por eso se siente como si tirara hacia afuera.',
    fr: 'Son seul point d’ancrage à la maison est {note} — c’est exactement pourquoi il semble s’arracher.',
    it: 'La sua unica àncora a casa è {note} — ed è esattamente per questo che sembra strapparsi via.',
    pt: 'Sua única âncora em casa é {note} — exatamente por isso parece estar se afastando.',
  },
  'The note doing the work is {note}, its {iv} — that’s the {deg} of the key.': {
    es: 'La nota que hace el trabajo es {note}, su {iv} — es el {deg} de la tonalidad.',
    fr: 'La note qui fait le travail est {note}, sa {iv} — c’est le {deg} de la tonalité.',
    it: 'La nota che fa il lavoro è {note}, il suo {iv} — è il {deg} della tonalità.',
    pt: 'A nota que faz o trabalho é {note}, sua {iv} — é o {deg} da tonalidade.',
  },
  'Play the scale, but aim at the lit-up chord tones. They land; everything else is passing through.': {
    es: 'Toca la escala, pero apunta a las notas del acorde iluminadas. Ellas aterrizan; todo lo demás va de paso.',
    fr: 'Joue la gamme, mais vise les notes d’accord allumées. Elles se posent ; tout le reste ne fait que passer.',
    it: 'Suona la scala, ma mira alle note dell’accordo illuminate. Loro atterrano; tutto il resto è di passaggio.',
    pt: 'Toque a escala, mas mire nas notas do acorde acesas. Elas pousam; todo o resto está de passagem.',
  },
  '{chord} over {key}': {
    es: '{chord} sobre {key}',
    fr: '{chord} sur {key}',
    it: '{chord} su {key}',
    pt: '{chord} sobre {key}',
  },
  ' and ': { es: ' y ', fr: ' et ', it: ' e ', pt: ' e ' },

  // ═══ walk.ts — describeStep ═══
  'Position {index} begins on {tonic}. That makes home {tonic}, so these notes are {tonic} {mode}{plain}.': {
    es: 'La posición {index} empieza en {tonic}. Eso hace que casa sea {tonic}, así que estas notas son {tonic} {mode}{plain}.',
    fr: 'La position {index} commence sur {tonic}. La maison est donc {tonic}, et ces notes sont {tonic} {mode}{plain}.',
    it: 'La posizione {index} inizia su {tonic}. Questo rende casa {tonic}, quindi queste note sono {tonic} {mode}{plain}.',
    pt: 'A posição {index} começa em {tonic}. Isso faz de {tonic} a casa, então estas notas são {tonic} {mode}{plain}.',
  },
  'You moved up the neck and nothing about the notes changed — it’s still the same scale under your fingers. But this position starts on {tonic}, so the drone moved home from {from} to {tonic}. The same notes are now {tonic} {mode}{plain}. Hear how different they feel.': {
    es: 'Subiste por el mástil y nada de las notas cambió: sigue siendo la misma escala bajo tus dedos. Pero esta posición empieza en {tonic}, así que el bordón movió casa de {from} a {tonic}. Las mismas notas ahora son {tonic} {mode}{plain}. Escucha qué distintas se sienten.',
    fr: 'Tu es monté sur le manche et rien des notes n’a changé — c’est toujours la même gamme sous tes doigts. Mais cette position commence sur {tonic}, donc le bourdon a déménagé de {from} à {tonic}. Les mêmes notes sont maintenant {tonic} {mode}{plain}. Écoute comme elles sonnent différemment.',
    it: 'Sei salito sul manico e nulla delle note è cambiato: è ancora la stessa scala sotto le tue dita. Ma questa posizione inizia su {tonic}, quindi il bordone ha spostato casa da {from} a {tonic}. Le stesse note ora sono {tonic} {mode}{plain}. Senti come suonano diverse.',
    pt: 'Você subiu pelo braço e nada nas notas mudou — ainda é a mesma escala sob seus dedos. Mas esta posição começa em {tonic}, então o bordão mudou a casa de {from} para {tonic}. As mesmas notas agora são {tonic} {mode}{plain}. Ouça como soam diferentes.',
  },
  ', which is {plain}': {
    es: ', que es {plain}',
    fr: ', c’est-à-dire {plain}',
    it: ', cioè {plain}',
    pt: ', que é {plain}',
  },

  // ═══ modes.ts ═══
  'Same home note, different notes — this is a real key change.': {
    es: 'Misma nota de casa, notas distintas: esto es un cambio de tonalidad de verdad.',
    fr: 'Même note de maison, notes différentes — c’est un vrai changement de tonalité.',
    it: 'Stessa nota di casa, note diverse: questo è un vero cambio di tonalità.',
    pt: 'Mesma nota de casa, notas diferentes — isto é uma mudança de tonalidade de verdade.',
  },
  'These are the exact same seven notes you were just playing, at the same frets — the drone simply moved home from {from} to {to}. That is the only difference between {from} {fromMode} and {to} {toMode}{plain}. No new notes. The sound completely changes anyway.': {
    es: 'Estas son exactamente las mismas siete notas que estabas tocando, en los mismos trastes: el bordón simplemente movió casa de {from} a {to}. Esa es la única diferencia entre {from} {fromMode} y {to} {toMode}{plain}. Ninguna nota nueva. El sonido cambia por completo de todos modos.',
    fr: 'Ce sont exactement les sept mêmes notes que tu jouais, aux mêmes frettes — le bourdon a simplement déménagé de {from} à {to}. C’est la seule différence entre {from} {fromMode} et {to} {toMode}{plain}. Aucune note nouvelle. Le son change complètement quand même.',
    it: 'Queste sono esattamente le stesse sette note che stavi suonando, sugli stessi tasti: il bordone ha semplicemente spostato casa da {from} a {to}. È l’unica differenza tra {from} {fromMode} e {to} {toMode}{plain}. Nessuna nota nuova. Il suono cambia completamente lo stesso.',
    pt: 'Estas são exatamente as mesmas sete notas que você estava tocando, nos mesmos trastes — o bordão simplesmente mudou a casa de {from} para {to}. Essa é a única diferença entre {from} {fromMode} e {to} {toMode}{plain}. Nenhuma nota nova. O som muda completamente mesmo assim.',
  },
  'Don’t move your hands. The drone is now on {tonic}. Those same notes — {notes} — are no longer a {chordRoot} chord sitting at home; against {tonic} they’re the {intervals}. Identical shape. Completely different meaning. That is what a mode actually is.': {
    es: 'No muevas las manos. El bordón está ahora en {tonic}. Esas mismas notas — {notes} — ya no son un acorde de {chordRoot} sentado en casa; contra {tonic} son el {intervals}. Figura idéntica. Significado completamente distinto. Eso es lo que realmente es un modo.',
    fr: 'Ne bouge pas les mains. Le bourdon est maintenant sur {tonic}. Ces mêmes notes — {notes} — ne sont plus un accord de {chordRoot} posé à la maison ; contre {tonic}, elles sont le {intervals}. Figure identique. Sens complètement différent. Voilà ce qu’est vraiment un mode.',
    it: 'Non muovere le mani. Il bordone è ora su {tonic}. Quelle stesse note — {notes} — non sono più un accordo di {chordRoot} seduto a casa; contro {tonic} sono il {intervals}. Figura identica. Significato completamente diverso. Ecco cosa è davvero un modo.',
    pt: 'Não mova as mãos. O bordão agora está em {tonic}. Essas mesmas notas — {notes} — não são mais um acorde de {chordRoot} sentado em casa; contra {tonic} elas são o {intervals}. Forma idêntica. Significado completamente diferente. Isso é o que um modo realmente é.',
  },

  // ═══ Scale display names ═══
  'Ionian (Major)': { es: 'Jónico (Mayor)', fr: 'Ionien (Majeur)', it: 'Ionico (Maggiore)', pt: 'Jônico (Maior)' },
  'Dorian': { es: 'Dórico', fr: 'Dorien', it: 'Dorico', pt: 'Dórico' },
  'Phrygian': { es: 'Frigio', fr: 'Phrygien', it: 'Frigio', pt: 'Frígio' },
  'Lydian': { es: 'Lidio', fr: 'Lydien', it: 'Lidio', pt: 'Lídio' },
  'Mixolydian': { es: 'Mixolidio', fr: 'Mixolydien', it: 'Misolidio', pt: 'Mixolídio' },
  'Aeolian (Natural Minor)': { es: 'Eólico (Menor natural)', fr: 'Éolien (Mineur naturel)', it: 'Eolio (Minore naturale)', pt: 'Eólio (Menor natural)' },
  'Locrian': { es: 'Locrio', fr: 'Locrien', it: 'Locrio', pt: 'Lócrio' },
  'Major Pentatonic': { es: 'Pentatónica mayor', fr: 'Pentatonique majeure', it: 'Pentatonica maggiore', pt: 'Pentatônica maior' },
  'Minor Pentatonic': { es: 'Pentatónica menor', fr: 'Pentatonique mineure', it: 'Pentatonica minore', pt: 'Pentatônica menor' },
  'Blues': {},
  'Major Blues': { es: 'Blues mayor', fr: 'Blues majeur', it: 'Blues maggiore', pt: 'Blues maior' },
  'Harmonic Minor': { es: 'Menor armónica', fr: 'Mineur harmonique', it: 'Minore armonica', pt: 'Menor harmônica' },
  'Melodic Minor': { es: 'Menor melódica', fr: 'Mineur mélodique', it: 'Minore melodica', pt: 'Menor melódica' },
  'Phrygian Dominant': { es: 'Frigio dominante', fr: 'Phrygien dominant', it: 'Frigio dominante', pt: 'Frígio dominante' },
  'Lydian Augmented': { es: 'Lidio aumentado', fr: 'Lydien augmenté', it: 'Lidio aumentato', pt: 'Lídio aumentado' },
  'Altered (Super Locrian)': { es: 'Alterada (Superlocrio)', fr: 'Altérée (Super locrien)', it: 'Alterata (Superlocrio)', pt: 'Alterada (Superlócrio)' },
  'Hungarian Minor': { es: 'Menor húngara', fr: 'Mineur hongrois', it: 'Minore ungherese', pt: 'Menor húngara' },
  'Whole Tone': { es: 'Tonos enteros', fr: 'Par tons', it: 'Toni interi', pt: 'Tons inteiros' },
  'Diminished (HW)': { es: 'Disminuida (S-T)', fr: 'Diminuée (½-1)', it: 'Diminuita (S-T)', pt: 'Diminuta (S-T)' },
  'Diminished (WH)': { es: 'Disminuida (T-S)', fr: 'Diminuée (1-½)', it: 'Diminuita (T-S)', pt: 'Diminuta (T-S)' },
  'Hirajoshi': {},
  'In Sen': {},
  'Iwato': {},

  // ═══ Chord display names ═══
  'Minor': { es: 'Menor', fr: 'Mineur', it: 'Minore', pt: 'Menor' },
  'Diminished': { es: 'Disminuido', fr: 'Diminué', it: 'Diminuito', pt: 'Diminuto' },
  'Augmented': { es: 'Aumentado', fr: 'Augmenté', it: 'Aumentato', pt: 'Aumentado' },
  'Power Chord': { es: 'Quinta (power)', fr: 'Power chord', it: 'Power chord', pt: 'Power chord' },
  'Major 7th': { es: 'Séptima mayor', fr: '7e majeure', it: 'Settima maggiore', pt: 'Sétima maior' },
  'Minor 7th': { es: 'Séptima menor', fr: '7e mineure', it: 'Settima minore', pt: 'Sétima menor' },
  'Dominant 7th': { es: 'Séptima dominante', fr: '7e de dominante', it: 'Settima di dominante', pt: 'Sétima dominante' },
  'Diminished 7th': { es: 'Séptima disminuida', fr: '7e diminuée', it: 'Settima diminuita', pt: 'Sétima diminuta' },
  'Half-Dim 7th': { es: 'Semidisminuido', fr: '7e demi-diminuée', it: 'Semidiminuito', pt: 'Meio-diminuto' },
  'Minor-Major 7th': { es: 'Menor con 7ª mayor', fr: 'Mineur 7e majeure', it: 'Minore settima maggiore', pt: 'Menor com 7ª maior' },
  'Augmented 7th': { es: 'Séptima aumentada', fr: '7e augmentée', it: 'Settima aumentata', pt: 'Sétima aumentada' },
  'Aug Major 7th': { es: 'Aumentado con 7ª mayor', fr: 'Augmenté 7e majeure', it: 'Aumentato settima maggiore', pt: 'Aumentado com 7ª maior' },
  'Add 9': {},
  'Major 9th': { es: 'Novena mayor', fr: '9e majeure', it: 'Nona maggiore', pt: 'Nona maior' },
  'Minor 9th': { es: 'Novena menor', fr: '9e mineure', it: 'Nona minore', pt: 'Nona menor' },
  'Dominant 9th': { es: 'Novena dominante', fr: '9e de dominante', it: 'Nona di dominante', pt: 'Nona dominante' },
  'Dominant 11th': { es: 'Oncena dominante', fr: '11e de dominante', it: 'Undicesima di dominante', pt: 'Décima primeira dominante' },
  'Major 13th': { es: 'Trecena mayor', fr: '13e majeure', it: 'Tredicesima maggiore', pt: 'Décima terceira maior' },
  'Minor 11th': { es: 'Oncena menor', fr: '11e mineure', it: 'Undicesima minore', pt: 'Décima primeira menor' },
  'Dominant 13th': { es: 'Trecena dominante', fr: '13e de dominante', it: 'Tredicesima di dominante', pt: 'Décima terceira dominante' },
  'Major 6th': { es: 'Sexta mayor', fr: '6te majeure', it: 'Sesta maggiore', pt: 'Sexta maior' },
  'Minor 6th': { es: 'Sexta menor', fr: '6te mineure', it: 'Sesta minore', pt: 'Sexta menor' },

  // ═══ Chord tier row ═══
  'Triad': { es: 'Tríada', fr: 'Triade', it: 'Triade', pt: 'Tríade' },
  'Sus': {},
  '7th': { es: '7ª', fr: '7e', it: '7ª', pt: '7ª' },
  '6th': { es: '6ª', fr: '6te', it: '6ª', pt: '6ª' },
  '9th': { es: '9ª', fr: '9e', it: '9ª', pt: '9ª' },
  '11/13': {},

  // ═══ Mic errors (micInput.ts keys) ═══
  'This browser can’t access the microphone. Try a recent Chrome, Firefox, or Safari.': {
    es: 'Este navegador no puede acceder al micrófono. Prueba un Chrome, Firefox o Safari reciente.',
    fr: 'Ce navigateur ne peut pas accéder au micro. Essaie un Chrome, Firefox ou Safari récent.',
    it: 'Questo browser non può accedere al microfono. Prova un Chrome, Firefox o Safari recente.',
    pt: 'Este navegador não consegue acessar o microfone. Tente um Chrome, Firefox ou Safari recente.',
  },
  'Mic access is blocked. Allow it for this site in your browser settings, then try again.': {
    es: 'El acceso al micrófono está bloqueado. Permítelo para este sitio en los ajustes del navegador y vuelve a intentarlo.',
    fr: 'L’accès au micro est bloqué. Autorise-le pour ce site dans les réglages du navigateur, puis réessaie.',
    it: 'L’accesso al microfono è bloccato. Consentilo per questo sito nelle impostazioni del browser e riprova.',
    pt: 'O acesso ao microfone está bloqueado. Permita para este site nas configurações do navegador e tente de novo.',
  },
  'No microphone found. Plug in an interface or mic and try again.': {
    es: 'No se encontró micrófono. Conecta una interfaz o un micro y vuelve a intentarlo.',
    fr: 'Aucun micro trouvé. Branche une interface ou un micro et réessaie.',
    it: 'Nessun microfono trovato. Collega un’interfaccia o un microfono e riprova.',
    pt: 'Nenhum microfone encontrado. Conecte uma interface ou microfone e tente de novo.',
  },
  'Another app has the microphone locked — close it and try again.': {
    es: 'Otra aplicación tiene el micrófono ocupado: ciérrala y vuelve a intentarlo.',
    fr: 'Une autre appli monopolise le micro — ferme-la et réessaie.',
    it: 'Un’altra app tiene occupato il microfono: chiudila e riprova.',
    pt: 'Outro aplicativo está com o microfone ocupado — feche-o e tente de novo.',
  },
  'Could not start the microphone.': {
    es: 'No se pudo iniciar el micrófono.',
    fr: 'Impossible de démarrer le micro.',
    it: 'Impossibile avviare il microfono.',
    pt: 'Não foi possível iniciar o microfone.',
  },

  // ═══ Short mode names (sibling chips, walk rungs, coaching lines) ═══
  'Ionian': { es: 'Jónico', fr: 'Ionien', it: 'Ionico', pt: 'Jônico' },
  'Aeolian': { es: 'Eólico', fr: 'Éolien', it: 'Eolio', pt: 'Eólio' },

  // ═══ The welcome (opens from "What is this?") ═══
  'It': { es: 'Te', fr: 'Il', it: 'Ti', pt: 'Ele' },
  'listens while you play,': {
    es: 'escucha mientras tocas,', fr: 't’écoute pendant que tu joues,',
    it: 'ascolta mentre suoni,', pt: 'escuta enquanto você toca,',
  },
  'and answers on the neck.': {
    es: 'y te responde en el mástil.', fr: 'et répond sur le manche.',
    it: 'e risponde sul manico.', pt: 'e responde no braço.',
  },
  'In 1959, Miles Davis walked into a studio bored of chasing chord changes and cut an album built on almost none.': {
    es: 'En 1959, Miles Davis entró a un estudio aburrido de perseguir cambios de acordes y grabó un disco construido casi sin ninguno.',
    fr: 'En 1959, Miles Davis est entré en studio, lassé de courir après les changements d’accords, et a gravé un album qui n’en contient presque aucun.',
    it: 'Nel 1959, Miles Davis entrò in studio stanco di inseguire i cambi di accordi e incise un album costruito quasi senza.',
    pt: 'Em 1959, Miles Davis entrou num estúdio entediado de perseguir mudanças de acordes e gravou um álbum construído quase sem nenhuma.',
  },
  '— still the best-selling jazz record ever made — runs on scales instead of progressions. He called it modal jazz: hold one note underneath (a drone), improvise inside a single scale (a mode), and let the mode do the emotional work a wall of chords usually does.': {
    es: '— todavía el disco de jazz más vendido de la historia — funciona con escalas en vez de progresiones. Lo llamó jazz modal: sostén una nota debajo (un bordón), improvisa dentro de una sola escala (un modo), y deja que el modo haga el trabajo emocional que normalmente hace una muralla de acordes.',
    fr: '— toujours le disque de jazz le plus vendu de l’histoire — repose sur des gammes plutôt que des progressions. Il a appelé ça le jazz modal : tiens une note en dessous (un bourdon), improvise dans une seule gamme (un mode), et laisse le mode faire le travail émotionnel qu’un mur d’accords fait d’habitude.',
    it: '— ancora oggi il disco jazz più venduto di sempre — gira su scale invece che su progressioni. Lo chiamò jazz modale: tieni una nota sotto (un bordone), improvvisa dentro una sola scala (un modo), e lascia che il modo faccia il lavoro emotivo che di solito fa un muro di accordi.',
    pt: '— ainda o disco de jazz mais vendido de todos os tempos — roda em escalas em vez de progressões. Ele chamou de jazz modal: segure uma nota embaixo (um bordão), improvise dentro de uma única escala (um modo), e deixe o modo fazer o trabalho emocional que uma muralha de acordes costuma fazer.',
  },
  'That’s this app, on a fretboard. Hold a drone in any key and the neck fills with the notes that work over it. Play, and Modal Runs hears you through the mic — it lights up what you just played and tells you the moment you land the note it’s hunting for. Move the tonic and the same seven notes turn from A Aeolian into D Dorian — same frets, same notes, just a different one as home. Seven different moods out of one shape. You find them by ear, the way Miles did — not off a chart.': {
    es: 'Eso es esta app, en un diapasón. Sostén un bordón en cualquier tonalidad y el mástil se llena con las notas que funcionan sobre él. Toca, y Modal Runs te oye por el micro: ilumina lo que acabas de tocar y te avisa en el momento en que aterrizas en la nota que está cazando. Mueve la tónica y las mismas siete notas pasan de La eólico a Re dórico — mismos trastes, mismas notas, solo otra como casa. Siete estados de ánimo distintos de una sola figura. Los encuentras de oído, como lo hizo Miles — no en una tabla.',
    fr: 'C’est cette appli, sur un manche. Tiens un bourdon dans n’importe quelle tonalité et le manche se remplit des notes qui fonctionnent dessus. Joue, et Modal Runs t’entend par le micro — elle allume ce que tu viens de jouer et te dit à l’instant où tu poses la note qu’elle chasse. Déplace la tonique et les sept mêmes notes passent de La éolien à Ré dorien — mêmes frettes, mêmes notes, juste une autre comme maison. Sept humeurs différentes dans une seule figure. Tu les trouves à l’oreille, comme Miles — pas sur un tableau.',
    it: 'Ecco questa app, su una tastiera. Tieni un bordone in qualsiasi tonalità e il manico si riempie delle note che ci funzionano sopra. Suona, e Modal Runs ti sente dal microfono: accende quello che hai appena suonato e ti avvisa nell’istante in cui atterri sulla nota che sta cacciando. Sposta la tonica e le stesse sette note passano da La eolio a Re dorico — stessi tasti, stesse note, solo un’altra come casa. Sette umori diversi da una sola figura. Li trovi a orecchio, come faceva Miles — non su una tabella.',
    pt: 'Isso é este app, num braço de guitarra. Segure um bordão em qualquer tonalidade e o braço se enche das notas que funcionam sobre ele. Toque, e o Modal Runs ouve você pelo microfone — ele acende o que você acabou de tocar e avisa no momento em que você pousa na nota que ele está caçando. Mova a tônica e as mesmas sete notas viram de Lá eólio para Ré dórico — mesmos trastes, mesmas notas, só outra como casa. Sete humores diferentes de uma só forma. Você os encontra de ouvido, como Miles fazia — não numa tabela.',
  },
  'Set the key': { es: 'Elige la tonalidad', fr: 'Choisis la tonalité', it: 'Scegli la tonalità', pt: 'Escolha a tonalidade' },
  'The neck fills with the notes that belong to it. Each one is coloured by its interval rather than its name, so you read what a note does against the tonic, not merely what it’s called. The root is amber.': {
    es: 'El mástil se llena con las notas que le pertenecen. Cada una está coloreada por su intervalo y no por su nombre, así que lees lo que una nota hace contra la tónica, no solo cómo se llama. La fundamental es ámbar.',
    fr: 'Le manche se remplit des notes qui lui appartiennent. Chacune est colorée par son intervalle plutôt que par son nom : tu lis ce qu’une note fait contre la tonique, pas seulement comment elle s’appelle. La fondamentale est ambre.',
    it: 'Il manico si riempie delle note che le appartengono. Ognuna è colorata dal suo intervallo e non dal suo nome, così leggi cosa fa una nota contro la tonica, non solo come si chiama. La fondamentale è ambra.',
    pt: 'O braço se enche das notas que pertencem a ela. Cada uma é colorida pelo seu intervalo e não pelo nome, então você lê o que uma nota faz contra a tônica, não apenas como ela se chama. A fundamental é âmbar.',
  },
  'Start the drone': { es: 'Enciende el bordón', fr: 'Lance le bourdon', it: 'Avvia il bordone', pt: 'Ligue o bordão' },
  'It sustains the tonic underneath you, so every note you play finally has something to lean against. The b6 aches against it; the natural 6 opens up. Intervals stop being arithmetic and start being sounds.': {
    es: 'Sostiene la tónica debajo de ti, así que cada nota que tocas por fin tiene algo en qué apoyarse. El b6 duele contra él; el 6 natural se abre. Los intervalos dejan de ser aritmética y empiezan a ser sonidos.',
    fr: 'Il tient la tonique sous toi : chaque note que tu joues a enfin quelque chose contre quoi s’appuyer. Le b6 se serre contre lui ; le 6 naturel s’ouvre. Les intervalles cessent d’être de l’arithmétique et deviennent des sons.',
    it: 'Tiene la tonica sotto di te, così ogni nota che suoni ha finalmente qualcosa su cui appoggiarsi. Il b6 duole contro di lui; il 6 naturale si apre. Gli intervalli smettono di essere aritmetica e iniziano a essere suoni.',
    pt: 'Ele sustenta a tônica embaixo de você, então cada nota que você toca finalmente tem algo em que se apoiar. O b6 dói contra ele; o 6 natural se abre. Os intervalos deixam de ser aritmética e viram sons.',
  },
  'Move the tonic': { es: 'Mueve la tónica', fr: 'Déplace la tonique', it: 'Sposta la tonica', pt: 'Mova a tônica' },
  'Tap Dorian in the same-notes strip. Same frets, same notes — the drone simply moves home to D, and the app names the one note that separates it from where you just were.': {
    es: 'Toca Dórico en la tira de mismas-notas. Mismos trastes, mismas notas: el bordón simplemente mueve casa a Re, y la app nombra la única nota que lo separa de donde estabas.',
    fr: 'Touche Dorien dans la bande des mêmes-notes. Mêmes frettes, mêmes notes — le bourdon déménage simplement vers Ré, et l’appli nomme la seule note qui le sépare de là où tu étais.',
    it: 'Tocca Dorico nella striscia delle stesse-note. Stessi tasti, stesse note: il bordone sposta semplicemente casa su Re, e l’app nomina l’unica nota che lo separa da dove eri.',
    pt: 'Toque em Dórico na faixa de mesmas-notas. Mesmos trastes, mesmas notas — o bordão simplesmente muda a casa para Ré, e o app nomeia a única nota que o separa de onde você estava.',
  },
  'Any key, any mode. Chords laid over scales, arpeggios, positions, the whole fretboard at once — and the theory that accounts for what you’re looking at, written for someone who wants to understand it rather than recite it.': {
    es: 'Cualquier tonalidad, cualquier modo. Acordes sobre escalas, arpegios, posiciones, todo el diapasón a la vez — y la teoría que explica lo que estás viendo, escrita para quien quiere entenderla y no recitarla.',
    fr: 'N’importe quelle tonalité, n’importe quel mode. Accords posés sur les gammes, arpèges, positions, tout le manche d’un coup — et la théorie qui explique ce que tu regardes, écrite pour qui veut la comprendre plutôt que la réciter.',
    it: 'Qualsiasi tonalità, qualsiasi modo. Accordi sopra le scale, arpeggi, posizioni, tutta la tastiera in una volta — e la teoria che spiega quello che stai guardando, scritta per chi vuole capirla e non recitarla.',
    pt: 'Qualquer tonalidade, qualquer modo. Acordes sobre escalas, arpejos, posições, o braço inteiro de uma vez — e a teoria que explica o que você está vendo, escrita para quem quer entender e não recitar.',
  },
  'Just play': { es: 'Solo toca', fr: 'Joue, c’est tout', it: 'Suona e basta', pt: 'Apenas toque' },
  'One idea, chosen for you, with the shape already sitting on the neck. Start the drone and play over it; if you let it listen through your mic, it will tell you when you land the note it asked for.': {
    es: 'Una idea, elegida por ti, con la figura ya puesta en el mástil. Enciende el bordón y toca encima; si dejas que escuche por tu micro, te dirá cuándo aterrizas en la nota que pidió.',
    fr: 'Une idée, choisie pour toi, avec la figure déjà posée sur le manche. Lance le bourdon et joue par-dessus ; si tu la laisses écouter par ton micro, elle te dira quand tu poses la note demandée.',
    it: 'Un’idea, scelta per te, con la figura già sul manico. Avvia il bordone e suonaci sopra; se la lasci ascoltare dal microfono, ti dirà quando atterri sulla nota richiesta.',
    pt: 'Uma ideia, escolhida para você, com a forma já no braço. Ligue o bordão e toque por cima; se deixar ele escutar pelo microfone, ele avisa quando você pousar na nota pedida.',
  },
  'Close': { es: 'Cerrar', fr: 'Fermer', it: 'Chiudi', pt: 'Fechar' },

  // ═══ Explore — concept hooks & listenFor ═══
  'Seven positions. Seven modes. The same seven notes.': {
    es: 'Siete posiciones. Siete modos. Las mismas siete notas.',
    fr: 'Sept positions. Sept modes. Les sept mêmes notes.',
    it: 'Sette posizioni. Sette modi. Le stesse sette note.',
    pt: 'Sete posições. Sete modos. As mesmas sete notas.',
  },
  'A minor and C major are the same scale. Every position on the neck starts on a different note of it — and that starting note is what decides the mode. Move up the neck; the drone moves home with you. Your hands never change. The sound completely does.': {
    es: 'La menor y Do mayor son la misma escala. Cada posición del mástil empieza en una nota distinta de ella — y esa nota inicial es la que decide el modo. Sube por el mástil; el bordón mueve casa contigo. Tus manos nunca cambian. El sonido cambia por completo.',
    fr: 'La mineur et Do majeur sont la même gamme. Chaque position du manche commence sur une note différente — et cette note de départ décide du mode. Monte sur le manche ; le bourdon déménage avec toi. Tes mains ne changent jamais. Le son, complètement.',
    it: 'La minore e Do maggiore sono la stessa scala. Ogni posizione sul manico inizia su una nota diversa — ed è quella nota iniziale a decidere il modo. Sali sul manico; il bordone sposta casa con te. Le tue mani non cambiano mai. Il suono cambia del tutto.',
    pt: 'Lá menor e Dó maior são a mesma escala. Cada posição no braço começa numa nota diferente dela — e essa nota inicial é o que decide o modo. Suba pelo braço; o bordão muda de casa com você. Suas mãos nunca mudam. O som muda completamente.',
  },
  'Minor — but the 6th is raised.': {
    es: 'Menor — pero con la 6ª elevada.', fr: 'Mineur — mais la 6te est haussée.',
    it: 'Minore — ma con la 6ª alzata.', pt: 'Menor — mas com a 6ª elevada.',
  },
  'Find the 6 and sit on it against the drone. That single note is the entire mode: still minor, but hopeful instead of grieving. Aeolian flattens it and the light goes out.': {
    es: 'Encuentra el 6 y siéntate en él contra el bordón. Esa única nota es el modo entero: sigue siendo menor, pero esperanzado en vez de afligido. El eólico la baja y la luz se apaga.',
    fr: 'Trouve le 6 et installe-toi dessus contre le bourdon. Cette seule note est tout le mode : toujours mineur, mais plein d’espoir plutôt qu’endeuillé. L’éolien l’abaisse et la lumière s’éteint.',
    it: 'Trova il 6 e siediti sopra contro il bordone. Quella singola nota è l’intero modo: ancora minore, ma pieno di speranza invece che in lutto. L’eolio la abbassa e la luce si spegne.',
    pt: 'Encontre o 6 e sente nele contra o bordão. Essa única nota é o modo inteiro: ainda menor, mas esperançoso em vez de enlutado. O eólio a abaixa e a luz se apaga.',
  },
  'The natural minor. The sad one.': {
    es: 'El menor natural. El triste.', fr: 'Le mineur naturel. Le triste.',
    it: 'Il minore naturale. Quello triste.', pt: 'O menor natural. O triste.',
  },
  'Go straight to the b6. That half-step drop is the whole difference from Dorian — same key, same drone, one note darker. Play the b6, then bend your ear back to Dorian and feel it lift.': {
    es: 'Ve directo al b6. Esa caída de medio tono es toda la diferencia con el dórico: misma tonalidad, mismo bordón, una nota más oscura. Toca el b6, luego devuelve el oído al dórico y siente cómo se eleva.',
    fr: 'Va droit au b6. Cette chute d’un demi-ton est toute la différence avec le dorien — même tonalité, même bourdon, une note plus sombre. Joue le b6, puis ramène ton oreille au dorien et sens la montée.',
    it: 'Vai dritto al b6. Quel calo di mezzo tono è tutta la differenza dal dorico: stessa tonalità, stesso bordone, una nota più scura. Suona il b6, poi riporta l’orecchio al dorico e senti come si solleva.',
    pt: 'Vá direto ao b6. Essa queda de meio tom é toda a diferença do dórico — mesma tonalidade, mesmo bordão, uma nota mais escura. Toque o b6, depois volte o ouvido ao dórico e sinta a elevação.',
  },
  'Major, with a raised 4th.': {
    es: 'Mayor, con la 4ª aumentada.', fr: 'Majeur, avec la 4te haussée.',
    it: 'Maggiore, con la 4ª aumentata.', pt: 'Maior, com a 4ª aumentada.',
  },
  'Hang on the b5 (the #4). It hovers — it wants to resolve and never has to. This is the film-score note, the wide-eyed one. Major already sounds happy; Lydian sounds like wonder.': {
    es: 'Quédate en el b5 (el #4). Flota: quiere resolver y nunca tiene que hacerlo. Esta es la nota de banda sonora, la de ojos abiertos. Mayor ya suena alegre; lidio suena a asombro.',
    fr: 'Reste sur le b5 (le #4). Il plane — il veut se résoudre et n’y est jamais obligé. C’est la note de musique de film, celle des yeux écarquillés. Le majeur sonne déjà joyeux ; le lydien sonne comme l’émerveillement.',
    it: 'Resta sul b5 (il #4). Aleggia: vuole risolvere e non deve mai farlo. È la nota da colonna sonora, quella a occhi spalancati. Il maggiore suona già felice; il lidio suona come meraviglia.',
    pt: 'Fique no b5 (o #4). Ele paira — quer resolver e nunca precisa. Esta é a nota de trilha sonora, a de olhos arregalados. Maior já soa feliz; lídio soa como deslumbre.',
  },
  'Major with the 7th flattened.': {
    es: 'Mayor con la 7ª bajada.', fr: 'Majeur avec la 7e abaissée.',
    it: 'Maggiore con la 7ª abbassata.', pt: 'Maior com a 7ª abaixada.',
  },
  'Hit the 7, then the b7. The b7 takes the leash off — it stops being polite and starts being rock. Same brightness as major, none of the manners.': {
    es: 'Toca el 7, luego el b7. El b7 quita la correa: deja de ser educado y empieza a ser rock. El mismo brillo que mayor, sin nada de los modales.',
    fr: 'Joue le 7, puis le b7. Le b7 enlève la laisse — il cesse d’être poli et devient rock. La même brillance que le majeur, sans les bonnes manières.',
    it: 'Colpisci il 7, poi il b7. Il b7 toglie il guinzaglio: smette di essere educato e inizia a essere rock. La stessa brillantezza del maggiore, senza le buone maniere.',
    pt: 'Toque o 7, depois o b7. O b7 tira a coleira — para de ser educado e vira rock. O mesmo brilho do maior, sem os bons modos.',
  },
  'Minor with a flattened 2nd.': {
    es: 'Menor con la 2ª bajada.', fr: 'Mineur avec la 2de abaissée.',
    it: 'Minore con la 2ª abbassata.', pt: 'Menor com a 2ª abaixada.',
  },
  'Root, then b2, then back. That half-step above the root is menace — Spanish, or metal, depending on how hard you hit it. Nothing else on the neck sounds like that interval.': {
    es: 'Fundamental, luego b2, luego de vuelta. Ese medio tono sobre la fundamental es amenaza — español, o metal, según lo fuerte que lo toques. Nada más en el mástil suena como ese intervalo.',
    fr: 'Fondamentale, puis b2, puis retour. Ce demi-ton au-dessus de la fondamentale est une menace — espagnol ou metal, selon la force de l’attaque. Rien d’autre sur le manche ne sonne comme cet intervalle.',
    it: 'Fondamentale, poi b2, poi indietro. Quel mezzo tono sopra la fondamentale è minaccia — spagnolo, o metal, a seconda di quanto forte lo colpisci. Nient’altro sul manico suona come quell’intervallo.',
    pt: 'Fundamental, depois b2, depois de volta. Esse meio tom acima da fundamental é ameaça — espanhol, ou metal, dependendo da força. Nada mais no braço soa como esse intervalo.',
  },
  'Flat 2 AND flat 5. Home is unstable.': {
    es: '2 bemol Y 5 bemol. Casa es inestable.', fr: '2 bémol ET 5 bémol. La maison est instable.',
    it: '2 bemolle E 5 bemolle. Casa è instabile.', pt: '2 bemol E 5 bemol. A casa é instável.',
  },
  'The b5 is why this mode can never rest — the root chord itself is diminished. Play it and notice you keep wanting to leave. That restlessness IS the sound. Use it as a passing colour, not a home.': {
    es: 'El b5 es la razón de que este modo nunca pueda descansar: el propio acorde de la fundamental es disminuido. Tócalo y nota que no dejas de querer irte. Esa inquietud ES el sonido. Úsalo como color de paso, no como casa.',
    fr: 'Le b5 est la raison pour laquelle ce mode ne peut jamais se reposer — l’accord de la fondamentale est lui-même diminué. Joue-le et remarque que tu veux sans cesse partir. Cette agitation EST le son. Utilise-le comme couleur de passage, pas comme maison.',
    it: 'Il b5 è il motivo per cui questo modo non può mai riposare: l’accordo della fondamentale è esso stesso diminuito. Suonalo e nota che continui a voler andartene. Quell’irrequietezza È il suono. Usalo come colore di passaggio, non come casa.',
    pt: 'O b5 é por que este modo nunca pode descansar — o próprio acorde da fundamental é diminuto. Toque e note que você fica querendo ir embora. Essa inquietação É o som. Use como cor de passagem, não como casa.',
  },
  'The jam-session mode.': {
    es: 'El modo perfecto para improvisar.', fr: 'Le mode idéal pour improviser.',
    it: 'La modalità perfetta per improvvisare.', pt: 'O modo perfeito para improvisar.',
  },
  'Same raised 6 as A Dorian, new home. Prove the concept is portable: the shape moved, the colour is identical. If you can hear the 6 here without hunting, you own it.': {
    es: 'El mismo 6 elevado que La dórico, nueva casa. Demuestra que el concepto es portátil: la figura se movió, el color es idéntico. Si puedes oír el 6 aquí sin cazarlo, es tuyo.',
    fr: 'Le même 6 haussé que La dorien, nouvelle maison. Prouve que le concept est portable : la figure a bougé, la couleur est identique. Si tu entends le 6 ici sans le chasser, il est à toi.',
    it: 'Lo stesso 6 alzato di La dorico, nuova casa. Dimostra che il concetto è portatile: la figura si è spostata, il colore è identico. Se riesci a sentire il 6 qui senza cacciarlo, è tuo.',
    pt: 'O mesmo 6 elevado do Lá dórico, nova casa. Prove que o conceito é portátil: a forma se moveu, a cor é idêntica. Se você ouve o 6 aqui sem caçar, ele é seu.',
  },
  'Wonder, transposed.': {
    es: 'El asombro, transportado.', fr: 'L’émerveillement, transposé.',
    it: 'La meraviglia, trasposta.', pt: 'O deslumbre, transposto.',
  },
  'Chase the #4 (the b5) again in a new key. The interval is the idea — not the fingering. Land on it, let the drone hold, and stop resolving it.': {
    es: 'Persigue el #4 (el b5) otra vez en una nueva tonalidad. El intervalo es la idea — no la digitación. Aterriza en él, deja que el bordón sostenga, y deja de resolverlo.',
    fr: 'Poursuis le #4 (le b5) encore, dans une nouvelle tonalité. L’intervalle est l’idée — pas le doigté. Pose-toi dessus, laisse le bourdon tenir, et arrête de le résoudre.',
    it: 'Insegui il #4 (il b5) di nuovo in una nuova tonalità. L’intervallo è l’idea — non la diteggiatura. Atterraci, lascia che il bordone tenga, e smetti di risolverlo.',
    pt: 'Persiga o #4 (o b5) de novo numa nova tonalidade. O intervalo é a ideia — não o dedilhado. Pouse nele, deixe o bordão segurar, e pare de resolvê-lo.',
  },
  'The b7, one more time.': {
    es: 'El b7, una vez más.', fr: 'Le b7, encore une fois.',
    it: 'Il b7, ancora una volta.', pt: 'O b7, mais uma vez.',
  },
  'Bounce between the 3 and the b7 — a major third and a flat seventh in the same breath. That pair is the dominant sound; it is the whole reason blues and rock exist.': {
    es: 'Rebota entre el 3 y el b7: una tercera mayor y una séptima bemol en el mismo aliento. Ese par es el sonido dominante; es toda la razón de que existan el blues y el rock.',
    fr: 'Rebondis entre le 3 et le b7 — une tierce majeure et une septième bémol dans le même souffle. Cette paire est le son dominant ; c’est toute la raison d’être du blues et du rock.',
    it: 'Rimbalza tra il 3 e il b7: una terza maggiore e una settima bemolle nello stesso respiro. Quella coppia è il suono di dominante; è l’intera ragione per cui esistono blues e rock.',
    pt: 'Alterne entre o 3 e o b7 — uma terça maior e uma sétima bemol no mesmo fôlego. Esse par é o som dominante; é toda a razão de blues e rock existirem.',
  },
  'Aeolian with the 7th raised back up.': {
    es: 'Eólico con la 7ª subida de vuelta.', fr: 'Éolien avec la 7e remontée.',
    it: 'Eolio con la 7ª rialzata.', pt: 'Eólio com a 7ª elevada de volta.',
  },
  'Play the b6 straight into the 7. That leap is a step and a half — the widest thing in the scale, and the reason this mode sounds like a knife. Everything else is just natural minor.': {
    es: 'Toca el b6 directo al 7. Ese salto es un tono y medio: lo más ancho de la escala, y la razón de que este modo suene a cuchillo. Todo lo demás es simplemente menor natural.',
    fr: 'Joue le b6 droit dans le 7. Ce saut fait un ton et demi — le plus grand écart de la gamme, et la raison pour laquelle ce mode sonne comme un couteau. Tout le reste n’est que du mineur naturel.',
    it: 'Suona il b6 dritto nel 7. Quel salto è un tono e mezzo: la cosa più ampia della scala, e il motivo per cui questo modo suona come un coltello. Tutto il resto è solo minore naturale.',
    pt: 'Toque o b6 direto no 7. Esse salto é um tom e meio — a coisa mais larga da escala, e a razão deste modo soar como uma faca. Todo o resto é só menor natural.',
  },
  'Minor on the bottom, major on top.': {
    es: 'Menor abajo, mayor arriba.', fr: 'Mineur en bas, majeur en haut.',
    it: 'Minore sotto, maggiore sopra.', pt: 'Menor embaixo, maior em cima.',
  },
  'The 6 AND the 7 are both raised. Run up from the root and it turns bright halfway through — minor third, but a major climb home. Ambiguous and expensive-sounding.': {
    es: 'El 6 Y el 7 están ambos subidos. Sube desde la fundamental y se vuelve brillante a mitad de camino: tercera menor, pero una subida mayor a casa. Ambiguo y con sonido caro.',
    fr: 'Le 6 ET le 7 sont tous deux relevés. Monte depuis la fondamentale et ça s’éclaircit à mi-chemin — tierce mineure, mais une montée majeure vers la maison. Ambigu et au son luxueux.',
    it: 'Il 6 E il 7 sono entrambi alzati. Sali dalla fondamentale e diventa luminoso a metà strada: terza minore, ma una salita maggiore verso casa. Ambiguo e dal suono costoso.',
    pt: 'O 6 E o 7 estão ambos elevados. Suba da fundamental e clareia no meio do caminho — terça menor, mas uma subida maior para casa. Ambíguo e com som caro.',
  },
  'Five notes. No wrong ones.': {
    es: 'Cinco notas. Ninguna equivocada.', fr: 'Cinq notes. Aucune fausse.',
    it: 'Cinque note. Nessuna sbagliata.', pt: 'Cinco notas. Nenhuma errada.',
  },
  'Nothing to decode here — that\'s the point. The tension is gone, so the only thing left is phrasing. Play fewer notes than you want to. Let the drone hold and leave space.': {
    es: 'Nada que descifrar aquí — ese es el punto. La tensión se fue, así que lo único que queda es el fraseo. Toca menos notas de las que quieres. Deja que el bordón sostenga y deja espacio.',
    fr: 'Rien à décoder ici — c’est le but. La tension est partie, il ne reste que le phrasé. Joue moins de notes que tu n’en as envie. Laisse le bourdon tenir et laisse de l’espace.',
    it: 'Niente da decifrare qui — è questo il punto. La tensione è sparita, quindi resta solo il fraseggio. Suona meno note di quante ne vorresti. Lascia che il bordone tenga e lascia spazio.',
    pt: 'Nada para decifrar aqui — esse é o ponto. A tensão se foi, então só resta o fraseado. Toque menos notas do que você quer. Deixe o bordão segurar e deixe espaço.',
  },
  'Pentatonic, plus the one dirty note.': {
    es: 'Pentatónica, más la única nota sucia.', fr: 'Pentatonique, plus la seule note sale.',
    it: 'Pentatonica, più l’unica nota sporca.', pt: 'Pentatônica, mais a única nota suja.',
  },
  'The b5. Don\'t land on it — pass THROUGH it. It only works in motion; sit on it and it sounds wrong, slide off it and it sounds like the blues.': {
    es: 'El b5. No aterrices en él: pásalo DE LARGO. Solo funciona en movimiento; siéntate en él y suena mal, resbala fuera y suena a blues.',
    fr: 'Le b5. Ne t’y pose pas — TRAVERSE-le. Il ne marche qu’en mouvement ; reste dessus et ça sonne faux, glisse et ça sonne comme le blues.',
    it: 'Il b5. Non atterrarci: ATTRAVERSALO. Funziona solo in movimento; fermati sopra e suona sbagliato, scivola via e suona come il blues.',
    pt: 'O b5. Não pouse nele — passe ATRAVÉS dele. Só funciona em movimento; fique nele e soa errado, deslize para fora e soa como blues.',
  },
  'The sweet one.': { es: 'La dulce.', fr: 'La douce.', it: 'La dolce.', pt: 'A doce.' },
  'Same five shapes as minor pentatonic, different home. This is the Mayer sound — open, vocal, uncluttered. Bend into the 2 and the 6 and let them ring.': {
    es: 'Las mismas cinco figuras que la pentatónica menor, distinta casa. Este es el sonido Mayer: abierto, vocal, despejado. Haz bend hacia el 2 y el 6 y déjalos sonar.',
    fr: 'Les cinq mêmes figures que la pentatonique mineure, autre maison. C’est le son Mayer — ouvert, vocal, épuré. Tire vers le 2 et le 6 et laisse-les sonner.',
    it: 'Le stesse cinque figure della pentatonica minore, casa diversa. Questo è il suono alla Mayer: aperto, vocale, pulito. Fai bending verso il 2 e il 6 e lasciali suonare.',
    pt: 'As mesmas cinco formas da pentatônica menor, casa diferente. Este é o som do Mayer — aberto, vocal, limpo. Faça bend no 2 e no 6 e deixe soar.',
  },
  'The chord under the mode.': {
    es: 'El acorde bajo el modo.', fr: 'L’accord sous le mode.',
    it: 'L’accordo sotto il modo.', pt: 'O acorde sob o modo.',
  },
  'Sweep the i chord, then step outside it to the 6. Hear how the arpeggio is the skeleton and the 6 is the flesh. Chord tones land; the 6 floats.': {
    es: 'Barre el acorde i, luego sal de él hacia el 6. Escucha cómo el arpegio es el esqueleto y el 6 es la carne. Las notas del acorde aterrizan; el 6 flota.',
    fr: 'Balaye l’accord i, puis sors-en vers le 6. Écoute comme l’arpège est le squelette et le 6 la chair. Les notes d’accord se posent ; le 6 flotte.',
    it: 'Suona in sweep l’accordo i, poi esci verso il 6. Senti come l’arpeggio è lo scheletro e il 6 la carne. Le note dell’accordo atterrano; il 6 fluttua.',
    pt: 'Varra o acorde i, depois saia dele para o 6. Ouça como o arpejo é o esqueleto e o 6 é a carne. As notas do acorde pousam; o 6 flutua.',
  },
  'Land on the chord, float on the #4.': {
    es: 'Aterriza en el acorde, flota en el #4.', fr: 'Pose-toi sur l’accord, flotte sur le #4.',
    it: 'Atterra sull’accordo, fluttua sul #4.', pt: 'Pouse no acorde, flutue no #4.',
  },
  'Play the arpeggio to establish home, then reach for the #4 and hang there. The contrast between "safe" and "floating" is the whole exercise.': {
    es: 'Toca el arpegio para establecer casa, luego alcanza el #4 y quédate ahí. El contraste entre "seguro" y "flotante" es todo el ejercicio.',
    fr: 'Joue l’arpège pour établir la maison, puis attrape le #4 et restes-y. Le contraste entre « sûr » et « flottant » est tout l’exercice.',
    it: 'Suona l’arpeggio per stabilire casa, poi raggiungi il #4 e restaci. Il contrasto tra "sicuro" e "sospeso" è tutto l’esercizio.',
    pt: 'Toque o arpejo para estabelecer casa, depois alcance o #4 e fique lá. O contraste entre "seguro" e "flutuante" é o exercício inteiro.',
  },
  'One shape, the whole neck.': {
    es: 'Una figura, todo el mástil.', fr: 'Une figure, tout le manche.',
    it: 'Una figura, tutto il manico.', pt: 'Uma forma, o braço inteiro.',
  },
  'Stop thinking about position boxes. Run the pattern up and down and let the 6 fall where it falls — you\'re training the ear, not the hand. Speed is irrelevant here.': {
    es: 'Deja de pensar en cajas de posición. Corre el patrón arriba y abajo y deja que el 6 caiga donde caiga — estás entrenando el oído, no la mano. La velocidad es irrelevante aquí.',
    fr: 'Arrête de penser en boîtes de position. Parcours le motif de haut en bas et laisse le 6 tomber où il tombe — tu entraînes l’oreille, pas la main. La vitesse n’a aucune importance ici.',
    it: 'Smetti di pensare a scatole di posizione. Percorri il pattern su e giù e lascia che il 6 cada dove cade — stai allenando l’orecchio, non la mano. La velocità è irrilevante qui.',
    pt: 'Pare de pensar em caixas de posição. Percorra o padrão para cima e para baixo e deixe o 6 cair onde cair — você está treinando o ouvido, não a mão. Velocidade é irrelevante aqui.',
  },
  'The b7, everywhere at once.': {
    es: 'El b7, en todas partes a la vez.', fr: 'Le b7, partout à la fois.',
    it: 'Il b7, ovunque in una volta.', pt: 'O b7, em todo lugar de uma vez.',
  },
  'Same pattern logic, dominant colour. Find every b7 in the shape as you run it. When you can hear them coming before you play them, you\'ve got the mode.': {
    es: 'La misma lógica de patrón, color dominante. Encuentra cada b7 en la figura mientras la corres. Cuando puedas oírlos venir antes de tocarlos, tienes el modo.',
    fr: 'Même logique de motif, couleur dominante. Trouve chaque b7 dans la figure en la parcourant. Quand tu les entends arriver avant de les jouer, le mode est à toi.',
    it: 'Stessa logica di pattern, colore di dominante. Trova ogni b7 nella figura mentre la percorri. Quando riesci a sentirli arrivare prima di suonarli, il modo è tuo.',
    pt: 'Mesma lógica de padrão, cor dominante. Encontre cada b7 na forma enquanto a percorre. Quando conseguir ouvi-los chegando antes de tocar, o modo é seu.',
  },
  'The note that makes a chord sound expensive.': {
    es: 'La nota que hace que un acorde suene caro.', fr: 'La note qui donne à un accord un son luxueux.',
    it: 'La nota che fa suonare costoso un accordo.', pt: 'A nota que faz um acorde soar caro.',
  },
  'Against the drone, find the 2 — and now think of it as a 9. It\'s the same pitch; the name just tells you it\'s stacked on top. It floats above the chord instead of sitting in it.': {
    es: 'Contra el bordón, encuentra el 2 — y ahora piénsalo como un 9. Es la misma altura; el nombre solo te dice que está apilado encima. Flota sobre el acorde en vez de sentarse en él.',
    fr: 'Contre le bourdon, trouve le 2 — et pense-le maintenant comme un 9. C’est la même hauteur ; le nom te dit juste qu’il est empilé au-dessus. Il flotte au-dessus de l’accord au lieu de s’y asseoir.',
    it: 'Contro il bordone, trova il 2 — e ora pensalo come un 9. È la stessa altezza; il nome ti dice solo che è impilato sopra. Fluttua sopra l’accordo invece di sedercisi dentro.',
    pt: 'Contra o bordão, encontre o 2 — e agora pense nele como um 9. É a mesma altura; o nome só diz que está empilhado em cima. Ele flutua sobre o acorde em vez de sentar nele.',
  },
  'Learn the shape before you learn the speed.': {
    es: 'Aprende la figura antes que la velocidad.', fr: 'Apprends la figure avant la vitesse.',
    it: 'Impara la figura prima della velocità.', pt: 'Aprenda a forma antes da velocidade.',
  },
  'Every note in order, up the neck. Don\'t rush it — play it slower than feels necessary and let each note actually ring. The app will follow you.': {
    es: 'Cada nota en orden, subiendo el mástil. No te apures: tócalo más lento de lo que parece necesario y deja que cada nota realmente suene. La app te seguirá.',
    fr: 'Chaque note dans l’ordre, en montant le manche. Ne te presse pas — joue plus lentement que nécessaire et laisse chaque note vraiment sonner. L’appli te suivra.',
    it: 'Ogni nota in ordine, su per il manico. Non correre: suonalo più lento di quanto sembri necessario e lascia che ogni nota suoni davvero. L’app ti seguirà.',
    pt: 'Cada nota em ordem, subindo o braço. Não se apresse — toque mais devagar do que parece necessário e deixe cada nota realmente soar. O app vai te seguir.',
  },
  'One stroke down, one stroke back.': {
    es: 'Una pasada abajo, una de vuelta.', fr: 'Un coup vers le bas, un coup retour.',
    it: 'Una pennata giù, una di ritorno.', pt: 'Uma palhetada para baixo, uma de volta.',
  },
  'Let the pick fall through the strings — don\'t pick each note separately. Where two notes share a fret, roll the finger across instead of lifting it. That roll is the whole technique.': {
    es: 'Deja que la púa caiga a través de las cuerdas — no piques cada nota por separado. Donde dos notas comparten traste, rueda el dedo en vez de levantarlo. Ese rodado es toda la técnica.',
    fr: 'Laisse le médiator tomber à travers les cordes — ne pioche pas chaque note séparément. Là où deux notes partagent une frette, fais rouler le doigt au lieu de le lever. Ce roulé est toute la technique.',
    it: 'Lascia che il plettro cada attraverso le corde — non pizzicare ogni nota separatamente. Dove due note condividono un tasto, fai rotolare il dito invece di sollevarlo. Quel roll è tutta la tecnica.',
    pt: 'Deixe a palheta cair através das cordas — não palhete cada nota separadamente. Onde duas notas dividem um traste, role o dedo em vez de levantá-lo. Esse rolamento é a técnica inteira.',
  },
  'This is what turns an exercise into a phrase.': {
    es: 'Esto es lo que convierte un ejercicio en una frase.', fr: 'C’est ce qui transforme un exercice en phrase.',
    it: 'È questo che trasforma un esercizio in una frase.', pt: 'Isto é o que transforma um exercício em frase.',
  },
  'Groups of three, shifting up one note each time. Suddenly it stops sounding like practice and starts sounding like music. Same notes — different order.': {
    es: 'Grupos de tres, subiendo una nota cada vez. De repente deja de sonar a práctica y empieza a sonar a música. Las mismas notas — distinto orden.',
    fr: 'Groupes de trois, en montant d’une note à chaque fois. Soudain, ça cesse de sonner comme un exercice et ça commence à sonner comme de la musique. Mêmes notes — ordre différent.',
    it: 'Gruppi di tre, salendo di una nota ogni volta. All’improvviso smette di suonare come esercizio e inizia a suonare come musica. Stesse note — ordine diverso.',
    pt: 'Grupos de três, subindo uma nota de cada vez. De repente para de soar como treino e começa a soar como música. Mesmas notas — ordem diferente.',
  },
  'The bright one.': { es: 'El brillante.', fr: 'Le lumineux.', it: 'Quello luminoso.', pt: 'O brilhante.' },
  'Same idea, major flavour. Listen to how the 7 leans back into the root — that lean is what makes major sound settled.': {
    es: 'La misma idea, sabor mayor. Escucha cómo el 7 se apoya de vuelta en la fundamental — ese apoyo es lo que hace que mayor suene asentado.',
    fr: 'Même idée, saveur majeure. Écoute comme le 7 s’appuie vers la fondamentale — cet appui est ce qui fait sonner le majeur posé.',
    it: 'Stessa idea, sapore maggiore. Ascolta come il 7 si appoggia di nuovo alla fondamentale — quell’appoggio è ciò che fa suonare il maggiore stabile.',
    pt: 'Mesma ideia, sabor maior. Ouça como o 7 se apoia de volta na fundamental — esse apoio é o que faz o maior soar assentado.',
  },
  'The turnaround is the hard part.': {
    es: 'La vuelta es la parte difícil.', fr: 'Le demi-tour est la partie difficile.',
    it: 'L’inversione è la parte difficile.', pt: 'A virada é a parte difícil.',
  },
  'Up, then straight back down without pausing at the top. Everyone can climb; almost nobody can turn around cleanly. Go slow at the peak.': {
    es: 'Arriba, luego directo abajo sin pausa en la cima. Todos pueden subir; casi nadie puede dar la vuelta limpiamente. Ve lento en el pico.',
    fr: 'En haut, puis droit en bas sans pause au sommet. Tout le monde sait monter ; presque personne ne sait faire demi-tour proprement. Ralentis au sommet.',
    it: 'Su, poi dritto giù senza pausa in cima. Tutti sanno salire; quasi nessuno sa girarsi in modo pulito. Vai piano in cima.',
    pt: 'Para cima, depois direto para baixo sem pausar no topo. Todos sabem subir; quase ninguém vira limpo. Vá devagar no pico.',
  },
  'One note separates dreamy from restless.': {
    es: 'Una nota separa lo soñador de lo inquieto.', fr: 'Une note sépare le rêveur de l’agité.',
    it: 'Una nota separa il sognante dall’inquieto.', pt: 'Uma nota separa o sonhador do inquieto.',
  },
  'Play the natural 7 against the drone: lush, unresolved, floating. Then flatten it to a b7 in your head — instantly it wants to move somewhere. That single half-step is the engine of all Western harmony.': {
    es: 'Toca el 7 natural contra el bordón: exuberante, sin resolver, flotante. Luego bájalo a b7 en tu cabeza — al instante quiere moverse a alguna parte. Ese único medio tono es el motor de toda la armonía occidental.',
    fr: 'Joue le 7 naturel contre le bourdon : luxuriant, irrésolu, flottant. Puis abaisse-le en b7 dans ta tête — instantanément il veut aller quelque part. Ce seul demi-ton est le moteur de toute l’harmonie occidentale.',
    it: 'Suona il 7 naturale contro il bordone: lussureggiante, irrisolto, sospeso. Poi abbassalo a b7 nella tua testa — all’istante vuole andare da qualche parte. Quel singolo semitono è il motore di tutta l’armonia occidentale.',
    pt: 'Toque o 7 natural contra o bordão: exuberante, sem resolver, flutuando. Depois abaixe para b7 na sua cabeça — na hora ele quer ir para algum lugar. Esse único meio tom é o motor de toda a harmonia ocidental.',
  },
}
