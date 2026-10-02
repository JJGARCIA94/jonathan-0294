import { useEffect } from 'react'
import { APP_NAME } from '../constants/theme'

export function usePageTitle(title: string) {
    useEffect(() => {
        document.title = `${title} · ${APP_NAME}`
    }, [title])
}