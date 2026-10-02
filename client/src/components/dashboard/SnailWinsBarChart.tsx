import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { THEME_COLORS } from '../../constants/theme'
import type { SnailWins } from '../../types/race'

interface SnailWinsBarChartProps {
    data: SnailWins[]
}

export function SnailWinsBarChart({ data }: SnailWinsBarChartProps) {
    const maxWins = Math.max(...data.map((snail) => snail.wins))
    const coloredData = data.map((snail) => ({
        ...snail,
        fill: snail.wins === maxWins ? THEME_COLORS.gold : THEME_COLORS.brand,
    }))

    return (
        <>
            <BarChart
                layout="vertical"
                data={coloredData}
                responsive
                style={{ width: '100%', height: 260 }}
                margin={{ right: 16 }}
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="snail" width={90} />
                <Tooltip />
                <Bar dataKey="wins" name="Victorias" radius={[0, 4, 4, 0]} />
            </BarChart>
            <p className="small text-body-secondary mb-0">En dorado, el líder del día.</p>
        </>
    )
}