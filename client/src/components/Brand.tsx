import { APP_NAME } from '../constants/theme'

export function Brand() {
    return (
        <span className="brand">
            <span aria-hidden="true">🐌</span> {APP_NAME}
        </span>
    )
}