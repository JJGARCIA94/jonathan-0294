import type { SNAILS } from '../constants/race'

export type SnailName = (typeof SNAILS)[number]

export interface RaceResult {
    race: number
    winner: SnailName
    userBets: SnailName[]
}

export interface SnailWins {
    snail: SnailName
    wins: number
}

export interface BetsSummary {
    won: number
    lost: number
}

export interface RaceDay {
    races: RaceResult[]
    winsBySnail: SnailWins[]
    bets: BetsSummary
}