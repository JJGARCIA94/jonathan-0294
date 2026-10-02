import { useEffect } from 'react'

const APP_NAME = 'Carreras de caracoles'

export function usePageTitle(title: string) {
    useEffect(() => {
        document.title = `${title} · ${APP_NAME}`
    }, [title])
}