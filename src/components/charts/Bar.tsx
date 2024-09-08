
import { filter } from 'ramda'
import { ResponsiveBar as NivoBar } from '@nivo/bar'
import { useTheme } from '@/components/ThemeProvider'
import { chartStyles } from '@/components/charts/chartStyles'

import { BarData, LineInfo } from '@/types/Graphs'

import { useShowNumbers } from '@/state/ShowNumbersProvider'
import ChartHeading from './ChartHeading'
import hasChartData from './hasChartData'
import { AnyForLib } from '@/types/State'

type BarProps = {
    data: BarData[]
    bars: LineInfo[]
    sortBy: string
    indexBy: string
    max?: number
    title: string
}
const Bar = ({
    data = [],
    bars = [],
    sortBy = '',
    indexBy = 'user',
    max = 20,
    title = '',
}:BarProps) => {
    const { theme } = useTheme()
    const styles = chartStyles(theme)

    const { showNumbers } = useShowNumbers()
    const trimmedData = filter(item => bars.some(x => item[x.dataKey]), data)

    const byPropDesc = (prop: string) => (a:Record<string, number | string>, b:Record<string, number | string>) =>
        +((a[prop] || 0) < (b[prop] || 0)) || +((a[prop] || 0) === (b[prop] || 0)) - 1

    const sortedData = sortBy
        ? trimmedData.sort(byPropDesc(sortBy))
        : trimmedData

    const finalData = max
        ? sortedData.slice(0, max)
        : sortedData

    const keys = bars.map(x => x.dataKey)

    return hasChartData<BarData>(data,keys) && (
        <div className="w-full max-w-mw mb-4">
            <ChartHeading text={title} items={bars} />
            <div className="chart-wrap">
                <NivoBar
                    data={finalData}
                    keys={keys}
                    indexBy={indexBy}
                    margin={{ top: 5, right: 50, bottom: 60, left: 50 }}
                    padding={0.3}
                    groupMode="grouped"
                    layout="vertical"
                    valueFormat={(value) => `${value}`}
                    colors={bars.map(x => x.color)}
                    axisBottom={{
                        tickSize: 0,
                        tickRotation: -45,
                    }}
                    axisLeft={{
                        ...(!showNumbers && { renderTick: undefined}),
                        tickSize: 0,
                    }}
                    isInteractive={showNumbers}
                    enableLabel={false}
                    animate={false}
                    theme={styles as AnyForLib}
                />
            </div>
        </div>
    )
}

export default Bar