
import { filter } from 'ramda'
import { ResponsiveBar as NivoBar } from '@nivo/bar'
import { useTheme } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { AllowedColors } from '../../types/Components'
import { BarData } from '../../types/Graphs'

import { useShowNumbers } from '../../state/ShowNumbersProvider'
import ChartHeading from './ChartHeading'
import styledCharts from './styledCharts'
import hasChartData from './hasChartData'
import { AnyForLib } from '../../types/State'

type BarProps = {
    data: BarData[]
    bars: {
        dataKey: string
        color: AllowedColors
        label: string
    }[]
    sortBy: string
    indexBy: string
    max: number
    classes: Record<string, string>
    layout: "horizontal" | "vertical" | undefined
    title: string
}
const Bar = styledCharts(({
    data = [],
    bars = [],
    sortBy = '',
    indexBy = 'user',
    max = 20,
    classes,
    layout = "vertical",
    title = '',
}:BarProps) => {
    const theme:Theme = useTheme();
    const { showNumbers } = useShowNumbers()
    const trimmedData = filter(item => bars.some(x => item[x.dataKey]), data)

    const byPropDesc = (prop: string) => (a:Record<string, number>, b:Record<string, number>) =>
        +((a[prop] || 0) < (b[prop] || 0)) || +((a[prop] || 0) === (b[prop] || 0)) - 1

    const sortedData = sortBy
        ? trimmedData.sort(byPropDesc(sortBy))
        : trimmedData

    const finalData = max
        ? sortedData.slice(0, max)
        : sortedData

    const keys = bars.map(x => x.dataKey)

    return hasChartData<BarData>(data,keys) && (
        <div className={classes.barChartComponentWrap}>
            <ChartHeading text={title} items={bars} />
            <div className={classes.chartWrap}>
                <NivoBar
                    data={finalData}
                    keys={keys}
                    indexBy={indexBy}
                    margin={{ top: 5, right: 50, bottom: 60, left: 50 }}
                    padding={0.3}
                    groupMode="grouped"
                    layout={layout}
                    valueFormat={(value) => layout === 'horizontal'
                        ? `${Math.abs(value)}`
                        : `${value}`}
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
                    theme={theme.charts as AnyForLib}
                />
            </div>
        </div>
    )
})

export default Bar