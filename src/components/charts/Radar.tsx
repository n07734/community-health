
import { Radar as RadarArea, RadarChart, PolarGrid, PolarAngleAxis, Tooltip } from 'recharts';
import { useTheme } from '@mui/styles'
import { Theme } from '@mui/material/styles'

import { useShowNumbers } from '../../state/ShowNumbersProvider'
import ChartHeading from './ChartHeading'
import styledCharts from './styledCharts'
import hasChartData from './hasChartData'
import { RadarData, RadarDataItem } from '../../types/Components'

type RadarProps = RadarData & {
    showTitle?: boolean
    colors?: string[]
    width?: number
    height?: number
    classes: Record<string, string>
}
const Radar = styledCharts(({
    title = '',
    showTitle = true,
    data = [],
    keys = [],
    colors = [],
    width = 410,
    height = 300,
    classes,
}:RadarProps) => {
    const theme:Theme = useTheme();
    const colorA = theme.palette.secondary.main
    const colorB = theme.palette.primary.main
    const radarColors = colors.length > 0 ? colors : [colorA, colorB]

    const { showNumbers } = useShowNumbers()

    const chartStyles = {
        fontFamily:'"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: '12px',
        fill: theme.palette.text.primary,
    }

    return hasChartData<RadarDataItem>(data,keys) && (
        <div>
            {
                showTitle && <ChartHeading className={classes.centerHeading} items={[{ label: title, color: colorB }]} />
            }
            <RadarChart
                width={width}
                height={height}
                cx="50%"
                cy="50%"
                outerRadius="90%"
                data={data}
            >
                <PolarGrid />
                <PolarAngleAxis
                    dataKey="area"
                    tick={({ payload, x, y, textAnchor, stroke, radius }:{ payload:{ value: string }, x:number, y:number, textAnchor:string, stroke:string, radius:number }) => (
                        <g
                            className="recharts-layer recharts-polar-angle-axis-tick"
                        >
                            <text
                            radius={radius}
                            stroke={stroke}
                            fill={theme.palette.text.primary}
                            style={chartStyles}
                            x={x}
                            y={y}
                            className="recharts-text recharts-polar-angle-axis-tick-value"
                            textAnchor={textAnchor}
                            >
                            <tspan x={x} dy="0em">
                                {payload.value}
                            </tspan>
                            </text>
                        </g>
                        )}
                />
                <RadarArea
                    dataKey="value"
                    stroke={radarColors[0]}
                    strokeWidth={2}
                    fill={radarColors[0]}
                    fillOpacity={0.5}
                    dot={true}
                />
                {
                    showNumbers && <Tooltip
                        labelStyle={({
                            color: theme.palette.text.primary,
                        })}
                        contentStyle={({
                            ...chartStyles,
                            backgroundColor: theme.palette.background.paper,
                        })}
                        formatter={
                            (_value, _name, props) => [props.payload.valueOriginal]
                        }
                    />
                }
            </RadarChart>
        </div>
    )
})

export default Radar