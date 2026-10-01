import type { RaceResult } from '../../types/race'

interface RaceResultsTableProps {
    races: RaceResult[]
}

export function RaceResultsTable({ races }: RaceResultsTableProps) {
    return (
        <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
                <caption>Las apuestas en verde son las que ganaste.</caption>
                <thead>
                    <tr>
                        <th scope="col">Carrera</th>
                        <th scope="col">Ganador</th>
                        <th scope="col">Tus apuestas</th>
                    </tr>
                </thead>
                <tbody>
                    {races.map((race) => (
                        <tr key={race.race}>
                            <td>{race.race}</td>
                            <td className="fw-semibold">{race.winner}</td>
                            <td>
                                {race.userBets.map((snail) => {
                                    const won = snail === race.winner
                                    return (
                                        <span key={snail} className={`badge me-1 ${won ? 'text-bg-success' : 'text-bg-secondary'}`}>
                                            {won && <i className="bi bi-check-lg me-1" aria-hidden="true" />}
                                            {snail}
                                            {won && <span className="visually-hidden"> (ganada)</span>}
                                        </span>
                                    )
                                })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}