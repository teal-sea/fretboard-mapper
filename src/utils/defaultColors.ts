// Modal Runs interval palette — drawn ENTIRELY from the logo.
//
// The logo is a cool neon spectrum (cyan → blue → purple → magenta → pink → coral)
// with a single warm gold dot. So the neck is cool, and the ROOT is the gold dot —
// the only warm colour on the fretboard, which is why it reads instantly.
// (The previous palette invented emeralds, citrines and coppers that appear nowhere
// in the mark, and stacked three oranges around the root, which is what turned the
// whole thing to mud.)
//
// Assignment is FUNCTIONAL, not a chromatic ramp. The pairs a player must never
// confuse are pushed to opposite ends of the spectrum:
//   b3 blue  vs  3 coral      — cool vs warm
//   b5 red   vs  5 purple
//   b6 pink  vs  6 lavender   — saturated vs pale
//   b7 indigo vs 7 blush
export const DEFAULT_INTERVAL_COLORS: Record<string, string> = {
  'R':  '#FFC233', // the gold dot in the mark — the only warm note on the neck
  'b2': '#E648D8', // logo magenta
  '2':  '#09CEDE', // logo cyan
  'b3': '#2987E6', // logo blue
  '3':  '#F57064', // logo coral
  '4':  '#7BE0F0', // pale cyan
  'b5': '#FF4D6D', // the tritone: the one alarm colour
  '5':  '#9846EA', // logo purple
  'b6': '#F749A2', // logo pink
  '6':  '#C9A0FF', // pale lavender
  'b7': '#5A6EE8', // indigo
  '7':  '#FF8FC8', // blush
}

export const ALL_INTERVALS = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7']
