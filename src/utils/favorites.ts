// ─── Favorites ─────────────────────────────────────────────────────────
// Star a chord or scale to jump back to it later — localStorage only via
// the existing persist.ts snapshot, same zero-backend answer as the
// practice streak. A favorite is just enough to reconstruct the selection:
// which view it was, the root, and the chord/scale key.

export interface FavoriteItem {
  viewMode: 'chords' | 'scales'
  root: string
  key: string // chord key (e.g. 'maj7') or scale key (e.g. 'dorian')
}

export function favoriteId(item: FavoriteItem): string {
  return `${item.viewMode}:${item.root}:${item.key}`
}

export function isFavorited(favorites: FavoriteItem[], item: FavoriteItem): boolean {
  const id = favoriteId(item)
  return favorites.some(f => favoriteId(f) === id)
}

// Add if absent, remove if present — the toggle a single star button needs.
export function toggleFavorite(favorites: FavoriteItem[], item: FavoriteItem): FavoriteItem[] {
  const id = favoriteId(item)
  return isFavorited(favorites, item)
    ? favorites.filter(f => favoriteId(f) !== id)
    : [...favorites, item]
}
