import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'

import type { SnailWins } from '../../types/race'

const BAR_COLOR = '#0d6efd'

interface SnailWinsBarChartProps {
    data: SnailWins[]
}

export function SnailWinsBarChart({ data }: SnailWinsBarChartProps) {
    return (
        <BarChart layout="vertical" data={data} responsive style={{ width: '100%', height: 260 }} margin={{ right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="snail" width={90} />
            <Tooltip />
            <Bar dataKey="wins" name="Victorias" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
        </BarChart>
    )
}