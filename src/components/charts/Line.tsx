import { useState } from 'react'
import { useTheme } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { LineChart, Line as RLine, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

import { Lines, LineInfo, LineForGraph, ColumnKeys, TableData, Graph} from '../../types/Graphs'
import { EventInfo } from '../../types/FormattedData'

import { useShowNumbers } from '../../state/ShowNumbersProvider'
import ChartHeading from './ChartHeading'
import styledCharts from './styledCharts'
import ItemsTable from '../sections/ItemsTable'
import GraphUi from './GraphUi'

import {
    getMaxYValue,
    getMinYValue,
    formatLinesData,
    formatGraphMarkers,
} from './lineHelpers'

const getAllYMax = (data:LineInfo[] = []) => data
    .filter(x => x.yMax)
    .map(x => x.yMax) as number[]

const sortDesc = (a:number, b:number) => b - a

type LineProps = {
    title: string
    combineTitles: boolean
    blockHeading: boolean
    data: Lines[]
    markers: EventInfo[]
    showLegends: boolean
    classes: Record<string, string>
    tableData: readonly TableData[][]
    tableKeys: ColumnKeys[]
    graphInfo?: Graph
    setGraph?: (graphs: Graph[]) => void
    graphs?: Graph[]
    tableOpenedByDefault: boolean
}
const Line = styledCharts(({
    title,
    combineTitles = false,
    blockHeading = false,
    data = [],
    markers = [],
    showLegends = false,
    classes,
    tableData = [],
    tableKeys = [],
    graphInfo,
    setGraph = () => {},
    graphs = [],
    tableOpenedByDefault = false,
}:LineProps = {} as LineProps) => {
    const theme:Theme = useTheme();
    const { showNumbers } = useShowNumbers()
    // TODO: function to see time gap in data to help format date e.g. should add year
    const leftAxis = data
        .find(({ xAxis }) => xAxis === 'left') || { data: [], lines: [], xAxis: 'left' }
    const allLeftLineMaxYs = getAllYMax(leftAxis.lines)

    const leftLinesData = formatLinesData(leftAxis)

    const [maxLeftLineValue] = [...allLeftLineMaxYs, getMaxYValue(leftLinesData)].sort(sortDesc)
    const minLeftValue = getMinYValue(leftLinesData)

    const rightAxis = data
        .find(({ xAxis }) => xAxis === 'right') || { data: [], lines: [], xAxis: 'right'}

    const rightLineMaxYs = getAllYMax(rightAxis.lines)
    const rightLinesData = formatLinesData(rightAxis)
    const [maxRightValue] = [...rightLineMaxYs, getMaxYValue(rightLinesData)].sort(sortDesc)
    const minRightValue = getMinYValue(rightLinesData)

    // if no left try right mas as there may be a right line being used
    const maxLeftValue = maxLeftLineValue || maxRightValue

    const leftLines = leftAxis.lines

    const leftHeadingItems = !combineTitles && title || blockHeading
        ? []
        : leftLines

    const rightHeadingItems = rightAxis.lines

    const allLines = [
        ...leftAxis.lines,
        ...rightAxis.lines,
    ]

    type ColorsInfo = {
        label: string
        default: string
        current: string
        clicked: boolean
        color?: string
    }
    const colorsInfo:ColorsInfo[] = allLines.map(x => ({
        label: x.label,
        default: x.color,
        current: x.color,
        clicked: false,
    }))

    const [ hookedColors = [], setState] = useState(colorsInfo)

    if ((colorsInfo.length !== hookedColors.length) || hookedColors.length === 1 && hookedColors[0].color !== colorsInfo[0].color) {
        setState(colorsInfo)
    }

    const defaultLegendInfo = {
        anchor: 'top-right',
        direction: 'column',
        justify: false,
        translateX: -10,
        translateY: 10,
        itemsSpacing: 0,
        itemDirection: 'right-to-left',
        itemWidth: 80,
        itemHeight: 20,
        itemOpacity: 1,
        symbolSize: 12,
        symbolShape: 'square',
        symbolBorderColor: 'rgba(0, 0, 0, .9)',
        itemTextColor: theme.palette.text.primary,
    }

    const legends = []

    // If single axis and total and over x lines, then split, just for left lines
    if (rightAxis.lines.length < 1 && leftLines.length > 10) {
        type Info = {
            label: string
            color: string
        }
        const leftData:Info[] = []
        const rightData:Info[] = []
        const splitIndex = Math.ceil(leftLines.length / 2)
        leftLines
            .forEach(({ label, color }, i) => {
                const { current } = hookedColors.find(x => x.label === label) || {}
                const item = {
                    label,
                    color: current || color,
                }
                if (i < splitIndex) {
                    leftData.push(item)
                } else {
                    rightData.push(item)
                }
            })

        legends.push(
            {
                ...defaultLegendInfo,
                data: leftData,
                anchor: 'top-left',
                direction: 'column',
                translateX: 10,
                itemDirection: 'left-to-right',
            },
            {
                ...defaultLegendInfo,
                data: rightData,
            },
        )
    }

    const lineData = leftLinesData.concat(rightLinesData)

    const formattedMarkers = formatGraphMarkers(markers, theme, lineData)

    const chartStyles = {
        fontFamily:'"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: '12px',
        fill: theme.palette.text.primary,
    }

    const dateLabel = (value:string) => {
        const date = new Date(value)
        return date.toLocaleDateString('en-US', {
            month: 'numeric',
            year: '2-digit',
        })
    }

    const hasData = (items:LineForGraph[]) => items.some(item => (item?.data || []).length)
    return hasData(lineData) && (
        <div className={classes.lineChartComponentWrap}>
            {
                graphInfo && graphs.length > 0 && <GraphUi
                    graphInfo={graphInfo as Graph}
                    setGraph={setGraph}
                    graphs={graphs}
                />
            }
            <div className={classes.headingWrap}>
                <ChartHeading type='line' text={title} items={leftHeadingItems} />
                {
                    !blockHeading && rightHeadingItems.length > 0
                        && <ChartHeading type='line' items={rightHeadingItems} />
                }
            </div>

            <div className={classes.chartWrap}>
                <ResponsiveContainer width="100%">
                    <LineChart
                        // height={500}
                        margin={{
                            top: 5,
                            right: rightLinesData.length > 0 ? -10 : 50,
                            left: -10,
                            bottom: 19,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="x"
                            type="number"
                            style={chartStyles}
                            tickLine={false}
                            axisLine={false}
                            domain={['dataMin', 'dataMax']}
                            tickCount={13}
                            interval={0}
                            allowDuplicatedCategory={false}
                            tickFormatter={dateLabel}
                        />
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            style={chartStyles}
                            tickLine={false}
                            axisLine={false}
                            domain={[minLeftValue, maxLeftValue]}
                        />
                        {
                            leftLinesData
                                .map((line) => (
                                    <RLine
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="y"
                                        data={line.data.map(x => ({
                                            x: new Date(x.x).getTime(),
                                            y:x.y,
                                        }))}
                                        dot={{
                                            fill: line.color,
                                            stroke: line.color,
                                            strokeWidth: 1,
                                        }}
                                        name={line.id}
                                        key={line.id}
                                        stroke={line.color}
                                        strokeWidth={2}
                                    />
                                ))
                        }
                        {
                            rightLinesData.length > 0 && <YAxis
                                yAxisId="right"
                                orientation="right"
                                style={chartStyles}
                                tickLine={false}
                                axisLine={false}
                                domain={[minRightValue, maxRightValue]}
                            />
                        }
                        {
                            rightLinesData
                                .map((line) => (
                                    <RLine
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="y"
                                        data={line.data.map(x => ({
                                            x: new Date(x.x).getTime(),
                                            y:x.y,
                                        }))}
                                        dot={{
                                            fill: line.color,
                                            stroke: line.color,
                                            strokeWidth: 1,
                                        }}
                                        name={line.id}
                                        key={line.id}
                                        stroke={line.color}
                                        strokeWidth={2}
                                    />
                                ))
                        }
                        {
                            showNumbers && <Tooltip
                                labelStyle={({
                                    color: theme.palette.text.primary,
                                })}
                                contentStyle={({
                                    ...chartStyles,
                                    backgroundColor: theme.palette.background.paper,
                                })}
                                labelFormatter={dateLabel}
                            />
                        }
                        {
                            showLegends && formattedMarkers
                                .map((marker,i) =>  (
                                    <ReferenceLine
                                        yAxisId="left"
                                        key={i}
                                        x={marker.value}
                                        stroke={marker.lineStyle.stroke}
                                        label={({
                                            value: marker.legend,
                                            position:'insideTop',
                                            offset: marker.legendOffsetY,
                                            style: {
                                                ...marker.textStyle,
                                            },
                                        })}
                                    />
                                ))
                        }
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {
                  tableData.length > 0 && <ItemsTable
                    data={tableData}
                    dataKeys={tableKeys}
                    tableOpenedByDefault={tableOpenedByDefault}
                />
            }
        </div>
    )
})

export default Line
