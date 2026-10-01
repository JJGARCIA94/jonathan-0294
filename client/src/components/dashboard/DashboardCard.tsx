import type { ReactNode } from 'react'

interface DashboardCardProps {
    title: string
    children: ReactNode
}

export function DashboardCard({ title, children }: DashboardCardProps) {
    return (
        <section className="card h-100 shadow-sm">
            <div className="card-body">
                <h2 className="h6 mb-3">{title}</h2>
                {children}
            </div>
        </section>
    )
}