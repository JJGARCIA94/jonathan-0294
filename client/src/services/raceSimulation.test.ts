import { describe, expect, it } from 'vitest'

import { RACES_PER_DAY, SNAILS } from '../constants/race'
import { createSeededRandom, seedFromDate } from '../utils/random'
import { simulateRaceDay } from './raceSimulation'

const SEEDS = Array.from({ length: 1000 }, (_, index) => 20260101 + index)

describe('parámetros de la simulación', () => {
    it('hay 6 caracoles y 6 carreras por día', () => {
        expect(SNAILS).toHaveLength(6)
        expect(RACES_PER_DAY).toBe(6)
    })
})

describe('simulateRaceDay', () => {
    it('cada día tiene todas sus carreras y cada carrera un ganador que existe', () => {
        for (const seed of SEEDS) {
            const day = simulateRaceDay(seed)

            expect(day.races).toHaveLength(RACES_PER_DAY)
            for (const race of day.races) {
                expect(SNAILS).toContain(race.winner)
            }
        }
    })

    it('las victorias de todos los caracoles suman el número de carreras', () => {
        for (const seed of SEEDS) {
            const totalWins = simulateRaceDay(seed).winsBySnail.reduce((sum, snail) => sum + snail.wins, 0)

            expect(totalWins, `semilla ${seed}`).toBe(RACES_PER_DAY)
        }
    })

    it('en cada carrera se apuesta a entre 1 y 3 caracoles, sin repetir', () => {
        for (const seed of SEEDS) {
            for (const race of simulateRaceDay(seed).races) {
                expect(race.userBets.length).toBeGreaterThanOrEqual(1)
                expect(race.userBets.length).toBeLessThanOrEqual(3)
                expect(new Set(race.userBets).size).toBe(race.userBets.length)
            }
        }
    })

    it('ganadas más perdidas da el total de apuestas, y solo se gana si el caracol elegido ganó', () => {
        for (const seed of SEEDS) {
            const day = simulateRaceDay(seed)
            const totalBets = day.races.reduce((sum, race) => sum + race.userBets.length, 0)
            const racesWithWinningBet = day.races.filter((race) => race.userBets.includes(race.winner)).length

            expect(day.bets.won + day.bets.lost, `semilla ${seed}`).toBe(totalBets)
            expect(day.bets.won, `semilla ${seed}`).toBe(racesWithWinningBet)
        }
    })

    it('el mismo día siempre da el mismo resultado, y días distintos dan resultados distintos', () => {
        expect(simulateRaceDay(20260930)).toEqual(simulateRaceDay(20260930))
        expect(simulateRaceDay(20260930)).not.toEqual(simulateRaceDay(20261001))
    })
})

describe('azar con semilla', () => {
    it('seedFromDate convierte la fecha en un número AAAAMMDD', () => {
        expect(seedFromDate(new Date(2026, 8, 30))).toBe(20260930)
    })

    it('createSeededRandom da números entre 0 y 1 y repite la secuencia con la misma semilla', () => {
        const first = createSeededRandom(42)
        const second = createSeededRandom(42)

        for (let step = 0; step < 1000; step++) {
            const value = first()

            expect(value).toBeGreaterThanOrEqual(0)
            expect(value).toBeLessThan(1)
            expect(second()).toBe(value)
        }
    })
})