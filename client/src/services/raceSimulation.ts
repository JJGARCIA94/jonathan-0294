import { MAX_BETS_PER_RACE, RACES_PER_DAY, SNAILS } from '../constants/race'
import type { RaceDay, RaceResult } from '../types/race'
import { createSeededRandom } from '../utils/random'

export function simulateRaceDay(seed: number): RaceDay {
    const random = createSeededRandom(seed)
    const races: RaceResult[] = []

    for (let race = 1; race <= RACES_PER_DAY; race++) {
        const [winner] = pickDistinct(SNAILS, 1, random)
        const betCount = 1 + Math.floor(random() * MAX_BETS_PER_RACE)
        races.push({ race, winner, userBets: pickDistinct(SNAILS, betCount, random) })
    }

    const winsBySnail = SNAILS.map((snail) => ({
        snail,
        wins: races.filter((race) => race.winner === snail).length,
    }))

    const betResults = races.flatMap((race) => race.userBets.map((snail) => snail === race.winner))
    const won = betResults.filter(Boolean).length

    return { races, winsBySnail, bets: { won, lost: betResults.length - won } }
}

function pickDistinct<T>(items: readonly T[], count: number, random: () => number): T[] {
    const remaining = [...items]
    const picked: T[] = []

    while (picked.length < count) {
        const index = Math.floor(random() * remaining.length)
        picked.push(...remaining.splice(index, 1))
    }

    return picked
}