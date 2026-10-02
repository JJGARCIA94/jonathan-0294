import { useState } from 'react'
import { BetsDonutChart } from '../components/dashboard/BetsDonutChart'
import { ChargeHistoryTable } from '../components/dashboard/ChargeHistoryTable'
import { DashboardCard } from '../components/dashboard/DashboardCard'
import { RaceResultsTable } from '../components/dashboard/RaceResultsTable'
import { SnailWinsBarChart } from '../components/dashboard/SnailWinsBarChart'
import { StatCard } from '../components/dashboard/StatCard'
import { RechargeDialog } from '../components/recharge/RechargeDialog'
import { RACES_PER_DAY } from '../constants/race'
import { useAuth } from '../hooks/useAuth'
import { useChargeHistory } from '../hooks/useChargeHistory'
import { simulateRaceDay } from '../services/raceSimulation'
import { formatCurrency } from '../utils/format'
import { seedFromDate } from '../utils/random'
import { usePageTitle } from '../hooks/usePageTitle'
import { Brand } from '../components/Brand'

const raceDay = simulateRaceDay(seedFromDate(new Date()))

export function DashboardPage() {
    const { user, logout } = useAuth()
    const [isRechargeOpen, setIsRechargeOpen] = useState(false)
    const { charges, reload: reloadCharges } = useChargeHistory(user?.id)
    usePageTitle('Resumen')

    if (!user) return null

    const { won, lost } = raceDay.bets

    return (
        <>
            <nav className="navbar app-navbar">
                <div className="container">
                    <span className="navbar-brand">
                        <Brand />
                    </span>
                    <button type="button" className="btn btn-outline-light btn-sm" onClick={logout}>
                        <i className="bi bi-box-arrow-right me-1" aria-hidden="true" />
                        Cerrar sesión
                    </button>
                </div>
            </nav>

            <main className="container py-4">
                <h1 className="h3 mb-1">Hola, {user.fullName}</h1>
                <p className="text-body-secondary mb-4">Este es el resumen de las carreras de hoy.</p>

                <div className="row g-3 mb-3">
                    <div className="col-12 col-md-4">
                        <StatCard title="Saldo actual" value={formatCurrency(user.balance)} icon="bi-wallet2">
                            <button
                                type="button"
                                className="btn btn-primary btn-sm mt-2"
                                onClick={() => setIsRechargeOpen(true)}
                            >
                                <i className="bi bi-plus-lg me-1" aria-hidden="true" />
                                Recargar saldo
                            </button>
                        </StatCard>
                    </div>
                    <div className="col-6 col-md-4">
                        <StatCard title="Apuestas ganadas" value={won} icon="bi-trophy" tone="success" />
                    </div>
                    <div className="col-6 col-md-4">
                        <StatCard title="Apuestas perdidas" value={lost} icon="bi-x-circle" tone="danger" />
                    </div>
                </div>

                <div className="row g-3 mb-3">
                    <div className="col-12 col-lg-5">
                        <DashboardCard title="Apuestas ganadas y perdidas">
                            <BetsDonutChart won={won} lost={lost} />
                        </DashboardCard>
                    </div>
                    <div className="col-12 col-lg-7">
                        <DashboardCard title={`Victorias por caracol en las ${RACES_PER_DAY} carreras de hoy`}>
                            <SnailWinsBarChart data={raceDay.winsBySnail} />
                        </DashboardCard>
                    </div>
                </div>

                <div className="mb-3">
                    <DashboardCard title="Últimas recargas">
                        <ChargeHistoryTable charges={charges} />
                    </DashboardCard>
                </div>

                <DashboardCard title="Resultados de las carreras">
                    <RaceResultsTable races={raceDay.races} />
                </DashboardCard>
            </main>

            {isRechargeOpen && (
                <RechargeDialog onClose={() => setIsRechargeOpen(false)} onSettled={reloadCharges} />
            )}
        </>
    )
}