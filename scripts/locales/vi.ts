// ─── Tiếng Việt ──────────────────────────────────────────────────────
// Vietnamese locale for the static mode pages. Vietnam names notes in
// fixed-do solfège (Đô Rê Mi Fa Sol La Si) — display goes through the
// app's displayNote(). Guitarists keep the English mode names (Dorian,
// Lydian…); the prose around them is Vietnamese, bạn-form, guitar-
// community voice. Slugs stay ASCII: /vi/modes/do-thang-dorian.

import type { Language } from '../../src/utils/noteNames'
import type { ModeKey } from '../shared'
import type { Locale } from '../locales'

export const vi: Locale = {
  code: 'vi' satisfies Language,
  htmlLang: 'vi',
  modesSegment: 'modes',
  sharpWord: 'thang',
  flatWord: 'giang',
  majorLabel: 'trưởng',
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
      focusLabel: 'quãng 7 trưởng',
      hook: 'Mode Ionian chính là thang âm trưởng quen thuộc: âm thanh sáng sủa, đã được giải quyết, mà âm nhạc phương Tây coi là nhà.',
      sound: 'Đó là âm thanh của những điệp khúc pop và những cái kết có hậu. Mọi mode khác trên trang này đều là chính những nốt này, chỉ khác nốt nào được chọn làm nhà.',
      practice: 'Trên nền drone, hãy nghe quãng 7 trưởng ngả một cách khao khát về nốt chủ — lực hút đó chính là ý nghĩa của chữ «giải quyết».',
    },
    dorian: {
      focusLabel: 'quãng 6 trưởng',
      hook: 'Mode Dorian là một thang âm thứ với một nốt được nâng lên: quãng 6 là trưởng thay vì thứ, và cái «buồn» bỗng thành cái «ngầu».',
      sound: 'Đó là âm thanh của «Oye Como Va» và Santana, của «So What» và jazz modal, của những groove funk sống trên một hợp âm thứ duy nhất mà không bao giờ chán. Thứ, nhưng ngẩng cao đầu.',
      practice: 'Trên nền drone, mọi thứ nghe như thang âm thứ bình thường cho đến khi bạn đáp xuống quãng 6 trưởng — nốt đó CHÍNH LÀ hương vị Dorian: hãy chủ đích nhắm vào nó.',
    },
    phrygian: {
      focusLabel: 'quãng 2 thứ',
      hook: 'Mode Phrygian là một thang âm thứ với nốt ngay phía trên nhà bị đẩy xuống nửa cung — bóng tối tức thì.',
      sound: 'Quãng 2 thứ đó là âm thanh của flamenco, của vòng hòa thanh Andalusia và của một nửa số riff metal từng được viết. Nó nằm cách nốt chủ đúng một phím đàn: sự căng thẳng luôn ở ngay đầu ngón tay.',
      practice: 'Trên nền drone, hãy gõ qua lại giữa nốt chủ và quãng 2 thứ — sự cọ xát nửa cung đó CHÍNH LÀ Phrygian; phần còn lại của thang âm chỉ là bối cảnh.',
    },
    lydian: {
      focusLabel: 'quãng 4 tăng',
      hook: 'Mode Lydian là thang âm trưởng với quãng 4 nâng lên nửa cung — vẫn trưởng, nhưng lơ lửng thay vì chạm đất.',
      sound: 'Đó là âm thanh mơ màng của nhạc phim, của nhạc hiệu «The Simpsons» và những bản ballad của Joe Satriani («Flying in a Blue Dream» là một bài học Lydian có hợp đồng thu âm).',
      practice: 'Trên nền drone, hãy giữ quãng 4 tăng và để nó ngân — trong bất kỳ ngữ cảnh trưởng nào khác, đó sẽ là một nốt «sai»; ở đây, đó chính là điểm hay.',
    },
    mixolydian: {
      focusLabel: 'quãng 7 thứ',
      hook: 'Mode Mixolydian là thang âm trưởng với quãng 7 hạ xuống — sáng ở trên, đậm chất blues ở dưới.',
      sound: 'Đó là thang âm mặc định của rock and roll: riff của AC/DC, Grateful Dead, nhạc Celtic và mọi câu solo mười hai ô nhịp nghe vui mà không hề ngây ngô.',
      practice: 'Trên nền drone, hãy so quãng 7 thứ với nốt dẫn mà tai bạn đang chờ — cái yên bình «chẳng cần giải quyết gì» đó là toàn bộ mode này.',
    },
    aeolian: {
      focusLabel: 'quãng 6 thứ',
      hook: 'Mode Aeolian là thang âm thứ tự nhiên — thang âm buồn quen thuộc, người chị em trong bóng tối của thang âm trưởng.',
      sound: 'Đó là âm thanh của gần như mọi bản rock và pop giọng thứ: «Stairway to Heaven», «Losing My Religion», mọi bản power ballad. Quãng 6 thứ là thứ tách nó khỏi Dorian: nơi Dorian nâng lên, Aeolian chìm xuống.',
      practice: 'Trên nền drone, hãy đi từ quãng 6 thứ xuống quãng 5 và cảm nhận nó yên vị — tiếng thở dài đó là chữ ký của thang âm thứ tự nhiên.',
    },
    locrian: {
      focusLabel: 'quãng 5 giảm',
      hook: 'Mode Locrian là kẻ bất ổn: quãng 2 và quãng 5 đều bị hạ xuống, nên chính ngôi nhà cũng là một hợp âm giảm không bao giờ yên vị.',
      sound: 'Không có quãng 5 đúng để tựa vào, Locrian từ chối được giải quyết — và chính vì thế metal và jazz để dành nó cho những khoảnh khắc căng nhất. Nó không hẳn là một nơi để sống, mà là một nơi để đi ngang qua với vẻ đầy đe dọa.',
      practice: 'Trên nền drone, hãy để ý ngay cả nốt chủ cũng thấy tạm bợ — quãng 5 giảm cứ liên tục rút mặt đất khỏi chân bạn.',
    },
  },
  t: {
    upgradeCta: 'Biến luyện tập thành thói quen · $5/tháng',
    title: 'Mode {name} trên guitar — Âm giai, hợp âm và sơ đồ cần đàn | Modal Runs',
    metaDesc: '{name} trên guitar: {notes}. Sơ đồ cần đàn tương tác, các hợp âm diatonic và một drone miễn phí để ngẫu hứng — Modal Runs nghe bạn qua micro và làm sáng những gì bạn chơi theo thời gian thực.',
    h1: '{name} trên guitar',
    lead: '{hook} Các nốt của {name} là <strong>{notes}</strong>. Nốt đặc trưng của nó là <strong>{focus}</strong> — {focusLabel} — nốt tạo nên màu sắc riêng của thang âm này.',
    neckHeading: '{name} trên toàn bộ cần đàn',
    figcaption: 'Dây chuẩn, phím 0–12. Các nốt màu vàng là nốt chủ ({root}); mỗi màu đánh dấu một quãng, cùng bảng màu mà app sử dụng.',
    ariaFretboard: 'Thang âm {name} trên cần đàn guitar, phím 0 đến 12',
    ctaMain: 'Luyện {name} trên nền drone →',
    ctaSub: 'Miễn phí, ngay trong trình duyệt. Nó nghe bạn qua micro và làm sáng những gì bạn chơi.',
    formulaHeading: 'Công thức và các quãng',
    formulaLine: '<strong>{formula}</strong> — {n} nốt. {family}',
    familyMajor: 'Quãng 3 trưởng khiến nó thuộc họ thang âm trưởng.',
    familyMinor: 'Quãng 3 thứ khiến nó thuộc họ thang âm thứ.',
    familyDim: 'Quãng 3 thứ và quãng 5 giảm tạo thành một hợp âm ba giảm trên nốt chủ.',
    chordsHeading: 'Các hợp âm trong {name}',
    chordsIntro: 'Đây là các hợp âm diatonic — phần hòa âm xây dựng chỉ từ những nốt ở trên. Chuyển qua lại giữa chúng giữ bạn ở trong mode.',
    thDegree: 'Bậc', thChord: 'Hợp âm', thQuality: 'Tính chất',
    sameNotesHeading: 'Cùng nốt, khác nhà',
    relative: '{name} chứa chính xác những nốt giống hệt <a href="{parentHref}">{parent}</a>. Các nốt không đổi — chỉ đổi nốt nào được cảm nhận là nhà, và điều đó thay đổi tất cả.',
    relativeIonian: 'Mọi mode trên trang này đều sinh ra từ một thang âm trưởng. {name} là thang âm trưởng của {root} — sáu mode còn lại dùng lại đúng những nốt của nó với một nhà khác.',
    otherModesHeading: 'Các mode khác trên {root}',
    otherModesIntro: 'Giữ nguyên nốt chủ và đổi thang âm — cách nhanh nhất để nghe được mỗi mode làm gì.',
    indexTitle: 'Các mode guitar ở mọi giọng — Công thức, nốt và sơ đồ cần đàn | Modal Runs',
    indexDesc: 'Sơ đồ cần đàn cho bảy mode ở cả mười hai giọng: công thức và các nốt của từng mode, hợp âm diatonic và một drone miễn phí để ngẫu hứng. Luyện tai thật sự — Modal Runs nghe bạn qua micro trong lúc bạn tập.',
    indexH1: 'Mọi mode, mọi giọng',
    indexLead: 'Bảy mode của thang âm trưởng, vẽ trên cần đàn ở cả mười hai giọng — kèm các nốt, những hợp âm sống bên trong mỗi mode và một drone để ngẫu hứng. Chọn một giọng; trang sẽ cho bạn xem sơ đồ và <a href="/">app</a> sẽ nghe bạn trong lúc bạn chơi.',
    faqQ: '{name} là gì?',
    footerModes: 'Tất cả các mode',
    footerApp: 'Mở app',
    footerTag: 'Modal Runs — học cần đàn bằng cách chơi nó. Miễn phí.',
    homeTitle: 'Modal Runs — Học cần đàn bằng cách chơi nó',
    homeDesc: 'Học cần đàn bằng cách chơi nó: giữ một drone ở bất kỳ giọng nào, ngẫu hứng, và Modal Runs làm sáng từng nốt bạn chơi trên cần đàn theo thời gian thực — luyện tai thật sự. Tìm ra các mode bằng tai thay vì học thuộc. Miễn phí.',
    homeH1: 'Modal Runs — học cần đàn bằng cách chơi nó',
    homeLead: 'Giữ một drone ở bất kỳ giọng nào, ngẫu hứng, và Modal Runs nghe bạn qua micro — làm sáng từng nốt bạn chơi trên cần đàn và báo cho bạn biết khi bạn chạm được nốt nó yêu cầu. Học các mode bằng tai thay vì học thuộc. Miễn phí, trong trình duyệt, không cần đăng ký.',
  },
}
