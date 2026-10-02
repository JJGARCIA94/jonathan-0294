// Se muestra mientras se descarga el código de una página
export function PageLoader() {
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando…</span>
            </div>
        </div>
    )
}