import type { ReactNode } from 'react'

interface AuthLayoutProps {
    title: string
    children: ReactNode
    footer?: ReactNode
}

export function AuthLayout({ title, children, footer }: AuthLayoutProps) {
    return (
        <main className="min-vh-100 bg-body-tertiary py-5">
            <div className="container">
                <h1 className="text-center mb-4">Carreras de caracoles</h1>
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                        <section className="card shadow-sm">
                            <div className="card-body p-4">
                                <h2 className="h4 mb-4">{title}</h2>
                                {children}
                            </div>
                        </section>
                        {footer && <p className="text-center mt-3 mb-0">{footer}</p>}
                    </div>
                </div>
            </div>
        </main>
    )
}