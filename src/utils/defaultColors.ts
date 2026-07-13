// Modal Runs neon interval palette.
// Hues come from the logo's spectrum (cyan → blue → purple → magenta → coral), but the
// assignment stays FUNCTIONAL rather than a straight chromatic ramp: the pairs a player
// must never confuse (b3/3, b5/5, b6/6, b7/7) are pushed to opposing hues.
// R is the logo's amber dot — the one colour nothing else competes with.
export const DEFAULT_INTERVAL_COLORS: Record<string, string> = {
  'R':  '#FAB123', // logo amber — the root, unmistakable
  'b2': '#F7568C', // neon rose
  '2':  '#09CEDE', // brand cyan
  'b3': '#2FD48A', // neon emerald
  '3':  '#9FE03C', // neon chartreuse
  '4':  '#F79A3C', // neon orange
  'b5': '#FF4D5E', // neon crimson
  '5':  '#2987E6', // brand blue
  'b6': '#9846EA', // brand purple
  '6':  '#C9E03C', // neon citrine
  'b7': '#E6883F', // neon copper
  '7':  '#F7509E', // brand pink
}

export const ALL_INTERVALS = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7']
