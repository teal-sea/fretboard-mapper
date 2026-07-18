// ─── 简体中文 ─────────────────────────────────────────────────────────
// Simplified Chinese locale for the static mode pages. Chinese guitarists
// mostly read letter note names (C D E …), which the app already displays;
// mode names show in Chinese (多利亚调式 etc.) but URLs stay ASCII, so we
// romanize both notes and modes for slugs: /zh/modes/do-sharp-dorian.

import type { Language } from '../../src/utils/noteNames'
import type { ModeKey } from '../shared'
import type { Locale } from '../locales'

export const zh: Locale = {
  code: 'zh',
  htmlLang: 'zh-Hans',
  modesSegment: 'modes',
  sharpWord: 'sharp',
  flatWord: 'flat',
  majorLabel: '大调',
  modeNames: {
    ionian: '伊奥尼亚', dorian: '多利亚', phrygian: '弗里几亚', lydian: '利底亚',
    mixolydian: '混合利底亚', aeolian: '爱奥利亚', locrian: '洛克里亚',
  },
  slugSolfege: ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'],
  modeSlugs: {
    ionian: 'ionian', dorian: 'dorian', phrygian: 'phrygian', lydian: 'lydian',
    mixolydian: 'mixolydian', aeolian: 'aeolian', locrian: 'locrian',
  },
  copy: {
    ionian: {
      focusLabel: '大七度',
      hook: '伊奥尼亚调式就是我们最熟悉的大调音阶：明亮、稳定、有归属感——西方音乐把它当作"家"的声音。',
      sound: '流行歌副歌和大团圆结局都是这个声音。本站其他所有调式，都是同样这几个音，只是换了一个音当家。',
      practice: '开着持续音（drone），听大七度怎样急切地向主音倾斜——那股拉力，就是"解决"两个字的真正含义。',
    },
    dorian: {
      focusLabel: '大六度',
      hook: '多利亚调式是把小调音阶抬高了一个音：六度从小六度变成大六度，"悲伤"立刻变成了"有态度"。',
      sound: '这是《Oye Como Va》和 Santana 的声音，是《So What》和调式爵士的声音，是那些在一个小和弦上循环整晚也不腻的放克律动。还是小调，但抬着头。',
      practice: '开着持续音，一切听起来都像普通小调——直到你落在大六度上。那个音就是多利亚的味道：有意识地瞄准它。',
    },
    phrygian: {
      focusLabel: '小二度',
      hook: '弗里几亚调式是把小调里紧贴主音上方的那个音往下压了半音——黑暗感瞬间到位。',
      sound: '那个小二度是弗拉门戈的声音，是安达卢西亚终止式的声音，也是有史以来一半金属 riff 的声音。它离主音只有一品：紧张感永远就在指尖。',
      practice: '开着持续音，在主音和小二度之间反复敲击——那半音的摩擦就是弗里几亚本身；音阶剩下的部分只是背景。',
    },
    lydian: {
      focusLabel: '增四度',
      hook: '利底亚调式是把大调音阶的四度升高半音——依然是大调，但不再脚踏实地，而是悬浮在空中。',
      sound: '这是电影配乐的梦幻声音，是《辛普森一家》主题曲的声音，也是 Joe Satriani 抒情曲的声音（《Flying in a Blue Dream》就是一份签了唱片约的利底亚教程）。',
      practice: '开着持续音，按住增四度让它一直响——在任何别的大调语境里它都是"错音"；在这里，它正是重点。',
    },
    mixolydian: {
      focusLabel: '小七度',
      hook: '混合利底亚调式是把大调音阶的七度降了半音——上面依然明亮，底下透着布鲁斯。',
      sound: '这是摇滚乐的默认音阶：AC/DC 的 riff、Grateful Dead、凯尔特音乐，还有每一段听起来快乐却不天真的十二小节 solo。',
      practice: '开着持续音，把小七度和你耳朵期待的导音比一比——那种"不需要解决"的松弛感，就是整个调式。',
    },
    aeolian: {
      focusLabel: '小六度',
      hook: '爱奥利亚调式就是自然小调——最经典的悲伤音阶，大调音阶的影子孪生。',
      sound: '几乎所有小调摇滚和流行都是这个声音：《Stairway to Heaven》《Losing My Religion》，每一首 power ballad。小六度是它和多利亚的分界线：多利亚往上提，爱奥利亚往下沉。',
      practice: '开着持续音，从小六度落到五度，感受它稳稳坐下——那声叹息就是自然小调的签名。',
    },
    locrian: {
      focusLabel: '减五度',
      hook: '洛克里亚是最不稳定的调式：二度和五度都被降低，连"家"本身都是一个永远坐不稳的减和弦。',
      sound: '没有纯五度可以依靠，洛克里亚拒绝解决——正因如此，金属和爵士把它留给最大张力的时刻。与其说是可以住的地方，不如说是一个带着杀气路过的地方。',
      practice: '开着持续音，注意连主音都显得摇摇欲坠——减五度不停地把地板从你脚下抽走。',
    },
  },
  t: {
    upgradeCta: '让练琴成为习惯 · 每月$5',
    title: '吉他上的{name}——音名、指板图与持续音 | Modal Runs',
    metaDesc: '吉他上的{name}：{notes}。交互式指板图、顺阶和弦，还有免费持续音（drone）供你即兴——Modal Runs 通过麦克风实时听你弹，并在指板上点亮你弹的每个音。',
    h1: '吉他上的{name}',
    lead: '{hook}{name}的音是<strong>{notes}</strong>。它的特征音是<strong>{focus}</strong>——{focusLabel}——正是这个音赋予了这条音阶独特的色彩。',
    neckHeading: '全指板上的{name}',
    figcaption: '标准调弦，0–12品。金色的是主音（{root}）；每种颜色代表一个音程，与 app 使用同一套配色。',
    ariaFretboard: '吉他指板上的{name}音阶，0到12品',
    ctaMain: '在持续音上练习{name} →',
    ctaSub: '免费，直接在浏览器里用。它通过麦克风听你弹，并点亮你弹的音。',
    formulaHeading: '公式与音程',
    formulaLine: '<strong>{formula}</strong>——共{n}个音。{family}',
    familyMajor: '大三度让它属于大调家族。',
    familyMinor: '小三度让它属于小调家族。',
    familyDim: '小三度加减五度，在主音上构成一个减三和弦。',
    chordsHeading: '{name}中的和弦',
    chordsIntro: '这些是顺阶和弦——只用上面这些音搭出来的和声。在它们之间切换，你就一直待在这个调式里。',
    thDegree: '级数', thChord: '和弦', thQuality: '性质',
    sameNotesHeading: '同样的音，不同的家',
    relative: '{name}包含的音和<a href="{parentHref}">{parent}</a>完全相同。音没有变——变的是哪个音当家，而这改变了一切。',
    relativeIonian: '本站所有调式都源自一条大调音阶。{name}就是{root}大调音阶——其余六个调式沿用它的全部音，只是换了一个家。',
    otherModesHeading: '以{root}为主音的其他调式',
    otherModesIntro: '保持同一个主音，换一条音阶——这是听出每个调式作用的最快方法。',
    indexTitle: '十二个调的吉他调式大全——指板图、音名与持续音 | Modal Runs',
    indexDesc: '七个调式（中古调式）在十二个调上的指板图：音名、顺阶和弦，还有免费持续音供你即兴。真正的练耳训练——你练琴时 Modal Runs 通过麦克风听着你。',
    indexH1: '所有调式，所有调',
    indexLead: '大调音阶的七个调式，在十二个调上铺满指板——附上音名、每个调式内部的和弦，以及一个供你即兴的持续音。选一个调；页面给你指板图，<a href="/">app</a> 在你弹的时候听着你。',
    faqQ: '什么是{name}？',
    footerModes: '所有调式',
    footerApp: '打开 app',
    footerTag: 'Modal Runs——免费的吉他练习工具，会听你弹。',
    homeTitle: 'Modal Runs——你弹，它在听',
    homeDesc: '一个会听你弹琴的交互式指板：在任意调上开一个持续音，随意即兴，Modal Runs 实时在指板上点亮你弹的每个音——真正的练耳训练。用耳朵找到调式，而不是死记硬背。免费。',
    homeH1: 'Modal Runs——你弹，它在听',
    homeLead: '在任意调上开一个持续音，随意即兴，Modal Runs 通过麦克风听你弹——在指板上点亮你弹的每个音，并在你弹中目标音时告诉你。用耳朵学会调式，而不是死记硬背。免费，浏览器直接用，无需注册。',
  },
}
