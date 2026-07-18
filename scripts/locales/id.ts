// ─── Bahasa Indonesia ────────────────────────────────────────────────
// Indonesian locale for the static mode pages. Indonesian guitarists use
// letter note names (C D E F G A B) and keep the English mode names
// (Dorian, Lydian…) — the prose around them is Indonesian, kamu-form,
// guitar-community voice. Slugs stay ASCII: /id/modus/c-kres-dorian.

import type { Language } from '../../src/utils/noteNames'
import type { ModeKey } from '../shared'
import type { Locale } from '../locales'

export const id: Locale = {
  code: 'id' satisfies Language,
  htmlLang: 'id',
  modesSegment: 'modus',
  sharpWord: 'kres',
  flatWord: 'mol',
  majorLabel: 'mayor',
  modeNames: {
    ionian: 'Ionian', dorian: 'Dorian', phrygian: 'Phrygian', lydian: 'Lydian',
    mixolydian: 'Mixolydian', aeolian: 'Aeolian', locrian: 'Locrian',
  },
  slugSolfege: ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'],
  modeSlugs: <Record<ModeKey, string>>{
    ionian: 'ionian', dorian: 'dorian', phrygian: 'phrygian', lydian: 'lydian',
    mixolydian: 'mixolydian', aeolian: 'aeolian', locrian: 'locrian',
  },
  copy: {
    ionian: {
      focusLabel: 'mayor 7',
      hook: 'Mode Ionian adalah tangga nada mayor yang itu-itu juga: bunyi terang dan "selesai" yang dianggap rumah oleh musik Barat.',
      sound: 'Ini bunyi reff lagu pop dan akhir cerita yang bahagia. Semua mode lain di situs ini memakai nada-nada yang sama persis — hanya rumahnya yang pindah.',
      practice: 'Di atas drone, dengarkan bagaimana mayor 7 seperti lapar ingin naik ke tonika — tarikan itulah arti kata "selesai".',
    },
    dorian: {
      focusLabel: 'mayor 6',
      hook: 'Mode Dorian adalah tangga nada minor dengan satu nada dinaikkan: 6-nya mayor, bukan minor — dan "sedih" langsung berubah jadi "keren".',
      sound: 'Ini bunyi "Oye Como Va" dan Santana, "So What" dan jazz modal, groove funk yang betah di satu akor minor tanpa pernah membosankan. Minor, tapi kepalanya tegak.',
      practice: 'Di atas drone, semuanya terdengar seperti minor biasa sampai kamu mendarat di mayor 6 — nada itulah rasa Dorian: bidik dia dengan sengaja.',
    },
    phrygian: {
      focusLabel: 'minor 2',
      hook: 'Mode Phrygian adalah tangga nada minor dengan nada tepat di atas rumah didorong turun setengah laras — gelap seketika.',
      sound: 'Minor 2 itu bunyi flamenco, kadens Andalusia, dan separuh riff metal yang pernah ditulis. Dia tinggal satu fret dari tonika: ketegangannya selalu sejauh satu jari.',
      practice: 'Di atas drone, bolak-balik antara tonika dan minor 2 — gesekan setengah laras itulah Phrygian; sisa tangga nadanya cuma konteks.',
    },
    lydian: {
      focusLabel: 'augmented 4',
      hook: 'Mode Lydian adalah tangga nada mayor dengan 4 dinaikkan setengah laras — mayor, tapi melayang alih-alih menapak tanah.',
      sound: 'Ini bunyi melamun musik film, tema "The Simpsons", dan balada Joe Satriani ("Flying in a Blue Dream" itu tutorial Lydian yang punya kontrak rekaman).',
      practice: 'Di atas drone, tahan augmented 4 dan biarkan berbunyi — di konteks mayor mana pun dia nada "salah"; di sini justru itu intinya.',
    },
    mixolydian: {
      focusLabel: 'minor 7',
      hook: 'Mode Mixolydian adalah tangga nada mayor dengan 7 diturunkan — terang di atas, blues di bawahnya.',
      sound: 'Ini tangga nada bawaan rock and roll: riff AC/DC, Grateful Dead, musik Celtic, dan tiap solo dua belas birama yang terdengar gembira tapi tidak naif.',
      practice: 'Di atas drone, bandingkan minor 7 dengan leading tone yang diharapkan telingamu — rasa santai "tidak perlu resolusi" itu adalah seluruh mode ini.',
    },
    aeolian: {
      focusLabel: 'minor 6',
      hook: 'Mode Aeolian adalah tangga nada minor natural — si sedih klasik, kembaran bayangan dari tangga nada mayor.',
      sound: 'Ini bunyi hampir semua rock dan pop bernada minor: "Stairway to Heaven", "Losing My Religion", tiap power ballad. Minor 6-lah yang memisahkannya dari Dorian: Dorian mengangkat, Aeolian tenggelam.',
      practice: 'Di atas drone, turun dari minor 6 ke 5 dan rasakan dia mendarat — helaan napas itulah tanda tangan minor natural.',
    },
    locrian: {
      focusLabel: 'diminished 5',
      hook: 'Mode Locrian adalah yang paling labil: 2 dan 5-nya diturunkan, sehingga rumahnya sendiri adalah akor diminished yang tidak pernah tenang.',
      sound: 'Tanpa 5 murni untuk bersandar, Locrian menolak resolusi — persis karena itulah metal dan jazz menyimpannya untuk ketegangan maksimal. Bukan tempat tinggal, tapi tempat lewat sambil mengancam.',
      practice: 'Di atas drone, perhatikan bagaimana tonikanya pun terasa sementara — diminished 5 terus menarik lantai dari bawah kakimu.',
    },
  },
  t: {
    upgradeCta: 'Jadikan latihan kebiasaan · $5/bln',
    title: '{name} di gitar — Nada, peta fretboard, dan drone | Modal Runs',
    metaDesc: '{name} di gitar: {notes}. Visualisasi fretboard interaktif, akor diatonis, dan drone gratis untuk improvisasi — Modal Runs mendengarkanmu lewat mikrofon dan menyalakan nada yang kamu mainkan secara real-time.',
    h1: '{name} di gitar',
    lead: '{hook} Nada-nada {name} adalah <strong>{notes}</strong>. Nada khasnya adalah <strong>{focus}</strong> — si {focusLabel} — nada yang memberi tangga nada ini warnanya.',
    neckHeading: '{name} di seluruh neck',
    figcaption: 'Stem standar, fret 0–12. Nada emas adalah tonika ({root}); tiap warna menandai satu interval, palet yang sama dengan aplikasinya.',
    ariaFretboard: 'Tangga nada {name} di fretboard gitar, fret 0 sampai 12',
    ctaMain: 'Latih {name} di atas drone →',
    ctaSub: 'Gratis, di browsermu. Dia mendengarkanmu lewat mikrofon dan menyalakan apa yang kamu mainkan.',
    formulaHeading: 'Rumus dan interval',
    formulaLine: '<strong>{formula}</strong> — {n} nada. {family}',
    familyMajor: 'Mayor 3-nya menjadikan ini tangga nada keluarga mayor.',
    familyMinor: 'Minor 3-nya menjadikan ini tangga nada keluarga minor.',
    familyDim: 'Minor 3 dan diminished 5 membentuk triad diminished di atas tonika.',
    chordsHeading: 'Akor dalam {name}',
    chordsIntro: 'Ini akor-akor diatonisnya — harmoni yang dibangun hanya dari nada-nada di atas. Berpindah di antaranya membuatmu tetap di dalam mode.',
    thDegree: 'Tingkat', thChord: 'Akor', thQuality: 'Kualitas',
    sameNotesHeading: 'Nada sama, rumah berbeda',
    relative: '{name} berisi nada yang sama persis dengan <a href="{parentHref}">{parent}</a>. Nadanya tidak berubah — yang berubah adalah mana yang terasa sebagai rumah, dan itu mengubah segalanya.',
    relativeIonian: 'Semua mode di situs ini lahir dari satu tangga nada mayor. {name} adalah tangga nada mayor {root} — enam mode lainnya memakai ulang nada-nada persisnya dengan rumah yang lain.',
    otherModesHeading: 'Mode lain di atas {root}',
    otherModesIntro: 'Pertahankan tonika yang sama dan ganti tangga nadanya — cara tercepat mendengar apa yang dilakukan tiap mode.',
    indexTitle: 'Mode gitar di semua nada dasar — Peta fretboard, nada, dan drone | Modal Runs',
    indexDesc: 'Peta fretboard untuk tujuh mode di dua belas nada dasar: nada, akor diatonis, dan drone gratis untuk improvisasi. Ear training beneran — Modal Runs mendengarkanmu lewat mikrofon saat kamu berlatih.',
    indexH1: 'Semua mode, semua nada dasar',
    indexLead: 'Tujuh mode dari tangga nada mayor, dipetakan di fretboard dalam dua belas nada dasar — lengkap dengan nadanya, akor yang hidup di dalam masing-masing, dan drone untuk improvisasi. Pilih satu nada dasar; halamannya menunjukkan petanya dan <a href="/">aplikasinya</a> mendengarkanmu saat kamu memainkannya.',
    faqQ: 'Apa itu {name}?',
    footerModes: 'Semua mode',
    footerApp: 'Buka aplikasi',
    footerTag: 'Modal Runs — latihan gitar gratis yang mendengarkanmu.',
    homeTitle: 'Modal Runs — Mendengarkanmu saat kamu bermain',
    homeDesc: 'Visualisasi fretboard interaktif yang mendengarkanmu: tahan drone di nada dasar mana pun, improvisasi, dan Modal Runs menyalakan tiap nada yang kamu mainkan di neck secara real-time — ear training beneran. Temukan mode dengan telinga, bukan hafalan. Gratis.',
    homeH1: 'Modal Runs — mendengarkanmu saat kamu bermain',
    homeLead: 'Tahan drone di nada dasar mana pun, improvisasi, dan Modal Runs mendengarkanmu lewat mikrofon — menyalakan tiap nada yang kamu mainkan di neck dan memberi tahu saat kamu mendarat di nada yang dimintanya. Pelajari mode dengan telinga, bukan hafalan. Gratis, di browser, tanpa daftar.',
  },
}
