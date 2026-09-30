import { useState, type ChangeEvent, type SubmitEvent } from 'react'
import { FormField } from '../components/FormField'
import { AuthError, register } from '../services/authService'
import type { RegisterForm, User } from '../types/auth'
import { hasErrors, PASSWORD_HINT, validateRegister, type FieldErrors } from '../utils/validations'

const EMPTY_FORM: RegisterForm = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
}

interface RegisterPageProps {
    onRegistered: (user: User) => void
}

export function RegisterPage({ onRegistered }: RegisterPageProps) {
    const [form, setForm] = useState<RegisterForm>(EMPTY_FORM)
    const [wasSubmitted, setWasSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const errors: FieldErrors<RegisterForm> = wasSubmitted ? validateRegister(form) : {}

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target
        setForm((current) => ({ ...current, [name]: value }))
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        setWasSubmitted(true)
        setSubmitError(null)
        if (hasErrors(validateRegister(form))) return

        setIsSubmitting(true)
        try {
            const user = await register(form)
            onRegistered(user)
        } catch (error) {
            setSubmitError(error instanceof AuthError ? error.message : 'No pudimos crear tu cuenta. Inténtalo de nuevo.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                <section className="card shadow-sm">
                    <div className="card-body p-4">
                        <h2 className="h4 mb-4">Crear cuenta</h2>

                        <form onSubmit={handleSubmit} noValidate>
                            <FormField
                                id="fullName"
                                name="fullName"
                                label="Nombre completo"
                                autoComplete="name"
                                value={form.fullName}
                                onChange={handleChange}
                                error={errors.fullName}
                                validated={wasSubmitted}
                            />
                            <FormField
                                id="email"
                                name="email"
                                type="email"
                                label="Correo electrónico"
                                autoComplete="email"
                                value={form.email}
                                onChange={handleChange}
                                error={errors.email}
                                validated={wasSubmitted}
                            />
                            <FormField
                                id="password"
                                name="password"
                                type="password"
                                label="Contraseña"
                                autoComplete="new-password"
                                hint={PASSWORD_HINT}
                                value={form.password}
                                onChange={handleChange}
                                error={errors.password}
                                validated={wasSubmitted}
                            />
                            <FormField
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                label="Confirmar contraseña"
                                autoComplete="new-password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                error={errors.confirmPassword}
                                validated={wasSubmitted}
                            />

                            {submitError && (
                                <div className="alert alert-danger py-2" role="alert">
                                    {submitError}
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                                {isSubmitting && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
                                {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    )
}