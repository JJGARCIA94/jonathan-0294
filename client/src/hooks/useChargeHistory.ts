import { useState } from 'react'

import { getChargesForUser } from '../services/chargeHistory'
import type { ChargeResponse } from '../types/snailpay'

export function useChargeHistory(userId: string | undefined) {
    const [charges, setCharges] = useState<ChargeResponse[]>(() => (userId ? getChargesForUser(userId) : []))

    function reload() {
        setCharges(userId ? getChargesForUser(userId) : [])
    }

    return { charges, reload }
}