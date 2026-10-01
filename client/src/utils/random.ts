export function createSeededRandom(seed: number): () => number {
    let state = seed >>> 0

    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0
        return state / 2 ** 32
    }
}

export function seedFromDate(date: Date): number {
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
}