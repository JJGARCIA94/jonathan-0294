import type { ReactNode } from 'react'

interface StatCardProps {
    title: string
    value: ReactNode
    icon: string
    tone?: 'primary' | 'success' | 'danger'
}

export function StatCard({ title, value, icon, tone = 'primary' }: StatCardProps) {
    return (
        <section className="card h-100 shadow-sm">
            <div className="card-body d-flex align-items-center gap-3">
                <i className={`bi ${icon} fs-2 text-${tone}`} aria-hidden="true" />
                <div>
                    <h2 className="h6 text-body-secondary mb-1">{title}</h2>
                    <p className="fs-4 fw-semibold mb-0">{value}</p>
                </div>
            </div>
        </section>
    )
}