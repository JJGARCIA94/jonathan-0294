import { Label, Legend, Pie, PieChart, Tooltip } from 'recharts'

import type { BetsSummary } from '../../types/race'

const WON_COLOR = '#198754'
const LOST_COLOR = '#dc3545'

export function BetsDonutChart({ won, lost }: BetsSummary) {
    const data = [
        { name: 'Ganadas', value: won, fill: WON_COLOR },
        { name: 'Perdidas', value: lost, fill: LOST_COLOR },
    ]

    return (
        <PieChart responsive style={{ width: '100%', height: 260 }}>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="85%" paddingAngle={2}>
                <Label value={`${won + lost} apuestas`} position="center" />
            </Pie>
            <Tooltip />
            <Legend />
        </PieChart>
    )
}