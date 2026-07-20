// ─── Türkçe ──────────────────────────────────────────────────────────
// Turkish locale for the static /modes/ cluster. Turkey names notes in
// fixed-do solfège (Do Re Mi Fa Sol La Si); mode names use the Turkish
// forms guitarists actually search (İyonyen, Doryen, …). Display names
// keep Turkish letters; slugs are ASCII-folded (İ → i).

import type { Locale } from '../locales'

export const tr: Locale = {
  code: 'tr',
  htmlLang: 'tr',
  modesSegment: 'modlar',
  sharpWord: 'diyez',
  flatWord: 'bemol',
  majorLabel: 'majör',
  modeNames: {
    ionian: 'İyonyen', dorian: 'Doryen', phrygian: 'Frigyen', lydian: 'Lidyen',
    mixolydian: 'Miksolidyen', aeolian: 'Eolyen', locrian: 'Lokriyen',
  },
  slugSolfege: ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'],
  modeSlugs: {
    ionian: 'iyonyen', dorian: 'doryen', phrygian: 'frigyen', lydian: 'lidyen',
    mixolydian: 'miksolidyen', aeolian: 'eolyen', locrian: 'lokriyen',
  },
  copy: {
    ionian: {
      focusLabel: 'majör 7’li',
      hook: 'İyonyen modu, bildiğin majör gamın ta kendisi: Batı müziğinin evi saydığı o çözülmüş, aydınlık ses.',
      sound: 'Pop nakaratlarının ve mutlu sonların sesi bu. Bu sitedeki diğer bütün modlar, aynı notaların başka bir notayı ev bellemiş hâli.',
      practice: 'Dron üzerinde majör 7’linin tonik notaya nasıl açlıkla yaslandığını dinle — o çekim, "çözülmüş" demenin ta kendisi.',
    },
    dorian: {
      focusLabel: 'majör 6’lı',
      hook: 'Doryen modu, tek notası yükseltilmiş bir minör gam: 6’lı minör yerine majör — ve "hüzünlü" birden karaktere dönüşüyor.',
      sound: '"Oye Como Va" ve Santana’nın, "So What" ve modal cazın, tek bir minör akorda saatlerce takılıp hiç sıkmayan funk groove’larının sesi. Minör, ama başı dik.',
      practice: 'Dron üzerinde her şey sıradan minör gibi tınlar — ta ki majör 6’lıya konana kadar. O nota Doryen tadının ta kendisi: ona bilerek nişan al.',
    },
    phrygian: {
      focusLabel: 'minör 2’li',
      hook: 'Frigyen modu, evin hemen üstündeki notası yarım ses aşağı itilmiş bir minör gam — anında karanlık.',
      sound: 'O minör 2’li flamenkonun, Endülüs kadansının ve yazılmış metal riff’lerinin yarısının sesi. Tonikten sadece bir perde uzakta yaşar: gerilim hep parmağının ucunda.',
      practice: 'Dron üzerinde tonik ile minör 2’li arasında gidip gel — o yarım ses sürtünmesi Frigyen’in ta kendisi; gamın geri kalanı sadece dekor.',
    },
    lydian: {
      focusLabel: 'artık 4’lü',
      hook: 'Lidyen modu, 4’lüsü yarım ses yükseltilmiş majör gam — majör, ama yere basmak yerine havada süzülüyor.',
      sound: 'Film müziklerinin, "Simpsonlar" jeneriğinin ve Joe Satriani baladlarının rüya gibi sesi ("Flying in a Blue Dream" plak sözleşmesi kapmış bir Lidyen dersidir).',
      practice: 'Dron üzerinde artık 4’lüyü basılı tut ve tınlamasına izin ver — başka herhangi bir majör bağlamda "yanlış" nota olurdu; burada olay tam da bu.',
    },
    mixolydian: {
      focusLabel: 'minör 7’li',
      hook: 'Miksolidyen modu, 7’lisi pesleştirilmiş majör gam — üstte pırıl pırıl, altında blues.',
      sound: 'Rock’n’roll’un varsayılan gamı bu: AC/DC riff’leri, Grateful Dead, Kelt ezgileri ve mutlu ama saf olmayan her on iki ölçülük solo.',
      practice: 'Dron üzerinde minör 7’liyi kulağının beklediği yeden ile karşılaştır — o "çözmeye gerek yok" rahatlığı modun tamamı.',
    },
    aeolian: {
      focusLabel: 'minör 6’lı',
      hook: 'Eolyen modu, doğal minör gamın ta kendisi — bildiğin hüzünlü gam, majör gamın gölge ikizi.',
      sound: 'Minör tondaki neredeyse bütün rock ve pop’un sesi: "Stairway to Heaven", "Losing My Religion", her power ballad. Onu Doryen’den ayıran minör 6’lı: Doryen yukarı kaldırır, Eolyen aşağı çeker.',
      practice: 'Dron üzerinde minör 6’lıdan 5’liye in ve yerine oturuşunu hisset — o iç çekiş, doğal minörün imzası.',
    },
    locrian: {
      focusLabel: 'eksik 5’li',
      hook: 'Lokriyen modu, dengesiz olan: 2’li de 5’li de pesleştirilmiş, yani evin kendisi bir türlü yerine oturmayan eksik bir akor.',
      sound: 'Yaslanacak tam 5’lisi olmadığı için Lokriyen çözülmeyi reddeder — metal ile cazın onu en yüksek gerilim anına saklamasının nedeni tam da bu. İçinde yaşanacak bir yerden çok, tehditkâr bakışlarla geçilecek bir yer.',
      practice: 'Dron üzerinde toniğin bile eğreti durduğuna dikkat et — eksik 5’li ayağının altındaki zemini durmadan çekiyor.',
    },
  },
  t: {
    upgradeCta: 'Pratiği alışkanlık yap · ayda $5',
    title: 'Gitarda {name} modu — Gam, akorlar ve klavye haritası | Modal Runs',
    metaDesc: 'Gitarda {name}: {notes}. İnteraktif klavye (sap) haritası, diyatonik akorlar ve doğaçlama için ücretsiz bir dron — Modal Runs seni mikrofondan dinler ve çaldığını gerçek zamanlı olarak klavyede aydınlatır.',
    h1: 'Gitarda {name}',
    lead: '{hook} {name} modunun notaları: <strong>{notes}</strong>. Karakteristik notası <strong>{focus}</strong> — yani {focusLabel} — bu gama rengini veren nota.',
    neckHeading: 'Sapın tamamında {name}',
    figcaption: 'Standart akort, perdeler 0–12. Altın renkli notalar tonik ({root}); her renk bir aralığı işaretler — uygulamanın kullandığı paletin aynısı.',
    ariaFretboard: 'Gitar sapında {name} gamı, 0’dan 12’ye perdeler',
    ctaMain: 'Dron eşliğinde {name} çalış →',
    ctaSub: 'Ücretsiz, tarayıcında. Seni mikrofondan dinler ve çaldığını aydınlatır.',
    formulaHeading: 'Formül ve aralıklar',
    formulaLine: '<strong>{formula}</strong> — {n} nota. {family}',
    familyMajor: 'Majör 3’lüsü onu majör aileden bir gam yapar.',
    familyMinor: 'Minör 3’lüsü onu minör aileden bir gam yapar.',
    familyDim: 'Minör 3’lü ile eksik 5’li, tonik üzerinde eksik bir üçlü akor oluşturur.',
    chordsHeading: '{name} içindeki akorlar',
    chordsIntro: 'Bunlar diyatonik akorlar — yalnızca yukarıdaki notalarla kurulan armoni. Aralarında gezinmek seni modun içinde tutar.',
    thDegree: 'Derece', thChord: 'Akor', thQuality: 'Nitelik',
    sameNotesHeading: 'Aynı notalar, başka bir ev',
    relative: '{name}, <a href="{parentHref}">{parent}</a> ile tamamen aynı notaları içerir. Notalar değişmez — hangisinin ev gibi hissettirdiği değişir, ve bu her şeyi değiştirir.',
    relativeIonian: 'Bu sitedeki bütün modlar bir majör gamdan doğar. {name}, {root} majör gamıdır — diğer altı mod, onun notalarını olduğu gibi alıp başka bir notayı ev yapar.',
    otherModesHeading: '{root} üzerinde diğer modlar',
    otherModesIntro: 'Toniği sabit tut, gamı değiştir — her modun ne yaptığını duymanın en hızlı yolu.',
    indexTitle: 'Bütün tonlarda gitar modları — Formüller, notalar ve klavye haritaları | Modal Runs',
    indexDesc: 'Yedi modun on iki tondaki klavye (sap) haritaları: her modun formülü ve notaları, diyatonik akorlar ve doğaçlama için ücretsiz bir dron. Gerçek bir kulak eğitimi — Modal Runs sen çalışırken seni mikrofondan dinler.',
    indexH1: 'Bütün modlar, bütün tonlar',
    indexLead: 'Majör gamın yedi modu, on iki tonun hepsinde sapa haritalanmış — notalarıyla, her birinin içinde yaşayan akorlarla ve doğaçlama için bir dronla. Bir ton seç; sayfa sana haritayı gösterir, <a href="/">uygulama</a> da sen çalarken seni dinler.',
    faqQ: '{name} nedir?',
    footerModes: 'Bütün modlar',
    footerApp: 'Uygulamayı aç',
    footerTag: 'Modal Runs — seni dinleyen ücretsiz gitar pratiği.',
    homeTitle: 'Modal Runs — Sen çalarken seni dinler',
    homeDesc: 'Seni dinleyen interaktif bir klavye (sap) haritası: herhangi bir tonda dron tut, doğaçla, Modal Runs çaldığın her notayı sapta gerçek zamanlı aydınlatsın — gerçek bir kulak eğitimi. Modları ezberlemek yerine kulakla bul. Ücretsiz.',
    homeH1: 'Modal Runs — sen çalarken seni dinler',
    homeLead: 'Herhangi bir tonda dron tut, doğaçla; Modal Runs seni mikrofondan dinlesin — çaldığın her notayı sapta aydınlatır, istediği notaya konduğunda sana söyler. Modları ezberlemek yerine kulakla öğren. Ücretsiz, tarayıcıda, kayıt yok.',
  },
}
