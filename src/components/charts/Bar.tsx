
import { filter } from 'ramda'
import { BarChart, Bar as BarBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useTheme } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { AllowedColors, ObjNumbers } from '../../types/Components'
import { BarData } from '../../types/Graphs'

import { useShowNumbers } from '../../state/ShowNumbersProvider'
import ChartHeading from './ChartHeading'
import styledCharts from './styledCharts'
import hasChartData from './hasChartData'

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
    max = 20,
    classes,
    title = '',
}:BarProps) => {
    const theme:Theme = useTheme();
    const { showNumbers } = useShowNumbers()
    const trimmedData = filter(item => bars.some(x => item[x.dataKey]), data)

    const byPropDesc = (prop: string) => (a:ObjNumbers, b:ObjNumbers) =>
        +((a[prop] || 0) < (b[prop] || 0)) || +((a[prop] || 0) === (b[prop] || 0)) - 1

    const sortedData = sortBy
        ? trimmedData.sort(byPropDesc(sortBy))
        : trimmedData

    const finalData = max
        ? sortedData.slice(0, max)
        : sortedData

    const keys = bars.map(x => x.dataKey)

    const chartStyles = {
        fontFamily:'"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: '12px',
        fill: theme.palette.text.primary,
    }

    return hasChartData<BarData>(data,keys) && (
        <div className={classes.barChartComponentWrap}>
            <ChartHeading text={title} items={bars} />
            <div className={classes.chartWrap}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        width={500}
                        height={300}
                        data={finalData}
                        barGap={0}
                        barCategoryGap="15%"
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            style={chartStyles}
                            tickCount={finalData.length}
                            interval={0}
                            angle={-45}
                            height={50}
                            textAnchor="end"
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            style={chartStyles}
                            tickLine={false}
                            axisLine={false}
                        />
                        {
                            keys
                                .map((key, i) => <BarBar
                                    key={key}
                                    dataKey={key}
                                    spacing={0}
                                    fill={bars[i].color}
                                />)
                        }
                        {
                            showNumbers && <Tooltip
                                cursor={({ fillOpacity: 0.1 })}
                                labelStyle={({
                                    color: theme.palette.text.primary,
                                })}
                                contentStyle={({
                                    ...chartStyles,
                                    backgroundColor: theme.palette.background.paper,
                                })}
                            />
                        }
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
})

export default Bar