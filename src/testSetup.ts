// ─── Vitest setup ───
// Node 25 ships an experimental built-in localStorage whose backing store never
// initializes under vitest ("--localstorage-file was provided without a valid
// path"), so a half-broken global shadows jsdom's Storage and .clear() is
// undefined. Install a real in-memory Storage before any test runs.

const makeStorage = (): Storage => {
  const map = new Map<string, string>()
  return {
    get length() { return map.size },
    key: i => [...map.keys()][i] ?? null,
    getItem: k => map.get(k) ?? null,
    setItem: (k, v) => { map.set(String(k), String(v)) },
    removeItem: k => { map.delete(k) },
    clear: () => { map.clear() },
  }
}

Object.defineProperty(globalThis, 'localStorage', { value: makeStorage(), configurable: true })
Object.defineProperty(globalThis, 'sessionStorage', { value: makeStorage(), configurable: true })
