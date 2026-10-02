import { Label, Legend, Pie, PieChart, Tooltip } from 'recharts'
import type { BetsSummary } from '../../types/race'
import { THEME_COLORS } from '../../constants/theme'

export function BetsDonutChart({ won, lost }: BetsSummary) {
    const data = [
        { name: 'Ganadas', value: won, fill: THEME_COLORS.won },
        { name: 'Perdidas', value: lost, fill: THEME_COLORS.lost },
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