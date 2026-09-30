import { useAuth } from '../hooks/useAuth'
import { formatCurrency } from '../utils/format'

export function DashboardPage() {
    const { user, logout } = useAuth()

    if (!user) return null

    return (
        <>
            <nav className="navbar bg-body border-bottom">
                <div className="container">
                    <span className="navbar-brand fw-semibold">Carreras de caracoles</span>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={logout}>
                        <i className="bi bi-box-arrow-right me-1" aria-hidden="true" />
                        Cerrar sesión
                    </button>
                </div>
            </nav>

            <main className="container py-4">
                <h1 className="h3 mb-4">Hola, {user.fullName}</h1>

                <div className="row">
                    <div className="col-12 col-md-6 col-lg-4">
                        <section className="card shadow-sm">
                            <div className="card-body">
                                <h2 className="h6 text-body-secondary mb-1">Saldo actual</h2>
                                <p className="display-6 fw-semibold mb-0">{formatCurrency(user.balance)}</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </>
    )
}